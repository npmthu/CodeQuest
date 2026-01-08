import { useState, useCallback, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { 
  ArrowLeft,
  FileText,
  Sparkles,
  Calendar,
  MessageSquare,
  X,
  Brain,
  GitBranch,
  AlertTriangle,
  Loader2,
  Save
} from "lucide-react";
import { toast } from "sonner";
import { useNotebookAssist, useGenerateSummary, useGenerateMindmap, useUpdateNote } from "../hooks/useApi";
import type { Note } from "../interfaces";
import { useNotebookAI } from "../hooks/useNotebookAI";
import { 
  AILoadingOverlay, 
  SummaryDisplay, 
  MindmapDisplay, 
  parseSummaryResponse, 
  parseMindmapResponse,
  type SummaryData,
  type MindmapData
} from "./AIResultDisplay";
import { MarkdownRenderer } from "./ui/MarkdownRenderer";

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
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [mindmap, setMindmap] = useState<MindmapData | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [showMindmap, setShowMindmap] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  const assistMutation = useNotebookAssist();
  const summaryMutation = useGenerateSummary();
  const mindmapMutation = useGenerateMindmap();
  const updateNoteMutation = useUpdateNote(notebook.id);
  
  // Use our custom AI hook for loading states and validation
  const {
    generationState,
    validateContent
  } = useNotebookAI({
    minContentLength: 10,
    onValidationError: (errors) => {
      errors.forEach(err => toast.warning(err));
    }
  });

  // Track unsaved changes
  useEffect(() => {
    const titleChanged = editTitle !== (notebook.title || '');
    const contentChanged = editContent !== (notebook.contentMarkdown || '');
    setHasUnsavedChanges(titleChanged || contentChanged);
  }, [editTitle, editContent, notebook.title, notebook.contentMarkdown]);

  // Warn about unsaved changes on page leave
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleAskAI = async () => {
    if (!aiQuestion.trim()) {
      toast.warning('Please enter a question');
      return;
    }

    // Use CURRENT editContent (not database content) for context
    const currentContent = editContent || notebook.contentMarkdown || '';
    
    try {
      await assistMutation.mutateAsync({
        question: aiQuestion,
        context: currentContent, // Use current editor content!
        sourceType: 'note',
        sourceId: notebook.id
      });
      toast.success('AI response received!');
    } catch (error) {
      console.error('AI assist error:', error);
      toast.error('Failed to get AI response');
    }
  };

  const handleGenerateSummary = async () => {
    // IMPORTANT: Use CURRENT editContent (what user sees in editor)
    // NOT notebook.contentMarkdown (database content)
    const currentContent = editContent || '';
    
    // Validate content
    const validation = validateContent(editTitle, currentContent);
    if (!validation.isValid) {
      return; // Toast warnings already shown by validateContent
    }

    try {
      const result = await summaryMutation.mutateAsync(currentContent);
      // Parse and format as structured bullet points
      const parsedSummary = parseSummaryResponse(result.summary || result);
      setSummary(parsedSummary);
      setShowSummary(true);
      toast.success('Summary generated successfully!');
    } catch (error: any) {
      console.error('Summary generation error:', error);
      toast.error(`Failed to generate summary: ${error.message}`);
    }
  };

  const handleGenerateMindmap = async () => {
    // IMPORTANT: Use CURRENT editContent (what user sees in editor)
    // NOT notebook.contentMarkdown (database content)
    const currentContent = editContent || '';
    
    // Validate content
    const validation = validateContent(editTitle, currentContent);
    if (!validation.isValid) {
      return; // Toast warnings already shown by validateContent
    }

    try {
      const result = await mindmapMutation.mutateAsync(currentContent);
      // Parse and format as visual tree structure
      const parsedMindmap = parseMindmapResponse(result);
      setMindmap(parsedMindmap);
      setShowMindmap(true);
      toast.success('Mindmap generated successfully!');
    } catch (error: any) {
      console.error('Mindmap generation error:', error);
      toast.error(`Failed to generate mindmap: ${error.message}`);
    }
  };

  const handleSaveEdit = async () => {
    // Validate before saving
    if (!editTitle.trim()) {
      toast.warning('Please enter a title for your notebook');
      return;
    }
    
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
      setHasUnsavedChanges(false);
      
      // Show success toast
      toast.success('Notebook saved successfully!');
    } catch (error: any) {
      console.error('Error saving note:', error);
      toast.error(`Failed to save changes: ${error.message || 'Unknown error'}`);
    }
  };

  // Handle back with unsaved changes warning
  const handleBack = useCallback(() => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to leave?'
      );
      if (!confirmed) return;
    }
    onBack();
  }, [hasUnsavedChanges, onBack]);

  // Check if AI generation is in progress
  const isAIGenerating = summaryMutation.isPending || mindmapMutation.isPending || assistMutation.isPending;

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
    <div className="min-h-screen bg-background relative">
      {/* AI Loading Overlay */}
      <AILoadingOverlay 
        isLoading={isAIGenerating}
        type={summaryMutation.isPending ? 'summary' : mindmapMutation.isPending ? 'mindmap' : 'assist'}
        progress={generationState.progress}
      />
      
      {/* Unsaved Changes Banner */}
      {hasUnsavedChanges && (
        <div className="bg-amber-500/10 border-b border-amber-500/30 px-8 py-2">
          <div className="max-w-4xl mx-auto flex items-center gap-2 text-amber-700">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm font-medium">You have unsaved changes</span>
            <Button 
              size="sm" 
              variant="outline" 
              className="ml-auto text-amber-700 border-amber-500/50 hover:bg-amber-500/20"
              onClick={handleSaveEdit}
              disabled={updateNoteMutation.isPending}
            >
              <Save className="w-3 h-3 mr-1" />
              {updateNoteMutation.isPending ? 'Saving...' : 'Save Now'}
            </Button>
          </div>
        </div>
      )}
      
      {/* Header */}
      <div className="bg-white border-b border-border">
        <div className="max-w-4xl mx-auto px-8 py-6">
          <Button 
            variant="ghost" 
            onClick={handleBack}
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
              {/* Generate Summary Button with Loading State */}
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleGenerateSummary}
                disabled={summaryMutation.isPending || isAIGenerating}
                title="Generate a concise summary of your notebook content"
                style={{ cursor: summaryMutation.isPending || isAIGenerating ? 'not-allowed' : 'pointer' }}
              >
                {summaryMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Brain className="w-4 h-4 mr-2" />
                )}
                {summaryMutation.isPending ? 'Generating...' : 'Generate Summary'}
              </Button>
              
              {/* Generate Mindmap Button with Loading State */}
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleGenerateMindmap}
                disabled={mindmapMutation.isPending || isAIGenerating}
                title="Generate a mindmap structure from your notebook content"
                style={{ cursor: mindmapMutation.isPending || isAIGenerating ? 'not-allowed' : 'pointer' }}
              >
                {mindmapMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <GitBranch className="w-4 h-4 mr-2" />
                )}
                {mindmapMutation.isPending ? 'Generating...' : 'Generate Mindmap'}
              </Button>
              
              {/* AI Assistant Button */}
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowAIAssistant(!showAIAssistant)}
                disabled={isAIGenerating}
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

            {/* Generated Summary - Improved Bullet Point Display */}
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
                
                {/* Use the new SummaryDisplay component for bullet points */}
                <SummaryDisplay 
                  data={summary}
                  isLoading={summaryMutation.isPending}
                  className="mb-4"
                />
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-4"
                  onClick={() => {
                    // Convert summary to text format for adding to notebook
                    const summaryText = [
                      summary.overview && summary.overview,
                      '',
                      '**Key Points:**',
                      ...summary.keyPoints.map(point => `- ${point}`),
                      '',
                      summary.topics?.length && `**Topics:** ${summary.topics.join(', ')}`
                    ].filter(Boolean).join('\n');
                    
                    const newContent = editContent + '\n\n## AI Summary\n\n' + summaryText;
                    setEditContent(newContent);
                    setShowSummary(false);
                    setIsEditing(true);
                    toast.success('Summary added to notebook!');
                  }}
                >
                  Add to Notebook
                </Button>
              </Card>
            )}

            {/* Generated Mindmap - Improved Visual Tree Diagram */}
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
                
                {/* Use the new MindmapDisplay component for visual tree */}
                <MindmapDisplay 
                  data={mindmap}
                  isLoading={mindmapMutation.isPending}
                  className="mb-4"
                />
                
                <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                  <p className="text-xs text-purple-700">
                    💡 Tip: This mindmap shows the hierarchical structure. You can use this to better organize your notes!
                  </p>
                </div>
              </Card>
            )}



            {/* Notebook Content */}
            <Card className="p-8">
              <MarkdownRenderer 
                content={notebook.contentMarkdown || 'No content yet. Start writing your notes here.'}
              />
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
              <Button variant="outline" onClick={handleBack}>
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
