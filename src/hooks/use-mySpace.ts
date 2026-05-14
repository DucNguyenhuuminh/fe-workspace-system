import { useEffect, useMemo } from 'react';
import { useDriveStore } from '@/stores/driveStore';
import { mergeItems } from '@/utils/fileUtils';

export const useMySpace = () => {
  // 1. Destructuring: Lấy tất cả những gì cần thiết từ store ra để code gọn và không bị lỗi "undefined"
  const {
    folders,
    documents,
    isLoading,
    currentFolderInfo,
    fetchRootItems,
    fetchFolderContents,
    createNewFolder,
    renameFolderItem,
    renameDocumentItem,
    deleteFolderItem,
    deleteDocumentItem,
    downloadDocument,
  } = useDriveStore();

  useEffect(() => {
    fetchRootItems(null); 
  }, [fetchRootItems]);

  const allItems = useMemo(
    () => mergeItems(folders, documents),
    [folders, documents]
  );

  const createFolder = (name: string) => {
    createNewFolder(name, null, currentFolderInfo?._id || null);
  };

  const handleBack = () => {
    if (currentFolderInfo?.parentId) {
      fetchFolderContents(currentFolderInfo.parentId);
    } else {
      fetchRootItems(null);
    }
  };

  return {
    allItems,
    currentFolderInfo,
    isLoading,
    createFolder,
    handleBack,
    fetchFolderContents,
    renameFolderItem,
    renameDocumentItem,
    deleteFolderItem,
    deleteDocumentItem,
    downloadDocument
  };
};