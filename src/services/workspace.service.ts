import api from './api';

export const workspaceService = {
    // Lấy danh sách Workspace mà user đang tham gia
    getWorkspaces: () => {
        return api.get('/workspaces'); 
    },

    // Tạo một Workspace mới
    createWorkspace: (name: string) => {
        return api.post('/workspaces', { name });
    },

    // Lấy chi tiết 1 Workspace (dùng sau này khi click vào bên trong)
    getWorkspaceById: (id: string) => {
        return api.get(`/workspaces/${id}`);
    }
};  