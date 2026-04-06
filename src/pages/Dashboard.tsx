import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { folderService } from '../services/folder.service';
import { Folder as FolderIcon, Plus, ChevronRight, List, LayoutGrid, MoreVertical } from 'lucide-react';
import { type Folder } from '../types';

export default function Dashboard() {
    const [folders, setFolders] = useState<Folder[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
    const [currentParentId, setCurrentParentId] = useState<string | null>(null);
    const [breadcrumbs, setBreadcrumbs] = useState<{_id: string, name: string}[]>([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const navigate = useNavigate();

    // ĐÃ LÀM RỖNG ĐỂ HIỂN THỊ EMPTY STATE (Khung xám)
    const mockFiles: any[] = []; 
    const displayMockFiles = currentParentId === null ? mockFiles : [];
    const isFolderEmpty = folders.length === 0 && displayMockFiles.length === 0;

    useEffect(() => {
        fetchFolders(currentParentId);
        if (currentParentId) fetchBreadcrumbs(currentParentId);
        else setBreadcrumbs([]);
    }, [currentParentId]);

    const fetchFolders = async (parentId: string | null) => {
        try {
            setLoading(true);
            const response = await folderService.getFolders(parentId);
            setFolders(response.data.data);
        } catch (error: any) {
            if (error.response?.status === 401) navigate('/login');
        } finally { setLoading(false); }
    };

    const fetchBreadcrumbs = async (folderId: string) => {
        try {
            const response = await folderService.getFolderById(folderId);
            setBreadcrumbs(response.data.breadcrumb || []);
        } catch (error) {}
    };

    const handleCreateFolder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newFolderName.trim()) return;
        try {
            await folderService.createFolder(newFolderName.trim(), currentParentId);
            setNewFolderName(''); setIsCreateModalOpen(false); fetchFolders(currentParentId);
        } catch (error: any) { alert("Error create folder"); }
    };

    return (
        <div className="h-full max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        {currentParentId && breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1].name : 'My Space'}
                    </h1>
                    <p className="text-gray-500 mt-1 text-sm">Manage your personal files</p>
                </div>

                <div className="flex items-center gap-3">
                    {breadcrumbs.length > 0 && (
                        <div className="flex items-center gap-2 mr-4 text-sm font-medium">
                            <span onClick={() => setCurrentParentId(null)} className="text-gray-500 hover:text-blue-600 cursor-pointer transition">Drive</span>
                            {breadcrumbs.map((crumb) => (
                                <React.Fragment key={crumb._id}>
                                    <ChevronRight size={16} className="text-gray-400" />
                                    <span onClick={() => setCurrentParentId(crumb._id)} className="text-gray-800 cursor-pointer hover:text-blue-600 transition">{crumb.name}</span>
                                </React.Fragment>
                            ))}
                        </div>
                    )}
                    <button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg font-medium hover:bg-blue-100 transition mr-2">
                        <Plus size={18} /> Tạo thư mục
                    </button>
                    <div className="flex bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
                        <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md transition ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:text-gray-800'}`}><List size={20} /></button>
                        <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md transition ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:text-gray-800'}`}><LayoutGrid size={20} /></button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
            ) : (
                <>
                    {/* KHUNG XÁM KHI THƯ MỤC TRỐNG */}
                    {isFolderEmpty ? (
                        <div className="w-full text-center py-24 bg-white border border-dashed border-gray-300 rounded-2xl shadow-sm">
                            <FolderIcon className="mx-auto text-gray-300 mb-4" size={56} />
                            <p className="text-gray-600 font-medium text-lg">This Space is empty</p>
                            <p className="text-gray-400 text-sm mt-1">Create new folder or upload file to start working</p>
                        </div>
                    ) : (
                        <>
                            {viewMode === 'list' && (
                                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-gray-200 bg-gray-50/50">
                                                <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Name</th>
                                                <th className="px-6 py-4 font-semibold text-gray-600 text-sm w-48">Created Date</th>
                                                <th className="px-6 py-4 w-16">Size</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {folders.map(folder => (
                                                <tr key={folder._id} onDoubleClick={() => setCurrentParentId(folder._id)} className="border-b border-gray-100 hover:bg-gray-50 transition cursor-pointer">
                                                    <td className="px-6 py-4 flex items-center gap-3"><FolderIcon className="text-blue-500" size={24} fill="currentColor" fillOpacity={0.2} /> <span className="font-medium text-gray-800">{folder.name}</span></td>
                                                    <td className="px-6 py-4 text-gray-500 text-sm">Hôm nay</td>
                                                    <td className="px-6 py-4 text-right"><button className="text-gray-400 hover:text-gray-700 p-1 rounded-md hover:bg-gray-200"><MoreVertical size={18}/></button></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                            {viewMode === 'grid' && (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                                    {folders.map((folder) => (
                                        <div key={folder._id} onDoubleClick={() => setCurrentParentId(folder._id)} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 flex flex-col justify-between h-40 hover:shadow-md hover:border-blue-400 transition cursor-pointer group">
                                            <div className="flex justify-between items-start">
                                                <FolderIcon className="text-blue-500" size={36} fill="currentColor" fillOpacity={0.2} />
                                                <button className="text-gray-400 hover:text-gray-800 opacity-0 group-hover:opacity-100 transition"><MoreVertical size={18}/></button>
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-800 truncate mb-1" title={folder.name}>{folder.name}</p>
                                                <p className="text-xs text-gray-400">—</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </>
            )}

            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100"><h2 className="text-xl font-bold">Create new </h2></div>
                        <form onSubmit={handleCreateFolder} className="p-6">
                            <input autoFocus type="text" value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} placeholder="Enter folder' name..." className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-5 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                                <button type="submit" className="px-5 py-2 bg-blue-600 text-white rounded-lg">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}