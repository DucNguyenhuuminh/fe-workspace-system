import api from "@/api/axiosInstance";

export interface CommentUser {
  _id: string;
  username: string;
  email: string;
}

export interface CommentItem {
  _id: string;
  content: string;
  createdBy: CommentUser;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  replies: CommentItem[];
}

export const commentService = {
  getComments: async (fileId: string) => {
    const res = await api.get(`/files/${fileId}/comments`);
    return res.data.data;
  },

  createComment: async (fileId: string, content: string, parentId?: string) => {
    const res = await api.post(`/files/${fileId}/comments`, { content, parentId });
    return res.data;
  },

  updateComment: async (fileId: string, commentId: string, content: string) => {
    const res = await api.put(`/files/${fileId}/comments/${commentId}`, { content });
    return res.data;
  },

  deleteComment: async (fileId: string, commentId: string) => {
    const res = await api.delete(`/files/${fileId}/comments/${commentId}`);
    return res.data;
  },
};