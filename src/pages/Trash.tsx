import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, Trash2, AlertTriangle, FileX2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/layout/AppLayout";
import { useTrashStore } from "@/stores/trashStore";
import { mergeItems, getFileIcon, getFolderIcon, formatBytes, formatDate } from "@/utils/fileUtils";
import { useNavigate } from "react-router-dom";

const TrashPage = () => {
  const navigate = useNavigate();
  const { 
    trashedFolders, 
    trashedDocuments, 
    isLoading, 
    fetchTrash, 
    forceDeleteItem, 
    emptyAllTrash,
    restoreItem 
  } = useTrashStore();

  useEffect(() => {
    fetchTrash(null);
  }, [fetchTrash]);

  const allItems = mergeItems(trashedFolders, trashedDocuments);

  const handleEmptyTrash = async () => {
    if (window.confirm("WARNING: This action will permanently delete all data in Trash and it cannot be recovered. Are you sure?")) {
      await emptyAllTrash();
    }
  };

  const handleForceDelete = (id: string, kind: "folder" | "document") => {
    if (window.confirm("Are you sure you want to permanently delete this item?")) {
      forceDeleteItem(id, kind);
    }
  };

  const getDisplayData = (item: any) => {
    if (item.kind === "folder") {
      const { icon: Icon, color } = getFolderIcon();
      return { id: item.data._id, name: item.data.name, date: formatDate(item.data.deletedAt || item.data.createdAt), size: "—", Icon, color, kind: item.kind };
    }
    const { icon: Icon, color } = getFileIcon(item.data.physicalFileId?.mimeType || "");
    return { id: item.data._id, name: item.data.originalName, date: formatDate(item.data.deletedAt || item.data.createdAt), size: formatBytes(item.data.physicalFileId?.sizeBytes || 0), Icon, color, kind: item.kind };
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Header Thùng rác */}
        <div className="flex items-center justify-between bg-red-50/50 p-6 rounded-2xl border border-red-100">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
              <Trash2 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Trash</h1>
              <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                Items in the trash will be permanently deleted after 10 days
              </p>
            </div>
          </div>
          
          <Button 
            variant="destructive" 
            className="gap-2 shadow-sm"
            onClick={handleEmptyTrash}
            disabled={allItems.length === 0 || isLoading}
          >
            <FileX2 className="h-4 w-4" />
            Empty the trash can
          </Button>
        </div>

        {/* Danh sách Data */}
        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
        ) : allItems.length === 0 ? (
          <div className="text-center py-24 text-slate-500 border-2 border-dashed rounded-2xl bg-slate-50/50">
            <Trash2 className="h-12 w-12 mx-auto text-slate-300 mb-3" />
            <p className="font-medium text-slate-600">Trash can is empty</p>
            <p className="text-sm mt-1">There are no files or folders here</p>
          </div>
        ) : (
          <div className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm">
            <div className="grid grid-cols-12 px-6 py-4 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50">
              <div className="col-span-6">Name</div>
              <div className="col-span-3">Date deleted</div>
              <div className="col-span-2">Size</div>
              <div className="col-span-1 text-right">Operation</div>
            </div>
            
            <div className="divide-y divide-slate-100 max-h-[600px] overflow-auto">
              {allItems.map((item) => {
                const display = getDisplayData(item);
                return (
                  <div key={display.id} className="grid grid-cols-12 px-6 py-4 items-center hover:bg-slate-50 transition-colors">
                    <div className="col-span-6 flex items-center gap-3 pr-4">
                      <display.Icon className={`h-6 w-6 ${display.color}`} />
                      <span className="text-[15px] font-medium text-slate-700 truncate line-through opacity-70">
                        {display.name}
                      </span>
                    </div>
                    <div className="col-span-3 text-sm text-slate-500">{display.date}</div>
                    <div className="col-span-2 text-sm text-slate-500">{display.size}</div>
                    <div className="col-span-1 text-right">
                      {/* Nút Khôi phục */}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 h-8 px-2 gap-1"
                        onClick={() => restoreItem(display.id, display.kind as "folder" | "document")}
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        <span className="text-xs">Restore</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs"
                        onClick={() => handleForceDelete(display.id, display.kind as "folder" | "document")}
                      >
                        Permanently delete
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default TrashPage;