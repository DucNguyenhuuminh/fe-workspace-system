import React, { useState, useEffect } from 'react';
import { userService } from '../services/user.service';
import { User as UserIcon, Bell, Shield } from 'lucide-react';

export default function Settings() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    
    // Thêm state loading để UX mượt hơn
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Vừa vào trang là gọi API lấy thông tin luôn
    useEffect(() => {
        fetchProfileData();
    }, []);

    const fetchProfileData = async () => {
        try {
            setIsLoading(true);
            const res = await userService.getProfile();
            const userData = res.data.user; // Đảm bảo khớp với cấu trúc JSON backend trả về
            
            if (userData) {
                setUsername(userData.username);
                setEmail(userData.email);
            }
        } catch (error) {
            console.error("Lỗi lấy thông tin profile:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username.trim()) return;

        try {
            setIsSaving(true);
            // Gọi API Update
            await userService.updateProfile({ username: username.trim() });
            alert("Update information successfully!");
            
            window.location.reload(); 
        } catch (error: any) {
            alert(error.response?.data?.message || "Error while save changed");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
                <p className="text-gray-500 mt-1">Manage account and system settings</p>
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
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
                                disabled // Khóa không cho đổi email
                                className="w-full px-4 py-2 border border-gray-200 bg-gray-50 text-gray-500 rounded-lg outline-none cursor-not-allowed"
                            />
                        </div>
                    </div>

                    <button 
                        type="submit"
                        disabled={isSaving}
                        className={`mt-6 px-6 py-2 text-white font-medium rounded-lg transition ${isSaving ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                        {isSaving ? 'Saving...' : 'Save changed'}
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
                        <span className="text-gray-700">Notify when file is shared</span>
                        <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500" />
                    </label>

                    <label className="flex items-center justify-between cursor-pointer">
                        <span className="text-gray-700">Notify when upload finishes</span>
                        <input type="checkbox" className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500" />
                    </label>
                </div>
            </div>

            {/* CARD BẢO MẬT */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                    <Shield className="text-blue-500" size={20} />
                    <h2 className="text-lg font-semibold text-gray-800">Security</h2>
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