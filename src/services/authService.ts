import api from "@/api/axiosInstance";
import type { AuthResponse, User } from "@/types";

export const authService = {
  register: async (data: any): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>("/auth/register", data);
    return res.data;
  },

  login: async (credentials: any): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>("/auth/login", credentials);
    return res.data; 
  },

  getProfile: async (): Promise<{user: User}> => {
    const res = await api.get<{user: User}>("/auth/profile");
    return res.data;
  }
};