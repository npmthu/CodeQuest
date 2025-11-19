import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { 
  ArrowLeft,
  ThumbsUp,
  MessageSquare,
  Eye,
  Clock,
  TrendingUp,
  Share2
} from "lucide-react";

interface ForumPostDetailProps {
  post: {
    id: number;
    title: string;
    author: string;
    avatar: string;
    time: string;
    tags: string[];
    views: number;
    replies: number;
    likes: number;
    trending?: boolean;
  };
  onBack: () => void;
}

export default function ForumPostDetail({ post, onBack }: ForumPostDetailProps) {
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
            Back to Forum
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-8 py-8">
        {/* Post Header */}
        <Card className="p-8 mb-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <span className="text-blue-600">{post.avatar}</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h4>{post.author}</h4>
                <span className="text-sm text-muted-foreground">•</span>
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {post.time}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {post.trending && (
                  <Badge className="bg-orange-100 text-orange-700 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    Trending
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <h2 className="mb-6">{post.title}</h2>

          {/* Placeholder Notice */}
          <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg mb-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="mb-1">🚧 Post Content Placeholder</h4>
                <p className="text-sm text-muted-foreground">
                  This is a placeholder page showing only the post metadata. 
                  The actual post content, comments, and interactions will be displayed here once implemented.
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 pt-6 border-t border-border">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Eye className="w-5 h-5" />
              <span>{post.views} views</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MessageSquare className="w-5 h-5" />
              <span>{post.replies} replies</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <ThumbsUp className="w-5 h-5" />
              <span>{post.likes} likes</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 mt-6 pt-6 border-t border-border">
            <Button variant="outline" disabled>
              <ThumbsUp className="w-4 h-4 mr-2" />
              Like
            </Button>
            <Button variant="outline" disabled>
              <MessageSquare className="w-4 h-4 mr-2" />
              Reply
            </Button>
            <Button variant="outline" disabled>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </Card>

        {/* Comments Section Placeholder */}
        <Card className="p-8">
          <h3 className="mb-6">Replies ({post.replies})</h3>
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-muted-foreground">
              Comment section is not yet implemented
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
