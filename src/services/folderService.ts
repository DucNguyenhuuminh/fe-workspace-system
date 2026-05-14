import api from "@/api/axiosInstance";
import type { ItemsResponse, Folder, FolderDetailResponse } from "@/types";
import { triggerNotiRefresh } from "@/utils/triggerNoti";

export const folderService = {
  getFolders: (parentId: string | null, workspaceId?: string) => {
        return api.get('/folders', { 
            params: { 
                parentId: parentId || undefined, 
                workspaceId: workspaceId || undefined
            } 
        });
    },

  getFolderContents: async (folderId: string): Promise<FolderDetailResponse> => {
    const res = await api.get(`/folders/${folderId}`);
    const data = res.data.data; 

    return {
      folderInfo: data.folderInfo,
      folders: data.folders,
      documents: data.files,
      breadcrumb: data.breadcrumb
    };
  },

  createFolder: async (name: string, workspaceId: string | null = null, parentId: string | null = null): Promise<Folder> => {
    const res = await api.post("/folders", { name, workspaceId, parentId });
    return res.data.data; 
  },

  renameFolder: async (folderId: string, name: string): Promise<Folder> => {
    const res = await api.put(`/folders/${folderId}/rename`, { name }); 
    return res.data.data;
  },

  deleteFolder: async (folderId: string): Promise<void> => {
    await api.delete(`/folders/${folderId}`);
  },

  restoreFolder: async (folderId: string): Promise<Folder> => {
    const res = await api.put(`/folders/${folderId}/restore`);
    triggerNotiRefresh();
    return res.data.data;
  },

  moveFolder: async (folderId: string, newParentId: string | null, targetWorkspaceId: string | null): Promise<Folder> => {
    const res = await api.put(`/folders/${folderId}/move`, { newParentId, targetWorkspaceId });
    return res.data.data;
  }
};