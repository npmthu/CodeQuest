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
import { useNotes, useCreateNote } from "../hooks/useApi";

export default function NotebookPage() {
  const [selectedNote, setSelectedNote] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<"list" | "detail">("list");
  const [isNewNotebookOpen, setIsNewNotebookOpen] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState("");

  // Fetch notes from API
  const { data: notesData, isLoading } = useNotes();
  const createNoteMutation = useCreateNote();

  const notes = notesData || [];

  const handleCreateNote = async () => {
    if (!newNoteTitle.trim()) return;

    try {
      await createNoteMutation.mutateAsync({
        title: newNoteTitle,
        content_markdown: '',
        is_private: true,
        tags: []
      });

      setIsNewNotebookOpen(false);
      setNewNoteTitle("");
    } catch (error) {
      console.error('Error creating note:', error);
    }
  };

  const handleNotebookClick = (noteId: string) => {
    setSelectedNote(noteId);
    setCurrentView("detail");
  };

  const handleBack = () => {
    setCurrentView("list");
  };

  const selectedNoteData = notes.find((note: any) => note.id === selectedNote);

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If viewing notebook detail
  if (currentView === "detail" && selectedNoteData) {
    return (
      <NotebookDetailPlaceholder 
        notebook={selectedNoteData} 
        onBack={handleBack} 
      />
    );
  }

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
                    Start taking notes on your learning journey
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Notebook Title *</Label>
                    <Input 
                      placeholder="e.g., Array Algorithms"
                      value={newNoteTitle}
                      onChange={(e) => setNewNoteTitle(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsNewNotebookOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={handleCreateNote}
                    disabled={!newNoteTitle.trim() || createNoteMutation.isPending}
                  >
                    {createNoteMutation.isPending ? 'Creating...' : 'Create Notebook'}
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
          {notes.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No notes yet</p>
              <p className="text-xs">Create your first note to get started</p>
            </div>
          ) : (
            notes.map((note: any) => (
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
                    <span className="text-sm truncate">{note.title || 'Untitled'}</span>
                  </div>
                  <div className="flex items-center gap-1">
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
                  {note.content_markdown?.substring(0, 100) || 'No content'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(note.updated_at).toLocaleDateString()}
                </p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col bg-background">
        {/* Empty State - No Note Selected */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No note selected</h3>
            <p className="text-muted-foreground mb-6">
              Select a note from the list or create a new one to get started
            </p>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => setIsNewNotebookOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Note
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}