import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { 
  ArrowLeft,
  FileText,
  Star,
  Sparkles,
  Calendar,
  MessageSquare,
  X,
  Brain,
  GitBranch
} from "lucide-react";
import { useNotebookAssist, useGenerateSummary, useGenerateMindmap, useUpdateNote } from "../hooks/useApi";
import type { Note } from "../interfaces";
import type { MindmapResponse } from "../interfaces/ai.interface";

interface NotebookDetailPlaceholderProps {
  notebook: Note;
  onBack: () => void;
}

export default function NotebookDetailPlaceholder({ notebook, onBack }: NotebookDetailPlaceholderProps) {
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [aiQuestion, setAiQuestion] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(notebook.title || '');
  const [editContent, setEditContent] = useState(notebook.contentMarkdown || '');
  const [summary, setSummary] = useState<string | null>(null);
  const [mindmap, setMindmap] = useState<MindmapResponse | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [showMindmap, setShowMindmap] = useState(false);
  
  const assistMutation = useNotebookAssist();
  const summaryMutation = useGenerateSummary();
  const mindmapMutation = useGenerateMindmap();
  const updateNoteMutation = useUpdateNote(notebook.id);

  const handleAskAI = async () => {
    if (!aiQuestion.trim()) return;

    try {
      await assistMutation.mutateAsync({
        question: aiQuestion,
        context: notebook.contentMarkdown,
        sourceType: 'note',
        sourceId: notebook.id
      });
    } catch (error) {
      console.error('AI assist error:', error);
    }
  };

  const handleGenerateSummary = async () => {
    const content = editContent || notebook.contentMarkdown || '';
    if (!content.trim()) {
      alert('Please add some content to your notebook before generating a summary');
      return;
    }

    try {
      const result = await summaryMutation.mutateAsync(content);
      setSummary(result.summary);
      setShowSummary(true);
    } catch (error: any) {
      console.error('Summary generation error:', error);
      alert(`Failed to generate summary: ${error.message}`);
    }
  };

  const handleGenerateMindmap = async () => {
    const content = editContent || notebook.contentMarkdown || '';
    if (!content.trim()) {
      alert('Please add some content to your notebook before generating a mindmap');
      return;
    }

    try {
      const result = await mindmapMutation.mutateAsync(content);
      setMindmap(result);
      setShowMindmap(true);
    } catch (error: any) {
      console.error('Mindmap generation error:', error);
      alert(`Failed to generate mindmap: ${error.message}`);
    }
  };

  const renderMindmapNode = (node: { label: string; children: any[] }, level: number = 0, index: number = 0): JSX.Element => {
    const indent = level * 24;
    const key = `${node.label}-${level}-${index}`;
    return (
      <div key={key} style={{ marginLeft: `${indent}px`, marginTop: level > 0 ? '8px' : '0' }}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-600"></div>
          <span className="font-medium text-sm">{node.label}</span>
        </div>
        {node.children && node.children.length > 0 && (
          <div className="mt-2">
            {node.children.map((child, idx) => renderMindmapNode(child, level + 1, idx))}
          </div>
        )}
      </div>
    );
  };

  const handleSaveEdit = async () => {
    try {
      const response = await updateNoteMutation.mutateAsync({
        title: editTitle,
        contentMarkdown: editContent,
      });
      
      // Extract the note data from the API response
      const updatedNote = response.data || response;
      
      // Update local state with the saved values
      // This ensures the UI reflects the saved content immediately
      if (updatedNote.title !== undefined) {
        setEditTitle(updatedNote.title || '');
      }
      if (updatedNote.contentMarkdown !== undefined) {
        setEditContent(updatedNote.contentMarkdown || '');
      }
      
      // Exit edit mode on success
      setIsEditing(false);
      
      // Optionally show success message
      // You could use a toast library here if available
    } catch (error: any) {
      console.error('Error saving note:', error);
      alert(`Failed to save changes: ${error.message || 'Unknown error'}`);
    }
  };

  // Generate unique placeholder content based on notebook id
  const placeholderContent = `# ${notebook.title || 'Untitled Notebook'}

## Overview
${notebook.contentMarkdown || 'No content yet. Start writing your notes here.'}

This notebook contains your personal learning notes. You can:

- Write detailed notes and explanations
- Add code snippets and examples
- Include diagrams and visualizations
- Record practice problems and solutions
- Capture personal insights and takeaways

## Notes
*Last updated: ${new Date(notebook.updatedAt).toLocaleDateString()}*`;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-border">
        <div className="max-w-4xl mx-auto px-8 py-6">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Notebooks
          </Button>
          
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2>{notebook.title || 'Untitled'}</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  <Calendar className="w-3 h-3 inline mr-1" />
                  {new Date(notebook.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleGenerateSummary}
                disabled={summaryMutation.isPending}
                title="Generate a concise summary of your notebook content"
              >
                <Brain className="w-4 h-4 mr-2" />
                {summaryMutation.isPending ? 'Generating...' : 'Generate Summary'}
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleGenerateMindmap}
                disabled={mindmapMutation.isPending}
                title="Generate a mindmap structure from your notebook content"
              >
                <GitBranch className="w-4 h-4 mr-2" />
                {mindmapMutation.isPending ? 'Generating...' : 'Generate Mindmap'}
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowAIAssistant(!showAIAssistant)}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                AI Assistant
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-8 py-8">
        {isEditing ? (
          // Edit Mode
          <Card className="p-6 mb-6 border-blue-300 bg-blue-50">
            <h3 className="text-lg font-semibold mb-4">Edit Notebook</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Content</label>
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={10}
                  className="resize-none"
                  placeholder="Write your notes here..."
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleSaveEdit}
                  disabled={updateNoteMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {updateNoteMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  disabled={updateNoteMutation.isPending}
                >
                  Cancel
                </Button>
              </div>
              {updateNoteMutation.isError && (
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                  Error: {updateNoteMutation.error?.message || 'Failed to save changes'}
                </div>
              )}
            </div>
          </Card>
        ) : (
          // View Mode
          <>
            {/* AI Assistant Panel */}
            {showAIAssistant && (
              <Card className="p-6 mb-6 bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4>AI Notebook Assistant</h4>
                      <p className="text-sm text-muted-foreground">
                        Ask questions about your notes or get help understanding concepts
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowAIAssistant(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <Textarea
                    placeholder="Ask a question about your notes... (e.g., 'Summarize the key points' or 'Explain this concept')"
                    value={aiQuestion}
                    onChange={(e) => setAiQuestion(e.target.value)}
                    rows={3}
                    className="resize-none"
                  />
                  
                  <Button 
                    onClick={handleAskAI}
                    disabled={!aiQuestion.trim() || assistMutation.isPending}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    {assistMutation.isPending ? 'Processing...' : 'Ask AI'}
                  </Button>

                  {assistMutation.isError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                      Error: {assistMutation.error?.message || 'Failed to get AI response'}
                    </div>
                  )}

                  {assistMutation.isSuccess && assistMutation.data && (
                    <div className="p-4 bg-white border border-purple-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <Sparkles className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <h5 className="font-medium mb-2">AI Response:</h5>
                          <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                            {assistMutation.data.response}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Generated Summary */}
            {showSummary && summary && (
              <Card className="p-6 mb-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                      <Brain className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Generated Summary</h4>
                      <p className="text-sm text-muted-foreground">
                        AI-generated summary of your notebook content
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setShowSummary(false);
                      setSummary(null);
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-wrap text-gray-700" 
                    dangerouslySetInnerHTML={{ 
                      __html: summary
                        .split('\n')
                        .map((line) => {
                          const trimmed = line.trim();
                          if (trimmed.startsWith('# ')) {
                            return `<h1 class="text-xl font-bold mt-4 mb-2">${trimmed.slice(2)}</h1>`;
                          }
                          if (trimmed.startsWith('## ')) {
                            return `<h2 class="text-lg font-semibold mt-3 mb-2">${trimmed.slice(3)}</h2>`;
                          }
                          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                            return `<li class="ml-4 mb-1">${trimmed.slice(2)}</li>`;
                          }
                          if (trimmed === '') {
                            return '<br/>';
                          }
                          return `<p class="mb-2">${line}</p>`;
                        })
                        .join('')
                    }} 
                  />
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-4"
                  onClick={() => {
                    const newContent = editContent + '\n\n## AI Summary\n\n' + summary;
                    setEditContent(newContent);
                    setShowSummary(false);
                  }}
                >
                  Add to Notebook
                </Button>
              </Card>
            )}

            {/* Generated Mindmap */}
            {showMindmap && mindmap && (
              <Card className="p-6 mb-6 bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                      <GitBranch className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Generated Mindmap</h4>
                      <p className="text-sm text-muted-foreground">
                        Hierarchical structure of your notebook content
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setShowMindmap(false);
                      setMindmap(null);
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="bg-white rounded-lg p-4 border border-purple-200">
                  <div className="mb-4 pb-3 border-b border-purple-200">
                    <h3 className="text-lg font-bold text-purple-900">{mindmap.root}</h3>
                  </div>
                  <div className="space-y-2">
                    {mindmap.children.map((child, idx) => renderMindmapNode(child, 0, idx))}
                  </div>
                </div>
                <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                  <p className="text-xs text-purple-700">
                    💡 Tip: This mindmap shows the hierarchical structure. You can use this to better organize your notes!
                  </p>
                </div>
              </Card>
            )}

            {/* Placeholder Notice */}
            <Card className="p-6 bg-blue-50 border-blue-200 mb-8">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="mb-1">📝 Notebook Content</h4>
                  <p className="text-sm text-muted-foreground">
                    This is your notebook: <span className="font-medium text-blue-600">{notebook.title || 'Untitled'}</span>.
                    In the full implementation, you would be able to edit this content, add rich formatting, 
                    and insert code blocks. For now, you can use the AI Assistant above to ask questions about your notes.
                  </p>
                </div>
              </div>
            </Card>

            {/* Notebook Content */}
            <Card className="p-8">
              <div className="prose prose-blue max-w-none">
                <div className="whitespace-pre-wrap font-mono text-sm">
                  {placeholderContent}
                </div>
              </div>
            </Card>

            {/* Info: AI Assistant available in header */}
            <Card className="p-4 mt-6 bg-blue-50 border-blue-200">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <p className="text-sm text-blue-800">
                  💡 Click the <strong>AI Assistant</strong> button in the header above to ask questions about your notes!
                </p>
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <Button variant="outline" onClick={onBack}>
                Close
              </Button>
              <Button 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => setIsEditing(true)}
              >
                <FileText className="w-4 h-4 mr-2" />
                Edit Notebook
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
