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
  status: "pending" | "approved" | "rejected" | "deleted";
  reports_count?: number;
  reportDetails?: Report[];
  likes_count?: number;
  comments_count?: number;
}

export default function ContentModeration() {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getForumPosts();
      if (response.success && response.data) {
        const postsData = response.data.posts || response.data || [];
        // Map API data to component format
        const mappedPosts = postsData.map((post: any) => ({
          id: post.id,
          author_id: post.author_id || post.user_id,
          author_name:
            post.author_name ||
            post.user_name ||
            post.author?.full_name ||
            "Unknown",
          author_email:
            post.author_email || post.user_email || post.author?.email,
          title: post.title,
          content: post.content || post.body || "",
          category: post.category || post.topic_name || "General",
          topic_name: post.topic_name,
          created_at: post.created_at,
          status: post.status || "approved",
          reports_count: post.reports_count || post.report_count || 0,
          likes_count: post.likes_count || post.like_count || 0,
          comments_count: post.comments_count || post.comment_count || 0,
        }));
        setPosts(mappedPosts);
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
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
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
      post.status === activeTab ||
      (activeTab === "reported" && (post.reports_count || 0) > 0);
    return matchesSearch && matchesTab;
  });

  const handleApprove = async (postId: string) => {
    try {
      const response = await adminApi.approvePost(postId);
      if (response.success) {
        toast.success("Post approved");
        setPosts(
          posts.map((post) =>
            post.id === postId ? { ...post, status: "approved" as const } : post
          )
        );
      } else {
        toast.error(response.error || "Failed to approve post");
      }
    } catch (error) {
      toast.error("Failed to approve post");
    }
  };

  const handleReject = async (postId: string) => {
    try {
      const response = await adminApi.rejectPost(postId);
      if (response.success) {
        toast.success("Post rejected");
        setPosts(
          posts.map((post) =>
            post.id === postId ? { ...post, status: "rejected" as const } : post
          )
        );
      } else {
        toast.error(response.error || "Failed to reject post");
      }
    } catch (error) {
      toast.error("Failed to reject post");
    }
  };

  const handleDelete = async (postId: string) => {
    try {
      const response = await adminApi.deletePost(postId);
      if (response.success) {
        toast.success("Post deleted");
        setPosts(
          posts.map((post) =>
            post.id === postId ? { ...post, status: "deleted" as const } : post
          )
        );
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

  const getStatusBadge = (status: ForumPost["status"]) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-700">Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-700">Rejected</Badge>;
      case "deleted":
        return <Badge className="bg-gray-100 text-gray-700">Deleted</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>;
    }
  };

  const pendingCount = posts.filter((p) => p.status === "pending").length;
  const reportedCount = posts.filter(
    (p) => (p.reports_count || 0) > 0 && p.status !== "deleted"
  ).length;
  const deletedCount = posts.filter((p) => p.status === "deleted").length;

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
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-blue-800 bg-clip-text text-transparent">
          Content Moderation
        </h1>
        <p className="text-gray-500 mt-1">
          Review and moderate forum posts and user content
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-0 shadow-lg shadow-gray-200/50 hover:shadow-xl transition-all">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Pending Review</p>
                <p className="text-2xl font-bold text-gray-900">
                  {pendingCount}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg shadow-yellow-500/30">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-0 shadow-lg shadow-gray-200/50 hover:shadow-xl transition-all">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Reported Posts</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reportedCount}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-400 to-rose-500 flex items-center justify-center shadow-lg shadow-red-500/30">
                <Flag className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-0 shadow-lg shadow-gray-200/50 hover:shadow-xl transition-all">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Posts</p>
                <p className="text-2xl font-bold text-gray-900">
                  {posts.length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-0 shadow-lg shadow-gray-200/50 hover:shadow-xl transition-all">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Deleted</p>
                <p className="text-2xl font-bold text-gray-900">
                  {deletedCount}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-400 to-slate-500 flex items-center justify-center shadow-lg shadow-gray-500/30">
                <Trash2 className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border-0 shadow-lg shadow-gray-200/50 p-6">
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
          <TabsTrigger value="pending" className="rounded-lg">
            Pending ({pendingCount})
          </TabsTrigger>
          <TabsTrigger value="reported" className="rounded-lg">
            Reported ({reportedCount})
          </TabsTrigger>
          <TabsTrigger value="approved" className="rounded-lg">
            Approved
          </TabsTrigger>
          <TabsTrigger value="rejected" className="rounded-lg">
            Rejected
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
                  className="rounded-2xl border-0 shadow-lg shadow-gray-200/50 hover:shadow-xl transition-all"
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <Avatar className="mt-1 ring-2 ring-white shadow-md">
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold">
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
                            <span>💬 {post.comments_count || 0}</span>
                            {(post.reports_count || 0) > 0 && (
                              <span className="text-red-500 flex items-center gap-1">
                                <Flag className="w-4 h-4" />
                                {post.reports_count} reports
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {getStatusBadge(post.status)}
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(post)}
                            className="rounded-lg"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {post.status === "pending" && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleApprove(post.id)}
                                className="rounded-lg text-green-600 hover:bg-green-50"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleReject(post.id)}
                                className="rounded-lg text-red-600 hover:bg-red-50"
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          {post.status !== "deleted" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setPostToDelete(post.id)}
                              className="rounded-lg text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
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
              {selectedPost && getStatusBadge(selectedPost.status)}
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
            {selectedPost?.status === "pending" && (
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  onClick={() => {
                    handleApprove(selectedPost.id);
                    setIsDetailsOpen(false);
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
                </Button>
                <Button
                  onClick={() => {
                    handleReject(selectedPost.id);
                    setIsDetailsOpen(false);
                  }}
                  variant="destructive"
                  className="flex-1"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
              </div>
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
