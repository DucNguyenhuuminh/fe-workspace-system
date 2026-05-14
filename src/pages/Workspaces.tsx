import { useNavigate } from "react-router-dom";
import { Users, Plus, Loader2, Trash2 } from "lucide-react"; 
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/layout/AppLayout";
import { useWorkspaceData } from "@/hooks/use-workspace"; 
import { formatDate } from "@/utils/fileUtils";
import { useMemo } from "react";

const Workspaces = () => {
  const navigate = useNavigate();
  const { workspaces, isLoading, createWorkspace, deleteWorkspace } = useWorkspaceData();

  // 🚨 BƯỚC SỬA LỖI: Lọc bỏ các Workspace bị trùng lặp ID từ Store
  const uniqueWorkspaces = useMemo(() => {
    if (!workspaces) return [];
    return workspaces.filter((ws, index, self) => 
      index === self.findIndex((t) => t._id === ws._id)
    );
  }, [workspaces]);

  const handleCreateWorkspace = () => {
    const workspaceName = window.prompt("Nhập tên Workspace mới");
    if (workspaceName && workspaceName.trim()) {
      createWorkspace(workspaceName.trim());
    }
  };

  const handleDeleteWorkspace = (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation(); 
    if (window.confirm(`Bạn có chắc chắn muốn xóa Workspace "${name}" không?`)) {
      if (deleteWorkspace) {
        deleteWorkspace(id);
      }
    }
  };

  return (
    <AppLayout>
      <div>
        <div className="flex items-center justify-between mb-6">
          <div> 
            <h1 className="text-2xl font-bold text-foreground">Workspaces</h1>
            <p className="text-muted-foreground text-sm mt-1">Không gian làm việc nhóm</p>
          </div>
          <Button onClick={handleCreateWorkspace} className="gap-2">
            <Plus className="h-4 w-4" />
            Tạo Workspace
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
        ) : uniqueWorkspaces.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">Bạn chưa tham gia Workspace nào.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* 🚨 Dùng mảng đã lọc để render */}
            {uniqueWorkspaces.map((ws) => (
              <div
                key={ws._id}
                className="group relative rounded-xl border border-border bg-card p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/workspaces/${ws._id}`)}
              >
                
                <button
                  onClick={(e) => handleDeleteWorkspace(e, ws._id, ws.name)}
                  className="absolute top-4 right-4 p-2 rounded-md opacity-0 transition-opacity group-hover:opacity-100 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  title="Xóa Workspace"
                >
                  <Trash2 className="h-5 w-5" />
                </button>

                <div className={`h-12 w-12 rounded-xl bg-primary flex items-center justify-center mb-4`}>
                  <Users className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="text-base font-semibold text-foreground pr-8">{ws.name}</h3>
                <p className="text-xs text-muted-foreground mt-1 mb-4">
                  Tạo ngày: {formatDate(ws.createdAt)}
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {ws.members?.length || 0} Thành viên
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Workspaces;