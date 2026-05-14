// ==================== AUTH ====================
export interface User {
  _id: string;
  email: string;
  username: string;
  globalRole: "USER" | "SYSTEM_ADMIN";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  message: string;
  token: string; 
  user: User;
}

// ==================== WORKSPACE ====================
export interface WorkspaceMember {
  userId: string;
  role: "MEMBER" | "ADMIN";
  permissions: "viewer" | "editor";
}

export interface Workspace {
  _id: string;
  name: string;
  createdBy: string; // ObjectId string
  members: WorkspaceMember[];
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// ==================== FOLDER ====================
export interface Folder {
  _id: string;
  name: string;
  workspaceId: string | null;   // null = MySpace
  parentId: string | null;      // null = root
  createdBy: string;            // ObjectId string
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// ==================== PHYSICAL FILE ====================
export interface PhysicalFile {
  _id: string;
  hashString: string;
  minioObjectPath: string;
  sizeBytes: number;
  mimeType: string;
  createdAt: string;
  updatedAt: string; // ✅ Đã bổ sung theo {timestamps: true} của backend
}

// ==================== DOCUMENT ====================
export type ProcessedStatus = "PENDING" | "PROCESSING" | "DONE" | "FAILED";

export interface Document {
  _id: string;
  originalName: string;
  workspaceId: string | null;   // null = MySpace
  folderId: string | null;      // null = root
  physicalFileId: PhysicalFile; // Được populate (.populate('physicalFileId')) từ backend
  uploadedBy: string;           // ObjectId string
  processedStatus: ProcessedStatus;
  isDuplicate: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// ==================== API RESPONSE SHAPE ====================
export interface ItemsResponse {
  folders: Folder[];
  documents: Document[];
}

export interface FolderDetailResponse {
  folderInfo: Folder;
  folders: Folder[];
  documents: Document[]; 
  breadcrumb: { _id: string; name: string; parentId: string | null }[];
}

// (Có thể bạn không cần WorkspaceDetailResponse nữa vì chúng ta đã 
// tách ra gọi api 2 lần: 1 lấy info workspace, 1 lấy items bên trong)
export interface WorkspaceDetailResponse {
  workspace: Workspace;
  folders: Folder[];
  documents: Document[];
}