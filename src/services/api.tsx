import axios from 'axios';

// 1. Khởi tạo một "bưu điện" Axios riêng biệt
const api = axios.create({
    // LƯU Ý QUAN TRỌNG: Sửa số 3000 thành đúng cái Cổng (Port) mà Backend của bạn đang chạy nhé!
    baseURL: 'http://localhost:3001/api', 
    timeout: 10000, // Nếu gọi API quá 10 giây không phản hồi thì báo lỗi timeout
});

// 2. Interceptor (Người gác cổng): Tự động nhét Token vào ví trước khi gửi API đi
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 3. Interceptor: Đứng đón lõng kết quả từ Backend trả về
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Nếu Backend báo lỗi 401 (Token hết hạn hoặc không hợp lệ)
        if (error.response?.status === 401) {
            localStorage.removeItem('token'); // Xóa token cũ đi
            window.location.href = '/login';  // Đuổi thẳng cổ ra trang Đăng nhập
        }
        return Promise.reject(error);
    }
);

export default api;