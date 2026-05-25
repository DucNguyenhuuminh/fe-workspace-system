import api from "@/api/axiosInstance";

export const adminService = {
  getStats: async () => {
    const res = await api.get('/admin/stats');
    return res.data.data;
  },
  
  getUsers: async (params?: any) => {
    const res = await api.get('/admin/users', { params });
    return res.data.data;
  },

  banUser: async (id: string) => {
    const res = await api.patch(`/admin/users/${id}/ban`);
    return res.data;
  },

  getWorkspaces: async (params?: any) => {
    const res = await api.get('/admin/workspaces', { params });
    return res.data.data;
  },

  getFiles: async (params?: any) => {
    const res = await api.get('/admin/files', { params });
    return res.data.data;
  }
};