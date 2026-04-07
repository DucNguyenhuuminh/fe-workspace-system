import api from './api';

export const userService = {
    getProfile: () => {
        return api.get('/auth/profile'); 
    },
    updateProfile: (data: { username: string }) => {
        return api.put('/auth/update', data); 
    }
};