import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  LayoutList, LayoutGrid, MoreVertical, Pencil, Download, Trash2, 
  ArrowLeft, Settings, Loader2, FolderPlus, UserPlus, UserMinus, 
  ShieldCheck, FolderOpen, UploadCloud, RotateCcw, AlertOctagon,
  FolderOutput, Check, ChevronRight, Eye, Link, MessageSquare 
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AppLayout from "@/components/layout/AppLayout";

import InviteManagerModal from "@/components/workspace/InviteManagerModal";
import ShareModal from "@/components/share/ShareModal";
import CommentModal from "@/components/comment/CommentModal";
import WorkspacePosts from "@/components/workspace/WorkspacePosts";

import { useWorkspaceDetail } from "@/hooks/use-workspaceDetail"; 
import { useAuthStore } from "@/stores/authStore";
import { useTrashStore } from "@/stores/trashStore"; 
import { getFileIcon, getFolderIcon, formatBytes, formatDate, FileItem } from "@/utils/fileUtils";
import { toast } from "sonner";

// --- FILE CONTEXT MENU ---
const FileContextMenu = ({ 
  align = "end", isFolder, onDelete, onRename, onDownload, onMove, onView, onComment, onShare, canEdit
}: { 
  align?: "end" | "start"; isFolder: boolean; canEdit: boolean;
  onDelete: () => void; onRename: () => void; onDownload: () => void; onMove: () => void; onView: () => void; onComment: () => void;
  onShare: () => void;
}) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <button className="text-muted-foreground hover:text-foreground outline-none">
        <MoreVertical className="h-4 w-4" />
      </button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align={align} className="w-48">
      {!isFolder && (
        <DropdownMenuItem className="gap-2" onClick={(e) => { e.stopPropagation(); onView(); }}>
          <Eye className="h-4 w-4" /> Xem trước
        </DropdownMenuItem>
      )}
      {!isFolder && (
        <DropdownMenuItem className="gap-2" onClick={(e) => { e.stopPropagation(); onComment(); }}>
          <MessageSquare className="h-4 w-4" /> Bình luận
        </DropdownMenuItem>
      )}
      {canEdit && (
        <DropdownMenuItem className="gap-2" onClick={(e) => { e.stopPropagation(); onRename(); }}>
          <Pencil className="h-4 w-4" /> Đổi tên
        </DropdownMenuItem>
      )}
      {canEdit && (
        <DropdownMenuItem className="gap-2" onClick={(e) => { e.stopPropagation(); onMove(); }}>
          <FolderOutput className="h-4 w-4" /> Di chuyển tới...
        </DropdownMenuItem>
      )}
      {!isFolder && (
        <DropdownMenuItem className="gap-2" onClick={(e) => { e.stopPropagation(); onShare(); }}>
          <Link className="h-4 w-4" /> Chia sẻ
        </DropdownMenuItem>
      )}
      {!isFolder && (
        <DropdownMenuItem className="gap-2" onClick={(e) => { e.stopPropagation(); onDownload(); }}>
          <Download className="h-4 w-4" /> Tải xuống
        </DropdownMenuItem>
      )}

      {canEdit && <DropdownMenuSeparator />}
      
      {canEdit && (
        <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
          <Trash2 className="h-4 w-4" /> Xóa
        </DropdownMenuItem>
      )}
    </DropdownMenuContent>
  </DropdownMenu>
);

const WorkspaceDetail = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  
  // --- STATES TỔNG QUAN ---
  const [activeTab, setActiveTab] = useState("files"); // Quản lý Tab hiện tại
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  
  const { user } = useAuthStore();
  const { isLoading: isTrashLoading } = useTrashStore();

  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState<"viewer" | "editor">("viewer");

  const { 
    currentWorkspace, currentFolderInfo, allItems, trashedItems, isLoading,
    createNewFolder, renameFolderItem, renameDocumentItem, deleteFolderItem, deleteDocumentItem, 
    downloadDocument, addMember, removeMember, setUserPermission, fetchFolderContents, handleBack,
    fetchTrash, emptyAllTrash, forceDeleteItem, restoreItem,
    viewDocument, moveFolderItem, moveDocumentItem
  } = useWorkspaceDetail(id);

  // --- PHÂN QUYỀN ---
  const memberInfo = useMemo(() => {
    return currentWorkspace?.members.find(m => m.userId.toString() === user?._id);
  }, [currentWorkspace, user]);

  const isAdmin = memberInfo?.role === "ADMIN";
  const isEditor = memberInfo?.permissions === "editor" || isAdmin;

  // --- STATE MODALS ---
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [movingItem, setMovingItem] = useState<FileItem | null>(null);
  const [destPath, setDestPath] = useState<{id: string | null, name: string}[]>([{id: null, name: 'Đang tải...'}]);
  const [destFolders, setDestFolders] = useState<any[]>([]);
  const [isFetchingDest, setIsFetchingDest] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [commentFileId, setCommentFileId] = useState<string | null>(null);
  const [shareItem, setShareItem] = useState<FileItem | null>(null);

  useEffect(() => {
    if (currentWorkspace && movingItem) {
      setDestPath([{id: null, name: currentWorkspace.name}]);
    }
  }, [currentWorkspace, movingItem]);

  useEffect(() => {
    if (!movingItem) return;
    
    const fetchDestFolders = async () => {
      setIsFetchingDest(true);
      try {
        const currentDestId = destPath[destPath.length - 1].id;
        const { folderService } = await import('@/services/folderService');
        const res = await folderService.getFolders(currentDestId, id);
        let folders = res.data.data || [];
        
        if (movingItem.kind === "folder") {
          folders = folders.filter((f: any) => f._id !== movingItem.data._id);
        }
        setDestFolders(folders);
      } catch (error) {
        toast.error("Không thể tải danh sách thư mục đích.");
      } finally {
        setIsFetchingDest(false);
      }
    };
    fetchDestFolders();
  }, [movingItem, destPath, id]);

  // --- CÁC HÀM XỬ LÝ (Handlers) ---
  const handleConfirmMove = async () => {
    if (!movingItem) return;
    const targetFolderId = destPath[destPath.length - 1].id;
    const currentParentId = currentFolderInfo?._id || null;

    if (targetFolderId === currentParentId) {
      toast.warning("Tệp này đã nằm trong thư mục đích rồi!");
      setMovingItem(null);
      return;
    }

    setIsMoving(true);
    const toastId = toast.loading("Đang di chuyển...");
    
    try {
      if (movingItem.kind === "folder") {
        await moveFolderItem(movingItem.data._id, targetFolderId, id!);
      } else {
        await moveDocumentItem(movingItem.data._id, targetFolderId);
      }
      toast.success("Di chuyển thành công!", { id: toastId });
      setMovingItem(null);
    } catch (error) {
      console.error(error);
    } finally {
      setIsMoving(false);
    }
  };

  const handleCreateFolder = () => {
    const folderName = window.prompt("Nhập tên thư mục mới:");
    if (folderName?.trim()) createNewFolder(folderName.trim());
  };

  const handleRename = (item: FileItem) => {
    const name = item.kind === "folder" ? item.data.name : item.data.originalName;
    const newName = window.prompt("Nhập tên mới:", name);
    if (newName?.trim() && newName !== name) {
      item.kind === "folder" ? renameFolderItem(item.data._id, newName) : renameDocumentItem(item.data._id, newName);
    }
  };

  const handleDelete = (item: FileItem) => {
    if (window.confirm("Xác nhận chuyển vào thùng rác?")) {
      item.kind === "folder" ? deleteFolderItem(item.data._id) : deleteDocumentItem(item.data._id);
    }
  };

  const handleView = (item: FileItem) => {
    if (item.kind === "document") viewDocument(item.data._id);
  };

  const handleDoubleClick = (item: FileItem) => {
    if (item.kind === "folder" && fetchFolderContents) {
      fetchFolderContents(item.data._id);
    } else {
      handleView(item); 
    }
  };

  const getDisplayData = (item: FileItem) => {
    if (item.kind === "folder") {
      const { icon: Icon, color } = getFolderIcon();
      return { id: item.data._id, name: item.data.name, date: formatDate(item.data.createdAt), size: "—", Icon, color, isFolder: true };
    }
    const { icon: Icon, color } = getFileIcon(item.data.physicalFileId?.mimeType || "");
    return { id: item.data._id, name: item.data.originalName, date: formatDate(item.data.createdAt), size: formatBytes(item.data.physicalFileId?.sizeBytes || 0), Icon, color, isFolder: false };
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-[1600px] mx-auto">
        
        {/* =========================================
            HEADER CỐ ĐỊNH (Tên Workspace + Thành viên) 
            ========================================= */}
        <div className="flex items-center justify-between pb-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                if (currentFolderInfo && handleBack) handleBack(); 
                else navigate("/workspaces"); 
              }} 
              className="h-9 w-9 flex items-center justify-center rounded-full bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground transition-all"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                {isLoading && !currentWorkspace ? (
                   <span className="animate-pulse bg-secondary h-8 w-48 rounded"></span>
                ) : (
                  currentFolderInfo ? currentFolderInfo.name : currentWorkspace?.name
                )}
              </h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
                <span className="font-medium uppercase tracking-tight">Quyền: {memberInfo?.permissions || "viewer"}</span>
                {isAdmin && <span title="Bạn là Admin"><ShieldCheck className="h-4 w-4 text-primary" /></span>}
              </div>
            </div>
          </div>
          
          {/* Nút Invite & Settings Thành viên luôn hiện bất kể Tab nào */}
          <div className="flex items-center gap-3">
            {isAdmin && !currentFolderInfo && (
              <>
                <Button onClick={() => setIsInviteModalOpen(true)} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                  <Link className="h-4 w-4" /> Link mời
                </Button>
                <InviteManagerModal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} workspaceId={id!} />
              </>
            )}

            {isAdmin && !currentFolderInfo && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2"><Settings className="h-4 w-4" /> Thành viên</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[550px] bg-[#f4f6fc] p-6 border-none shadow-2xl">
                  <DialogHeader className="mb-4">
                    <DialogTitle className="text-xl font-semibold text-slate-800">Quản lý thành viên nhóm</DialogTitle>
                  </DialogHeader>
                  <div className="flex gap-3 items-center">
                    <div className="flex-1 relative">
                      <Input placeholder="Nhập email..." value={newMemberEmail} onChange={(e) => setNewMemberEmail(e.target.value)} className="w-full h-12 bg-transparent border-2 border-indigo-500 rounded-xl focus-visible:ring-0 focus-visible:border-indigo-600 shadow-sm text-slate-700"/>
                    </div>
                    <Select value={newMemberRole} onValueChange={(v: any) => setNewMemberRole(v)}>
                      <SelectTrigger className="w-[120px] h-12 rounded-xl border border-slate-200 bg-transparent text-slate-700 shadow-sm"><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="viewer">Viewer</SelectItem><SelectItem value="editor">Editor</SelectItem></SelectContent>
                    </Select>
                    <Button className="h-12 w-14 rounded-xl bg-indigo-500 hover:bg-indigo-600 shadow-sm" onClick={async () => { await addMember(id!, newMemberEmail, newMemberRole); setNewMemberEmail(""); }}>
                      <UserPlus className="h-5 w-5" />
                    </Button>
                  </div>
                  <div className="mt-6 border border-slate-200 rounded-2xl divide-y divide-slate-100 max-h-[350px] overflow-auto bg-white shadow-sm">
                    {currentWorkspace?.members.map((m) => (
                      <div key={m.userId.toString()} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                        <div className="flex-1 min-w-0 mr-4">
                          <p className="text-[15px] font-medium text-slate-800 truncate">ID: {m.userId.toString()}</p>
                          <p className="text-[13px] text-slate-500 mt-1">Vai trò: {m.role} &bull; Quyền: {m.permissions}</p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          {m.role !== "ADMIN" ? (
                            <>
                              <Select value={m.permissions as string} onValueChange={(v: any) => setUserPermission(id!,m.userId.toString(), v)}>
                                <SelectTrigger className="h-9 w-[100px] text-xs bg-white border-slate-200"><SelectValue /></SelectTrigger>
                                <SelectContent><SelectItem value="viewer">Viewer</SelectItem><SelectItem value="editor">Editor</SelectItem></SelectContent>
                              </Select>
                              <Button variant="ghost" size="icon" className="h-9 w-9 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => removeMember(id!, m.userId.toString())}><UserMinus className="h-5 w-5" strokeWidth={1.5} /></Button>
                            </>
                          ) : (
                            <Button variant="ghost" size="icon" disabled className="h-9 w-9 text-red-500 opacity-60 cursor-not-allowed"><UserMinus className="h-5 w-5" strokeWidth={1.5} /></Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* =========================================
            HỆ THỐNG TABS & NỘI DUNG CHÍNH
            ========================================= */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          
          <div className="flex items-center justify-between mb-6">
            <TabsList className="bg-secondary/50">
              <TabsTrigger value="files" className="px-6">Tài liệu</TabsTrigger>
              <TabsTrigger value="posts" className="px-6">Thảo luận</TabsTrigger>
            </TabsList>

            {/* Các thanh công cụ thao tác File (Chỉ hiển thị khi đang ở Tab Tài liệu) */}
            {activeTab === "files" && (
              <div className="flex items-center gap-3">
                {isEditor && (
                  <Button onClick={handleCreateFolder} className="gap-2 shadow-sm"><FolderPlus className="h-4 w-4" /> Tạo thư mục</Button>
                )}

                <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1 shadow-sm">
                  <Button variant={viewMode === "list" ? "secondary" : "ghost"} size="icon" className="h-8 w-8" onClick={() => setViewMode("list")}><LayoutList className="h-4 w-4" /></Button>
                  <Button variant={viewMode === "grid" ? "secondary" : "ghost"} size="icon" className="h-8 w-8" onClick={() => setViewMode("grid")}><LayoutGrid className="h-4 w-4" /></Button>
                </div>
                
                {isEditor && !currentFolderInfo && (
                  <Dialog onOpenChange={(open) => { if (open) fetchTrash(); }}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="gap-2 text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive">
                        <Trash2 className="h-4 w-4" /> Thùng rác
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[700px] bg-[#f4f6fc] p-6 border-none shadow-2xl">
                      <DialogHeader className="mb-4 flex flex-row items-center justify-between pr-6">
                        <DialogTitle className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                          <Trash2 className="h-5 w-5 text-destructive" /> Thùng rác Workspace
                        </DialogTitle>
                        {trashedItems.length > 0 && (
                          <Button variant="destructive" size="sm" className="gap-2" onClick={emptyAllTrash}>
                            <AlertOctagon className="h-4 w-4" /> Làm trống
                          </Button>
                        )}
                      </DialogHeader>

                      <div className="border border-slate-200 rounded-2xl divide-y divide-slate-100 max-h-[400px] overflow-auto bg-white shadow-sm">
                        {isTrashLoading ? (
                          <div className="p-8 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-indigo-500" /></div>
                        ) : trashedItems.length === 0 ? (
                          <div className="p-10 text-center text-slate-500 flex flex-col items-center gap-2">
                            <Trash2 className="h-10 w-10 opacity-20" />
                            <p>Thùng rác đang trống.</p>
                          </div>
                        ) : (
                          trashedItems.map(item => {
                            const display = getDisplayData(item);
                            return (
                              <div key={display.id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group">
                                <div className="flex items-center gap-4 min-w-0 pr-4 flex-1">
                                  <div className="p-2 rounded-lg bg-slate-100 shrink-0">
                                    <display.Icon className={`h-5 w-5 ${display.color}`} />
                                  </div>
                                  <div className="overflow-hidden">
                                    <p className="text-sm font-medium text-slate-800 truncate" title={display.name}>{display.name}</p>
                                    <p className="text-xs text-slate-500 mt-0.5">Xóa lúc: {display.date}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                  <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50" onClick={() => restoreItem(display.id, item.kind)}>
                                    <RotateCcw className="h-4 w-4 mr-1" /> Khôi phục
                                  </Button>
                                  <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50 px-2" title="Xóa vĩnh viễn" onClick={() => forceDeleteItem(display.id, item.kind)}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            )}
          </div>

          {/* =========================================
              NỘI DUNG TAB 1: QUẢN LÝ TÀI LIỆU
              ========================================= */}
          <TabsContent value="files" className="mt-0 outline-none">
            {isLoading ? (
              viewMode === "list" ? (
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                  <div className="grid grid-cols-12 px-6 py-3 border-b text-xs font-semibold text-muted-foreground uppercase bg-secondary/30">
                    <div className="col-span-6">Tên</div>
                    <div className="col-span-3">Ngày tạo</div>
                    <div className="col-span-2">Kích thước</div>
                    <div className="col-span-1 text-right"></div>
                  </div>
                  <div className="divide-y divide-border">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex items-center px-6 py-4 animate-pulse">
                        <div className="flex-1 flex items-center gap-4"><div className="h-8 w-8 bg-secondary rounded-lg"></div><div className="h-4 w-1/3 bg-secondary rounded"></div></div>
                        <div className="w-1/4 h-4 bg-secondary rounded mx-4"></div>
                        <div className="w-24 h-4 bg-secondary rounded mr-10"></div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div key={i} className="rounded-xl border border-border bg-card p-4 h-32 animate-pulse flex flex-col justify-end"><div className="h-10 w-10 bg-secondary rounded-lg mb-3"></div><div className="h-4 w-3/4 bg-secondary rounded mb-2"></div><div className="h-3 w-1/2 bg-secondary rounded"></div></div>
                  ))}
                </div>
              )
            ) : allItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 text-center border-2 border-dashed border-border/60 rounded-2xl bg-secondary/20 transition-all hover:bg-secondary/30">
                <div className="relative mb-6">
                  <FolderOpen className="h-20 w-20 text-muted-foreground/30" strokeWidth={1} />
                  {isEditor && <div className="absolute -bottom-2 -right-2 bg-background rounded-full p-1 shadow-sm"><UploadCloud className="h-6 w-6 text-primary/60" /></div>}
                </div>
                <h3 className="text-xl font-semibold text-foreground">Không gian này trống</h3>
                <p className="text-muted-foreground mt-2 max-w-sm">{isEditor ? "Bắt đầu tải lên tài liệu hoặc tạo thư mục mới để chia sẻ với nhóm." : "Nhóm này chưa có tài liệu nào."}</p>
                {isEditor && <div className="mt-6 flex gap-3"><Button onClick={handleCreateFolder} className="gap-2 shadow-sm"><FolderPlus className="h-4 w-4" /> Tạo thư mục</Button></div>}
              </div>
            ) : viewMode === "list" ? (
              <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
                <div className="grid grid-cols-12 px-6 py-3 border-b text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-secondary/30">
                  <div className="col-span-6">Tên</div>
                  <div className="col-span-3">Ngày tạo</div>
                  <div className="col-span-2">Kích thước</div>
                  <div className="col-span-1 text-right"></div>
                </div>
                <div className="divide-y divide-border">
                  {allItems.map((item) => {
                    const display = getDisplayData(item);
                    return (
                      <div key={display.id} className="grid grid-cols-12 px-6 py-4 items-center hover:bg-secondary/60 transition-all cursor-pointer group" onDoubleClick={() => handleDoubleClick(item)}>
                        <div className="col-span-6 flex items-center gap-4 pr-4">
                          <div className="p-1.5 rounded-lg bg-background shadow-sm border border-border/50"><display.Icon className={`h-5 w-5 ${display.color}`} /></div>
                          <span className="text-sm font-medium text-foreground truncate select-none group-hover:text-primary transition-colors">{display.name}</span>
                        </div>
                        <div className="col-span-3 text-sm text-muted-foreground select-none">{display.date}</div>
                        <div className="col-span-2 text-sm text-muted-foreground select-none">{display.size}</div>
                        <div className="col-span-1 text-right">
                          <FileContextMenu 
                            canEdit={isEditor} isFolder={display.isFolder}
                            onRename={() => handleRename(item)} onDelete={() => handleDelete(item)} onDownload={() => downloadDocument(display.id, display.name)}
                            onView={() => handleView(item)}
                            onComment={() => setCommentFileId(item.data._id)}
                            onShare={() => setShareItem(item)}
                            onMove={() => { setDestPath([{id: null, name: currentWorkspace?.name || 'Workspace'}]); setMovingItem(item); }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {allItems.map((item) => {
                  const display = getDisplayData(item);
                  return (
                    <div key={display.id} className="group relative rounded-xl border border-border bg-card p-5 hover:shadow-lg hover:-translate-y-0.5 hover:border-primary/30 transition-all cursor-pointer flex flex-col" onDoubleClick={() => handleDoubleClick(item)}>
                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                        <FileContextMenu 
                          canEdit={isEditor} isFolder={display.isFolder}
                          onRename={() => handleRename(item)} onDelete={() => handleDelete(item)} onDownload={() => downloadDocument(display.id, display.name)}
                          onView={() => handleView(item)}
                          onComment={() => setCommentFileId(item.data._id)}
                          onShare={() => setShareItem(item)}
                          onMove={() => { setDestPath([{id: null, name: currentWorkspace?.name || 'Workspace'}]); setMovingItem(item); }}
                        />
                      </div>
                      <div className="p-2 w-fit rounded-lg bg-secondary/50 mb-4 group-hover:scale-110 transition-transform"><display.Icon className={`h-10 w-10 ${display.color}`} /></div>
                      <p className="text-sm font-medium text-foreground truncate select-none mt-auto group-hover:text-primary transition-colors" title={display.name}>{display.name}</p>
                      <p className="text-[11px] text-muted-foreground mt-1 select-none">{display.size} • {display.date.split(' ')[0]}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* =========================================
              NỘI DUNG TAB 2: BẢNG TIN THẢO LUẬN
              ========================================= */}
          <TabsContent value="posts" className="mt-0 outline-none">
            {/* Nhúng component Bảng tin vào đây */}
            <WorkspacePosts workspaceId={id!} isAdmin={isAdmin} />
          </TabsContent>

        </Tabs>
      </div>

      {/* --- CÁC DIALOG/MODALS CHỨC NĂNG --- */}
      <ShareModal 
        isOpen={!!shareItem} 
        onClose={() => setShareItem(null)}
        fileId={shareItem?.data._id || null}
        fileName={shareItem ? (shareItem.kind === "document" ? shareItem.data.originalName : shareItem.data.name) : ''}
      />

      <CommentModal 
        isOpen={!!commentFileId} 
        onClose={() => setCommentFileId(null)} 
        fileId={commentFileId} 
      />

      {/* MODAL DI CHUYỂN FILE/FOLDER */}
      <Dialog open={!!movingItem} onOpenChange={(open) => !open && setMovingItem(null)}>
        <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden bg-background border-border">
          <DialogHeader className="p-6 pb-4 border-b">
            <DialogTitle className="text-lg font-semibold flex items-center gap-2">
              <FolderOutput className="h-5 w-5 text-indigo-500" /> Di chuyển tới...
            </DialogTitle>
          </DialogHeader>

          <div className="px-6 py-3 bg-secondary/30 flex items-center gap-2 overflow-x-auto whitespace-nowrap hide-scrollbar">
            {destPath.map((pathItem, index) => (
              <div key={pathItem.id || 'root'} className="flex items-center text-sm">
                <button 
                  className={`hover:text-indigo-600 transition-colors ${index === destPath.length - 1 ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}
                  onClick={() => setDestPath(prev => prev.slice(0, index + 1))}
                >
                  {pathItem.name}
                </button>
                {index < destPath.length - 1 && <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground/50" />}
              </div>
            ))}
          </div>

          <div className="h-[300px] overflow-y-auto p-2">
            {isFetchingDest ? (
              <div className="h-full flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : destFolders.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                <FolderOpen className="h-12 w-12 opacity-20 mb-2" />
                <p className="text-sm">Không có thư mục con nào</p>
              </div>
            ) : (
              destFolders.map((folder: any) => (
                <div key={folder._id} onClick={() => setDestPath(prev => [...prev, { id: folder._id, name: folder.name }])} className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary cursor-pointer transition-colors">
                  <FolderOpen className="h-5 w-5 text-blue-500 fill-blue-500/20" />
                  <span className="text-sm font-medium flex-1 truncate">{folder.name}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                </div>
              ))
            )}
          </div>

          <DialogFooter className="p-4 border-t bg-secondary/10 flex justify-between sm:justify-between items-center">
            <span className="text-xs text-muted-foreground pl-2 truncate flex-1 pr-4">
              Đích: <strong className="text-foreground">{destPath[destPath.length - 1].name}</strong>
            </span>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setMovingItem(null)}>Hủy</Button>
              <Button onClick={handleConfirmMove} disabled={isMoving} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                {isMoving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                Di chuyển đến đây
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default WorkspaceDetail;