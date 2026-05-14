import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  LayoutList, LayoutGrid, MoreVertical, Pencil, Download, Trash2, 
  ArrowLeft, Settings, Loader2, FolderPlus, UserPlus, UserMinus, 
  ShieldCheck, FolderOpen, UploadCloud, RotateCcw, AlertOctagon 
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AppLayout from "@/components/layout/AppLayout";

import { useWorkspaceDetail } from "@/hooks/use-workspaceDetail"; 
import { useAuthStore } from "@/stores/authStore";
import { useTrashStore } from "@/stores/trashStore"; // Lấy loading của trash
import { getFileIcon, getFolderIcon, formatBytes, formatDate, FileItem } from "@/utils/fileUtils";

const FileContextMenu = ({ 
  align = "end", 
  isFolder,
  onDelete,
  onRename,
  onDownload,
  canEdit
}: { 
  align?: "end" | "start";
  isFolder: boolean;
  onDelete: () => void;
  onRename: () => void;
  onDownload: () => void;
  canEdit: boolean;
}) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <button className="text-muted-foreground hover:text-foreground outline-none">
        <MoreVertical className="h-4 w-4" />
      </button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align={align}>
      {canEdit && (
        <DropdownMenuItem className="gap-2" onClick={(e) => { e.stopPropagation(); onRename(); }}>
          <Pencil className="h-4 w-4" /> Đổi tên
        </DropdownMenuItem>
      )}
      {!isFolder && (
        <DropdownMenuItem className="gap-2" onClick={(e) => { e.stopPropagation(); onDownload(); }}>
          <Download className="h-4 w-4" /> Tải xuống
        </DropdownMenuItem>
      )}
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
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const { user } = useAuthStore();
  const { isLoading: isTrashLoading } = useTrashStore();

  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState<"viewer" | "editor">("viewer");

  const { 
    currentWorkspace,
    currentFolderInfo, 
    allItems, 
    trashedItems, 
    isLoading,
    createNewFolder,
    renameFolderItem,
    renameDocumentItem,
    deleteFolderItem,
    deleteDocumentItem,
    downloadDocument,
    addMember,
    removeMember,
    setUserPermission,
    fetchFolderContents, 
    handleBack,
    fetchTrash,
    emptyAllTrash,     // ✅ Hàm dọn sạch thùng rác
    forceDeleteItem,   // ✅ Hàm xóa vĩnh viễn
    restoreItem        // ✅ Hàm khôi phục
  } = useWorkspaceDetail(id);

  const memberInfo = useMemo(() => {
    return currentWorkspace?.members.find(m => m.userId.toString() === user?._id);
  }, [currentWorkspace, user]);

  const isAdmin = memberInfo?.role === "ADMIN";
  const isEditor = memberInfo?.permissions === "editor" || isAdmin;

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

  const handleDoubleClick = (item: FileItem) => {
    if (item.kind === "folder" && fetchFolderContents) {
      fetchFolderContents(item.data._id);
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
        {/* --- HEADER --- */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                if (currentFolderInfo && handleBack) {
                  handleBack(); 
                } else {
                  navigate("/workspaces"); 
                }
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
          
          <div className="flex items-center gap-3">
            {isEditor && (
              <Button onClick={handleCreateFolder} className="gap-2"><FolderPlus className="h-4 w-4" /> Tạo thư mục</Button>
            )}

            <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1 shadow-sm">
              <Button variant={viewMode === "list" ? "secondary" : "ghost"} size="icon" className="h-8 w-8" onClick={() => setViewMode("list")}><LayoutList className="h-4 w-4" /></Button>
              <Button variant={viewMode === "grid" ? "secondary" : "ghost"} size="icon" className="h-8 w-8" onClick={() => setViewMode("grid")}><LayoutGrid className="h-4 w-4" /></Button>
            </div>
            
            {/* ✅ NÚT THÙNG RÁC */}
            {isEditor && !currentFolderInfo && (
              <Dialog onOpenChange={(open) => { if (open) fetchTrash(); }}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2 text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive">
                    <Trash2 className="h-4 w-4" /> Thùng rác
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[700px] bg-[#f4f6fc] p-6 border-none shadow-2xl">
                  
                  {/* ✅ THÊM NÚT LÀM TRỐNG THÙNG RÁC TRÊN HEADER */}
                  <DialogHeader className="mb-4 flex flex-row items-center justify-between pr-6">
                    <DialogTitle className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                      <Trash2 className="h-5 w-5 text-destructive" /> Thùng rác Workspace
                    </DialogTitle>
                    {trashedItems.length > 0 && (
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        className="gap-2"
                        onClick={emptyAllTrash} // Gọi thẳng từ hook
                      >
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
                            
                            {/* ✅ CỤM NÚT KHÔI PHỤC VÀ XÓA VĨNH VIỄN */}
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                                onClick={() => {
                                  restoreItem(display.id, item.kind);
                                  // Tự động load lại folder hiện tại để thấy file (tuỳ chọn)
                                  if (currentFolderInfo) fetchFolderContents(currentFolderInfo._id);
                                }}
                              >
                                <RotateCcw className="h-4 w-4 mr-1" /> Khôi phục
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 px-2"
                                title="Xóa vĩnh viễn"
                                onClick={() => forceDeleteItem(display.id, item.kind)}
                              >
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

            {/* --- NÚT THÀNH VIÊN --- */}
            {isAdmin && !currentFolderInfo && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="gap-2"><Settings className="h-4 w-4" /> Thành viên</Button>
                </DialogTrigger>
                
                <DialogContent className="sm:max-w-[550px] bg-[#f4f6fc] p-6 border-none shadow-2xl">
                  {/* ... GIỮ NGUYÊN NHƯ CŨ ... */}
                  <DialogHeader className="mb-4">
                    <DialogTitle className="text-xl font-semibold text-slate-800">Quản lý thành viên nhóm</DialogTitle>
                  </DialogHeader>
                  
                  <div className="flex gap-3 items-center">
                    <div className="flex-1 relative">
                      <Input 
                        placeholder="Nhập email..." 
                        value={newMemberEmail} 
                        onChange={(e) => setNewMemberEmail(e.target.value)}
                        className="w-full h-12 bg-transparent border-2 border-indigo-500 rounded-xl focus-visible:ring-0 focus-visible:border-indigo-600 shadow-sm text-slate-700"
                      />
                    </div>
                    <Select value={newMemberRole} onValueChange={(v: any) => setNewMemberRole(v)}>
                      <SelectTrigger className="w-[120px] h-12 rounded-xl border border-slate-200 bg-transparent text-slate-700 shadow-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="viewer">Viewer</SelectItem>
                        <SelectItem value="editor">Editor</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button 
                      className="h-12 w-14 rounded-xl bg-indigo-500 hover:bg-indigo-600 shadow-sm"
                      onClick={async () => { await addMember(id!, newMemberEmail, newMemberRole); setNewMemberEmail(""); }}
                    >
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
                                <SelectContent>
                                  <SelectItem value="viewer">Viewer</SelectItem>
                                  <SelectItem value="editor">Editor</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button variant="ghost" size="icon" className="h-9 w-9 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => removeMember(id!, m.userId.toString())}>
                                <UserMinus className="h-5 w-5" strokeWidth={1.5} />
                              </Button>
                            </>
                          ) : (
                            <Button variant="ghost" size="icon" disabled className="h-9 w-9 text-red-500 opacity-60 cursor-not-allowed">
                              <UserMinus className="h-5 w-5" strokeWidth={1.5} />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                    {(!currentWorkspace?.members || currentWorkspace.members.length === 0) && (
                      <div className="p-6 text-center text-sm text-slate-500">Chưa có thành viên nào.</div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* --- CONTENT SECTION (Giữ nguyên không đổi) --- */}
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
                    <div className="flex-1 flex items-center gap-4">
                      <div className="h-8 w-8 bg-secondary rounded-lg"></div>
                      <div className="h-4 w-1/3 bg-secondary rounded"></div>
                    </div>
                    <div className="w-1/4 h-4 bg-secondary rounded mx-4"></div>
                    <div className="w-24 h-4 bg-secondary rounded mr-10"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="rounded-xl border border-border bg-card p-4 h-32 animate-pulse flex flex-col justify-end">
                  <div className="h-10 w-10 bg-secondary rounded-lg mb-3"></div>
                  <div className="h-4 w-3/4 bg-secondary rounded mb-2"></div>
                  <div className="h-3 w-1/2 bg-secondary rounded"></div>
                </div>
              ))}
            </div>
          )
        ) : allItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center border-2 border-dashed border-border/60 rounded-2xl bg-secondary/20 transition-all hover:bg-secondary/30">
            <div className="relative mb-6">
              <FolderOpen className="h-20 w-20 text-muted-foreground/30" strokeWidth={1} />
              {isEditor && (
                <div className="absolute -bottom-2 -right-2 bg-background rounded-full p-1 shadow-sm">
                  <UploadCloud className="h-6 w-6 text-primary/60" />
                </div>
              )}
            </div>
            <h3 className="text-xl font-semibold text-foreground">Không gian này trống</h3>
            <p className="text-muted-foreground mt-2 max-w-sm">
              {isEditor 
                ? "Bắt đầu tải lên tài liệu hoặc tạo thư mục mới để chia sẻ với nhóm." 
                : "Nhóm này chưa có tài liệu nào."}
            </p>
            {isEditor && (
              <div className="mt-6 flex gap-3">
                <Button onClick={handleCreateFolder} className="gap-2"><FolderPlus className="h-4 w-4" /> Tạo thư mục</Button>
              </div>
            )}
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
                  <div 
                    key={display.id} 
                    className="grid grid-cols-12 px-6 py-4 items-center hover:bg-secondary/60 transition-all cursor-pointer group"
                    onDoubleClick={() => handleDoubleClick(item)}
                  >
                    <div className="col-span-6 flex items-center gap-4 pr-4">
                      <div className="p-1.5 rounded-lg bg-background shadow-sm border border-border/50">
                        <display.Icon className={`h-5 w-5 ${display.color}`} />
                      </div>
                      <span className="text-sm font-medium text-foreground truncate select-none group-hover:text-primary transition-colors">{display.name}</span>
                    </div>
                    <div className="col-span-3 text-sm text-muted-foreground select-none">{display.date}</div>
                    <div className="col-span-2 text-sm text-muted-foreground select-none">{display.size}</div>
                    <div className="col-span-1 text-right">
                      <FileContextMenu 
                        canEdit={isEditor} isFolder={display.isFolder}
                        onRename={() => handleRename(item)}
                        onDelete={() => handleDelete(item)}
                        onDownload={() => downloadDocument(display.id, display.name)}
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
                <div 
                  key={display.id} 
                  className="group relative rounded-xl border border-border bg-card p-5 hover:shadow-lg hover:-translate-y-0.5 hover:border-primary/30 transition-all cursor-pointer flex flex-col"
                  onDoubleClick={() => handleDoubleClick(item)}
                >
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                    <FileContextMenu 
                      canEdit={isEditor} isFolder={display.isFolder}
                      onRename={() => handleRename(item)}
                      onDelete={() => handleDelete(item)}
                      onDownload={() => downloadDocument(display.id, display.name)}
                    />
                  </div>
                  <div className="p-2 w-fit rounded-lg bg-secondary/50 mb-4 group-hover:scale-110 transition-transform">
                    <display.Icon className={`h-10 w-10 ${display.color}`} />
                  </div>
                  <p className="text-sm font-medium text-foreground truncate select-none mt-auto group-hover:text-primary transition-colors" title={display.name}>{display.name}</p>
                  <p className="text-[11px] text-muted-foreground mt-1 select-none">{display.size} • {display.date.split(' ')[0]}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default WorkspaceDetail;