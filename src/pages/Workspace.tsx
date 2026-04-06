import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { workspaceService } from '../services/workspace.service';
import { Users, Plus } from 'lucide-react';
import { type Workspace } from '../types';

// Danh sách màu tự động xoay vòng cho các Workspace thật
const colorPalette = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-pink-500', 'bg-teal-500'];

export default function Workspaces() {
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [loading, setLoading] = useState(true);
    
    // State cho Modal tạo mới
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newWorkspaceName, setNewWorkspaceName] = useState('');

    const navigate = useNavigate();
    
    useEffect(() => {
        fetchWorkspaces();
    }, []);

    const fetchWorkspaces = async () => {
        try {
            setLoading(true);
            const response = await workspaceService.getWorkspaces();
            setWorkspaces(response.data.data || []);
        } catch (error: any) {
            if (error.response?.status === 401) navigate('/login');
            console.error("Error take workspace list", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateWorkspace = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newWorkspaceName.trim()) return;
        try {
            await workspaceService.createWorkspace(newWorkspaceName.trim());
            setNewWorkspaceName('');
            setIsCreateModalOpen(false);
            fetchWorkspaces(); // Tải lại danh sách
        } catch (error: any) {
            alert(error.response?.data?.message || "Error create workspace");
        }
    };

    // Hàm xử lý khi click vào 1 Workspace
    const handleOpenWorkspace = (workspaceId: string) => {
        navigate(`/workspaces/${workspaceId}`);
    };

    return (
        <div className="max-w-7xl mx-auto h-full flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-end mb-8 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        Workspaces
                    </h1>
                    <p className="text-gray-500 mt-1 text-sm">Shared Team Workspace</p>
                </div>

                <button 
                    onClick={() => setIsCreateModalOpen(true)} 
                    className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition shadow-sm"
                >
                    <Plus size={18} /> Create Workspace
                </button>
            </div>

            {/* Danh sách Workspace */}
            {loading ? (
                <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    
                    {/* Render các Workspace THẬT từ API nhưng dùng UI MỚI */}
                    {workspaces.map((ws, index) => {
                        // Tự động gán 1 màu trong mảng colorPalette dựa vào index
                        const cardColor = colorPalette[index % colorPalette.length];
                        
                        return (
                            <div 
                                key={ws._id}
                                onClick={() => handleOpenWorkspace(ws._id)}
                                className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition cursor-pointer p-6 flex flex-col"
                            >
                                {/* Icon màu sắc */}
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white mb-4 ${cardColor}`}>
                                    <Users size={24} />
                                </div>
                                
                                {/* Tiêu đề & Mô tả */}
                                <div className="flex-1">
                                    <h3 className="font-bold text-gray-800 text-xl mb-2 truncate" title={ws.name}>
                                        {ws.name}
                                    </h3>
                                    <p className="text-gray-500 text-sm">Không gian làm việc chung</p>
                                </div>
                                
                                {/* Footer với gạch ngang */}
                                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center gap-4 text-sm text-gray-500 font-medium">
                                    <div className="flex items-center gap-1.5">
                                        <Users size={16} className="text-gray-400" />
                                        <span>{ws.members ? ws.members.length : 1} members</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        {/* Tạm thời để 0 files vì backend chưa đếm số lượng file, bạn có thể update sau */}
                                        <span>0 files</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* NẾU KHÔNG CÓ WORKSPACE NÀO -> Hiện khung xám đứt nét cũ */}
                    {workspaces.length === 0 && (
                        <div className="col-span-full text-center py-16 bg-white border border-dashed border-gray-300 rounded-xl">
                            <Users className="mx-auto text-gray-300 mb-3" size={48} />
                            <p className="text-gray-500 font-medium">You do not join any workspace</p>
                            <p className="text-gray-400 text-sm mt-1">Let create a new workspace to start a team work</p>
                        </div>
                    )}
                </div>
            )}

            {/* Modal Tạo mới */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100">
                            <h2 className="text-xl font-bold">Create new workspace</h2>
                        </div>
                        <form onSubmit={handleCreateWorkspace} className="p-6">
                            <input 
                                autoFocus 
                                type="text" 
                                value={newWorkspaceName} 
                                onChange={(e) => setNewWorkspaceName(e.target.value)} 
                                placeholder="Nhập tên Workspace (VD: Dự án Marketing)..." 
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                            />
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-5 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium">Hủy</button>
                                <button type="submit" className="px-5 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">Creating new</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}