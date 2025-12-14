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
  X
} from "lucide-react";
import { useNotebookAssist } from "../hooks/useApi";
import type { Note } from "../interfaces";

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
  const assistMutation = useNotebookAssist();

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

  const handleSaveEdit = () => {
    // TODO: Call API to save edited notebook
    console.log('Save edit:', { editTitle, editContent });
    setIsEditing(false);
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
                  className="bg-green-600 hover:bg-green-700"
                >
                  Save Changes
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
              </div>
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
