import { useState } from "react";
import { uploadService } from "@/services/uploadService";
import { useDriveStore } from "@/stores/driveStore";
import { toast } from "sonner";

interface UploadContext {
  workspaceId?: string | null;
  folderId?: string | null;
}

export const useFileUpload = (context: UploadContext) => {
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  // THÊM STATE NÀY ĐỂ LƯU THÔNG TIN FILE ĐANG TẢI
  const [uploadingFile, setUploadingFile] = useState<File | null>(null);
  
  const { fetchRootItems, fetchFolderContents } = useDriveStore();

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setProgress(0);
    setUploadingFile(file); // Lưu file vào state

    try {
      const doc = await uploadService.uploadFile(file, {
        workspaceId: context.workspaceId,
        folderId: context.folderId,
        onProgress: setProgress,
      });

      toast.success(`"${doc.originalName}" đã tải lên thành công!`);
      
      // Reload UI sau khi upload xong
      if (context.folderId) {
        await fetchFolderContents(context.folderId);
      } else {
        await fetchRootItems(context.workspaceId);
      }
      
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Tải lên thất bại, vui lòng thử lại");
      console.error(error);
    } finally {
      // Đợi 1 giây rồi mới ẩn popup đi để người dùng kịp nhìn thấy 100%
      setTimeout(() => {
        setIsUploading(false);
        setProgress(0);
        setUploadingFile(null);
      }, 1000);
    }
  };

  // Trả thêm uploadingFile ra ngoài
  return { uploadFile, progress, isUploading, uploadingFile };
};