import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { type User } from '../types';
import { User as UserIcon, Bell, Shield } from 'lucide-react';

export default function Settings() {
    // Lấy thông tin user từ Layout truyền xuống (không cần gọi lại API)
    const { user } = useOutletContext<{ user: User | null }>();

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');

    // Tự động điền thông tin vào form khi có dữ liệu user
    useEffect(() => {
        if (user) {
            setUsername(user.username);
            setEmail(user.email);
        }
    }, [user]);

    const handleSaveProfile = (e: React.FormEvent) => {
        e.preventDefault();
        // Sau này mình sẽ gọi API Update Profile ở đây
        alert(`Sẽ cập nhật tên thành: ${username}`);
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
                <p className="text-gray-500 mt-1">Manage account and setting system</p>
            </div>

            {/* CARD THÔNG TIN CÁ NHÂN */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                    <UserIcon className="text-blue-500" size={20} />
                    <h2 className="text-lg font-semibold text-gray-800">Personal profile</h2>
                </div>
                
                <form onSubmit={handleSaveProfile} className="p-6">
                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                value={email}
                                disabled // Tạm thời khóa không cho đổi email
                                className="w-full px-4 py-2 border border-gray-200 bg-gray-50 text-gray-500 rounded-lg outline-none cursor-not-allowed"
                            />
                        </div>
                    </div>

                    <button 
                        type="submit"
                        className="mt-6 px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
                    >
                        Save changed
                    </button>
                </form>
            </div>

            {/* CARD THÔNG BÁO */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                    <Bell className="text-blue-500" size={20} />
                    <h2 className="text-lg font-semibold text-gray-800">Notification</h2>
                </div>
                
                <div className="p-6 space-y-4">
                    <label className="flex items-center justify-between cursor-pointer">
                        <span className="text-gray-700">Notify when have new file</span>
                        <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500" />
                    </label>
                    
                    <label className="flex items-center justify-between cursor-pointer">
                        <span className="text-gray-700">Notify when have been shared file</span>
                        <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500" />
                    </label>

                    <label className="flex items-center justify-between cursor-pointer">
                        <span className="text-gray-700">Notify when upload finish</span>
                        <input type="checkbox" className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500" />
                    </label>
                </div>
            </div>

            {/* CARD BẢO MẬT (Để sẵn khung) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                    <Shield className="text-blue-500" size={20} />
                    <h2 className="text-lg font-semibold text-gray-800">Bảo mật</h2>
                </div>
                <div className="p-6">
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition">
                        Change password
                    </button>
                </div>
            </div>
            
        </div>
    );
}