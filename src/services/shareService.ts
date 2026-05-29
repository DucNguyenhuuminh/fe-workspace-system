import api from "@/api/axiosInstance";
import { triggerNotiRefresh } from "@/utils/triggerNoti";

export const shareService = {
  createShareLink: async (fileId: string, payload: any) => {
    const res = await api.post(`/files/${fileId}/share`, payload);
    return res.data.data;
  },

  getShareLinks: async (fileId: string) => {
    const res = await api.get(`/files/${fileId}/share`);
    return res.data.data;
  },

  revokeShareLink: async (fileId: string, token: string) => {
    const res = await api.delete(`/files/${fileId}/share/${token}`);
    return res.data;
  },

  getSharedFile: async (token: string) => {
    const res = await api.get(`/files/share/${token}`);
    return res.data.data;
  },

  verifyPassword: async (token: string, password: string) => {
    const res = await api.post(`/files/share/${token}/verify`, { password });
    return res.data;
  },

  accessSharedFile: async (token: string, action: 'view' | 'download', password?: string) => {
    const res = await api.post(`/files/share/${token}/access`, { action, password });
    triggerNotiRefresh();
    return res.data.data;
  },

  saveToMySpace: async (token: string, password?: string, folderId?: string | null) => {
    const res = await api.post(`/files/share/${token}/save`, { password, folderId });
    triggerNotiRefresh();
    return res.data.data;
  }
};