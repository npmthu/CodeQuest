import { useState } from "react";
import { Search, CheckCircle, XCircle, Flag, MessageSquare, Trash2, Eye } from "lucide-react";
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

interface Report {
  id: string;
  reportedBy: string;
  reason: string;
  timestamp: string;
}

interface ForumPost {
  id: string;
  author: string;
  title: string;
  content: string;
  category: string;
  timestamp: string;
  status: "pending" | "approved" | "rejected" | "deleted";
  reports: number;
  reportDetails?: Report[];
  likes: number;
  comments: number;
}

const mockPosts: ForumPost[] = [
  {
    id: "1",
    author: "Nguyễn Văn A",
    title: "How to implement binary search tree in C++?",
    content: "I'm having trouble understanding the insert operation in BST. Can someone explain the recursive approach? I've tried implementing it but keep getting stack overflow errors when inserting multiple nodes. Here's what I have so far...",
    category: "C/C++",
    timestamp: "2 hours ago",
    status: "pending",
    reports: 0,
    reportDetails: [],
    likes: 5,
    comments: 3,
  },
  {
    id: "2",
    author: "Trần Thị B",
    title: "Best resources for learning Python?",
    content: "I'm a complete beginner looking for good Python learning resources. Any recommendations? I'm particularly interested in data science and machine learning applications. I've heard about Coursera and Udemy but not sure which one to choose.",
    category: "Python",
    timestamp: "5 hours ago",
    status: "approved",
    reports: 0,
    reportDetails: [],
    likes: 12,
    comments: 8,
  },
  {
    id: "3",
    author: "Lê Văn C",
    title: "Spam content here - buy cheap courses",
    content: "Click this link to get amazing deals on programming courses!!! www.fake-site.com - Limited time offer! Get 90% discount on all courses. We also offer certificate programs and job guarantees. Don't miss out!",
    category: "General",
    timestamp: "1 day ago",
    status: "pending",
    reports: 3,
    reportDetails: [
      {
        id: "r1",
        reportedBy: "User123",
        reason: "Spam and promotional content",
        timestamp: "1 day ago",
      },
      {
        id: "r2",
        reportedBy: "Moderator456",
        reason: "Suspicious external links",
        timestamp: "1 day ago",
      },
      {
        id: "r3",
        reportedBy: "Admin789",
        reason: "Violates community guidelines",
        timestamp: "23 hours ago",
      },
    ],
    likes: 0,
    comments: 1,
  },
  {
    id: "4",
    author: "Phạm Thị D",
    title: "Tips for acing technical interviews",
    content: "After landing a job at a top tech company, here are my tips: 1) Practice DSA daily on platforms like LeetCode, 2) Mock interviews are crucial - do at least 10 before your real interview, 3) Study system design fundamentals, 4) Prepare behavioral questions using STAR method, 5) Always ask clarifying questions before solving.",
    category: "Career",
    timestamp: "3 hours ago",
    status: "approved",
    reports: 0,
    reportDetails: [],
    likes: 45,
    comments: 12,
  },
  {
    id: "5",
    author: "Hoàng Văn E",
    title: "Offensive language in post",
    content: "This contains inappropriate language that violates community guidelines and includes personal attacks against other users. The content is not constructive and creates a hostile environment.",
    category: "General",
    timestamp: "30 minutes ago",
    status: "pending",
    reports: 2,
    reportDetails: [
      {
        id: "r4",
        reportedBy: "User555",
        reason: "Offensive language and personal attacks",
        timestamp: "25 minutes ago",
      },
      {
        id: "r5",
        reportedBy: "User666",
        reason: "Creates hostile environment",
        timestamp: "20 minutes ago",
      },
    ],
    likes: 1,
    comments: 0,
  },
  {
    id: "6",
    author: "Vũ Thị F",
    title: "SQL JOIN operations explained",
    content: "Let me break down INNER JOIN, LEFT JOIN, RIGHT JOIN, and FULL OUTER JOIN with examples: INNER JOIN returns only matching rows from both tables. LEFT JOIN returns all rows from left table and matching rows from right. RIGHT JOIN is the opposite. FULL OUTER JOIN returns all rows from both tables. Here are some practical examples...",
    category: "SQL",
    timestamp: "1 day ago",
    status: "approved",
    reports: 0,
    reportDetails: [],
    likes: 28,
    comments: 6,
  },
];

export default function ContentModeration() {
  const [posts, setPosts] = useState<ForumPost[]>(mockPosts);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab =
      activeTab === "all" ||
      post.status === activeTab ||
      (activeTab === "reported" && post.reports > 0);
    return matchesSearch && matchesTab;
  });

  const handleApprove = (postId: string) => {
    setPosts(
      posts.map((post) =>
        post.id === postId ? { ...post, status: "approved" as const } : post
      )
    );
  };

  const handleReject = (postId: string) => {
    setPosts(
      posts.map((post) =>
        post.id === postId ? { ...post, status: "rejected" as const } : post
      )
    );
  };

  const handleDelete = (postId: string) => {
    setPosts(
      posts.map((post) =>
        post.id === postId ? { ...post, status: "deleted" as const } : post
      )
    );
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
  const reportedCount = posts.filter((p) => p.reports > 0 && p.status !== "deleted").length;
  const deletedCount = posts.filter((p) => p.status === "deleted").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl text-[#1E3A8A] mb-2">Content Moderation</h1>
        <p className="text-gray-600">Review and moderate forum posts and user content</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-gray-200">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending Review</p>
                <p className="text-2xl text-gray-900">{pendingCount}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-gray-200">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Reported Content</p>
                <p className="text-2xl text-gray-900">{reportedCount}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                <Flag className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-gray-200">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Deleted</p>
                <p className="text-2xl text-gray-900">{deletedCount}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>
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
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search posts, users, or content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-11 rounded-xl border-gray-300"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white border border-gray-200 p-1 rounded-xl">
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
          <TabsTrigger value="deleted" className="rounded-lg">
            Deleted ({deletedCount})
          </TabsTrigger>
          <TabsTrigger value="all" className="rounded-lg">
            All Posts
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredPosts.length === 0 ? (
            <Card className="rounded-2xl border-gray-200">
              <CardContent className="p-12 text-center">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No posts found</p>
              </CardContent>
            </Card>
          ) : (
            filteredPosts.map((post) => (
              <Card
                key={post.id}
                className={`rounded-2xl border-gray-200 ${
                  post.reports > 0 && post.status !== "deleted" ? "border-red-300 bg-red-50/30" : ""
                } ${post.status === "deleted" ? "opacity-60" : ""}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3 flex-1">
                      <Avatar>
                        <AvatarFallback className="bg-[#2563EB] text-white">
                          {post.author.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-gray-900">{post.author}</span>
                          <span className="text-sm text-gray-500">•</span>
                          <span className="text-sm text-gray-500">{post.timestamp}</span>
                          <Badge className="bg-[#2563EB] text-white text-xs">
                            {post.category}
                          </Badge>
                        </div>
                        <h3 className="text-lg text-gray-900 mb-2">{post.title}</h3>
                        <p className="text-gray-600 line-clamp-2">{post.content}</p>
                      </div>
                    </div>
                    {getStatusBadge(post.status)}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-600">
                        👍 {post.likes} likes
                      </span>
                      <span className="text-sm text-gray-600">
                        💬 {post.comments} comments
                      </span>
                      {post.reports > 0 && (
                        <span className="text-sm text-red-600 flex items-center gap-1">
                          <Flag className="w-4 h-4" />
                          {post.reports} reports
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(post)}
                        className="rounded-xl"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </Button>
                      {post.status === "pending" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApprove(post.id)}
                            className="text-green-600 hover:bg-green-50 border-green-300 rounded-xl"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReject(post.id)}
                            className="text-orange-600 hover:bg-orange-50 border-orange-300 rounded-xl"
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                      {post.status !== "deleted" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPostToDelete(post.id)}
                          className="text-red-600 hover:bg-red-50 border-red-300 rounded-xl"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* View Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl text-[#1E3A8A]">Post Details</DialogTitle>
            <DialogDescription>
              Full content and report history
            </DialogDescription>
          </DialogHeader>
          {selectedPost && (
            <div className="space-y-6">
              {/* Post Info */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-[#2563EB] text-white">
                        {selectedPost.author.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-gray-900">{selectedPost.author}</p>
                      <p className="text-sm text-gray-500">{selectedPost.timestamp}</p>
                    </div>
                  </div>
                  {getStatusBadge(selectedPost.status)}
                </div>

                <div>
                  <h3 className="text-xl text-gray-900 mb-2">{selectedPost.title}</h3>
                  <Badge className="bg-[#2563EB] text-white">{selectedPost.category}</Badge>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedPost.content}</p>
                </div>

                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <span>👍 {selectedPost.likes} likes</span>
                  <span>💬 {selectedPost.comments} comments</span>
                  {selectedPost.reports > 0 && (
                    <span className="text-red-600 flex items-center gap-1">
                      <Flag className="w-4 h-4" />
                      {selectedPost.reports} reports
                    </span>
                  )}
                </div>
              </div>

              {/* Report History */}
              {selectedPost.reportDetails && selectedPost.reportDetails.length > 0 && (
                <div className="border-t pt-6">
                  <h4 className="text-lg text-gray-900 mb-4">Report History</h4>
                  <div className="space-y-3">
                    {selectedPost.reportDetails.map((report) => (
                      <div
                        key={report.id}
                        className="p-4 bg-red-50 border border-red-200 rounded-xl"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Flag className="w-4 h-4 text-red-600" />
                            <span className="text-sm text-gray-900">{report.reportedBy}</span>
                          </div>
                          <span className="text-xs text-gray-500">{report.timestamp}</span>
                        </div>
                        <p className="text-sm text-red-700">{report.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                {selectedPost.status === "pending" && (
                  <>
                    <Button
                      onClick={() => {
                        handleApprove(selectedPost.id);
                        setIsDetailsOpen(false);
                      }}
                      className="flex-1 bg-green-600 hover:bg-green-700 rounded-xl"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve Post
                    </Button>
                    <Button
                      onClick={() => {
                        handleReject(selectedPost.id);
                        setIsDetailsOpen(false);
                      }}
                      variant="outline"
                      className="flex-1 text-orange-600 hover:bg-orange-50 border-orange-300 rounded-xl"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject Post
                    </Button>
                  </>
                )}
                {selectedPost.status !== "deleted" && (
                  <Button
                    onClick={() => {
                      setPostToDelete(selectedPost.id);
                      setIsDetailsOpen(false);
                    }}
                    variant="outline"
                    className="flex-1 text-red-600 hover:bg-red-50 border-red-300 rounded-xl"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Post
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={postToDelete !== null} onOpenChange={() => setPostToDelete(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#1E3A8A]">Delete Post?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete this post and hide it from all users.
              The post status will be changed to "Deleted" and cannot be recovered.
              Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => postToDelete && handleDelete(postToDelete)}
              className="bg-red-600 hover:bg-red-700 rounded-xl"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Post
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}