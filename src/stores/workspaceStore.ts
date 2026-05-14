import { create } from 'zustand';
import { workspaceService } from '@/services/workspaceService';
import type { Workspace } from '@/types';
import { toast } from 'sonner';

interface WorkspaceState {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  isLoading: boolean;

  fetchWorkspaces: () => Promise<void>;
  fetchWorkspaceDetail: (id: string) => Promise<void>;
  createWorkspace: (name: string) => Promise<void>;
  addMember: (workspaceId: string, email: string, permissions: "viewer" | "editor") => Promise<void>;
  removeMember: (workspaceId: string, targetUserId: string) => Promise<void>;
  deleteWorkspace: (id: string) => Promise<void>;
  setUserPermission: (workspaceId: string, targetUserId: string, permissions: "viewer" | "editor") => Promise<void>;
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  workspaces: [],
  currentWorkspace: null,
  isLoading: false,

  fetchWorkspaces: async () => {
    set({ isLoading: true });
    try {
      const data = await workspaceService.getAll();
      set({ workspaces: data });
    } catch (error) {
      toast.error("Lỗi khi tải danh sách Workspace");
    } finally {
      set({ isLoading: false });
    }
  },

  fetchWorkspaceDetail: async (id) => {
    set({ isLoading: true });
    try {
      const data = await workspaceService.getDetail(id);
      set({ currentWorkspace: data });
    } catch (error) {
      toast.error("Lỗi tải thông tin Workspace");
    } finally {
      set({ isLoading: false });
    }
  },

  createWorkspace: async (name) => {
    try {
      const newWs = await workspaceService.create(name);
      toast.success("Tạo Workspace thành công");
      set((state) => ({ workspaces: [...state.workspaces, newWs] }));
    } catch (error) {
      toast.error("Tạo Workspace thất bại");
    }
  },

  addMember: async (workspaceId, email, permissions) => {
    try {
      await workspaceService.addMember(workspaceId, email, permissions);
      toast.success(`Đã thêm ${email} vào nhóm`);
      // Reload lại detail
      get().fetchWorkspaceDetail(workspaceId);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Thêm thành viên thất bại");
    }
  },

  removeMember: async (workspaceId, targetUserId) => {
    try {
      await workspaceService.removeMember(workspaceId, targetUserId);
      toast.success("Đã xoá thành viên");
      get().fetchWorkspaceDetail(workspaceId);
    } catch (error) {
      toast.error("Xoá thành viên thất bại");
    }
  },
  deleteWorkspace: async (id) => {
    try {
      await workspaceService.deleteWorkspace(id); 
      toast.success("Đã xóa Workspace");
      set((state) => ({ 
        workspaces: state.workspaces.filter((ws) => ws._id !== id) 
      }));
    } catch (error) {
      toast.error("Xóa Workspace thất bại");
    }
  },
  setUserPermission: async (workspaceId, targetUserId, permissions) => {
    try {
      await workspaceService.setUserPermission(workspaceId, targetUserId, permissions);
      toast.success(`Đã thay đổi quyền thành ${permissions}`);
      await get().fetchWorkspaceDetail(workspaceId);
    } catch(error) {
      toast.error(error.response?.data?.message || "Lỗi khi đổi quyền");
    }
  }
}));