import { useState, useEffect, useRef } from "react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { 
  Send, MoreVertical, Pencil, Trash2, MessageSquare, 
  CornerDownRight, Loader2, User
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import { commentService, CommentItem } from "@/services/commentService";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";

export default function CommentSection({ fileId }: { fileId: string }) {
  const { user } = useAuthStore();
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // States cho Form
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ref để focus vào input khi bấm Reply
  const replyInputRef = useRef<HTMLTextAreaElement>(null);

  // --- FETCH DATA ---
  const fetchComments = async () => {
    try {
      const data = await commentService.getComments(fileId);
      setComments(data.comments);
      setTotal(data.total);
    } catch (error) {
      console.error(error);
      toast.error("Unable to load comments");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (fileId) fetchComments();
  }, [fileId]);

  // --- HANDLERS ---
  const handleSubmit = async (parentId?: string) => {
    const content = parentId ? editContent : newComment;
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      if (editingId) {
        // ĐANG SỬA
        await commentService.updateComment(fileId, editingId, content);
        toast.success("Comments have been updated");
        setEditingId(null);
      } else {
        // ĐANG TẠO MỚI HOẶC TRẢ LỜI
        await commentService.createComment(fileId, content, parentId);
        toast.success("Comment has been submitted");
        if (parentId) setReplyingTo(null);
        setNewComment("");
      }
      setEditContent("");
      fetchComments(); // Tải lại danh sách
    } catch (error: any) {
      toast.error(error.response?.data?.message || "An error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!window.confirm("Confirm deletion of this comment?")) return;
    try {
      await commentService.deleteComment(fileId, commentId);
      toast.success("Comment has been deleted");
      fetchComments();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Cannot be deleted");
    }
  };

  const openEdit = (comment: CommentItem) => {
    setEditingId(comment._id);
    setEditContent(comment.content);
    setReplyingTo(null);
  };

  const openReply = (commentId: string) => {
    setReplyingTo(commentId);
    setEditContent("");
    setEditingId(null);
    setTimeout(() => replyInputRef.current?.focus(), 100);
  };

  const cancelAction = () => {
    setReplyingTo(null);
    setEditingId(null);
    setEditContent("");
  };

  // --- RENDER BÌNH LUẬN (ĐỆ QUY 1 TẦNG DỰA VÀO DỮ LIỆU CỦA BẠN) ---
  const renderCommentNode = (comment: CommentItem, isReply = false) => {
    // Nếu backend trả về deletedAt (xóa mềm), ta có thể ẩn đi hoặc hiện "Đã xóa"
    if (comment.deletedAt) {
      return (
        <div key={comment._id} className={`flex gap-3 mb-4 opacity-50 ${isReply ? "ml-10" : ""}`}>
          <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center"><Trash2 className="h-4 w-4" /></div>
          <div className="bg-secondary/50 rounded-lg px-4 py-2 italic text-sm text-muted-foreground border border-border/50">
            This comment has been deleted
          </div>
        </div>
      );
    }

    const isOwner = comment.createdBy?._id === user?._id;

    return (
      <div key={comment._id} className={`flex flex-col mb-5 ${isReply ? "ml-10 mt-3" : ""}`}>
        <div className="flex items-start gap-3 group">
          
          {/* Avatar */}
          <Avatar className="h-8 w-8 border border-border">
            <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xs font-bold uppercase">
              {comment.createdBy?.username?.substring(0, 2) || <User className="h-4 w-4"/>}
            </AvatarFallback>
          </Avatar>

          {/* Nội dung */}
          <div className="flex-1 min-w-0">
            <div className="bg-secondary/40 rounded-xl px-4 py-3 border border-border/50 shadow-sm relative">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-[13px] text-foreground">
                  {comment.createdBy?.username || "Anonymous user"}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                  {comment.updatedAt !== comment.createdAt && " (updated)"}
                </span>
              </div>
              
              {/* Vùng Edit hoặc Hiển thị Text */}
              {editingId === comment._id ? (
                <div className="mt-2">
                  <Textarea 
                    value={editContent} 
                    onChange={(e) => setEditContent(e.target.value)} 
                    className="min-h-[60px] text-sm mb-2" autoFocus
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={cancelAction}>Cancel</Button>
                    <Button size="sm" onClick={() => handleSubmit()} disabled={isSubmitting}>Save</Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                  {comment.content}
                </p>
              )}

              {/* Dropdown Menu Hành động */}
              {isOwner && editingId !== comment._id && (
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-secondary text-muted-foreground"><MoreVertical className="h-4 w-4" /></button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-32">
                      <DropdownMenuItem onClick={() => openEdit(comment)}><Pencil className="h-4 w-4 mr-2" /> Edit</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(comment._id)} className="text-destructive focus:text-destructive"><Trash2 className="h-4 w-4 mr-2" /> Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>

            {/* Nút Phản hồi */}
            {editingId !== comment._id && (
              <div className="flex items-center gap-4 mt-1.5 ml-1">
                <button 
                  onClick={() => openReply(comment._id)} 
                  className="text-xs font-medium text-muted-foreground hover:text-indigo-600 transition-colors"
                >
                  Phản hồi
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Khung nhập Phản hồi */}
        {replyingTo === comment._id && (
          <div className="flex gap-3 mt-3 ml-10 animate-in fade-in slide-in-from-top-2">
            <CornerDownRight className="h-5 w-5 text-muted-foreground/40 shrink-0 mt-2" />
            <div className="flex-1 flex gap-2">
              <Textarea 
                ref={replyInputRef}
                placeholder={`Trả lời ${comment.createdBy?.username}...`} 
                value={editContent} onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[40px] h-10 resize-none py-2 text-sm bg-background focus-visible:ring-indigo-500"
              />
              <div className="flex flex-col gap-1">
                <Button size="icon" className="h-10 w-10 bg-indigo-600 hover:bg-indigo-700" onClick={() => handleSubmit(comment._id)} disabled={isSubmitting}>
                  <Send className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-10" onClick={cancelAction}>Hủy</Button>
              </div>
            </div>
          </div>
        )}

        {/* Hiển thị danh sách phản hồi (replies) */}
        {comment.replies?.length > 0 && (
          <div className="mt-2 relative">
             <div className="absolute left-[15px] top-0 bottom-4 w-px bg-border/60"></div>
             {comment.replies.map(reply => renderCommentNode(reply, true))}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) return <div className="p-8 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-indigo-500" /></div>;

  return (
    <div className="flex flex-col h-full bg-card rounded-xl border border-border shadow-sm overflow-hidden max-w-2xl mx-auto w-full">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border bg-secondary/20 flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-indigo-500" />
        <h3 className="font-semibold text-foreground">Comment</h3>
        <span className="bg-secondary text-secondary-foreground text-xs px-2 py-0.5 rounded-full font-medium ml-1">
          {total}
        </span>
      </div>

      {/* Danh sách Comments */}
      <div className="flex-1 overflow-y-auto p-5 hide-scrollbar">
        {comments.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-60">
            <MessageSquare className="h-12 w-12 mb-3" strokeWidth={1} />
            <p className="text-sm">No comment yet</p>
            <p className="text-xs mt-1">Be the first to give your opinion!</p>
          </div>
        ) : (
          comments.map(c => renderCommentNode(c))
        )}
      </div>

      {/* Khung chat gốc (Top-level) */}
      <div className="p-4 border-t border-border bg-background">
        <div className="flex gap-3">
          <Avatar className="h-9 w-9 border border-border shrink-0">
            <AvatarFallback className="bg-indigo-600 text-white text-xs font-bold uppercase">
              {user?.username?.substring(0, 2) || <User className="h-4 w-4"/>}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 relative">
            <Textarea 
              placeholder="Write your comment..." 
              className="min-h-[44px] h-[44px] resize-none pr-12 py-3 bg-secondary/30 focus-visible:bg-background transition-colors focus-visible:ring-indigo-500"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
            <Button 
              size="icon" 
              className="absolute right-1 bottom-1 h-9 w-9 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md"
              onClick={() => handleSubmit()}
              disabled={isSubmitting || !newComment.trim()}
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 ml-0.5" />}
            </Button>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground text-center mt-2">Press Enter to submit, Shift + Enter to go to the next line</p>
      </div>
    </div>
  );
}