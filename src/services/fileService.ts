import api from "@/api/axiosInstance";
import type { Document } from "@/types";
import { triggerNotiRefresh } from "@/utils/triggerNoti";

export const fileService = {
  getFiles: async (params?: { workspaceId?: string | null; folderId?: string | null }): Promise<Document[]> => {
    const res = await api.get("/files", { params });
    return res.data.data || [];
  },

  get: async (id: string): Promise<Document> => {
    const res = await api.get(`/files/${id}`);
    return res.data.data;
  },

  renameFile: async (id: string, name: string): Promise<Document> => {
    const res = await api.put(`/files/${id}/rename`, { name });
    return res.data.data;
  },

  deleteFile: async (id: string): Promise<void> => {
    await api.delete(`/files/${id}`);
  },

  restoreFile: async (id: string): Promise<Document> => {
    const res = await api.put(`/files/${id}/restore`);
    triggerNotiRefresh();
    return res.data.data;
  },

  getFileLink: async (fileId: string, action: 'view' | 'download') => {
    const res = await api.get(`/files/${fileId}/link`, { params: { action } });
    return res.data.data.url;
  },

  moveFile: async (id: string, targetFolderId: string | null) => {
    const folderPath = targetFolderId === null ? "null" : targetFolderId;
    const res = await api.put(`/files/${id}/move/${folderPath}`);
    return res.data.data.file;
  }
};