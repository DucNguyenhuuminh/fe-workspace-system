import { useEffect, useMemo } from 'react';
import { useDriveStore } from '@/stores/driveStore';
import { mergeItems } from '@/utils/fileUtils';

export const useMySpace = () => {
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
    moveFolderItem,
    moveDocumentItem,
    viewDocument,
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
    downloadDocument,
    moveFolderItem,
    moveDocumentItem,
    viewDocument
  };
};