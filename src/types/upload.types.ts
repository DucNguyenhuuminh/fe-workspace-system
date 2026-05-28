import type { Document } from "./index"; // Đảm bảo import đúng từ file types chung

// ==================== REQUESTS (Payload gửi lên BE) ====================

export interface HashCheckRequest {
  filename: string;         // BE yêu cầu 'filename'
  hashString: string;       // BE yêu cầu 'hashString'
  workspaceId?: string | null;
  folderId?: string | null;
}

export interface InitUploadRequest {
  filename: string;
  totalChunks: number;
  mimeType: string;
  sizeBytes: number;
  workspaceId?: string | null;
  folderId?: string | null;
  // Route này BE không cần hashString nữa nên ta bỏ đi
}

export interface ETagPart {
  partNumber: number;
  etag: string;
}

export interface MergeUploadRequest {
  uploadId: string;
  etags: ETagPart[];          
  objectName: string; 
  minioObjectPath: string;     
  filename: string;
  totalChunks: number;
  mimeType: string;
  hashString: string;
  sizeBytes: number;
  workspaceId?: string | null;
  folderId?: string | null;
}

// ==================== RESPONSES (Dữ liệu BE trả về) ====================

export interface HashCheckResponse {
  message: string;
  data: {
    isDuplicate: boolean;
    document?: Document; // Chỉ có khi isDuplicate = true
  };
}

export interface InitUploadResponse {
  message: string;
  data: {
    uploadId: string;
    objectName: string;
    minioObjectPath: string; 
    presignedUrls: string[]; 
    meta?: any;
  };
}

export interface MergeUploadResponse {
  message: string;
  data: Document;
}

// ==================== MISC ====================

// Callback báo tiến độ upload
export type UploadProgressCallback = (progress: number) => void; // 0 → 100