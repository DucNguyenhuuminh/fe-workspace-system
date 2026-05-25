import api from "@/api/axiosInstance";

export const shareService = {
  // 1. Tạo link chia sẻ
  createShareLink: async (fileId: string, payload: any) => {
    const res = await api.post(`/files/${fileId}/share`, payload);
    return res.data.data;
  },

  // 2. Lấy danh sách các link đã tạo cho 1 file
  getShareLinks: async (fileId: string) => {
    const res = await api.get(`/files/${fileId}/share`);
    return res.data.data;
  },

  // 3. Thu hồi (Xóa) link chia sẻ
  revokeShareLink: async (fileId: string, token: string) => {
    const res = await api.delete(`/files/${fileId}/share/${token}`);
    return res.data;
  },

  // 4. Lấy thông tin file được chia sẻ (Dùng cho trang Public)
  getSharedFile: async (token: string) => {
    const res = await api.get(`/files/share/${token}`);
    return res.data.data;
  },

  // 5. Xác thực mật khẩu
  verifyPassword: async (token: string, password: string) => {
    const res = await api.post(`/files/share/${token}/verify`, { password });
    return res.data;
  },

  // 6. Lấy URL để View/Download (Nhớ đổi Backend thành POST nhé)
  accessSharedFile: async (token: string, action: 'view' | 'download', password?: string) => {
    const res = await api.post(`/files/share/${token}/access`, { action, password });
    return res.data.data;
  },

  // 7. Lưu file vào MySpace
  saveToMySpace: async (token: string, password?: string, folderId?: string | null) => {
    const res = await api.post(`/files/share/${token}/save`, { password, folderId });
    return res.data.data;
  }
};