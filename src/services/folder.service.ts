import api from './api';

export const folderService = {
    // Lấy danh sách thư mục (Hỗ trợ lọc theo parentId và workspaceId)
    getFolders: (parentId: string | null, workspaceId?: string) => {
        return api.get('/folders', { 
            params: { 
                parentId: parentId || undefined, 
                workspaceId 
            } 
        });
    },

    // Lấy chi tiết thư mục (dùng để vẽ breadcrumb)
    getFolderById: (id: string) => {
        return api.get(`/folders/${id}`);
    },

    // Tạo mới (Hỗ trợ tạo trong My Drive hoặc Workspace)
    createFolder: (name: string, parentId: string | null, workspaceId?: string) => {
        return api.post('/folders', { name, parentId, workspaceId });
    },

    // Đổi tên
    renameFolder: (id: string, name: string) => {
        return api.put(`/folders/${id}/rename`, { name });
    },

    // MỚI: Di chuyển thư mục
    moveFolder: (id: string, newParentId: string | null) => {
        return api.put(`/folders/${id}/move`, { newParentId });
    },

    // Xóa
    deleteFolder: (id: string) => {
        return api.delete(`/folders/${id}`);
    }
};