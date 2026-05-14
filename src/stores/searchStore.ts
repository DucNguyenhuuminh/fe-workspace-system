import { create } from 'zustand';
import { searchService, SearchHit, SearchResponse } from '@/services/searchService';
import { toast } from 'sonner';

interface SearchState {
  query: string;
  results: SearchHit[];
  total: number;
  isLoading: boolean;
  isOpen: boolean;
  error: string | null;

  setQuery: (q: string) => void;
  setIsOpen: (isOpen: boolean) => void;
  executeSearch: (q: string, workspaceId?: string | null) => Promise<void>;
  clearSearch: () => void;
  setError: (error: string | null) => void;
}

export const useSearchStore = create<SearchState>((set, get) => ({
  query: "",
  results: [],
  total: 0,
  isLoading: false,
  isOpen: false,
  error: null,

  setQuery: (q) => set({ 
    query: q, 
    isOpen: q.trim().length > 0,
    error: null
  }),

  setIsOpen: (isOpen) => set({ isOpen }),

  setError: (error) => set({ error }),

  executeSearch: async (q, workspaceId = null) => {
    const trimmedQ = q?.trim();
    if (!trimmedQ) {
      set({ results: [], total: 0, isLoading: false, error: null });
      return;
    }

    set({ isLoading: true, error: null });
    
    try {
      const data: SearchResponse = await searchService.searchDocuments(trimmedQ, workspaceId);
      set({ 
        results: data.results || [], 
        total: data.total || 0,
        query: data.query
      });
    } catch (error: any) {
      console.error("Search error:", error);
      toast.error(error.response?.data?.message || "Lỗi khi tìm kiếm tài liệu");
      set({ 
        results: [], 
        total: 0, 
        error: error.message || 'Lỗi tìm kiếm không xác định' 
      });
    } finally {
      set({ isLoading: false });
    }
  },

  clearSearch: () => set({ 
    query: "", 
    results: [], 
    total: 0, 
    isOpen: false,
    error: null 
  })
}));