export interface User {
    _id: String;
    email: string;
    username: string;
    globalRole: 'USER' | 'SYSTEM_ADMIN';
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface WorkspaceMember {
    userId: string;
    role: 'MEMBER' | 'ADMIN';
    permissions: Array<'preview' | 'download' | 'upload'>;
}

export interface Workspace {
    _id: string;
    name: string;
    createdBy: string | null;
    members: WorkspaceMember[];
    deletedAt?: string | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface Folder {
    _id: string;
    name: string;
    workspaceId: string | null;
    ownerId: string | null;
    parentId: string | null;
    createdBy: string;
    deletedAt?: string | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface Document {
    _id: string;
    originalName: string;
    workspaceId: string | null;
    folderId: string | null;
    physicalFileId: string;
    uploadedBy: string;
    processedStatus: 'PENDING' | 'PROCESSING' | 'DONE' | 'FAILED';
    createdAt?: string;
    updatedAt?: string;
}