import axios from "axios";
import { useAuthStore } from "@/stores/authStore"; 
import { toast } from "sonner";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      const currentPath = window.location.pathname;
      if (currentPath !== "/login" && currentPath !== "/register") {
        
        toast.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!");

        useAuthStore.getState().logout();

        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;