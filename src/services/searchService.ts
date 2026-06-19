import api from "@/api/axiosInstance";
import { StringToBoolean } from "class-variance-authority/types";

export interface SearchHit {
  documentId: string;
  originalName: string;
  score: number;
  workspaceId?: string;
  mimeType?: string;
  preview: string;
  metadata?: any;
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
        throw new Error('Please enter searching word');
      }
      if (error.response?.status === 403) {
        throw new Error('You have no permission to access this file');
      }
      throw new Error('Searching error, please try again');
    }
  }
};