import api from './api';

export const fileService = {
    // Lấy danh sách file (Hỗ trợ lọc theo folderId và workspaceId)
    getFiles: (folderId: string | null, workspaceId?: string) => {
        return api.get('/files', { 
            params: { 
                folderId: folderId || undefined, 
                workspaceId 
            } 
        });
    }
    
    // Lưu ý: Sau này Giai đoạn 4 làm thao tác file, bạn sẽ viết thêm 
    // renameFile, moveFile, deleteFile, downloadFile ở đây nhé!
};