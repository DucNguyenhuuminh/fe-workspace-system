import { useState, useEffect, useRef } from "react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { Send, Trash2, CornerDownRight, Loader2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { postService, PostComment } from "@/services/postService";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";

interface PostCommentsProps {
  workspaceId: string;
  postId: string;
  onCommentAdded: () => void; // Call back để tăng số đếm bình luận ở bài viết gốc
}

export default function PostComments({ workspaceId, postId, onCommentAdded }: PostCommentsProps) {
  const { user } = useAuthStore();
  const [comments, setComments] = useState<PostComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [replyContent, setReplyContent] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const replyInputRef = useRef<HTMLTextAreaElement>(null);

  const fetchComments = async () => {
    try {
      const data = await postService.getComments(workspaceId, postId);
      setComments(data.comments);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const handleSubmit = async (parentId?: string) => {
    const content = parentId ? replyContent : newComment;
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      await postService.createComment(workspaceId, postId, content, parentId);
      if (parentId) {
        setReplyingTo(null);
        setReplyContent("");
      } else {
        setNewComment("");
      }
      fetchComments();
      onCommentAdded();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error create comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      await postService.deleteComment(workspaceId, postId, commentId);
      fetchComments();
    } catch (error: any) {
      toast.error("Error delete commengt");
    }
  };

  const openReply = (commentId: string) => {
    setReplyingTo(commentId);
    setReplyContent("");
    setTimeout(() => replyInputRef.current?.focus(), 100);
  };

  const renderComment = (c: PostComment, isReply = false) => {
    const isOwner = c.createdBy === user?._id || c.createdBy?._id === user?._id;

    return (
      <div key={c._id} className={`flex flex-col mt-4 ${isReply ? "ml-8" : ""}`}>
        <div className="flex gap-2 group">
          <Avatar className="h-7 w-7 mt-0.5">
            <AvatarFallback className="bg-slate-200 text-xs">
              <User className="h-3 w-3" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="bg-secondary/40 rounded-2xl rounded-tl-sm px-3 py-2 inline-block max-w-full">
              <p className="text-xs font-semibold mb-0.5">{c.createdBy?.username || "Member"}</p>
              <p className="text-[13px] text-foreground/90 whitespace-pre-wrap">{c.content}</p>
            </div>
            <div className="flex items-center gap-3 mt-1 ml-2">
              <span className="text-[10px] text-muted-foreground">
                {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true})}
              </span>
              {(
                <button onClick={() => openReply(c._id)} className="text-[11px] font-medium text-muted-foreground hover:text-foreground">
                  Response
                </button>
              )}
              {isOwner && (
                <button onClick={() => handleDelete(c._id)} className="text-[11px] font-medium text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>

        {replyingTo === c._id && (
          <div className="flex gap-2 mt-2 ml-8 animate-in fade-in zoom-in-95">
            <CornerDownRight className="h-4 w-4 text-muted-foreground/40 mt-2" />
            <Textarea 
              ref={replyInputRef}
              value={replyContent} onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write reply..." className="min-h-[36px] h-9 text-xs py-2"
            />
            <Button size="icon" className="h-9 w-9 shrink-0" onClick={() => handleSubmit(c._id)} disabled={isSubmitting}>
              <Send className="h-3 w-3" />
            </Button>
            <Button size="icon" variant="ghost" className="h-9 w-9 shrink-0" onClick={() => setReplyingTo(null)}>Cancel</Button>
          </div>
        )}

        {c.replies?.length > 0 && (
          <div className="mt-1">
            {c.replies.map(r => renderComment(r, true))}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) return <div className="py-4 text-center"><Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" /></div>;

  return (
    <div className="pt-4 mt-4 border-t border-border">
      <div className="flex gap-2 mb-4">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-indigo-600 text-white text-xs"><User className="h-4 w-4"/></AvatarFallback>
        </Avatar>
        <div className="flex-1 relative">
          <Textarea 
            placeholder="Write comment..." 
            value={newComment} onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[36px] h-[36px] text-sm py-2 pr-10 resize-none bg-secondary/30"
          />
          <Button size="icon" className="absolute right-1 bottom-1 h-7 w-7 rounded-sm" onClick={() => handleSubmit()} disabled={isSubmitting || !newComment.trim()}>
            {isSubmitting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
          </Button>
        </div>
      </div>
      <div className="space-y-1">
        {comments.map(c => renderComment(c))}
      </div>
    </div>
  );
}