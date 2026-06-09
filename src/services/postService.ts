import api from "@/api/axiosInstance";

export interface Post {
  _id: string;
  content: string;
  createdBy: any; // Có thể là string ID hoặc object User
  commentCount: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface PostComment {
  _id: string;
  content: string;
  createdBy: any;
  parentId: string | null;
  createdAt: string;
  replies: PostComment[];
}

export const postService = {
  // --- BÀI VIẾT ---
  getPosts: async (workspaceId: string, page = 1, limit = 20) => {
    const res = await api.get(`/workspaces/${workspaceId}/posts`, { params: { page, limit } });
    return res.data.data; // { posts, pagination }
  },
  createPost: async (workspaceId: string, content: string) => {
    const res = await api.post(`/workspaces/${workspaceId}/posts`, { content });
    return res.data.data;
  },
  updatePost: async (workspaceId: string, postId: string, content: string) => {
    const res = await api.put(`/workspaces/${workspaceId}/posts/${postId}`, { content });
    return res.data.data;
  },
  deletePost: async (workspaceId: string, postId: string) => {
    const res = await api.delete(`/workspaces/${workspaceId}/posts/${postId}`);
    return res.data;
  },

  // --- BÌNH LUẬN BÀI VIẾT ---
  getComments: async (workspaceId: string, postId: string) => {
    const res = await api.get(`/workspaces/${workspaceId}/posts/${postId}/comments`);
    return res.data.data; // { total, comments }
  },
  createComment: async (workspaceId: string, postId: string, content: string, parentId?: string) => {
    const res = await api.post(`/workspaces/${workspaceId}/posts/${postId}/comments`, { content, parentId });
    return res.data.data;
  },
  deleteComment: async (workspaceId: string, postId: string, commentId: string) => {
    const res = await api.delete(`/workspaces/${workspaceId}/posts/${postId}/comments/${commentId}`);
    return res.data;
  }
};