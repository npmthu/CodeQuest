import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";
import { 
  ArrowLeft,
  ThumbsUp,
  MessageSquare,
  Clock,
  Share2,
  Send,
  Reply,
  Trash2
} from "lucide-react";
import { useState, useCallback, memo, useMemo } from "react";
import { useAuth } from "../contexts/AuthContext";
import type { ForumPostWithAuthor } from "../types";
import { useUserVotes, useVoteForumItem, useCreateForumReply, useDeleteReply, useDeleteForumPost } from "../hooks/useApi";

interface ForumPostDetailProps {
  post: ForumPostWithAuthor;
  onBack: () => void;
  onUpdate?: () => void;
}

// Separate memoized component for reply items to prevent re-creation
interface ReplyItemProps {
  reply: any;
  allReplies: any[];
  depth: number;
  userVotes: any;
  replyingToId: string | null;
  nestedContent: string;
  isPending: boolean;
  currentUserId?: string;
  onVote: (id: string) => void;
  onReplyClick: (id: string) => void;
  onContentChange: (content: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  onDelete: (replyId: string) => void;
}

const ReplyItem = memo<ReplyItemProps>(({ 
  reply,
  allReplies,
  depth,
  userVotes,
  replyingToId,
  nestedContent,
  isPending,
  currentUserId,
  onVote,
  onReplyClick,
  onContentChange,
  onSubmit,
  onCancel,
  onDelete
}) => {
  const maxDepth = 3;
  const isMaxDepth = depth >= maxDepth;
  const isReplying = replyingToId === reply.id;
  
  // Sort nested replies by upvotes (descending)
  const nestedReplies = allReplies
    .filter((r: any) => r.parent_reply_id === reply.id)
    .sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));

  return (
    <div className={depth > 0 ? "ml-6 pl-4 border-l-2 border-gray-200 mt-3" : "mt-3"}>
      <Card className={`p-4 ${depth === 0 ? 'bg-gray-50' : 'bg-white'}`}>
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            {reply.author?.avatar_url ? (
              <img src={reply.author.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <span className="text-blue-600 font-semibold text-sm">
                {reply.author?.display_name?.substring(0, 2).toUpperCase() || 'U'}
              </span>
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-medium text-sm">
                {reply.author?.display_name || 'Anonymous'}
              </span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(reply.created_at).toLocaleDateString()}
              </span>
              {reply.is_accepted_answer && (
                <Badge className="bg-green-100 text-green-700 text-xs">✓ Accepted</Badge>
              )}
            </div>
            
            <div className="text-sm text-muted-foreground whitespace-pre-wrap mb-3">
              {reply.content_markdown}
            </div>
            
            {reply.code_snippet && (
              <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto mb-3">
                <code>{reply.code_snippet}</code>
              </pre>
            )}
            
            <div className="flex items-center gap-3">
              <Button 
                variant={userVotes?.replyVotes?.[reply.id] === 'upvote' ? "default" : "ghost"} 
                size="sm" 
                className={`text-xs ${userVotes?.replyVotes?.[reply.id] === 'upvote' ? 'bg-blue-600 text-white' : ''}`}
                onClick={() => onVote(reply.id)}
                disabled={isPending}
              >
                <ThumbsUp className="w-3 h-3 mr-1" />
                {reply.upvotes ?? 0}
              </Button>
              {!isMaxDepth && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs"
                  onClick={() => onReplyClick(reply.id)}
                >
                  <Reply className="w-3 h-3 mr-1" />
                  {isReplying ? 'Cancel' : 'Reply'}
                </Button>
              )}
              {currentUserId && reply.author_id === currentUserId && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => onDelete(reply.id)}
                  disabled={isPending}
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Delete
                </Button>
              )}
            </div>

            {isReplying && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground mb-2">
                  Replying to <strong>{reply.author?.display_name || 'Anonymous'}</strong>
                </p>
                <Textarea
                  value={nestedContent}
                  onChange={(e) => onContentChange(e.target.value)}
                  placeholder="Write your reply..."
                  className="min-h-[80px] mb-2 text-sm"
                  autoFocus
                />
                <div className="flex items-center gap-2">
                  <Button 
                    size="sm"
                    onClick={onSubmit}
                    disabled={isPending || !nestedContent.trim()}
                  >
                    <Send className="w-3 h-3 mr-1" />
                    {isPending ? "Posting..." : "Post"}
                  </Button>
                  <Button 
                    size="sm"
                    variant="outline"
                    onClick={onCancel}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {nestedReplies.length > 0 && (
        <div className="mt-2">
          {nestedReplies.map((nested: any) => (
            <ReplyItem 
              key={nested.id}
              reply={nested}
              allReplies={allReplies}
              depth={depth + 1}
              userVotes={userVotes}
              replyingToId={replyingToId}
              nestedContent={nestedContent}
              isPending={isPending}
              currentUserId={currentUserId}
              onVote={onVote}
              onReplyClick={onReplyClick}
              onContentChange={onContentChange}
              onSubmit={onSubmit}
              onCancel={onCancel}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
});

ReplyItem.displayName = 'ReplyItem';

export default function ForumPostDetail({ post, onBack, onUpdate }: ForumPostDetailProps) {
  const { user } = useAuth();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [nestedReplyContent, setNestedReplyContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  
  const { data: userVotes } = useUserVotes(post.id);
  const voteMutation = useVoteForumItem();
  const replyMutation = useCreateForumReply();
  const deleteReplyMutation = useDeleteReply();
  const deletePostMutation = useDeleteForumPost();

  const author = typeof post.author === 'object' ? post.author : null;
  const authorName = author?.display_name || "Anonymous";
  const authorAvatar = author?.avatar_url;
  const createdAt = post.created_at ? new Date(post.created_at).toLocaleDateString() : "Unknown";

  const handleVote = useCallback(async (votableType: 'post' | 'reply', votableId: string) => {
    if (!user) {
      setError("Please login to vote");
      return;
    }

    try {
      await voteMutation.mutateAsync({
        votable_type: votableType,
        votable_id: votableId,
        vote_type: 'upvote',
        postId: post.id
      });
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to vote");
    }
  }, [user, voteMutation, post.id]);

  const handleReply = useCallback(async (parentReplyId?: string) => {
    if (!user) {
      setError("Please login to reply");
      return;
    }

    const content = parentReplyId ? nestedReplyContent : replyContent;
    if (!content.trim()) {
      setError("Reply content cannot be empty");
      return;
    }

    try {
      await replyMutation.mutateAsync({
        postId: post.id,
        content_markdown: content,
        parent_reply_id: parentReplyId
      });
      
      if (parentReplyId) {
        setNestedReplyContent("");
        setReplyingToId(null);
      } else {
        setReplyContent("");
        setShowReplyForm(false);
      }
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to post reply");
    }
  }, [user, replyMutation, post.id, nestedReplyContent, replyContent]);

  const handleReplyVote = useCallback((replyId: string) => {
    handleVote('reply', replyId);
  }, [handleVote]);

  const handleReplyClick = useCallback((replyId: string) => {
    if (replyingToId === replyId) {
      setReplyingToId(null);
      setNestedReplyContent("");
    } else {
      setReplyingToId(replyId);
      setNestedReplyContent("");
    }
  }, [replyingToId]);

  const handleNestedSubmit = useCallback(() => {
    if (replyingToId) {
      handleReply(replyingToId);
    }
  }, [replyingToId, handleReply]);

  const handleNestedCancel = useCallback(() => {
    setReplyingToId(null);
    setNestedReplyContent("");
  }, []);

  const handleDeleteReply = useCallback(async (replyId: string) => {
    if (!window.confirm('Are you sure you want to delete this reply?')) {
      return;
    }

    try {
      await deleteReplyMutation.mutateAsync({ replyId, postId: post.id });
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to delete reply");
    }
  }, [deleteReplyMutation, post.id]);

  const handleDeletePost = useCallback(async () => {
    if (!window.confirm('Are you sure you want to delete this post? This will also delete all replies.')) {
      return;
    }

    try {
      await deletePostMutation.mutateAsync(post.id);
      setError(null);
      // Navigate back to forum after successful deletion
      onBack();
    } catch (err: any) {
      setError(err.message || "Failed to delete post");
    }
  }, [deletePostMutation, post.id, onBack]);

  // Sort replies by upvotes (descending) - most upvoted first
  const topLevelReplies = useMemo(() => {
    const filtered = ((post as any).replies || []).filter((r: any) => !r.parent_reply_id);
    return [...filtered].sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
  }, [(post as any).replies]);
  
  return (
    <div className="min-h-screen bg-background">
      <div className="bg-white border-b border-border">
        <div className="max-w-4xl mx-auto px-8 py-6">
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Forum
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-8">
        <Card className="p-8 mb-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              {authorAvatar ? (
                <img src={authorAvatar} alt={authorName} className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <span className="text-blue-600 font-bold">
                  {authorName.split(" ").map(s => s[0]).join("").slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h4>{authorName}</h4>
                <span className="text-sm text-muted-foreground">•</span>
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {createdAt}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {Array.isArray(post.tags) && post.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <h2 className="mb-6">{post.title}</h2>

          <div className="prose prose-sm max-w-none mb-6">
            {post.content_markdown ? (
              <div className="whitespace-pre-wrap text-muted-foreground">
                {post.content_markdown}
              </div>
            ) : (
              <p className="text-muted-foreground italic">No content provided</p>
            )}
          </div>

          <div className="flex items-center gap-6 pt-6 border-t border-border">
            <div className="flex items-center gap-2 text-muted-foreground">
              <ThumbsUp className="w-5 h-5" />
              <span>{post.upvotes ?? 0} upvotes</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MessageSquare className="w-5 h-5" />
              <span>{post.reply_count ?? 0} replies</span>
            </div>
            {post.has_accepted_answer && (
              <Badge className="bg-green-100 text-green-700">✓ Answered</Badge>
            )}
          </div>

          <div className="flex items-center gap-3 mt-6 pt-6 border-t border-border">
            <Button 
              variant={userVotes?.postVote === 'upvote' ? "default" : "outline"}
              onClick={() => handleVote('post', post.id)}
              className={userVotes?.postVote === 'upvote' ? "bg-blue-600" : ""}
              disabled={voteMutation.isPending}
            >
              <ThumbsUp className="w-4 h-4 mr-2" />
              {userVotes?.postVote === 'upvote' ? 'Upvoted' : 'Upvote'} ({post.upvotes ?? 0})
            </Button>
            <Button variant="outline" onClick={() => setShowReplyForm(!showReplyForm)}>
              <MessageSquare className="w-4 h-4 mr-2" />
              Reply
            </Button>
            <Button variant="outline">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            {user?.id === post.author_id && (
              <Button 
                variant="outline" 
                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                onClick={handleDeletePost}
                disabled={deletePostMutation.isPending}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {deletePostMutation.isPending ? 'Deleting...' : 'Delete Post'}
              </Button>
            )}
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
              {error}
            </div>
          )}

          {showReplyForm && (
            <div className="mt-6 pt-6 border-t border-border">
              <h4 className="mb-4">Write a Reply</h4>
              <Textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Share your thoughts, code snippets, or solutions..."
                className="min-h-[120px] mb-3"
              />
              <div className="flex items-center gap-2">
                <Button 
                  onClick={() => handleReply()}
                  disabled={replyMutation.isPending || !replyContent.trim()}
                >
                  <Send className="w-4 h-4 mr-2" />
                  {replyMutation.isPending ? "Posting..." : "Post Reply"}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setShowReplyForm(false);
                    setReplyContent("");
                    setError(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </Card>

        <Card className="p-8">
          <h3 className="mb-6">Replies ({post.reply_count ?? 0})</h3>
          
          {topLevelReplies.length > 0 ? (
            <div className="space-y-4">
              {topLevelReplies.map((reply: any) => (
                <ReplyItem
                  key={reply.id}
                  reply={reply}
                  allReplies={(post as any).replies || []}
                  depth={0}
                  userVotes={userVotes}
                  replyingToId={replyingToId}
                  nestedContent={nestedReplyContent}
                  isPending={voteMutation.isPending || replyMutation.isPending || deleteReplyMutation.isPending}
                  currentUserId={user?.id}
                  onVote={handleReplyVote}
                  onReplyClick={handleReplyClick}
                  onContentChange={setNestedReplyContent}
                  onSubmit={handleNestedSubmit}
                  onCancel={handleNestedCancel}
                  onDelete={handleDeleteReply}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-muted-foreground">
                No replies yet. Be the first to reply!
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
