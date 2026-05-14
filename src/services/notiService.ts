import api from "@/api/axiosInstance";

// Định nghĩa Interface dựa trên noti.model.js của bạn
export interface AppNotification {
  _id: string;
  userId: string;
  actorId?: string | null;
  type: string;
  title: string;
  message: string;
  actionUrl?: string | null;
  metadata?: any;
  isRead: boolean;
  createdAt: string;
}

export interface GetNotiResponse {
  notifications: AppNotification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  unreadCount: number;
}

export const notiService = {
  getNotifications: async (page = 1, limit = 20, unreadOnly = false): Promise<GetNotiResponse> => {
    const res = await api.get("/notifications", { 
      params: { page, limit, unreadOnly } 
    });
    return res.data.data;
  },

  markAsRead: async (id: string) => {
    const res = await api.patch(`/notifications/${id}/read`);
    return res.data;
  },

  markAllAsRead: async () => {
    const res = await api.patch("/notifications/read-all");
    return res.data;
  },

  deleteNotification: async (id: string) => {
    const res = await api.delete(`/notifications/${id}`);
    return res.data;
  }
};