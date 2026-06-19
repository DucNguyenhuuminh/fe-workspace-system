import { create } from 'zustand';
import { authService } from '@/services/authService';
import { useDriveStore } from '@/stores/driveStore';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import type { User } from '@/types';
import { toast } from 'sonner';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  login: (credentials: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  fetchProfile: () => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: !!localStorage.getItem('accessToken'),
  isLoading: false,

  login: async (credentials) => {
    set({ isLoading: true });
    try {
      const res = await authService.login(credentials);
      localStorage.setItem('accessToken', res.token);
      set({ user: res.user, isAuthenticated: true });
      toast.success(res.message || "Login successful!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Login failed!");
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (data) => {
    set({ isLoading: true });
    try {
      const res = await authService.register(data);
      toast.success(res.message || "Registration successful!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Registration failed!");
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchProfile: async () => {
    set({ isLoading: true });
    try {
      const res = await authService.getProfile();
      set({ user: res.user, isAuthenticated: true });
    } catch (error) {
      localStorage.removeItem('accessToken');
      set({ user: null, isAuthenticated: false });
    } finally {
      set({ isLoading: false });
    }
  },

  logout: () => {
    // 1. Xóa toàn bộ token lưu ở ổ cứng
    localStorage.removeItem('accessToken');
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user-storage");
    
    // 2. Set state tạm thời để UI không bị văng lỗi trước khi reload
    set({ user: null, isAuthenticated: false });
    toast.info("Logged out");

    // 3. Ép trình duyệt tải lại và điều hướng về trang đăng nhập
    // Dùng setTimeout nhỏ để User kịp nhìn thấy Toast thông báo "Đã đăng xuất"
    setTimeout(() => {
      window.location.href = "/login";
    }, 500);
  }
}));