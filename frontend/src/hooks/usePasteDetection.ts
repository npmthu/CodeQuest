import { useRef, useCallback } from 'react';

// Types for paste event tracking
export interface PasteEvent {
  id: string;
  timestamp: number;
  pastedText: string;
  pastedLength: number;
  isExternal: boolean;  // true if paste is from outside the editor
  cursorPosition: number;
  totalCodeLengthBefore: number;
  totalCodeLengthAfter: number;
  suspicionScore: number;  // Individual score for this paste event (0-1)
  reason: string;  // Why this score was assigned
}

export interface SuspicionBreakdown {
  pasteEvents: PasteEvent[];
  totalPasteCount: number;
  externalPasteCount: number;
  totalExternalPastedChars: number;
  largestExternalPaste: number;
  finalScore: number;
  computedAt: number;
}

export interface PasteDetectionState {
  internalClipboard: Set<string>;  // Text copied within the editor
  pasteEvents: PasteEvent[];
  codeHistory: Array<{ code: string; timestamp: number }>;
}

// Thresholds for suspicion scoring
const SUSPICION_THRESHOLDS = {
  // Paste length thresholds
  SMALL_PASTE: 50,        // < 50 chars: low suspicion
  MEDIUM_PASTE: 200,      // 50-200 chars: medium suspicion
  LARGE_PASTE: 500,       // 200-500 chars: high suspicion
  VERY_LARGE_PASTE: 1000, // > 1000 chars: very high suspicion
  
  // Score multipliers
  INTERNAL_PASTE_MULTIPLIER: 0.1,  // Internal pastes get 10% of the score
  REPEATED_PASTE_REDUCTION: 0.5,   // Same paste repeated gets 50% reduction
  
  // Time-based thresholds
  RAPID_PASTE_WINDOW_MS: 5000,     // Multiple pastes within 5s is suspicious
  
  // Length ratio thresholds
  CODE_JUMP_RATIO: 0.5,  // If paste increases code by >50%, more suspicious
};

export function usePasteDetection() {
  const stateRef = useRef<PasteDetectionState>({
    internalClipboard: new Set(),
    pasteEvents: [],
    codeHistory: [],
  });

  // Generate unique ID for paste events
  const generateId = () => `paste_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Record when user copies text within the editor
  const handleInternalCopy = useCallback((selectedText: string) => {
    if (selectedText && selectedText.trim().length > 0) {
      // Store the copied text to identify internal pastes later
      stateRef.current.internalClipboard.add(selectedText.trim());
      
      // Keep clipboard size manageable (last 100 copies)
      if (stateRef.current.internalClipboard.size > 100) {
        const entries = Array.from(stateRef.current.internalClipboard);
        stateRef.current.internalClipboard = new Set(entries.slice(-100));
      }
    }
  }, []);

  // Record code changes for history tracking
  const recordCodeSnapshot = useCallback((code: string) => {
    const now = Date.now();
    const history = stateRef.current.codeHistory;
    
    // Only record if code actually changed and not too frequent (min 1s apart)
    if (history.length === 0 || 
        (history[history.length - 1].code !== code && 
         now - history[history.length - 1].timestamp > 1000)) {
      history.push({ code, timestamp: now });
      
      // Keep last 50 snapshots
      if (history.length > 50) {
        stateRef.current.codeHistory = history.slice(-50);
      }
    }
  }, []);

  // Calculate suspicion score for a single paste event
  const calculatePasteSuspicion = useCallback((
    pastedText: string,
    isExternal: boolean,
    codeLengthBefore: number,
    codeLengthAfter: number
  ): { score: number; reason: string } => {
    const pasteLength = pastedText.length;
    
    // Internal paste - very low suspicion
    if (!isExternal) {
      if (pasteLength > SUSPICION_THRESHOLDS.LARGE_PASTE) {
        return { 
          score: 0.15 * SUSPICION_THRESHOLDS.INTERNAL_PASTE_MULTIPLIER, 
          reason: 'Internal paste (large, from editor clipboard)' 
        };
      }
      return { 
        score: 0.05 * SUSPICION_THRESHOLDS.INTERNAL_PASTE_MULTIPLIER, 
        reason: 'Internal paste (from editor clipboard)' 
      };
    }
    
    // External paste - calculate based on size
    let baseScore = 0;
    let reason = '';
    
    if (pasteLength < SUSPICION_THRESHOLDS.SMALL_PASTE) {
      baseScore = 0.1;
      reason = 'Small external paste';
    } else if (pasteLength < SUSPICION_THRESHOLDS.MEDIUM_PASTE) {
      baseScore = 0.3;
      reason = 'Medium external paste';
    } else if (pasteLength < SUSPICION_THRESHOLDS.LARGE_PASTE) {
      baseScore = 0.6;
      reason = 'Large external paste';
    } else if (pasteLength < SUSPICION_THRESHOLDS.VERY_LARGE_PASTE) {
      baseScore = 0.8;
      reason = 'Very large external paste';
    } else {
      baseScore = 0.95;
      reason = 'Extremely large external paste (possible full solution copy)';
    }
    
    // Increase score if paste represents large portion of code increase
    if (codeLengthBefore > 0) {
      const codeIncrease = codeLengthAfter - codeLengthBefore;
      const increaseRatio = codeIncrease / codeLengthBefore;
      
      if (increaseRatio > SUSPICION_THRESHOLDS.CODE_JUMP_RATIO) {
        baseScore = Math.min(1, baseScore * 1.2);
        reason += ' (significant code increase)';
      }
    } else if (pasteLength > SUSPICION_THRESHOLDS.MEDIUM_PASTE) {
      // First paste and it's large - suspicious
      baseScore = Math.min(1, baseScore * 1.1);
      reason += ' (initial large paste)';
    }
    
    // Check if this exact text was pasted before (copy-paste debugging pattern)
    const previousSamePaste = stateRef.current.pasteEvents.find(
      e => e.pastedText === pastedText
    );
    if (previousSamePaste) {
      baseScore *= SUSPICION_THRESHOLDS.REPEATED_PASTE_REDUCTION;
      reason += ' (repeated paste, reduced)';
    }
    
    // Check for rapid consecutive pastes
    const recentPastes = stateRef.current.pasteEvents.filter(
      e => Date.now() - e.timestamp < SUSPICION_THRESHOLDS.RAPID_PASTE_WINDOW_MS
    );
    if (recentPastes.length > 2) {
      baseScore = Math.min(1, baseScore * 1.1);
      reason += ' (rapid paste sequence)';
    }
    
    return { score: Math.min(1, Math.max(0, baseScore)), reason };
  }, []);

  // Handle paste event from the editor
  const handlePaste = useCallback((
    pastedText: string,
    cursorPosition: number,
    codeBefore: string,
    codeAfter: string
  ): PasteEvent => {
    const now = Date.now();
    const trimmedPaste = pastedText.trim();
    
    // Check if this paste is from internal clipboard
    const isExternal = !stateRef.current.internalClipboard.has(trimmedPaste);
    
    // Calculate suspicion for this paste
    const { score, reason } = calculatePasteSuspicion(
      pastedText,
      isExternal,
      codeBefore.length,
      codeAfter.length
    );
    
    const pasteEvent: PasteEvent = {
      id: generateId(),
      timestamp: now,
      pastedText: pastedText.substring(0, 500), // Truncate for storage
      pastedLength: pastedText.length,
      isExternal,
      cursorPosition,
      totalCodeLengthBefore: codeBefore.length,
      totalCodeLengthAfter: codeAfter.length,
      suspicionScore: score,
      reason,
    };
    
    stateRef.current.pasteEvents.push(pasteEvent);
    
    // Also record code snapshot
    recordCodeSnapshot(codeAfter);
    
    return pasteEvent;
  }, [calculatePasteSuspicion, recordCodeSnapshot]);

  // Compute final suspicion breakdown for submission
  const computeSuspicionBreakdown = useCallback((): SuspicionBreakdown => {
    const events = stateRef.current.pasteEvents;
    const externalEvents = events.filter(e => e.isExternal);
    
    // Calculate final score - weighted average with emphasis on worst events
    let finalScore = 0;
    
    if (externalEvents.length === 0) {
      // No external pastes - very low suspicion
      finalScore = 0;
    } else if (externalEvents.length === 1) {
      // Single external paste - use its score directly
      finalScore = externalEvents[0].suspicionScore;
    } else {
      // Multiple external pastes - combine scores
      // Use a formula that emphasizes the highest scores
      const sortedScores = externalEvents
        .map(e => e.suspicionScore)
        .sort((a, b) => b - a);
      
      // Take weighted average: highest score counts most
      let weightedSum = 0;
      let weightSum = 0;
      sortedScores.forEach((score, index) => {
        const weight = 1 / (index + 1);  // 1, 0.5, 0.33, 0.25, ...
        weightedSum += score * weight;
        weightSum += weight;
      });
      
      finalScore = weightedSum / weightSum;
      
      // Increase score for multiple external pastes
      if (externalEvents.length > 3) {
        finalScore = Math.min(1, finalScore * 1.1);
      }
      if (externalEvents.length > 5) {
        finalScore = Math.min(1, finalScore * 1.1);
      }
    }
    
    // Calculate total external pasted characters
    const totalExternalPastedChars = externalEvents.reduce(
      (sum, e) => sum + e.pastedLength,
      0
    );
    
    // Find largest external paste
    const largestExternalPaste = externalEvents.length > 0
      ? Math.max(...externalEvents.map(e => e.pastedLength))
      : 0;
    
    return {
      pasteEvents: events.map(e => ({
        ...e,
        pastedText: e.pastedText.substring(0, 200), // Further truncate for final storage
      })),
      totalPasteCount: events.length,
      externalPasteCount: externalEvents.length,
      totalExternalPastedChars,
      largestExternalPaste,
      finalScore: Math.round(finalScore * 100) / 100,  // Round to 2 decimal places
      computedAt: Date.now(),
    };
  }, []);

  // Reset state (e.g., when changing problems)
  const reset = useCallback(() => {
    stateRef.current = {
      internalClipboard: new Set(),
      pasteEvents: [],
      codeHistory: [],
    };
  }, []);

  // Get current state for debugging/display
  const getState = useCallback(() => ({
    pasteEventCount: stateRef.current.pasteEvents.length,
    externalPasteCount: stateRef.current.pasteEvents.filter(e => e.isExternal).length,
    internalClipboardSize: stateRef.current.internalClipboard.size,
    codeHistoryLength: stateRef.current.codeHistory.length,
  }), []);

  return {
    handleInternalCopy,
    handlePaste,
    recordCodeSnapshot,
    computeSuspicionBreakdown,
    reset,
    getState,
  };
}

export default usePasteDetection;
