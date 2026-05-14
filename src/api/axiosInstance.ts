import axios from "axios";
import { useAuthStore } from "@/stores/authStore"; // Import store của bạn
import { toast } from "sonner";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`; // Backend của bạn dùng Bearer token
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    // Nếu API thành công (Status 2xx), cho đi tiếp bình thường
    return response;
  },
  (error) => {
    // Nếu API lỗi và trả về mã 401 Unauthorized
    if (error.response && error.response.status === 401) {
      // Bỏ qua nếu đang ở sẵn trang login/register để tránh vòng lặp vô hạn
      const currentPath = window.location.pathname;
      if (currentPath !== "/login" && currentPath !== "/register") {
        
        // Hiện thông báo cho người dùng
        toast.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!");

        // Xóa token và cập nhật state thông qua Zustand (getState dùng khi nằm ngoài React Component)
        useAuthStore.getState().logout();

        // Ép trình duyệt chuyển hướng về trang Login
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;