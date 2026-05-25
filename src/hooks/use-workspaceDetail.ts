import { useEffect, useMemo } from 'react';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { useDriveStore } from '@/stores/driveStore';
import { useTrashStore } from '@/stores/trashStore';
import { mergeItems } from '@/utils/fileUtils';

export const useWorkspaceDetail = (workspaceId: string | undefined) => {
  const { 
    currentWorkspace, 
    fetchWorkspaceDetail,
    addMember, 
    removeMember,
    setUserPermission,
    deleteWorkspace,
    isLoading: isWsLoading 
  } = useWorkspaceStore();

  const { 
    folders, 
    documents,
    currentFolderInfo,   
    fetchRootItems, 
    fetchFolderContents, 
    createNewFolder,
    renameFolderItem,
    deleteFolderItem,
    renameDocumentItem,
    deleteDocumentItem,
    downloadDocument,
    moveFolderItem,
    moveDocumentItem,
    viewDocument,
    isLoading: isDriveLoading 
  } = useDriveStore();

  const {
    trashedFolders,
    trashedDocuments,
    fetchTrash,
    forceDeleteItem,
    emptyAllTrash,
    restoreItem,
    isLoading: isTrashLoading
  } = useTrashStore();

  useEffect(() => {
    if (workspaceId) {
      fetchWorkspaceDetail(workspaceId);
      fetchRootItems(workspaceId); 
    }
  }, [workspaceId, fetchWorkspaceDetail, fetchRootItems]);

  const allItems = useMemo(
    () => mergeItems(folders, documents),
    [folders, documents]
  );

  const trashedItems = useMemo(
    () => mergeItems(trashedFolders, trashedDocuments),
    [trashedFolders, trashedDocuments]
  );

  const handleBack = () => {
    if (currentFolderInfo?.parentId) {
      fetchFolderContents(currentFolderInfo.parentId);
    } else {
      fetchRootItems(workspaceId || null);
    }
  };

  const handleCreateFolder = (name: string) => {
    createNewFolder(name, workspaceId || null, currentFolderInfo?._id || null);
  };

  const handleFetchTrash = () => {
    if (workspaceId) {
      fetchTrash(workspaceId);
    }
  };

  const handleEmptyTrash = async () => {
    if (window.confirm("CẢNH BÁO: Hành động này sẽ xóa vĩnh viễn toàn bộ dữ liệu trong thùng rác và không thể khôi phục. Bạn có chắc chắn?")) {
      await emptyAllTrash();
    }
  };

  const handleForceDelete = (id: string, kind: "folder" | "document") => {
    if (window.confirm("Bạn có chắc muốn xóa vĩnh viễn mục này?")) {
      forceDeleteItem(id, kind);
    }
  };

  const handleRestore = async (id: string , kind: "folder" | "document") => {
    await restoreItem(id, kind);

    if (currentFolderInfo?._id) {
      fetchFolderContents(currentFolderInfo._id);
    }else {
      fetchRootItems(workspaceId || null);
    }
  }

  return {
    currentWorkspace,
    currentFolderInfo, 
    allItems,
    trashedItems,
    isLoading: isWsLoading || isDriveLoading || isTrashLoading,
    
    handleBack,          
    fetchFolderContents, 
    fetchTrash: handleFetchTrash,
    emptyAllTrash:handleEmptyTrash,
    forceDeleteItem: handleForceDelete,
    restoreItem: handleRestore,
    
    createNewFolder: handleCreateFolder, 
    renameFolderItem,
    deleteFolderItem,
    renameDocumentItem,
    deleteDocumentItem,
    downloadDocument,
    moveFolderItem,
    moveDocumentItem,
    viewDocument,

    addMember,
    removeMember,
    setUserPermission,
    deleteWorkspace,
  };
};