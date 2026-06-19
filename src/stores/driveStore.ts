import { create } from 'zustand';
import { folderService } from '@/services/folderService';
import { fileService } from '@/services/fileService';
import type { Folder, Document } from '@/types';
import { toast } from 'sonner';

interface DriveState {
  folders: Folder[];
  documents: Document[];
  currentFolderInfo: Folder | null;
  breadcrumbs: { _id: string; name: string; parentId: string | null }[];
  isLoading: boolean;

  fetchRootItems: (workspaceId: string | null) => Promise<void>;
  fetchFolderContents: (folderId: string) => Promise<void>;
  createNewFolder: (name: string, workspaceId?: string | null, parentId?: string | null) => Promise<void>;
  renameFolderItem: (folderId: string, newName: string) => Promise<void>;
  deleteFolderItem: (folderId: string) => Promise<void>;
  moveFolderItem: (folderId: string, newParentId: string | null, targetWorkspaceId: string | null) => Promise<void>;
  renameDocumentItem: (documentId: string, newName: string) => Promise<void>;
  deleteDocumentItem: (documentId: string) => Promise<void>;
  downloadDocument: (documentId: string, fileName: string) => Promise<void>;
  moveDocumentItem: (documentId: string, targetFolderId: string | null) => Promise<void>;
  viewDocument: (documentId: string) => Promise<void>;
}

export const useDriveStore = create<DriveState>((set, get) => ({
  folders: [],
  documents: [],
  currentFolderInfo: null,
  breadcrumbs: [],
  isLoading: false,

  fetchRootItems: async (workspaceId: string | null = null) => {
    set({ isLoading: true });
    try {
      const [foldersRes, documentsData] = await Promise.all([
        folderService.getFolders(null, workspaceId || undefined),
        fileService.getFiles({ workspaceId: workspaceId || undefined })
      ]);

      set({ 
        folders: foldersRes.data.data || [], 
        documents: documentsData || [],
        
        currentFolderInfo: null,
        breadcrumbs: [] 
      });
    } catch (error) {
      console.error("Error fetching Root items:", error);
      toast.error("Unable to load data");
    } finally {
      set({ isLoading: false });
    }
  },

  fetchFolderContents: async (folderId: string) => {
    set({ isLoading: true });
    try {
      const data = await folderService.getFolderContents(folderId);
      
      set({
        currentFolderInfo: data.folderInfo,
        breadcrumbs: data.breadcrumb,
        folders: data.folders,     
        documents: data.documents  
      });
    } catch (error) {
      toast.error("Unable to load folder contents");
    } finally {
      set({ isLoading: false });
    }
  },

  createNewFolder: async (name: string, workspaceId: string | null = null, parentId: string | null = null) => {
    try {
      await folderService.createFolder(name, workspaceId, parentId);
      toast.success("Folder created successfully");
      
      const { currentFolderInfo } = get();
      
      if (currentFolderInfo) {
        get().fetchFolderContents(currentFolderInfo._id); 
      } else {
        get().fetchRootItems(workspaceId);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Folder creation failed");
    }
  },

  renameFolderItem: async (folderId, newName) => {
    try {
      await folderService.renameFolder(folderId, newName);
      toast.success("Folder renaming successful");
      set((state) => ({
        folders: state.folders.map((f) => 
          f._id === folderId ? { ...f, name: newName } : f
        )
      }));
    } catch (error) {
      toast.error("Folder renaming failed");
    }
  },

  deleteFolderItem: async (folderId) => {
    try {
      await folderService.deleteFolder(folderId);
      toast.success("The folder has been moved to Trash");
      set((state) => ({
        folders: state.folders.filter((f) => f._id !== folderId)
      }));
    } catch (error) {
      toast.error("Folder deletion failed");
    }
  },

  moveFolderItem: async (folderId, newParentId, targetWorkspaceId) => {
    try {
      await folderService.moveFolder(folderId, newParentId, targetWorkspaceId);
      set((state) => ({
        folders: state.folders.filter((f) => f._id !== folderId)
      }));
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Folder move failed");
      throw error;
    }
  },

  renameDocumentItem: async (documentId, newName) => {
    try {
      await fileService.renameFile(documentId, newName);
      toast.success("File renaming successful");
      set((state) => ({
        documents: state.documents.map((d) => 
          d._id === documentId ? { ...d, originalName: newName } : d
        )
      }));
    } catch (error) {
      toast.error("File renaming failed");
    }
  },

  deleteDocumentItem: async (documentId) => {
    try {
      await fileService.deleteFile(documentId);
      toast.success("The file has been moved to Trash");
      set((state) => ({
        documents: state.documents.filter((d) => d._id !== documentId)
      }));
    } catch (error) {
      toast.error("File deletion failed");
    }
  },

  moveDocumentItem: async (documentId, targetFolderId) => {
    try {
      await fileService.moveFile(documentId, targetFolderId);
      set((state) => ({
        documents: state.documents.filter((d) => d._id !== documentId)
      }));
    } catch (error: any) {
      toast.error(error.response?.data?.message || "File transfer failed");
      throw error;
    }
  },

  downloadDocument: async (documentId: string, fileName: string) => {
    try {
      toast.info("Getting the download link...");
      const fileUrl = await fileService.getFileLink(documentId, "download"); 
    
      if (fileUrl) {
        const a = document.createElement("a");
        a.href = fileUrl;
        a.download = fileName; 
    
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        toast.error("No download link found");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error when retrieving download link");
    }
  },

  viewDocument: async (documentId: string) => {
    try {
      toast.info("Opening a file...");
      const fileUrl = await fileService.getFileLink(documentId, 'view');
      if (fileUrl) {
        window.open(fileUrl, '_blank');
      }else {
        toast.error("File path not found");
      }
    } catch(err) {
      toast.error(err.response?.data?.message || "Error when opening file");
    }
  }
}));