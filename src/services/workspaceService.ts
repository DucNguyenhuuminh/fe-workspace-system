import api from "@/api/axiosInstance";
import type { Workspace, WorkspaceDetailResponse, Folder, Document } from "@/types";
import { triggerNotiRefresh } from "@/utils/triggerNoti";

export const workspaceService = {
  getAll: async (): Promise<Workspace[]> => {
    const res = await api.get("/workspaces");
    return res.data.data;
  },

  getDetail: async (workspaceId: string): Promise<Workspace> => {
    const res = await api.get(`/workspaces/${workspaceId}`);
    return res.data.data; 
  },

  create: async (name: string): Promise<Workspace> => {
    const res = await api.post("/workspaces", { name });
    triggerNotiRefresh();
    return res.data.data;
  },

  addMember: async (workspaceId: string, email: string, permissions: "viewer" | "editor") => {
    const res = await api.post(`/workspaces/${workspaceId}/members`, { email, permissions });
    triggerNotiRefresh();
    return res.data.data;
  },

  removeMember: async (workspaceId: string, targetUserId: string): Promise<void> => {
    await api.delete(`/workspaces/${workspaceId}/members/${targetUserId}`);
    triggerNotiRefresh();
  },

  deleteWorkspace: async (workspaceId: string): Promise<void> => {
    await api.delete(`/workspaces/${workspaceId}`);
    triggerNotiRefresh();
  },

  setUserPermission: async (workspaceId: string, targetUserId: string, permissions: "viewer" | "editor"): Promise<void> => {
    await api.put(`/workspaces/${workspaceId}/members/${targetUserId}/permission`,{permissions:permissions});
    triggerNotiRefresh();
  },

  getWorkspaceTrashedItems: async (workspaceId?: string | null) => {
    const params: any = {};
    if (workspaceId) params.workspaceId = workspaceId;

    const [foldersRes, filesRes] = await Promise.all([
      api.get("/folders/trash", { params }),
      api.get("/files/trash", { params })
    ]);

    return {
      folders: foldersRes.data.data || [],
      documents: filesRes.data.data || []
    };
  },
};