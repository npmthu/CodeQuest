import { useState, useCallback } from 'react';
import { toast } from 'sonner';

// Types
export interface AIGenerationState {
  isGenerating: boolean;
  generationType: 'summary' | 'mindmap' | 'assist' | null;
  progress: number; // 0-100
  error: string | null;
}

export interface ContentValidation {
  isValid: boolean;
  errors: string[];
}

export interface UseNotebookAIOptions {
  minContentLength?: number;
  minTitleLength?: number;
  onValidationError?: (errors: string[]) => void;
}

export interface UseNotebookAIReturn {
  // State
  generationState: AIGenerationState;
  
  // Validation
  validateContent: (title: string, content: string) => ContentValidation;
  
  // Generation wrappers with loading states
  generateSummary: (
    content: string, 
    generateFn: (content: string) => Promise<any>
  ) => Promise<any>;
  
  generateMindmap: (
    content: string, 
    generateFn: (content: string) => Promise<any>
  ) => Promise<any>;
  
  askAssistant: (
    question: string,
    context: string,
    askFn: (params: any) => Promise<any>
  ) => Promise<any>;
  
  // Reset state
  resetState: () => void;
  
  // Button states for UI
  getButtonState: (type: 'summary' | 'mindmap' | 'assist') => {
    disabled: boolean;
    loading: boolean;
    text: string;
    cursor: string;
  };
}

const DEFAULT_OPTIONS: UseNotebookAIOptions = {
  minContentLength: 10,
  minTitleLength: 0,
};

/**
 * Custom hook for managing Notebook AI features with proper loading states and validation
 */
export function useNotebookAI(options: UseNotebookAIOptions = {}): UseNotebookAIReturn {
  const { minContentLength, minTitleLength, onValidationError } = {
    ...DEFAULT_OPTIONS,
    ...options
  };

  // Generation state
  const [generationState, setGenerationState] = useState<AIGenerationState>({
    isGenerating: false,
    generationType: null,
    progress: 0,
    error: null
  });

  /**
   * Validate content before AI generation
   */
  const validateContent = useCallback((title: string, content: string): ContentValidation => {
    const errors: string[] = [];

    // Title validation
    if (minTitleLength && minTitleLength > 0) {
      if (!title || title.trim().length < minTitleLength) {
        errors.push(`Title must be at least ${minTitleLength} characters`);
      }
    }

    // Content validation
    if (!content || content.trim().length === 0) {
      errors.push('Please add some content to your notebook before generating');
    } else if (content.trim().length < (minContentLength || 10)) {
      errors.push(`Content must be at least ${minContentLength} characters for meaningful AI generation`);
    }

    // Notify validation errors
    if (errors.length > 0) {
      onValidationError?.(errors);
      errors.forEach(error => toast.warning(error));
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, [minContentLength, minTitleLength, onValidationError]);

  /**
   * Start generation state
   */
  const startGeneration = useCallback((type: 'summary' | 'mindmap' | 'assist') => {
    setGenerationState({
      isGenerating: true,
      generationType: type,
      progress: 10,
      error: null
    });

    // Simulate progress
    const interval = setInterval(() => {
      setGenerationState(prev => ({
        ...prev,
        progress: Math.min(prev.progress + 10, 90)
      }));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  /**
   * End generation state
   */
  const endGeneration = useCallback((success: boolean, error?: string) => {
    setGenerationState({
      isGenerating: false,
      generationType: null,
      progress: success ? 100 : 0,
      error: error || null
    });
  }, []);

  /**
   * Generate Summary with loading state
   * IMPORTANT: Uses current content from editor (not from database)
   */
  const generateSummary = useCallback(async (
    content: string,
    generateFn: (content: string) => Promise<any>
  ) => {
    // Validate using CURRENT editor content (not DB content)
    const validation = validateContent('', content);
    if (!validation.isValid) {
      return null;
    }

    const cleanup = startGeneration('summary');

    try {
      // Pass the CURRENT content (what user sees in editor)
      const result = await generateFn(content);
      
      endGeneration(true);
      toast.success('Summary generated successfully!');
      
      return result;
    } catch (error: any) {
      const errorMsg = error.message || 'Failed to generate summary';
      endGeneration(false, errorMsg);
      toast.error(errorMsg);
      
      throw error;
    } finally {
      cleanup();
    }
  }, [validateContent, startGeneration, endGeneration]);

  /**
   * Generate Mindmap with loading state
   * IMPORTANT: Uses current content from editor (not from database)
   */
  const generateMindmap = useCallback(async (
    content: string,
    generateFn: (content: string) => Promise<any>
  ) => {
    // Validate using CURRENT editor content
    const validation = validateContent('', content);
    if (!validation.isValid) {
      return null;
    }

    const cleanup = startGeneration('mindmap');

    try {
      // Pass the CURRENT content (what user sees in editor)
      const result = await generateFn(content);
      
      endGeneration(true);
      toast.success('Mindmap generated successfully!');
      
      return result;
    } catch (error: any) {
      const errorMsg = error.message || 'Failed to generate mindmap';
      endGeneration(false, errorMsg);
      toast.error(errorMsg);
      
      throw error;
    } finally {
      cleanup();
    }
  }, [validateContent, startGeneration, endGeneration]);

  /**
   * Ask AI Assistant with loading state
   */
  const askAssistant = useCallback(async (
    question: string,
    context: string,
    askFn: (params: any) => Promise<any>
  ) => {
    if (!question || question.trim().length === 0) {
      toast.warning('Please enter a question');
      return null;
    }

    const cleanup = startGeneration('assist');

    try {
      const result = await askFn({
        question,
        context,
        sourceType: 'note'
      });
      
      endGeneration(true);
      
      return result;
    } catch (error: any) {
      const errorMsg = error.message || 'Failed to get AI response';
      endGeneration(false, errorMsg);
      toast.error(errorMsg);
      
      throw error;
    } finally {
      cleanup();
    }
  }, [startGeneration, endGeneration]);

  /**
   * Reset generation state
   */
  const resetState = useCallback(() => {
    setGenerationState({
      isGenerating: false,
      generationType: null,
      progress: 0,
      error: null
    });
  }, []);

  /**
   * Get button state for UI rendering
   * Returns proper disabled, loading, text, and cursor states
   */
  const getButtonState = useCallback((type: 'summary' | 'mindmap' | 'assist') => {
    const isThisTypeGenerating = generationState.isGenerating && generationState.generationType === type;
    const isAnyGenerating = generationState.isGenerating;

    const textMap = {
      summary: isThisTypeGenerating ? 'Generating...' : 'Generate Summary',
      mindmap: isThisTypeGenerating ? 'Generating...' : 'Generate Mindmap',
      assist: isThisTypeGenerating ? 'Processing...' : 'Ask AI'
    };

    return {
      disabled: isAnyGenerating,
      loading: isThisTypeGenerating,
      text: textMap[type],
      cursor: isAnyGenerating ? 'wait' : 'pointer'
    };
  }, [generationState]);

  return {
    generationState,
    validateContent,
    generateSummary,
    generateMindmap,
    askAssistant,
    resetState,
    getButtonState
  };
}

export default useNotebookAI;
