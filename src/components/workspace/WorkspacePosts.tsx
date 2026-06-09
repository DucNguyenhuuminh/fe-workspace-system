import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { 
  Send, MoreHorizontal, Pencil, Trash2, MessageCircle, 
  Loader2, User, Globe
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

import { postService, Post } from "@/services/postService";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";
import PostComments from "./PostCommentModal";

export default function WorkspacePosts({ workspaceId, isAdmin }: { workspaceId: string, isAdmin: boolean }) {
  const { user } = useAuthStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);

  const fetchPosts = async () => {
    try {
      const data = await postService.getPosts(workspaceId, 1, 30);
      // Lọc bỏ bài đã bị xóa mềm (trường hợp Backend trả về cả deletedAt)
      const activePosts = data.posts.filter((p: Post) => !p.deletedAt);
      setPosts(activePosts);
    } catch (error) {
      toast.error("Không thể tải bảng tin");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [workspaceId]);

  const handleCreatePost = async () => {
    if (!content.trim()) return;
    setIsSubmitting(true);
    try {
      await postService.createPost(workspaceId, content);
      setContent("");
      fetchPosts();
      toast.success("Đã đăng bài viết");
    } catch (error) {
      toast.error("Lỗi đăng bài");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdatePost = async (postId: string) => {
    if (!editContent.trim()) return;
    try {
      await postService.updatePost(workspaceId, postId, editContent);
      setEditingId(null);
      fetchPosts();
      toast.success("Đã cập nhật bài viết");
    } catch (error) {
      toast.error("Lỗi cập nhật");
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm("Chắc chắn xóa bài viết này?")) return;
    try {
      await postService.deletePost(workspaceId, postId);
      fetchPosts();
      toast.success("Đã xóa bài viết");
    } catch (error) {
      toast.error("Không có quyền xóa");
    }
  };

  if (isLoading) return <div className="flex justify-center p-10"><Loader2 className="h-8 w-8 animate-spin text-indigo-500" /></div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-10">
      {/* Khung đăng bài mới */}
      <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
        <div className="flex gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-indigo-600 text-white font-bold">
              {user?.username?.substring(0, 2) || <User className="h-5 w-5"/>}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea 
              placeholder="Bạn muốn thảo luận điều gì với nhóm?" 
              value={content} onChange={(e) => setContent(e.target.value)}
              className="min-h-[80px] bg-secondary/30 resize-none mb-3"
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Globe className="h-3 w-3" /> Mọi người trong Workspace đều có thể xem
              </span>
              <Button onClick={handleCreatePost} disabled={isSubmitting || !content.trim()} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Đăng bài
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Danh sách bài viết */}
      {posts.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground border-2 border-dashed border-border rounded-xl">
          <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-20" />
          <p>Chưa có bài thảo luận nào.</p>
        </div>
      ) : (
        posts.map((post) => {
          const isOwner = post.createdBy === user?._id || post.createdBy?._id === user?._id;
          const canDelete = isOwner || isAdmin;

          return (
            <div key={post._id} className="bg-card rounded-xl border border-border p-5 shadow-sm">
              {/* Header bài viết */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-3 items-center">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-slate-200 text-slate-700"><User className="h-5 w-5"/></AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-[15px]">{post.createdBy?.username || "Thành viên nhóm"}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: vi })}
                      {post.updatedAt !== post.createdAt && " • Đã chỉnh sửa"}
                    </p>
                  </div>
                </div>

                {canDelete && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="h-8 w-8 rounded-full hover:bg-secondary flex items-center justify-center text-muted-foreground"><MoreHorizontal className="h-5 w-5" /></button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-36">
                      {isOwner && <DropdownMenuItem onClick={() => { setEditingId(post._id); setEditContent(post.content); }}><Pencil className="h-4 w-4 mr-2" /> Sửa bài</DropdownMenuItem>}
                      <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDeletePost(post._id)}><Trash2 className="h-4 w-4 mr-2" /> Xóa bài</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              {/* Nội dung bài viết */}
              {editingId === post._id ? (
                <div className="mb-4">
                  <Textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} className="min-h-[100px] mb-2" autoFocus />
                  <div className="flex gap-2 justify-end">
                    <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>Hủy</Button>
                    <Button size="sm" onClick={() => handleUpdatePost(post._id)}>Cập nhật</Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed mb-4">{post.content}</p>
              )}

              {/* Action Bar */}
              <div className="border-t border-border pt-3 flex gap-2">
                <Button 
                  variant="ghost" 
                  className={`flex-1 gap-2 text-muted-foreground hover:bg-secondary/60 ${activeCommentPostId === post._id ? 'bg-secondary/50 text-foreground' : ''}`}
                  onClick={() => setActiveCommentPostId(activeCommentPostId === post._id ? null : post._id)}
                >
                  <MessageCircle className="h-4 w-4" /> 
                  Bình luận {post.commentCount > 0 && `(${post.commentCount})`}
                </Button>
              </div>

              {/* Khu vực Bình luận */}
              {activeCommentPostId === post._id && (
                <PostComments 
                  workspaceId={workspaceId} 
                  postId={post._id} 
                  onCommentAdded={fetchPosts} 
                />
              )}
            </div>
          );
        })
      )}
    </div>
  );
}