import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Plus,
  Search,
  FileText,
  MoreVertical,
  Trash2,
  Share2,
  Copy,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Label } from "./ui/label";
import NotebookDetailPlaceholder from "./NotebookDetail";
import { useNotes, useCreateNote, useDeleteNote } from "../hooks/useApi";
import type { Note } from "../interfaces";
import { toast } from "sonner";

export default function NotebookPage() {
  const { noteId } = useParams<{ noteId: string }>();
  const navigate = useNavigate();
  
  const [selectedNote, setSelectedNote] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<"list" | "detail">("list");
  const [isNewNotebookOpen, setIsNewNotebookOpen] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Fetch notes from API
  const { data: notesData, isLoading } = useNotes();
  const createNoteMutation = useCreateNote();
  const deleteNoteMutation = useDeleteNote();

  const notes = notesData || [];

  // Handle URL-based navigation
  useEffect(() => {
    if (noteId) {
      const noteExists = notes.find((n: Note) => n.id === noteId);
      if (noteExists) {
        setSelectedNote(noteId);
        setCurrentView("detail");
      } else if (!isLoading) {
        // Note doesn't exist, redirect to list
        navigate('/notebook');
      }
    } else if (!noteId && currentView === "detail") {
      // If no noteId in URL but we're in detail view, go back to list
      setCurrentView("list");
      setSelectedNote(null);
    }
  }, [noteId, notes, isLoading, currentView, navigate]);

  // Filter notes based on search query
  const filteredNotes = notes.filter((note: Note) => {
    const query = searchQuery.toLowerCase();
    return (
      note.title?.toLowerCase().includes(query) ||
      note.contentMarkdown?.toLowerCase().includes(query) ||
      (note.tags || []).some((tag: string) => tag.toLowerCase().includes(query))
    );
  });

  const handleCreateNote = async () => {
    if (!newNoteTitle.trim()) return;

    try {
      const result = await createNoteMutation.mutateAsync({
        title: newNoteTitle,
        contentMarkdown: "",
        isPrivate: true,
        tags: [],
      });

      setIsNewNotebookOpen(false);
      setNewNoteTitle("");
      
      // Navigate to the newly created note
      if (result?.data?.id) {
        navigate(`/notebook/${result.data.id}`);
      }
    } catch (error) {
      console.error("Error creating note:", error);
      toast.error("Failed to create note");
    }
  };

  const handleNotebookClick = (noteId: string) => {
    navigate(`/notebook/${noteId}`);
  };

  const handleBack = () => {
    navigate('/notebook');
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await deleteNoteMutation.mutateAsync(noteId);
      toast.success("Note deleted successfully");
      
      // If we're viewing the deleted note, go back to list
      if (selectedNote === noteId) {
        navigate('/notebook');
      }
      
      setDeleteConfirmId(null);
    } catch (error) {
      console.error("Error deleting note:", error);
      toast.error("Failed to delete note");
    }
  };

  const handleCopyLink = (noteId: string) => {
    const url = `${window.location.origin}/notebook/${noteId}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard");
  };

  const selectedNoteData = notes.find((note: Note) => note.id === selectedNote);

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
            <Dialog
              open={isNewNotebookOpen}
              onOpenChange={setIsNewNotebookOpen}
            >
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
                  <Button
                    variant="outline"
                    onClick={() => setIsNewNotebookOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={handleCreateNote}
                    disabled={
                      !newNoteTitle.trim() || createNoteMutation.isPending
                    }
                  >
                    {createNoteMutation.isPending
                      ? "Creating..."
                      : "Create Notebook"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search notes..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Notes List */}
        <div className="flex-1 overflow-auto p-2">
          {filteredNotes.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">
                {searchQuery ? "No notes match your search" : "No notes yet"}
              </p>
              {!searchQuery && (
                <p className="text-xs">Create your first note to get started</p>
              )}
            </div>
          ) : (
            filteredNotes.map((note: Note) => (
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
                    <span className="text-sm truncate">
                      {note.title || "Untitled"}
                    </span>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="p-1 hover:bg-gray-200 rounded inline-flex"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <MoreVertical className="w-3 h-3 text-gray-400" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                      <DropdownMenuItem
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          handleCopyLink(note.id);
                        }}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Link
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          // Could implement share functionality here
                          toast.info("Share functionality coming soon");
                        }}
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          setDeleteConfirmId(note.id);
                        }}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                  {note.contentMarkdown?.substring(0, 100) || "No content"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(note.updatedAt).toLocaleDateString()}
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Notebook</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this notebook? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmId(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirmId && handleDeleteNote(deleteConfirmId)}
              disabled={deleteNoteMutation.isPending}
            >
              {deleteNoteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
