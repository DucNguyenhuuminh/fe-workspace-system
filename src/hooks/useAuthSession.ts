import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';

export const useAuthSession = () => {
  const { isAuthenticated, isLoading, fetchProfile } = useAuthStore();

  useEffect(() => {
    // Fetch profile on mount to restore session from token
    if (!isLoading) {
      fetchProfile();
    }
  }, []);

  return {
    isAuthenticated,
    isLoading
  };
};
