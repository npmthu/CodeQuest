import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { 
  Search, 
  Plus, 
  MessageSquare, 
  ThumbsUp, 
  Eye,
  TrendingUp,
  Clock,
  X
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
import ForumPostDetail from "./ForumPostDetail";

export default function ForumPage() {
  const [currentView, setCurrentView] = useState<"list" | "detail">("list");
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [isNewPostOpen, setIsNewPostOpen] = useState(false);

  const tags = ["All", "Python", "C++", "DSA", "SQL", "Web", "AI", "Interview"];

  const posts = [
    {
      id: 1,
      title: "How to optimize my Two Sum solution?",
      author: "Alice Chen",
      avatar: "AC",
      time: "2 hours ago",
      tags: ["Python", "DSA"],
      views: 234,
      replies: 12,
      likes: 28,
      trending: true,
    },
    {
      id: 2,
      title: "Best resources for learning Dynamic Programming",
      author: "Bob Smith",
      avatar: "BS",
      time: "5 hours ago",
      tags: ["DSA", "Interview"],
      views: 456,
      replies: 34,
      likes: 67,
      trending: true,
    },
    {
      id: 3,
      title: "SQL JOIN vs UNION - When to use which?",
      author: "Carol Wang",
      avatar: "CW",
      time: "1 day ago",
      tags: ["SQL"],
      views: 189,
      replies: 8,
      likes: 15,
    },
    {
      id: 4,
      title: "Share your interview experience",
      author: "David Lee",
      avatar: "DL",
      time: "1 day ago",
      tags: ["Interview"],
      views: 567,
      replies: 45,
      likes: 89,
      trending: true,
    },
    {
      id: 5,
      title: "Understanding time complexity - A beginner's guide",
      author: "Emma Johnson",
      avatar: "EJ",
      time: "2 days ago",
      tags: ["DSA"],
      views: 892,
      replies: 23,
      likes: 124,
    },
    {
      id: 6,
      title: "React vs Vue - Which should I learn first?",
      author: "Frank Chen",
      avatar: "FC",
      time: "3 days ago",
      tags: ["Web"],
      views: 345,
      replies: 19,
      likes: 42,
    },
  ];

  const handlePostClick = (post: any) => {
    setSelectedPost(post);
    setCurrentView("detail");
  };

  const handleBack = () => {
    setCurrentView("list");
    setSelectedPost(null);
  };

  // If viewing post detail
  if (currentView === "detail" && selectedPost) {
    return <ForumPostDetail post={selectedPost} onBack={handleBack} />;
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2>Community Forum</h2>
          <p className="text-muted-foreground mt-1">Ask questions, share knowledge, and help others</p>
        </div>
        <Dialog open={isNewPostOpen} onOpenChange={setIsNewPostOpen}>
          <Button 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => setIsNewPostOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Post
          </Button>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Post</DialogTitle>
              <DialogDescription>
                🚧 This is a placeholder dialog. All features are non-functional.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input placeholder="What's your question or topic?" disabled />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select disabled>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="python">Python</SelectItem>
                    <SelectItem value="cpp">C++</SelectItem>
                    <SelectItem value="dsa">DSA</SelectItem>
                    <SelectItem value="sql">SQL</SelectItem>
                    <SelectItem value="web">Web Development</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Content *</Label>
                <Textarea 
                  placeholder="Describe your question or share your thoughts..." 
                  className="min-h-[200px]"
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label>Tags</Label>
                <Input placeholder="e.g., python, algorithms, help" disabled />
              </div>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-blue-600">Note:</strong> This is a placeholder dialog. 
                  In the full implementation, you would be able to create posts with rich text formatting, 
                  code blocks, and attachments.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNewPostOpen(false)}>
                Cancel
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700" disabled>
                Post Question
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search discussions..."
            className="pl-10"
          />
        </div>
      </div>

      {/* Tags */}
      <div className="flex items-center gap-2 flex-wrap">
        {tags.map((tag) => (
          <Badge
            key={tag}
            variant={tag === "All" ? "default" : "outline"}
            className={`cursor-pointer ${
              tag === "All" ? "bg-blue-600 hover:bg-blue-700" : "hover:bg-gray-100"
            }`}
          >
            {tag}
          </Badge>
        ))}
      </div>

      {/* Posts */}
      <div className="space-y-4">
        {posts.map((post) => (
          <Card 
            key={post.id} 
            className="p-6 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handlePostClick(post)}
          >
            <div className="flex gap-4">
              {/* Avatar */}
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600">{post.avatar}</span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="truncate">{post.title}</h4>
                      {post.trending && (
                        <Badge className="bg-orange-100 text-orange-700 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          Trending
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span>{post.author}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.time}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex items-center gap-2 mt-3">
                  {post.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6 mt-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    <span>{post.views}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    <span>{post.replies}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ThumbsUp className="w-4 h-4" />
                    <span>{post.likes}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}