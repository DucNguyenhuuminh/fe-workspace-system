import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Folder as FolderIcon, ArrowLeft, List, LayoutGrid, UserPlus, MoreVertical } from 'lucide-react';

export default function WorkspaceDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');

    const workspaceName = 'Workspace nhóm'; // Sau này sẽ gọi API lấy tên thật

    // CHƯA CÓ FOLDER/FILE NÀO NÊN ĐỂ TRỐNG
    const folders: any[] = []; 
    const mockFiles: any[] = []; 
    const isFolderEmpty = folders.length === 0 && mockFiles.length === 0;

    return (
        <div className="h-full max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/workspaces')} className="p-2 hover:bg-gray-200 text-gray-600 rounded-full transition">
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">{workspaceName}</h1>
                        <p className="text-gray-500 mt-1 text-sm">Shared Workspace  </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex bg-white border border-gray-200 rounded-lg p-1 shadow-sm mr-2">
                        <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md transition ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}><List size={20} /></button>
                        <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md transition ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}><LayoutGrid size={20} /></button>
                    </div>
                    <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition shadow-sm">
                        <UserPlus size={18} /> Manage members
                    </button>
                </div>
            </div>

            {/* KHUNG XÁM KHI TRỐNG */}
            {isFolderEmpty ? (
                <div className="w-full text-center py-24 bg-white border border-dashed border-gray-300 rounded-2xl shadow-sm">
                    <FolderIcon className="mx-auto text-gray-300 mb-4" size={56} />
                    <p className="text-gray-600 font-medium text-lg">This Workspace is empty</p>
                    <p className="text-gray-400 text-sm mt-1">Start create folder for sharing with members</p>
                </div>
            ) : (
                <div>
                    {/* Phần List/Grid render data sẽ viết ở đây sau khi nối API */}
                </div>
            )}
        </div>
    );
}