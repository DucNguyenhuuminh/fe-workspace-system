import { create } from "zustand";
import { notiService, AppNotification } from "@/services/notiService";

interface NotiState {
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
  hasMore: boolean;
  page: number;

  fetchNotifications: (pageNumber?: number) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNoti: (id: string) => Promise<void>;
}

export const useNotiStore = create<NotiState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  hasMore: true,
  page: 1,

  // Lấy danh sách (Có hỗ trợ phân trang Load More)
  fetchNotifications: async (pageNumber = 1) => {
    set({ isLoading: true });
    try {
      const data = await notiService.getNotifications(pageNumber, 20);
      
      set((state) => ({
        // Nếu là trang 1 thì ghi đè, nếu trang > 1 thì nối mảng (cho tính năng cuộn)
        notifications: pageNumber === 1 
          ? data.notifications 
          : [...state.notifications, ...data.notifications],
        unreadCount: data.unreadCount,
        hasMore: pageNumber < data.pagination.totalPages,
        page: pageNumber,
      }));
    } catch (error) {
      console.error("Lỗi lấy thông báo:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  // Đánh dấu 1 cái là đã đọc
  markAsRead: async (id) => {
    // Cập nhật UI ngay lập tức cho mượt (Optimistic Update)
    set((state) => ({
      notifications: state.notifications.map((n) => 
        n._id === id ? { ...n, isRead: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));

    try {
      await notiService.markAsRead(id);
    } catch (error) {
      // Nếu API lỗi, lấy lại dữ liệu từ server
      get().fetchNotifications(1);
    }
  },

  // Đánh dấu tất cả đã đọc
  markAllAsRead: async () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    }));
    try {
      await notiService.markAllAsRead();
    } catch (error) {
      get().fetchNotifications(1);
    }
  },

  // Xoá thông báo
  deleteNoti: async (id) => {
    const notiToDelete = get().notifications.find(n => n._id === id);
    
    set((state) => ({
      notifications: state.notifications.filter((n) => n._id !== id),
      unreadCount: notiToDelete && !notiToDelete.isRead 
        ? Math.max(0, state.unreadCount - 1) 
        : state.unreadCount,
    }));

    try {
      await notiService.deleteNotification(id);
    } catch (error) {
      get().fetchNotifications(1);
    }
  }
}));