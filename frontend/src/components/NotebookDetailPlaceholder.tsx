import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { 
  ArrowLeft,
  FileText,
  Star,
  Sparkles,
  Calendar
} from "lucide-react";

interface NotebookDetailPlaceholderProps {
  notebook: {
    id: number;
    title: string;
    preview: string;
    date: string;
    starred: boolean;
  };
  onBack: () => void;
}

export default function NotebookDetailPlaceholder({ notebook, onBack }: NotebookDetailPlaceholderProps) {
  // Generate unique placeholder content based on notebook id
  const placeholderContent = `# ${notebook.title}

## Overview
${notebook.preview}

This is placeholder content for "${notebook.title}". In the full implementation, this notebook would contain:

- Detailed notes and explanations
- Code snippets and examples
- Diagrams and visualizations
- Practice problems and solutions
- Personal insights and takeaways

## Key Points

### Point 1
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

### Point 2
Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

### Point 3
Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.

## Code Examples

\`\`\`python
# Example code snippet
def example_function():
    print("This is a placeholder code example")
    return True
\`\`\`

## Notes
- This is a placeholder note
- Content will be editable in full implementation
- AI features will be available for summarization and mind mapping

---
*Last updated: ${notebook.date}*`;

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
                <h2>{notebook.title}</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  <Calendar className="w-3 h-3 inline mr-1" />
                  {notebook.date}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {notebook.starred && (
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-8 py-8">
        {/* Placeholder Notice */}
        <Card className="p-6 bg-blue-50 border-blue-200 mb-8">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="mb-1">🚧 Notebook Placeholder Content</h4>
              <p className="text-sm text-muted-foreground">
                This is unique placeholder content for <span className="font-medium text-blue-600">{notebook.title}</span>.
                In the full implementation, you would be able to edit this content, add rich formatting, 
                insert code blocks, and use AI features like summarization and mind map generation.
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

        {/* AI Features Placeholder */}
        <Card className="p-6 mt-6 bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="mb-3">AI-Powered Features (Coming Soon)</h4>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" disabled>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Summarize with AI
                </Button>
                <Button variant="outline" disabled>
                  Generate Mind Map
                </Button>
                <Button variant="outline" disabled>
                  Generate Flashcards
                </Button>
                <Button variant="outline" disabled>
                  Ask AI Questions
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <Button variant="outline" onClick={onBack}>
            Close
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700" disabled>
            <FileText className="w-4 h-4 mr-2" />
            Edit Notebook (Coming Soon)
          </Button>
        </div>
      </div>
    </div>
  );
}
