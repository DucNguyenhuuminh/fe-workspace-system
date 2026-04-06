import api from './api';

export const userService = {
    getProfile: () => {
        // Giả định backend của bạn có API GET /auth/me để trả về info user dựa trên Token
        return api.get('/auth/profile'); 
    }
};