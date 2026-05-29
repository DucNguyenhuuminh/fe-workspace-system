import api from "@/api/axiosInstance";
import { triggerNotiRefresh } from "@/utils/triggerNoti";

export const workspaceInviteService = {
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
    triggerNotiRefresh();
    return res.data.data;
  },

  getInviteInfo: async (token: string) => {
    const res = await api.get(`/workspaces/invite/${token}`);
    return res.data.data;
  },

  joinWorkspace: async (token: string, message?: string) => {
    const res = await api.post(`/workspaces/invite/${token}/join`, { message });
    triggerNotiRefresh();
    return res.data.data;
  }
};