import api from "@/api/axiosInstance";
import { hashFile } from "@/utils/hashFile";
import type { Document } from "@/types";
import type {
  HashCheckRequest,
  HashCheckResponse,
  InitUploadRequest,
  InitUploadResponse,
  MergeUploadRequest,
  MergeUploadResponse,
  UploadProgressCallback
  // ETagPart
} from "@/types/upload.types";
import { triggerNotiRefresh } from "@/utils/triggerNoti"; 

const CHUNK_SIZE = 5 * 1024 * 1024; 

export const uploadService = {
  uploadFile: async (
    file: File,
    options: {
      workspaceId?: string | null;
      folderId?: string | null;
      onProgress?: UploadProgressCallback;
    } = {}
  ): Promise<Document> => {
    const workspaceId = options.workspaceId || null;
    const folderId = options.folderId || null;
    const onProgress = options.onProgress;
    
    onProgress?.(0);

    const hashString = await hashFile(file);

    const hashPayload: HashCheckRequest = {
      filename: file.name,
      hashString,
      workspaceId,
      folderId,
    };

    let isDuplicate = false;
    let existingDoc: Document | undefined = undefined;

    try {
      const hashRes = await api.post<HashCheckResponse>("/files-worker/hash", hashPayload);
      if (hashRes.data.data.isDuplicate && hashRes.data.data.document) {
        isDuplicate = true;
        existingDoc = hashRes.data.data.document;
      }
    } catch (error: any) {
      throw error;
    }

    if (isDuplicate && existingDoc) {
      onProgress?.(100);
      triggerNotiRefresh(); 
      return existingDoc;
    }

    onProgress?.(5);

    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    const mimeType = file.type || "application/octet-stream"; 

    const initPayload: InitUploadRequest = {
      filename: file.name,
      totalChunks,
      mimeType,
      sizeBytes: file.size,
      workspaceId,
      folderId,
    };

    const initRes = await api.post<InitUploadResponse>("/files-worker/init", initPayload);
    const { uploadId, objectName, minioObjectPath, presignedUrls } = initRes.data.data;

    const uploadChunk = async (chunkIndex: number): Promise<void> => {
      const start = chunkIndex * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, file.size);
      const chunk = file.slice(start, end);

      const res = await fetch(presignedUrls[chunkIndex], {
        method: "PUT",
        body: chunk,
        headers: { "Content-Type": mimeType },
      });

      if (!res.ok) throw new Error(`Chunk ${chunkIndex + 1} upload failed`);

      // let etag = res.headers.get("ETag");
      
      // if (!etag) {
      //   try {
      //     etag = res.headers.get("etag");
      //   } catch(err) {
      //     console.warn(`Không đọc được ETag ở chunk ${chunkIndex + 1}. Hãy kiểm tra cấu hình CORS của MinIO!: ${err}`);
      //   }
      //   return "";
      // }
      // return etag;
    };

    for (let i = 0; i < totalChunks; i++) {
      // const etagString = await uploadChunk(i);
      
      // etags.push({
      //   partNumber: i + 1,
      //   etag: etagString
      // });

      // const uploadProgress = 5 + Math.round(((i + 1) / totalChunks) * 85);
      // onProgress?.(uploadProgress);
      await uploadChunk(i);
      const uploadProgress = 5 + Math.round(((i+1)/totalChunks)*85);
      onProgress?.(uploadProgress);
    }

    const mergePayload: MergeUploadRequest = {
      uploadId,
      // etags,
      objectName,
      minioObjectPath: minioObjectPath || objectName,
      filename: file.name,
      totalChunks,
      mimeType,
      hashString,
      sizeBytes: file.size,
      workspaceId,
      folderId,
    };

    const mergeRes = await api.post<MergeUploadResponse>("/files-worker/merge", mergePayload);

    triggerNotiRefresh();

    onProgress?.(100);
    return mergeRes.data.data;
  },
};