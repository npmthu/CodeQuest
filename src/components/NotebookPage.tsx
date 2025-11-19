import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { 
  Plus, 
  Search, 
  FileText, 
  Trash2,
  Star,
  MoreVertical,
  Sparkles,
  Brain,
  Bold,
  Italic,
  Code,
  List,
  CheckSquare
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Label } from "./ui/label";
import NotebookDetailPlaceholder from "./NotebookDetailPlaceholder";

export default function NotebookPage() {
  const [selectedNote, setSelectedNote] = useState<number | null>(1);
  const [currentView, setCurrentView] = useState<"list" | "detail">("list");
  const [isNewNotebookOpen, setIsNewNotebookOpen] = useState(false);

  const notes = [
    {
      id: 1,
      title: "Dynamic Programming Notes",
      preview: "Key concepts and patterns for DP problems...",
      date: "Oct 20, 2025",
      starred: true,
    },
    {
      id: 2,
      title: "Binary Tree Traversal",
      preview: "Inorder, preorder, and postorder traversal...",
      date: "Oct 19, 2025",
      starred: false,
    },
    {
      id: 3,
      title: "SQL Query Optimization",
      preview: "Tips for writing efficient SQL queries...",
      date: "Oct 18, 2025",
      starred: true,
    },
    {
      id: 4,
      title: "Interview Prep Checklist",
      preview: "Things to review before coding interviews...",
      date: "Oct 17, 2025",
      starred: false,
    },
  ];

  const handleNotebookClick = (noteId: number) => {
    setSelectedNote(noteId);
    setCurrentView("detail");
  };

  const handleBack = () => {
    setCurrentView("list");
  };

  const selectedNoteData = notes.find(note => note.id === selectedNote);

  // If viewing notebook detail
  if (currentView === "detail" && selectedNoteData) {
    return (
      <NotebookDetailPlaceholder 
        notebook={selectedNoteData} 
        onBack={handleBack} 
      />
    );
  }

  const noteContent = `# Dynamic Programming Notes

## Key Concepts

Dynamic Programming is an optimization technique that solves complex problems by breaking them down into simpler subproblems.

### When to use DP?
- Optimal substructure property
- Overlapping subproblems
- Can be solved using recursion

## Common Patterns

### 1. Fibonacci Pattern
\`\`\`python
def fib(n):
    if n <= 1:
        return n
    dp = [0] * (n + 1)
    dp[1] = 1
    for i in range(2, n + 1):
        dp[i] = dp[i-1] + dp[i-2]
    return dp[n]
\`\`\`

### 2. 0/1 Knapsack
- Used for subset problems
- Decision: include or exclude

### 3. Unbounded Knapsack
- Unlimited items available
- Coin change, rod cutting

## Important Problems
- [ ] Climbing Stairs
- [x] Coin Change
- [ ] Longest Common Subsequence
- [x] House Robber
- [ ] Edit Distance

## Tips
> Always identify the state and transition before coding`;

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      {/* Notes List */}
      <div className="w-80 border-r border-border bg-white flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h3>My Notes</h3>
            <Dialog open={isNewNotebookOpen} onOpenChange={setIsNewNotebookOpen}>
              <Button 
                size="sm" 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => setIsNewNotebookOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                New
              </Button>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Notebook</DialogTitle>
                  <DialogDescription>
                    🚧 This is a placeholder dialog. All features are non-functional.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Notebook Title *</Label>
                    <Input placeholder="e.g., Array Algorithms" disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Category (Optional)</Label>
                    <Input placeholder="e.g., DSA, Python, SQL" disabled />
                  </div>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <strong className="text-blue-600">Note:</strong> This is a placeholder dialog. 
                      In the full implementation, you would be able to create notebooks with templates, 
                      categories, and start writing immediately with AI assistance.
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsNewNotebookOpen(false)}>
                    Cancel
                  </Button>
                  <Button className="bg-blue-600 hover:bg-blue-700" disabled>
                    Create Notebook
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search notes..." className="pl-9" />
          </div>
        </div>

        {/* Notes List */}
        <div className="flex-1 overflow-auto p-2">
          {notes.map((note) => (
            <button
              key={note.id}
              onClick={() => handleNotebookClick(note.id)}
              className={`w-full text-left p-4 rounded-lg mb-2 transition-colors ${
                selectedNote === note.id
                  ? "bg-blue-50 border border-blue-200"
                  : "hover:bg-gray-50"
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-sm truncate">{note.title}</span>
                </div>
                <div className="flex items-center gap-1">
                  {note.starred && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                  <span
                    className="p-1 hover:bg-gray-200 rounded cursor-pointer inline-flex"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <MoreVertical className="w-3 h-3 text-gray-400" />
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                {note.preview}
              </p>
              <p className="text-xs text-muted-foreground">{note.date}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col bg-background">
        {/* Toolbar */}
        <div className="bg-white border-b border-border px-6 py-3">
          <div className="flex items-center justify-between mb-3">
            <Input
              defaultValue="Dynamic Programming Notes"
              className="border-0 px-0 text-lg focus-visible:ring-0"
            />
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Star className="w-4 h-4 mr-2" />
                Star
              </Button>
              <Button variant="outline" size="sm">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* Formatting Toolbar */}
          <div className="flex items-center gap-1">
            <button className="p-2 hover:bg-gray-100 rounded">
              <Bold className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded">
              <Italic className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded">
              <Code className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-border mx-2"></div>
            <button className="p-2 hover:bg-gray-100 rounded">
              <List className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded">
              <CheckSquare className="w-4 h-4" />
            </button>
            <div className="flex-1"></div>
            <Button variant="outline" size="sm">
              <Sparkles className="w-4 h-4 mr-2" />
              Summarize with AI
            </Button>
            <Button variant="outline" size="sm">
              <Brain className="w-4 h-4 mr-2" />
              Generate Mind Map
            </Button>
          </div>
        </div>

        {/* Editor Content */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto p-8">
            <div className="prose prose-blue max-w-none">
              <textarea
                defaultValue={noteContent}
                className="w-full h-full min-h-[600px] border-0 outline-none resize-none font-mono text-sm"
                spellCheck={false}
              />
            </div>
          </div>
        </div>

        {/* AI Assistant Panel */}
        <div className="border-t border-border bg-blue-50 p-4">
          <Card className="p-4 bg-white">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="mb-2">AI Suggestions</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  I noticed you're learning about Dynamic Programming. Would you like me to:
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm">
                    Generate practice problems
                  </Button>
                  <Button variant="outline" size="sm">
                    Create flashcards
                  </Button>
                  <Button variant="outline" size="sm">
                    Explain a concept
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}