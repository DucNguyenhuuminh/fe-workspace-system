import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { HardDrive, Users, Settings, LogOut, Menu, Bell, Search, Upload } from 'lucide-react'; // Đã thêm Upload
import { userService } from '../services/user.service';
import { type User } from '../types';

export default function Layout() {
    const location = useLocation();
    const navigate = useNavigate();
    
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await userService.getProfile();
                setUser(res.data.user); 
            } catch (error) {
                console.error("Can not access profile:", error);
                localStorage.removeItem('token');
                navigate('/login');
            }
        };
        fetchProfile();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const menuItems = [
        { path: '/', icon: <HardDrive size={20} />, label: 'My Space' },
        { path: '/workspaces', icon: <Users size={20} />, label: 'Workspaces' },
        { path: '/settings', icon: <Settings size={20} />, label: 'Settings' },
    ];

    return (
        <div className="flex h-screen bg-gray-50 text-gray-800 overflow-hidden">
            {/* ================= SIDEBAR ================= */}
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex">
                {/* Logo Area */}
                <div className="h-16 flex items-center px-6 border-b border-gray-100 shrink-0">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                        <HardDrive className="text-white" size={18} />
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-500">
                        CloudSpace
                    </span>
                </div>

                {/* NÚT TẢI LÊN (UPLOAD) */}
                <div className="p-4 shrink-0">
                    <button className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition shadow-sm">
                        <Upload size={18} />
                        Upload
                    </button>
                </div>

                {/* Navigation Menu */}
                <nav className="flex-1 overflow-y-auto px-3 space-y-1">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path || (item.path === '/' && location.pathname === '');
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${
                                    isActive 
                                    ? 'bg-blue-50 text-blue-700' 
                                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                }`}
                            >
                                {item.icon}
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* THANH DUNG LƯỢNG & LOGOUT */}
                <div className="p-4 border-t border-gray-200 bg-gray-50/50 shrink-0">
                    <div className="mb-4 bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                        <div className="flex justify-between text-xs mb-2 text-gray-700 font-medium">
                            <span>Volume</span>
                            <span className="font-bold">15 GB / 100 GB</span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-600 rounded-full" style={{ width: '15%' }}></div>
                        </div>
                    </div>

                    <button 
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-3 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition font-medium"
                    >
                        <LogOut size={20} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* ================= MAIN KHU VỰC BÊN PHẢI ================= */}
            <div className="flex-1 flex flex-col min-w-0">
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 sticky top-0 z-20">
                    <div className="flex items-center gap-4 flex-1">
                        <button className="md:hidden text-gray-500 hover:text-gray-700">
                            <Menu size={24} />
                        </button>
                        <div className="hidden sm:flex items-center bg-gray-100 px-4 py-2.5 rounded-xl w-full max-w-3xl mx-8 focus-within:ring-2 focus-within:ring-blue-100 transition">
                            <Search className="text-gray-400 mr-2" size={20} />
                            <input 
                                type="text" 
                                placeholder="Hỏi tài liệu bất kỳ, ví dụ: Chính sách nghỉ phép là gì?..." 
                                className="bg-transparent border-none outline-none w-full text-base text-gray-700 placeholder-gray-400" 
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="text-gray-400 hover:text-gray-600 transition">
                            <Bell size={20} />
                        </button>
                        
                        {user ? (
                            <div className="flex items-center gap-3 pl-4 border-l border-gray-100 group cursor-pointer relative">
                                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-sm border-2 border-white ring-2 ring-gray-100">
                                    {(user.username || 'U').charAt(0).toUpperCase()}
                                </div>
                                <div className="hidden sm:block">
                                    <div className="text-sm font-semibold text-gray-800">{user.username}</div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 pl-4 border-l border-gray-100 animate-pulse">
                                <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                            </div>
                        )}
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
                    <Outlet context={{ user }} />
                </main>
            </div>
        </div>
    );
}