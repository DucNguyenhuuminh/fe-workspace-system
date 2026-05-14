import { useState } from "react";
import { 
  LayoutList, LayoutGrid, MoreVertical, Pencil, Download, Trash2, 
  FolderPlus, ArrowLeft, FolderOpen, UploadCloud
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import AppLayout from "@/components/layout/AppLayout";
import { toast } from "sonner"; 

import { useMySpace } from "@/hooks/use-mySpace"; 
import { getFileIcon, getFolderIcon, formatBytes, formatDate } from "@/utils/fileUtils";
import type { FileItem } from "@/utils/fileUtils"; 

// --- CONTEXT MENU (Giữ nguyên) ---
const FileContextMenu = ({ 
  align = "end", isFolder, onDelete, onRename, onDownload
}: { 
  align?: "end" | "start"; isFolder: boolean;
  onDelete: () => void; onRename: () => void; onDownload: () => void;
}) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <button className="text-muted-foreground hover:text-foreground outline-none">
        <MoreVertical className="h-4 w-4" />
      </button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align={align}>
      <DropdownMenuItem className="gap-2" onClick={(e) => { e.stopPropagation(); onRename(); }}>
        <Pencil className="h-4 w-4" /> Đổi tên
      </DropdownMenuItem>
      {!isFolder && (
        <DropdownMenuItem className="gap-2" onClick={(e) => { e.stopPropagation(); onDownload(); }}>
          <Download className="h-4 w-4" /> Tải xuống
        </DropdownMenuItem>
      )}
      <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
        <Trash2 className="h-4 w-4" /> Xóa
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

const MySpace = () => {
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  
  const { 
    allItems, currentFolderInfo, isLoading, 
    createFolder, handleBack, fetchFolderContents,
    renameFolderItem, renameDocumentItem, 
    deleteFolderItem, deleteDocumentItem, downloadDocument 
  } = useMySpace();

  const handleCreateFolder = () => {
    const folderName = window.prompt("Nhập tên thư mục mới:");
    if (folderName?.trim()) createFolder(folderName.trim());
  };

  const handleRename = (item: FileItem) => {
    if (item.kind === "folder") {
      const newName = window.prompt("Nhập tên mới:", item.data.name);
      if (newName?.trim() && newName.trim() !== item.data.name) renameFolderItem(item.data._id, newName.trim());
    } else {
      const newName = window.prompt("Nhập tên mới:", item.data.originalName);
      if (newName?.trim() && newName.trim() !== item.data.originalName) renameDocumentItem(item.data._id, newName.trim());
    }
  };

  const handleDownload = (item: FileItem) => {
    item.kind === "document" ? downloadDocument(item.data._id, item.data.originalName) : toast.info("Chưa hỗ trợ tải nguyên thư mục.");
  };

  const handleDelete = (item: FileItem) => {
    if (window.confirm("Chuyển mục này vào thùng rác?")) {
      item.kind === "folder" ? deleteFolderItem(item.data._id) : deleteDocumentItem(item.data._id);
    }
  };

  const handleDoubleClick = (item: FileItem) => {
    if (item.kind === "folder") fetchFolderContents(item.data._id);
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
            {currentFolderInfo && (
              <button onClick={handleBack} className="h-9 w-9 flex items-center justify-center rounded-full bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground transition-all">
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                {currentFolderInfo ? currentFolderInfo.name : "My Space"}
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                {currentFolderInfo ? "Thư mục con" : "Quản lý tài liệu cá nhân"}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button onClick={handleCreateFolder} className="gap-2"><FolderPlus className="h-4 w-4" /> Tạo thư mục</Button>
            <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1 shadow-sm">
              <Button variant={viewMode === "list" ? "secondary" : "ghost"} size="icon" className="h-8 w-8" onClick={() => setViewMode("list")}>
                <LayoutList className="h-4 w-4" />
              </Button>
              <Button variant={viewMode === "grid" ? "secondary" : "ghost"} size="icon" className="h-8 w-8" onClick={() => setViewMode("grid")}>
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* --- CONTENT SECTION --- */}
        {isLoading ? (
          /* TRẠNG THÁI 1: LOADING SKELETON (Đẹp và mượt hơn Spinner) */
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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
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
          /* TRẠNG THÁI 2: THƯ MỤC RỖNG SKELETON (Empty State) */
          <div className="flex flex-col items-center justify-center py-32 text-center border-2 border-dashed border-border/60 rounded-2xl bg-secondary/20 transition-all hover:bg-secondary/30">
            <div className="relative mb-6">
              <FolderOpen className="h-20 w-20 text-muted-foreground/30" strokeWidth={1} />
              <div className="absolute -bottom-2 -right-2 bg-background rounded-full p-1 shadow-sm">
                <UploadCloud className="h-6 w-6 text-primary/60" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-foreground">Thư mục này trống</h3>
            <p className="text-muted-foreground mt-2 max-w-sm">
              Bạn có thể tạo thư mục con mới hoặc tải tài liệu lên không gian này để bắt đầu lưu trữ.
            </p>
            <div className="mt-6 flex gap-3">
              <Button onClick={handleCreateFolder} className="gap-2 shadow-md">
                <FolderPlus className="h-4 w-4" /> Tạo thư mục con
              </Button>
            </div>
          </div>
        ) : viewMode === "list" ? (
          /* TRẠNG THÁI 3: CÓ DỮ LIỆU - DẠNG LIST */
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
                      <FileContextMenu isFolder={display.isFolder} onRename={() => handleRename(item)} onDownload={() => handleDownload(item)} onDelete={() => handleDelete(item)} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* TRẠNG THÁI 4: CÓ DỮ LIỆU - DẠNG GRID */
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
                    <FileContextMenu isFolder={display.isFolder} onRename={() => handleRename(item)} onDownload={() => handleDownload(item)} onDelete={() => handleDelete(item)} />
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

export default MySpace;