import { create } from 'zustand';
import { trashService } from '@/services/trashService';
import { toast } from 'sonner';
import type { Folder, Document } from '@/types';

interface TrashState {
  trashedFolders: Folder[];
  trashedDocuments: Document[];
  isLoading: boolean;

  fetchTrash: (workspaceId?: string | null) => Promise<void>;
  forceDeleteItem: (id: string, kind: "folder" | "document") => Promise<void>;
  emptyAllTrash: () => Promise<void>;
  restoreItem: (id: string, kind: "folder" | "document") => Promise<void>;
}

export const useTrashStore = create<TrashState>((set, get) => ({
  trashedFolders: [],
  trashedDocuments: [],
  isLoading: false,

  fetchTrash: async (workspaceId = null) => {
    set({ isLoading: true });
    try {
      const data = await trashService.getTrashedItems(workspaceId);
      set({ trashedFolders: data.folders, trashedDocuments: data.documents });
    } catch (error) {
      toast.error("Unable to load Trash data");
    } finally {
      set({ isLoading: false });
    }
  },

  forceDeleteItem: async (id, kind) => {
    try {
      await trashService.forceDelete(id, kind);
      toast.success("Permanently deleted");
      
      if (kind === "folder") {
        set((state) => ({ trashedFolders: state.trashedFolders.filter(f => f._id !== id) }));
      } else {
        set((state) => ({ trashedDocuments: state.trashedDocuments.filter(d => d._id !== id) }));
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Permanently delete the failure");
    }
  },

  emptyAllTrash: async () => {
    set({ isLoading: true });
    try {
      await trashService.emptyTrash();
      toast.success("Trash cans have been emptied");
      set({ trashedFolders: [], trashedDocuments: [] });
    } catch (error) {
      toast.error("The attempt to empty Trash can failed");
    } finally {
      set({ isLoading: false });
    }
  },

  restoreItem: async (id, kind) => {
    try {
      await trashService.restoreItem(id, kind);
      toast.success("Restore successfully");

      if (kind === "folder") {
        set((state) => ({
          trashedFolders: state.trashedFolders.filter((f) => f._id !== id),
        }));
      } else {
        set((state) => ({
          trashedDocuments: state.trashedDocuments.filter((d) => d._id !== id),
        }));
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || "Restore failed";
      toast.error(msg);
    }
  },
}));