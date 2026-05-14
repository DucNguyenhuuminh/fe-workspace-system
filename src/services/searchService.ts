import api from "@/api/axiosInstance";

export interface SearchHit {
  documentId: string;
  score: number;
  preview: string;
  metadata: any;
  document?: any;
}

export interface SearchResponse {
  query: string;
  total: number;
  results: SearchHit[];
}

export const searchService = {
  searchDocuments: async (q: string, workspaceId?: string | null): Promise<SearchResponse> => {
    const params: any = { q };
    if (workspaceId) {
      params.workspaceId = workspaceId;
    }
    try {
      const res = await api.get<{message: string; data: SearchResponse}>("/search",{params});
      return res.data.data;
    } catch(error: any) {
      if (error.response?.status === 400) {
        throw new Error('Vui lòng nhập từ khóa tìm kiếm');
      }
      if (error.response?.status === 403) {
        throw new Error('Bạn không có quyền truy cập workspace này');
      }
      throw new Error('Lỗi tìm kiếm, vui lòng thử lại');
    }
  }
};