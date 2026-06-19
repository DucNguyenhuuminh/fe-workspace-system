import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Plus, Loader2, Trash2 } from "lucide-react"; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import AppLayout from "@/components/layout/AppLayout";
import { useWorkspaceData } from "@/hooks/use-workspace"; 
import { formatDate } from "@/utils/fileUtils";

const Workspaces = () => {
  const navigate = useNavigate();
  const { workspaces, isLoading, createWorkspace, deleteWorkspace } = useWorkspaceData();

  // --- STATES CHO MODALS ---
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  
  const [deleteItem, setDeleteItem] = useState<{id: string, name: string} | null>(null);

  const uniqueWorkspaces = useMemo(() => {
    if (!workspaces) return [];
    return workspaces.filter((ws, index, self) => 
      index === self.findIndex((t) => t._id === ws._id)
    );
  }, [workspaces]);

  // --- HANDLERS TẠO WORKSPACE ---
  const openCreateModal = () => {
    setNewWorkspaceName("");
    setIsCreateModalOpen(true);
  };

  const submitCreateWorkspace = () => {
    if (newWorkspaceName.trim()) {
      createWorkspace(newWorkspaceName.trim());
      setIsCreateModalOpen(false);
    }
  };

  // --- HANDLERS XÓA WORKSPACE ---
  const openDeleteModal = (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation(); 
    setDeleteItem({ id, name });
  };

  const confirmDeleteWorkspace = () => {
    if (deleteItem && deleteWorkspace) {
      deleteWorkspace(deleteItem.id);
      setDeleteItem(null);
    }
  };

  return (
    <AppLayout>
      <div>
        <div className="flex items-center justify-between mb-6">
          <div> 
            <h1 className="text-2xl font-bold text-foreground">Workspaces</h1>
            <p className="text-muted-foreground text-sm mt-1">Teamwork space</p>
          </div>
          <Button onClick={openCreateModal} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Workspace
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
        ) : uniqueWorkspaces.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">You haven't joined any Workspace yet</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/*  Dùng mảng đã lọc để render */}
            {uniqueWorkspaces.map((ws) => (
              <div
                key={ws._id}
                className="group relative rounded-xl border border-border bg-card p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/workspaces/${ws._id}`)}
              >
                
                <button
                  onClick={(e) => openDeleteModal(e, ws._id, ws.name)}
                  className="absolute top-4 right-4 p-2 rounded-md opacity-0 transition-opacity group-hover:opacity-100 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  title="Delete Workspace"
                >
                  <Trash2 className="h-5 w-5" />
                </button>

                <div className={`h-12 w-12 rounded-xl bg-primary flex items-center justify-center mb-4`}>
                  <Users className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="text-base font-semibold text-foreground pr-8">{ws.name}</h3>
                <p className="text-xs text-muted-foreground mt-1 mb-4">
                  Create at: {formatDate(ws.createdAt)}
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {ws.members?.length || 0} Members
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- MODAL TẠO WORKSPACE MỚI --- */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create new workspace</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input 
              placeholder="Enter workspace name..." 
              value={newWorkspaceName} 
              onChange={(e) => setNewWorkspaceName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submitCreateWorkspace()}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
            <Button onClick={submitCreateWorkspace} disabled={!newWorkspaceName.trim()}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- MODAL XÁC NHẬN XÓA WORKSPACE --- */}
      <Dialog open={!!deleteItem} onOpenChange={(open) => !open && setDeleteItem(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <Trash2 className="h-5 w-5" /> Delete Workspace
            </DialogTitle>
            <DialogDescription className="pt-2">
              Are you sure you want to delete the <strong>"{deleteItem?.name}"</strong> workspace? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDeleteItem(null)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDeleteWorkspace}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Workspaces;