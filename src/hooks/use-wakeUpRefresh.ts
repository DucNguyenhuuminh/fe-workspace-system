import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { useDriveStore } from '@/stores/driveStore';

export const useWakeUpRefresh = () => {
  const { isAuthenticated, fetchProfile } = useAuthStore();
  const { fetchWorkspaces } = useWorkspaceStore();
  const { currentFolderInfo, fetchRootItems, fetchFolderContents } = useDriveStore();

  useEffect(() => {
    const handleWakeUp = () => {
      // Chỉ chạy nếu tab đang hiển thị và người dùng đã đăng nhập
      if (document.visibilityState === 'visible' && isAuthenticated) {
        console.log("The screen has woken up! Refreshing data...");
        
        // 1. Cập nhật lại thông tin user (đề phòng bị đổi quyền hoặc xóa tài khoản)
        fetchProfile();

        // 2. Cập nhật lại danh sách Workspace
        fetchWorkspaces();

        // 3. Cập nhật lại danh sách File/Folder đang xem
        if (currentFolderInfo?._id) {
          fetchFolderContents(currentFolderInfo._id);
        } else {
          // Lấy lại Root items, cần check URL để biết đang ở MySpace hay Workspace
          const workspaceMatch = window.location.pathname.match(/\/workspaces\/([a-zA-Z0-9_-]+)/);
          const currentWorkspaceId = workspaceMatch ? workspaceMatch[1] : null;
          fetchRootItems(currentWorkspaceId);
        }
      }
    };

    // Bắt sự kiện khi Tab thay đổi trạng thái ẩn/hiện (khóa/mở màn hình)
    document.addEventListener('visibilitychange', handleWakeUp);
    // Bắt thêm sự kiện khi click/focus lại vào cửa sổ trình duyệt
    window.addEventListener('focus', handleWakeUp);

    return () => {
      document.removeEventListener('visibilitychange', handleWakeUp);
      window.removeEventListener('focus', handleWakeUp);
    };
  }, [isAuthenticated, fetchProfile, fetchWorkspaces, currentFolderInfo, fetchRootItems, fetchFolderContents]);
};