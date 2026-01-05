import { useState, useEffect } from "react";
import {
  Search,
  CheckCircle,
  XCircle,
  Flag,
  MessageSquare,
  Trash2,
  Eye,
  Loader2,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Avatar, AvatarFallback } from "../ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { adminApi } from "../../services/api";
import { toast } from "sonner";

interface Report {
  id: string;
  reportedBy: string;
  reason: string;
  timestamp: string;
}

interface ForumPost {
  id: string;
  author_id?: string;
  author_name?: string;
  author_email?: string;
  title: string;
  content: string;
  category?: string;
  topic_name?: string;
  created_at: string;
  reports_count?: number;
  reportDetails?: Report[];
  likes_count?: number;
  comments_count?: number;
}

export default function ContentModeration() {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [selectedPostComments, setSelectedPostComments] = useState<any[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getForumPosts();
      if (response.success && response.data) {
        const postsData = response.data.posts || [];
        setPosts(postsData);
      } else {
        toast.error(response.error || "Failed to fetch posts");
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast.error("Failed to load forum posts");
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    // Debug logging
    console.log("📅 Time debug:", {
      dateString,
      parsedDate: date.toISOString(),
      now: now.toISOString(),
      differenceInSeconds: seconds,
    });

    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (post.author_name || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "hidden" && post.status === "hidden") ||
      (activeTab === "visible" && post.status === "approved") ||
      (activeTab === "reported" && (post.reports_count || 0) > 0);
    return matchesSearch && matchesTab;
  });

  const handleHide = async (postId: string) => {
    try {
      const response = await adminApi.hidePost(postId);
      if (response.success) {
        toast.success("Post hidden successfully");
        setPosts(
          posts.map((post) =>
            post.id === postId ? { ...post, status: "hidden" as const } : post
          )
        );
      } else {
        toast.error(response.error || "Failed to hide post");
      }
    } catch (error) {
      toast.error("Failed to hide post");
    }
  };

  const handleShow = async (postId: string) => {
    try {
      const response = await adminApi.showPost(postId);
      if (response.success) {
        toast.success("Post shown successfully");
        setPosts(
          posts.map((post) =>
            post.id === postId ? { ...post, status: "approved" as const } : post
          )
        );
      } else {
        toast.error(response.error || "Failed to show post");
      }
    } catch (error) {
      toast.error("Failed to show post");
    }
  };

  const handleDelete = async (postId: string) => {
    try {
      const response = await adminApi.deletePost(postId);
      if (response.success) {
        toast.success("Post deleted permanently");
        setPosts(posts.filter((post) => post.id !== postId));
      } else {
        toast.error(response.error || "Failed to delete post");
      }
    } catch (error) {
      toast.error("Failed to delete post");
    }
    setPostToDelete(null);
  };

  const handleViewDetails = (post: ForumPost) => {
    setSelectedPost(post);
    setIsDetailsOpen(true);
  };

  const handleViewComments = async (post: ForumPost) => {
    if ((post.comments_count || 0) === 0) {
      toast.info("This post has no comments");
      return;
    }

    setSelectedPost(post);
    setIsCommentsOpen(true);
    setLoadingComments(true);

    try {
      const response = await adminApi.getPostReplies(post.id);
      if (response.success && response.data) {
        setSelectedPostComments(response.data.replies || []);
      } else {
        toast.error(response.error || "Failed to fetch comments");
        setSelectedPostComments([]);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
      toast.error("Failed to load comments");
      setSelectedPostComments([]);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    try {
      const response = await adminApi.deleteComment(commentId);
      if (response.success) {
        toast.success("Comment deleted successfully");
        // Remove comment from list
        setSelectedPostComments((prevComments) =>
          prevComments.filter((c) => c.id !== commentId)
        );
        // Update post comment count
        if (selectedPost) {
          setPosts(
            posts.map((post) =>
              post.id === selectedPost.id
                ? { ...post, comments_count: (post.comments_count || 1) - 1 }
                : post
            )
          );
        }
      } else {
        toast.error(response.error || "Failed to delete comment");
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Failed to delete comment");
    }
  };

  const reportedCount = posts.filter((p) => (p.reports_count || 0) > 0).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2">Loading posts...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl text-[#1E3A8A] mb-2">Content Moderation</h1>
        <p className="text-gray-600">
          Review and moderate forum posts and user content
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="rounded-2xl border-gray-200">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Posts</p>
                <p className="text-2xl text-gray-900">{posts.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-gray-200">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Reported Posts</p>
                <p className="text-2xl text-gray-900">{reportedCount}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                <Flag className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search posts by title, content, or author..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-11 rounded-xl border-gray-300"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-100 p-1 rounded-xl">
          <TabsTrigger value="all" className="rounded-lg">
            All Posts
          </TabsTrigger>
          <TabsTrigger value="reported" className="rounded-lg">
            Reported ({reportedCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No posts found
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPosts.map((post) => (
                <Card
                  key={post.id}
                  className="rounded-2xl border-gray-200 hover:shadow-md transition-all"
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <Avatar className="mt-1">
                          <AvatarFallback className="bg-[#2563EB] text-white">
                            {(post.author_name || "U").charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900">
                              {post.author_name || "Unknown User"}
                            </span>
                            <span className="text-sm text-gray-500">•</span>
                            <span className="text-sm text-gray-500">
                              {formatTimeAgo(post.created_at)}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {post.category || post.topic_name || "General"}
                            </Badge>
                          </div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {post.title}
                          </h3>
                          <p className="text-gray-600 line-clamp-2 mb-3">
                            {post.content}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>👍 {post.likes_count || 0}</span>
                            <button
                              onClick={() => handleViewComments(post)}
                              className="hover:text-blue-600 transition-colors flex items-center gap-1"
                              title="View comments"
                            >
                              💬 {post.comments_count || 0}
                            </button>
                            {(post.reports_count || 0) > 0 && (
                              <span className="text-red-500 flex items-center gap-1">
                                <Flag className="w-4 h-4" />
                                {post.reports_count} reports
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(post)}
                          className="rounded-lg"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPostToDelete(post.id)}
                          className="rounded-lg text-red-600 hover:bg-red-50"
                          title="Delete post"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Post Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedPost?.title}</DialogTitle>
            <DialogDescription>
              Posted by {selectedPost?.author_name} •{" "}
              {selectedPost && formatTimeAgo(selectedPost.created_at)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {selectedPost?.category || "General"}
              </Badge>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl">
              <p className="text-gray-700 whitespace-pre-wrap">
                {selectedPost?.content}
              </p>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>👍 {selectedPost?.likes_count || 0} likes</span>
              <span>💬 {selectedPost?.comments_count || 0} comments</span>
              {(selectedPost?.reports_count || 0) > 0 && (
                <span className="text-red-500">
                  🚩 {selectedPost?.reports_count} reports
                </span>
              )}
            </div>
            <div className="flex gap-2 pt-4 border-t">
              <Button
                onClick={() => {
                  setPostToDelete(selectedPost!.id);
                  setIsDetailsOpen(false);
                }}
                variant="destructive"
                className="w-full"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Post
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Comments Dialog */}
      <Dialog open={isCommentsOpen} onOpenChange={setIsCommentsOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Comments on: {selectedPost?.title}</DialogTitle>
            <DialogDescription>
              {selectedPostComments.length}{" "}
              {selectedPostComments.length === 1 ? "comment" : "comments"}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {loadingComments ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                <span className="ml-2">Loading comments...</span>
              </div>
            ) : selectedPostComments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No comments found
              </div>
            ) : (
              selectedPostComments.map((comment: any) => (
                <Card key={comment.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="mt-1">
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {(comment.author_name || "U").charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">
                          {comment.author_name || "Unknown User"}
                        </span>
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-sm text-gray-500">
                          {formatTimeAgo(comment.created_at)}
                        </span>
                        {comment.is_accepted_answer && (
                          <Badge className="bg-green-100 text-green-700">
                            Accepted
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap mb-2">
                        {comment.content}
                      </p>
                      {comment.code_snippet && (
                        <pre className="bg-gray-100 p-3 rounded-lg text-sm overflow-x-auto">
                          <code>{comment.code_snippet}</code>
                        </pre>
                      )}
                      <div className="flex items-center justify-between gap-3 mt-2 text-sm text-gray-500">
                        <span>👍 {comment.upvotes || 0}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!postToDelete}
        onOpenChange={() => setPostToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this post? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => postToDelete && handleDelete(postToDelete)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
