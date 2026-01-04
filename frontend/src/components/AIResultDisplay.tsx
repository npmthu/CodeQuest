import React from 'react';
import {
  Brain,
  List,
  Loader2,
  Copy,
  Download,
  Check,
  ChevronRight,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

// ============================================================
// TYPES
// ============================================================

export interface SummaryData {
  keyPoints: string[];
  overview?: string;
  topics?: string[];
}

export interface MindmapNode {
  id: string;
  label: string;
  children?: MindmapNode[];
  level: number;
  type?: 'root' | 'topic' | 'subtopic' | 'detail';
}

export interface MindmapData {
  root: MindmapNode;
  flatNodes?: MindmapNode[];
}

// ============================================================
// AI LOADING OVERLAY
// ============================================================

interface AILoadingOverlayProps {
  isLoading: boolean;
  type: 'summary' | 'mindmap' | 'assist';
  progress?: number;
}

export const AILoadingOverlay: React.FC<AILoadingOverlayProps> = ({
  isLoading,
  type,
  progress = 0
}) => {
  if (!isLoading) return null;

  const messages = {
    summary: [
      'Analyzing your content...',
      'Extracting key points...',
      'Organizing summary...',
      'Finalizing output...'
    ],
    mindmap: [
      'Reading your notes...',
      'Identifying main topics...',
      'Building relationships...',
      'Creating visual structure...'
    ],
    assist: [
      'Understanding your question...',
      'Searching context...',
      'Generating response...'
    ]
  };

  const currentMessages = messages[type];
  const messageIndex = Math.min(
    Math.floor(progress / (100 / currentMessages.length)),
    currentMessages.length - 1
  );

  return (
    <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg">
      <div className="bg-gray-800 rounded-xl p-6 shadow-xl flex flex-col items-center gap-4 min-w-[280px]">
        <div className="relative">
          <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
          <Sparkles className="w-5 h-5 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
        </div>
        
        <div className="text-center">
          <p className="text-white font-medium mb-1">
            {currentMessages[messageIndex]}
          </p>
          <p className="text-gray-400 text-sm">
            {type === 'summary' && 'Creating your summary'}
            {type === 'mindmap' && 'Building mindmap'}
            {type === 'assist' && 'AI is thinking'}
          </p>
        </div>
        
        {/* Progress bar */}
        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

// ============================================================
// SUMMARY DISPLAY (Bullet Points)
// ============================================================

interface SummaryDisplayProps {
  data: SummaryData;
  isLoading?: boolean;
  onCopy?: () => void;
  className?: string;
}

export const SummaryDisplay: React.FC<SummaryDisplayProps> = ({
  data,
  isLoading = false,
  onCopy,
  className = ''
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    const text = [
      data.overview && `Overview: ${data.overview}`,
      '',
      'Key Points:',
      ...data.keyPoints.map((point) => `• ${point}`),
      '',
      data.topics?.length && `Topics: ${data.topics.join(', ')}`
    ].filter(Boolean).join('\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Summary copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
    onCopy?.();
  };

  if (isLoading) {
    return (
      <div className={`bg-black/50   rounded-lg p-4 ${className}`}>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-700 rounded w-3/4" />
          <div className="h-3 bg-gray-700 rounded w-full" />
          <div className="h-3 bg-gray-700 rounded w-5/6" />
          <div className="h-3 bg-gray-700 rounded w-4/5" />
        </div>
      </div>
    );
  }

  if (!data.keyPoints || data.keyPoints.length === 0) {
    return (
      <div className={`bg-black/50   rounded-lg p-4 text-center ${className}`}>
        <AlertCircle className="w-8 h-8 text-gray-500 mx-auto mb-2" />
        <p className="text-gray-400 text-sm">No summary available</p>
      </div>
    );
  }

  return (
    <div className={`bg-black/50   rounded-lg p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <List className="w-5 h-5 text-indigo-400" />
          <h3 className="text-white font-semibold">AI Summary</h3>
        </div>
        <button
          onClick={handleCopy}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          title="Copy summary"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-400" />
          ) : (
            <Copy className="w-4 h-4 text-gray-400" />
          )}
        </button>
      </div>

      {/* Overview */}
      {data.overview && (
        <p className="text-gray-300 mb-4 pb-4 border-b border-gray-700">
          {data.overview}
        </p>
      )}

      {/* Key Points as Bullet List */}
      <ul className="space-y-2 mb-4">
        {data.keyPoints.map((point, index) => (
          <li key={index} className="flex items-start gap-2">
            <ChevronRight className="w-4 h-4 text-indigo-400 mt-1 flex-shrink-0" />
            <span className="text-gray-300 text-sm leading-relaxed">{point}</span>
          </li>
        ))}
      </ul>

      {/* Topics Tags */}
      {data.topics && data.topics.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-700">
          {data.topics.map((topic, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-indigo-500/20 text-indigo-300 text-xs rounded-full"
            >
              {topic}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================
// MINDMAP DISPLAY (Visual Tree Diagram)
// ============================================================

interface MindmapDisplayProps {
  data: MindmapData;
  isLoading?: boolean;
  onExport?: () => void;
  className?: string;
}

const MindmapNodeComponent: React.FC<{
  node: MindmapNode;
  isFirst?: boolean;
  isLast?: boolean;
}> = ({ node }) => {
  const levelColors = {
    0: 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white',
    1: 'bg-indigo-500/30 text-indigo-200 border border-indigo-500/50',
    2: 'bg-purple-500/20 text-purple-200 border border-purple-500/40',
    3: 'bg-gray-700/50 text-gray-300 border border-gray-600'
  };

  const levelSizes = {
    0: 'text-base px-4 py-2',
    1: 'text-sm px-3 py-1.5',
    2: 'text-xs px-2.5 py-1',
    3: 'text-xs px-2 py-0.5'
  };

  const colorClass = levelColors[node.level as keyof typeof levelColors] || levelColors[3];
  const sizeClass = levelSizes[node.level as keyof typeof levelSizes] || levelSizes[3];

  return (
    <div className="relative">
      {/* Connector line */}
      {node.level > 0 && (
        <div className="absolute left-0 top-1/2 w-4 -ml-4 border-t-2 border-dashed border-gray-600" />
      )}
      
      <div className="flex items-start">
        {/* Node itself */}
        <div className={`rounded-lg ${colorClass} ${sizeClass} font-medium whitespace-nowrap`}>
          {node.label}
        </div>
        
        {/* Children */}
        {node.children && node.children.length > 0 && (
          <div className="relative ml-6 pl-4 border-l-2 border-dashed border-gray-600">
            <div className="space-y-2 py-1">
              {node.children.map((child, index) => (
                <MindmapNodeComponent
                  key={child.id}
                  node={child}
                  isFirst={index === 0}
                  isLast={index === node.children!.length - 1}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const MindmapDisplay: React.FC<MindmapDisplayProps> = ({
  data,
  isLoading = false,
  onExport,
  className = ''
}) => {
  if (isLoading) {
    return (
      <div className={`bg-gray-800/50 rounded-lg p-4 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-700 rounded w-1/3 mx-auto" />
          <div className="flex justify-center gap-8">
            <div className="h-6 bg-gray-700 rounded w-24" />
            <div className="h-6 bg-gray-700 rounded w-28" />
            <div className="h-6 bg-gray-700 rounded w-20" />
          </div>
          <div className="flex justify-center gap-4">
            <div className="h-5 bg-gray-700 rounded w-16" />
            <div className="h-5 bg-gray-700 rounded w-20" />
            <div className="h-5 bg-gray-700 rounded w-18" />
            <div className="h-5 bg-gray-700 rounded w-14" />
          </div>
        </div>
      </div>
    );
  }

  if (!data.root) {
    return (
      <div className={`bg-gray-800/50 rounded-lg p-4 text-center ${className}`}>
        <AlertCircle className="w-8 h-8 text-gray-500 mx-auto mb-2" />
        <p className="text-gray-400 text-sm">No mindmap available</p>
      </div>
    );
  }

  return (
    <div className={`bg-gray-800/50 rounded-lg p-4 overflow-x-auto ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-400" />
          <h3 className="text-white font-semibold">AI Mindmap</h3>
        </div>
        {onExport && (
          <button
            onClick={onExport}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-1 text-sm text-gray-400 hover:text-white"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        )}
      </div>

      {/* Mindmap Tree */}
      <div className="min-w-max p-4">
        <MindmapNodeComponent node={data.root} />
      </div>
      
      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-700 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-gradient-to-r from-indigo-500 to-purple-500" />
          Root
        </span>
        <span className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-indigo-500/30 border border-indigo-500/50" />
          Topic
        </span>
        <span className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-purple-500/20 border border-purple-500/40" />
          Subtopic
        </span>
        <span className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-gray-700/50 border border-gray-600" />
          Detail
        </span>
      </div>
    </div>
  );
};

// ============================================================
// AI GENERATION BUTTON
// ============================================================

interface AIGenerationButtonProps {
  type: 'summary' | 'mindmap' | 'assist';
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const AIGenerationButton: React.FC<AIGenerationButtonProps> = ({
  type,
  onClick,
  disabled = false,
  loading = false,
  loadingText,
  className = '',
  size = 'md'
}) => {
  const icons = {
    summary: List,
    mindmap: Brain,
    assist: Sparkles
  };

  const defaultText = {
    summary: 'Generate Summary',
    mindmap: 'Generate Mindmap',
    assist: 'Ask AI'
  };

  const defaultLoadingText = {
    summary: 'Generating...',
    mindmap: 'Generating...',
    assist: 'Processing...'
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const Icon = icons[type];
  const text = loading ? (loadingText || defaultLoadingText[type]) : defaultText[type];

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        flex items-center gap-2 rounded-lg font-medium transition-all
        ${disabled || loading
          ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
          : 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 cursor-pointer'
        }
        ${sizeClasses[size]}
        ${className}
      `}
      style={{ cursor: disabled || loading ? 'not-allowed' : 'pointer' }}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Icon className="w-4 h-4" />
      )}
      <span>{text}</span>
    </button>
  );
};

// ============================================================
// UTILITY: Parse AI Response to Summary/Mindmap Data
// ============================================================

export function parseSummaryResponse(response: any): SummaryData {
  // Handle string response (raw text from AI)
  if (typeof response === 'string') {
    const lines = response.split('\n').filter(line => line.trim());
    const keyPoints = lines
      .filter(line => line.startsWith('-') || line.startsWith('•') || line.match(/^\d+\./))
      .map(line => line.replace(/^[-•]\s*|\d+\.\s*/g, '').trim());
    
    return {
      keyPoints: keyPoints.length > 0 ? keyPoints : lines.slice(0, 5),
      overview: lines[0]?.startsWith('-') ? undefined : lines[0],
      topics: []
    };
  }

  // Handle structured response
  return {
    keyPoints: response.keyPoints || response.key_points || response.points || [],
    overview: response.overview || response.summary,
    topics: response.topics || response.tags || []
  };
}

export function parseMindmapResponse(response: any): MindmapData {
  // Handle string response
  if (typeof response === 'string') {
    try {
      response = JSON.parse(response);
    } catch {
      // Create simple mindmap from text
      const lines = response.split('\n').filter((line: string) => line.trim());
      return {
        root: {
          id: 'root',
          label: 'Main Topic',
          level: 0,
          type: 'root',
          children: lines.slice(0, 5).map((line: string, i: number) => ({
            id: `topic-${i}`,
            label: line.replace(/^[-•]\s*|\d+\.\s*/g, '').trim().slice(0, 50),
            level: 1,
            type: 'topic'
          }))
        }
      };
    }
  }

  // Handle structured response
  if (response.root) {
    return response;
  }

  // Handle array of topics
  if (Array.isArray(response)) {
    return {
      root: {
        id: 'root',
        label: 'Mindmap',
        level: 0,
        type: 'root',
        children: response.map((item: any, i: number) => ({
          id: `topic-${i}`,
          label: typeof item === 'string' ? item : item.label || item.name,
          level: 1,
          type: 'topic',
          children: item.children?.map((child: any, j: number) => ({
            id: `subtopic-${i}-${j}`,
            label: typeof child === 'string' ? child : child.label || child.name,
            level: 2,
            type: 'subtopic'
          }))
        }))
      }
    };
  }

  return {
    root: {
      id: 'root',
      label: 'Mindmap',
      level: 0,
      type: 'root',
      children: []
    }
  };
}

export default {
  AILoadingOverlay,
  SummaryDisplay,
  MindmapDisplay,
  AIGenerationButton,
  parseSummaryResponse,
  parseMindmapResponse
};
