import { useState } from 'react';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/authStore';
// Giả định bạn có các hàm này trong authService, nếu chưa có hãy thêm vào nhé
import { authService } from '@/services/authService'; 

export const useSettings = () => {
  const { fetchProfile } = useAuthStore();
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Xử lý cập nhật Profile (Tên, ...)
  const updateProfile = async (data: { username: string }) => {
    setIsUpdatingProfile(true);
    try {
      // Gọi API cập nhật
      // await authService.updateProfile(data); 
      
      // Sau khi cập nhật thành công ở DB, gọi lại hàm fetchProfile để đồng bộ state FE
      await fetchProfile(); 
      toast.success("Information updated successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Update failure information");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Xử lý đổi mật khẩu
  const changePassword = async (data: { currentPassword: string; newPassword: string }) => {
    setIsChangingPassword(true);
    try {
      // Gọi API đổi mật khẩu
      // await authService.changePassword(data);
      toast.success("Password changed successfully");
      return true; // Trả về true để component biết mà reset form
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Password change failed");
      return false;
    } finally {
      setIsChangingPassword(false);
    }
  };

  return {
    isUpdatingProfile,
    isChangingPassword,
    updateProfile,
    changePassword
  };
};