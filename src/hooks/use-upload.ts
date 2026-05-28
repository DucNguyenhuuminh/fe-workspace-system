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
  const [uploadingFile, setUploadingFile] = useState<File | null>(null);
  
  const { fetchRootItems, fetchFolderContents } = useDriveStore();

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setProgress(0);
    setUploadingFile(file);

    try {
      const doc = await uploadService.uploadFile(file, {
        workspaceId: context.workspaceId,
        folderId: context.folderId,
        onProgress: setProgress,
      });

      toast.success(`"${doc.originalName}" đã tải lên thành công!`);
      
      if (context.folderId) {
        await fetchFolderContents(context.folderId);
      } else {
        await fetchRootItems(context.workspaceId);
      }
      
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Tải lên thất bại, vui lòng thử lại");
      console.error(error);
    } finally {
      setTimeout(() => {
        setIsUploading(false);
        setProgress(0);
        setUploadingFile(null);
      }, 1000);
    }
  };

  return { uploadFile, progress, isUploading, uploadingFile };
};