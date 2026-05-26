import api from "@/api/axiosInstance";

export const workspaceInviteService = {
  // --- DÀNH CHO ADMIN ---
  createInviteLink: async (workspaceId: string, payload: { expiresInHours?: string | null, autoApprove: boolean }) => {
    const res = await api.post(`/workspaces/${workspaceId}/invite`, payload);
    return res.data.data;
  },
  getInviteLinks: async (workspaceId: string) => {
    const res = await api.get(`/workspaces/${workspaceId}/invites`);
    return res.data.data;
  },
  revokeInviteLink: async (workspaceId: string, token: string) => {
    const res = await api.delete(`/workspaces/${workspaceId}/invite/${token}`);
    return res.data;
  },
  getJoinRequests: async (workspaceId: string) => {
    const res = await api.get(`/workspaces/${workspaceId}/requests`);
    return res.data.data;
  },
  reviewRequest: async (workspaceId: string, requestId: string, action: 'approve' | 'reject') => {
    const res = await api.patch(`/workspaces/${workspaceId}/requests/${requestId}`, { action });
    return res.data;
  },
  approveAllRequests: async (workspaceId: string) => {
    const res = await api.patch(`/workspaces/${workspaceId}/requests/approved-all`);
    return res.data.data;
  },

  // --- DÀNH CHO NGƯỜI ĐƯỢC MỜI (GUEST) ---
  getInviteInfo: async (token: string) => {
    const res = await api.get(`/workspaces/invite/${token}`);
    return res.data.data;
  },
  joinWorkspace: async (token: string, message?: string) => {
    const res = await api.post(`/workspaces/invite/${token}/join`, { message });
    return res.data.data; // Trả về { status: 'approved' | 'pending', workspaceId, ... }
  }
};