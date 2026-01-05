import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { 
  Search, 
  Plus, 
  MessageSquare, 
  ThumbsUp, 
  TrendingUp,
  Clock,
  X,
  Trash2,
  Filter,
  XCircle
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
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { 
  useForumPosts, 
  useCreateForumPost, 
  useForumPost, 
  useDeleteForumPost
} from "../hooks/useApi";
import { useAuth } from "../contexts/AuthContext";
import type { ForumPostWithAuthor } from "../interfaces";
import ForumPostDetail from "./ForumPostDetail";

export default function ForumPage() {
  const { user } = useAuth();
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  
  const [currentView, setCurrentView] = useState<"list" | "detail">("list");
  const [selectedPost, setSelectedPost] = useState<ForumPostWithAuthor | null>(null);
  const [isNewPostOpen, setIsNewPostOpen] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostTags, setNewPostTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"recent" | "popular" | "mostReplies">("recent");
  
  // NEW: Tag filter state
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Fetch posts from API with tag filter
  const { data: postsData, isLoading } = useForumPosts(selectedTag);
  const createPostMutation = useCreateForumPost();
  const deletePostMutation = useDeleteForumPost();
  
  // Fetch single post detail when viewing detail or when postId is in URL
  const { data: postDetailData, refetch: refetchPostDetail } = useForumPost(
    postId || selectedPost?.id || ''
  );

  // Handle URL-based navigation
  useEffect(() => {
    if (postId && postDetailData) {
      setSelectedPost(postDetailData);
      setCurrentView("detail");
    } else if (!postId && currentView === "detail") {
      // If no postId in URL but we're in detail view, go back to list
      setCurrentView("list");
      setSelectedPost(null);
    }
  }, [postId, postDetailData, currentView]);

  // Available tags for filtering (standardized lowercase for consistency)
  const availableTags = [
    "python", 
    "javascript", 
    "java", 
    "cpp", 
    "csharp",
    "algorithms", 
    "data-structures", 
    "sql", 
    "database",
    "web-development", 
    "backend",
    "frontend",
    "ai-ml", 
    "interview-prep",
    "debugging",
    "best-practices",
    "career",
    "help"
  ];

  // Display names for tags (for UI)
  const tagDisplayNames: Record<string, string> = {
    "python": "Python",
    "javascript": "JavaScript",
    "java": "Java",
    "cpp": "C++",
    "csharp": "C#",
    "algorithms": "Algorithms",
    "data-structures": "Data Structures",
    "sql": "SQL",
    "database": "Database",
    "web-development": "Web Dev",
    "backend": "Backend",
    "frontend": "Frontend",
    "ai-ml": "AI/ML",
    "interview-prep": "Interview Prep",
    "debugging": "Debugging",
    "best-practices": "Best Practices",
    "career": "Career",
    "help": "Help"
  };

  // Handle tag selection
  const handleTagSelect = (tag: string) => {
    if (tag === "all" || selectedTag === tag) {
      // If clicking "All" or the same tag, clear filter
      setSelectedTag(null);
    } else {
      setSelectedTag(tag);
    }
  };

  // Clear tag filter
  const handleClearFilter = () => {
    setSelectedTag(null);
  };

  // Sort posts based on selected option
  const sortedPosts = useMemo(() => {
    const postsList = postsData || [];
    switch (sortBy) {
      case "popular":
        return [...postsList].sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
      case "mostReplies":
        return [...postsList].sort((a, b) => (b.replyCount || 0) - (a.replyCount || 0));
      case "recent":
      default:
        return postsList; // Already sorted by created_at from backend
    }
  }, [postsData, sortBy]);

  const handleViewPost = (post: ForumPostWithAuthor) => {
    // Navigate to the post URL instead of just changing view
    navigate(`/forum/${post.id}`);
  };

  const handleBackToList = () => {
    // Navigate back to forum list
    navigate('/forum');
  };

  const handleCreatePost = async () => {
    if (!newPostTitle || !newPostContent) return;

    try {
      await createPostMutation.mutateAsync({
        title: newPostTitle,
        contentMarkdown: newPostContent,
        tags: newPostTags
      });

      setIsNewPostOpen(false);
      setNewPostTitle("");
      setNewPostContent("");
      setNewPostTags([]);
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleDeletePost = async (postId: string, e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // Prevent opening post detail
    
    if (!window.confirm('Are you sure you want to delete this post? This will also delete all replies.')) {
      return;
    }

    try {
      await deletePostMutation.mutateAsync(postId);
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const tags = ["all", ...availableTags]; // Add "all" option

  // If viewing post detail
  if (currentView === "detail" && selectedPost) {
    // Use fetched detail data if available, otherwise use cached selected post
    const postToShow = postDetailData || selectedPost;
    
    return (
      <ForumPostDetail 
        post={postToShow} 
        onBack={handleBackToList}
        onUpdate={() => refetchPostDetail()}
      />
    );
  }

  return (
    <div className="p-8 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between" style={{ backgroundColor: '#B9D6F3', padding: '1.5rem', borderRadius: '0.5rem' }}>
        <div>
          <h2>Community Forum</h2>
          <p className="text-muted-foreground mt-1">Ask questions, share knowledge, and help others</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => setIsNewPostOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Post
          </Button>
        </div>
      </div>

      {/* Active Filter Indicator */}
      {selectedTag && (
        <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <Filter className="w-4 h-4 text-blue-600" />
          <span className="text-sm text-blue-800">
            Filtering by tag: <strong>{selectedTag}</strong>
          </span>
          <Button 
            variant="ghost" 
            size="sm" 
            className="ml-auto text-blue-600 hover:text-blue-700 hover:bg-blue-100"
            onClick={handleClearFilter}
          >
            <XCircle className="w-4 h-4 mr-1" />
            Clear Filter
          </Button>
        </div>
      )}

      {/* New Post Dialog */}
      <Dialog open={isNewPostOpen} onOpenChange={setIsNewPostOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Post</DialogTitle>
            <DialogDescription>
              Share your question or knowledge with the community
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input 
                placeholder="What's your question or topic?"
                value={newPostTitle}
                onChange={(e) => setNewPostTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Content *</Label>
              <Textarea 
                placeholder="Describe your question or share your thoughts..." 
                className="min-h-[200px]"
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Tags (optional)</Label>
              <Input 
                placeholder="e.g., python, algorithms, help (comma separated)"
                onChange={(e) => setNewPostTags(e.target.value.split(',').map(t => t.trim()).filter(t => t))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewPostOpen(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleCreatePost}
              disabled={!newPostTitle || !newPostContent || createPostMutation.isPending}
            >
              {createPostMutation.isPending ? 'Posting...' : 'Post Question'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search discussions..."
            className="pl-10 border-2 border-gray-300 shadow-md"
          />
        </div>
        <Select value={sortBy} onValueChange={(value: "recent" | "popular" | "mostReplies") => setSortBy(value)}>
          <SelectTrigger className="w-[180px] border-2 border-gray-300 shadow-md">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">📅 Most Recent</SelectItem>
            <SelectItem value="popular">🔥 Most Popular</SelectItem>
            <SelectItem value="mostReplies">💬 Most Replies</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tags - Now with active filter functionality */}
      <div className="flex items-center gap-2 flex-wrap">
        {tags.map((tag) => {
          const isActive = tag === "all" 
            ? selectedTag === null 
            : selectedTag === tag;
          
          const displayName = tag === "all" ? "All" : (tagDisplayNames[tag] || tag);
          
          return (
            <Badge
              key={tag}
              variant={isActive ? "default" : "outline"}
              className={`cursor-pointer transition-all ${
                isActive 
                  ? "bg-blue-600 hover:bg-blue-700 text-white" 
                  : "hover:bg-gray-100 hover:border-blue-400"
              }`}
              onClick={() => handleTagSelect(tag)}
            >
              {displayName}
              {isActive && tag !== "all" && (
                <X className="w-3 h-3 ml-1" />
              )}
            </Badge>
          );
        })}
      </div>

      {/* Posts */}
      <div className="space-y-4">
        {isLoading ? (
          <Card className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-muted-foreground mt-4">Loading posts...</p>
          </Card>
        ) : sortedPosts.length === 0 ? (
          <Card className="p-12 text-center">
            <MessageSquare className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {selectedTag ? `No posts found with tag "${selectedTag}"` : 'No posts yet'}
            </h3>
            <p className="text-muted-foreground">
              {selectedTag 
                ? 'Try selecting a different tag or clear the filter.' 
                : 'Be the first to start a discussion!'}
            </p>
            {selectedTag && (
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={handleClearFilter}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Clear Filter
              </Button>
            )}
          </Card>
        ) : (
          sortedPosts.map((post: ForumPostWithAuthor) => (
            <Card 
              key={post.id} 
              className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 border-gray-300 shadow-md"
              onClick={() => handleViewPost(post)}
            >
              <div className="flex gap-4">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  {typeof post.author === 'object' && post.author?.avatarUrl ? (
                    <img src={post.author.avatarUrl} alt="" className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <span className="text-blue-600 font-bold">
                      {typeof post.author === 'object' 
                        ? post.author?.displayName?.substring(0, 2).toUpperCase() || 'U'
                        : 'U'}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="truncate">{post.title}</h4>
                        {post.isPinned && (
                          <Badge className="bg-orange-100 text-orange-700 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            Pinned
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span>
                          {typeof post.author === 'object' 
                            ? post.author?.displayName || 'Anonymous'
                            : 'Anonymous'}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex items-center gap-2 mt-3">
                    {Array.isArray(post.tags) && post.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-6 mt-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-md" style={{ backgroundColor: '#B6DA9F' }}>
                      <MessageSquare className="w-4 h-4" />
                      <span>{post.replyCount || 0} replies</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-md" style={{ backgroundColor: '#FFB3C6' }}>
                      <ThumbsUp className="w-4 h-4" />
                      <span>{post.upvotes || 0}</span>
                    </div>
                    {post.hasAcceptedAnswer && (
                      <Badge className="bg-green-100 text-green-700">
                        ✓ Answered
                      </Badge>
                    )}
                    {user?.id === post.authorId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-auto text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleDeletePost(post.id, e)}
                        disabled={deletePostMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}