import { useEffect } from 'react';
import { useWorkspaceStore } from '@/stores/workspaceStore';

export const useWorkspaceData = () => {
  const { workspaces, isLoading, fetchWorkspaces, createWorkspace, deleteWorkspace} = useWorkspaceStore();

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  return { workspaces, isLoading, createWorkspace, deleteWorkspace };
};