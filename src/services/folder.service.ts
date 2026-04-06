import api from './api';

export const folderService = {
    // Lấy danh sách thư mục (có hỗ trợ truyền parentId)
    getFolders: (parentId: string | null) => {
        return api.get('/folders', { params: { parentId: parentId || undefined } });
    },

    // Lấy chi tiết thư mục (dùng để vẽ breadcrumb)
    getFolderById: (id: string) => {
        return api.get(`/folders/${id}`);
    },

    // Tạo mới
    createFolder: (name: string, parentId: string | null) => {
        return api.post('/folders', { name, parentId });
    },

    // Đổi tên
    renameFolder: (id: string, name: string) => {
        return api.put(`/folders/${id}/rename`, { name });
    },

    // Xóa
    deleteFolder: (id: string) => {
        return api.delete(`/folders/${id}`);
    }
};