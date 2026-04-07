import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { folderService } from '../services/folder.service';
import { fileService } from '../services/file.service';
import { 
    Folder as FolderIcon, Plus, ChevronRight, List, LayoutGrid, 
    MoreVertical, FileText, FileSpreadsheet, Image as ImageIcon, File as DefaultFileIcon,
    Edit2, Trash2, Move, Download
} from 'lucide-react';
import { type Folder } from '../types';

export default function Dashboard() {
    const [folders, setFolders] = useState<Folder[]>([]);
    const [files, setFiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
    const [currentParentId, setCurrentParentId] = useState<string | null>(null);
    const [breadcrumbs, setBreadcrumbs] = useState<{_id: string, name: string}[]>([]);
    
    // States cho Create Modal
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');

    // --- STATES MỚI CHO MENU 3 CHẤM VÀ ĐỔI TÊN ---
    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
    const [itemToRename, setItemToRename] = useState<{id: string, name: string, type: 'folder' | 'file'} | null>(null);
    const [editName, setEditName] = useState('');

    const navigate = useNavigate();
    const isFolderEmpty = folders.length === 0 && files.length === 0;

    // Tự động đóng Menu 3 chấm khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = () => setActiveMenu(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    useEffect(() => {
        fetchData(currentParentId);
        if (currentParentId) fetchBreadcrumbs(currentParentId);
        else setBreadcrumbs([]);
    }, [currentParentId]);

    const fetchData = async (parentId: string | null) => {
        try {
            setLoading(true);
            const [foldersRes, filesRes] = await Promise.all([
                folderService.getFolders(parentId),
                fileService.getFiles(parentId)
            ]);
            setFolders(foldersRes.data.data || []);
            setFiles(filesRes.data.data || []);
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

    // --- CÁC HÀM XỬ LÝ API ---
    const handleCreateFolder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newFolderName.trim()) return;
        try {
            await folderService.createFolder(newFolderName.trim(), currentParentId);
            setNewFolderName(''); setIsCreateModalOpen(false); fetchData(currentParentId);
        } catch (error: any) { alert("Error creating folder"); }
    };

    const handleRename = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editName.trim() || !itemToRename) return;
        try {
            if (itemToRename.type === 'folder') {
                await folderService.renameFolder(itemToRename.id, editName.trim());
            } else {
                // Tương lai: Gọi API fileService.renameFile()
                alert("Tính năng đổi tên File sẽ làm ở GĐ 4");
            }
            setIsRenameModalOpen(false); setItemToRename(null); fetchData(currentParentId);
        } catch (error: any) { alert("Error renaming folder"); }
    };

    const handleDelete = async (id: string, type: 'folder' | 'file', name: string) => {
        if (!window.confirm(`Are you sure to delete "${name}"?`)) return;
        try {
            if (type === 'folder') {
                await folderService.deleteFolder(id);
            } else {
                // Tương lai: Gọi API fileService.deleteFile()
                alert("Tính năng xóa File sẽ làm ở GĐ 4");
            }
            fetchData(currentParentId);
        } catch (error: any) { alert("Error deleting"); }
    };

    // Toggle menu 3 chấm
    const toggleMenu = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setActiveMenu(activeMenu === id ? null : id);
    };

    // Hàm tiện ích format
    const formatSize = (bytes: number) => {
        if (!bytes || bytes === 0) return '0 B';
        const k = 1024; const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFileIcon = (fileName: string, size: number = 24) => {
        const ext = fileName.split('.').pop()?.toLowerCase();
        if (['pdf'].includes(ext || '')) return <FileText className="text-red-500" size={size} />;
        if (['xls', 'xlsx', 'csv'].includes(ext || '')) return <FileSpreadsheet className="text-green-500" size={size} />;
        if (['jpg', 'jpeg', 'png', 'gif'].includes(ext || '')) return <ImageIcon className="text-purple-500" size={size} />;
        if (['doc', 'docx', 'txt'].includes(ext || '')) return <FileText className="text-blue-500" size={size} />;
        return <DefaultFileIcon className="text-gray-500" size={size} />;
    };

    // --- COMPONENT MENU DROPDOWN NHỎ ---
    const ActionMenu = ({ item, type }: { item: any, type: 'folder' | 'file' }) => {
        if (activeMenu !== item._id) return null;
        return (
            <div className="absolute right-8 top-8 w-44 bg-white rounded-lg shadow-xl border border-gray-100 py-1.5 z-50 overflow-hidden">
                <button 
                    onClick={(e) => { e.stopPropagation(); setItemToRename({id: item._id, name: item.name, type}); setEditName(item.name); setIsRenameModalOpen(true); setActiveMenu(null); }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                ><Edit2 size={16}/> Rename</button>
                
                <button 
                    onClick={(e) => { e.stopPropagation(); alert("Tính năng Di chuyển sẽ làm ở GĐ 4"); setActiveMenu(null); }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                ><Move size={16}/> Move</button>
                
                {type === 'file' && (
                    <button 
                        onClick={(e) => { e.stopPropagation(); alert("Tính năng Tải xuống sẽ làm ở GĐ 4"); setActiveMenu(null); }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    ><Download size={16}/> Download</button>
                )}

                <div className="h-px bg-gray-100 my-1"></div>
                
                <button 
                    onClick={(e) => { e.stopPropagation(); handleDelete(item._id, type, item.name); setActiveMenu(null); }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                ><Trash2 size={16}/> Delete</button>
            </div>
        );
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
                        <Plus size={18} /> Create folder
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
                    {isFolderEmpty ? (
                        <div className="w-full text-center py-24 bg-white border border-dashed border-gray-300 rounded-2xl shadow-sm">
                            <FolderIcon className="mx-auto text-gray-300 mb-4" size={56} />
                            <p className="text-gray-600 font-medium text-lg">This Space is empty</p>
                            <p className="text-gray-400 text-sm mt-1">Create new folder or upload file to start working</p>
                        </div>
                    ) : (
                        <>
                            {/* --- CHẾ ĐỘ LIST --- */}
                            {viewMode === 'list' && (
                                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-visible">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-gray-200 bg-gray-50/50">
                                                <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Name</th>
                                                <th className="px-6 py-4 font-semibold text-gray-600 text-sm w-48">Created Date</th>
                                                <th className="px-6 py-4 w-32">Size</th>
                                                <th className="px-6 py-4 w-16"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {folders.map(folder => (
                                                <tr key={folder._id} onDoubleClick={() => setCurrentParentId(folder._id)} className="border-b border-gray-100 hover:bg-gray-50 transition cursor-pointer relative group">
                                                    <td className="px-6 py-4 flex items-center gap-3"><FolderIcon className="text-blue-500" size={24} fill="currentColor" fillOpacity={0.2} /> <span className="font-medium text-gray-800">{folder.name}</span></td>
                                                    <td className="px-6 py-4 text-gray-500 text-sm">{new Date(folder.createdAt || Date.now()).toLocaleDateString('vi-VN')}</td>
                                                    <td className="px-6 py-4 text-gray-500 text-sm">—</td>
                                                    <td className="px-6 py-4 text-right relative">
                                                        <button onClick={(e) => toggleMenu(e, folder._id)} className="text-gray-400 hover:text-gray-700 p-1 rounded-md hover:bg-gray-200 opacity-0 group-hover:opacity-100"><MoreVertical size={18}/></button>
                                                        <ActionMenu item={folder} type="folder" />
                                                    </td>
                                                </tr>
                                            ))}
                                            {files.map(file => (
                                                <tr key={file._id} className="border-b border-gray-100 hover:bg-gray-50 transition cursor-pointer relative group">
                                                    <td className="px-6 py-4 flex items-center gap-3">{getFileIcon(file.name, 24)} <span className="font-medium text-gray-800">{file.name}</span></td>
                                                    <td className="px-6 py-4 text-gray-500 text-sm">{new Date(file.createdAt || Date.now()).toLocaleDateString('vi-VN')}</td>
                                                    <td className="px-6 py-4 text-gray-500 text-sm">{formatSize(file.size)}</td>
                                                    <td className="px-6 py-4 text-right relative">
                                                        <button onClick={(e) => toggleMenu(e, file._id)} className="text-gray-400 hover:text-gray-700 p-1 rounded-md hover:bg-gray-200 opacity-0 group-hover:opacity-100"><MoreVertical size={18}/></button>
                                                        <ActionMenu item={file} type="file" />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* --- CHẾ ĐỘ GRID --- */}
                            {viewMode === 'grid' && (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                                    {folders.map((folder) => (
                                        <div key={folder._id} onDoubleClick={() => setCurrentParentId(folder._id)} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 flex flex-col justify-between h-40 hover:shadow-md hover:border-blue-400 transition cursor-pointer group relative">
                                            <div className="flex justify-between items-start">
                                                <FolderIcon className="text-blue-500" size={36} fill="currentColor" fillOpacity={0.2} />
                                                <button onClick={(e) => toggleMenu(e, folder._id)} className="text-gray-400 hover:text-gray-800 opacity-0 group-hover:opacity-100 transition"><MoreVertical size={18}/></button>
                                                <ActionMenu item={folder} type="folder" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-800 truncate mb-1" title={folder.name}>{folder.name}</p>
                                                <p className="text-xs text-gray-400">—</p>
                                            </div>
                                        </div>
                                    ))}

                                    {files.map((file) => (
                                        <div key={file._id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 flex flex-col justify-between h-40 hover:shadow-md hover:border-blue-400 transition cursor-pointer group relative">
                                            <div className="flex justify-between items-start">
                                                {getFileIcon(file.name, 36)}
                                                <button onClick={(e) => toggleMenu(e, file._id)} className="text-gray-400 hover:text-gray-800 opacity-0 group-hover:opacity-100 transition"><MoreVertical size={18}/></button>
                                                <ActionMenu item={file} type="file" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-800 truncate mb-1" title={file.name}>{file.name}</p>
                                                <p className="text-xs text-gray-400">{formatSize(file.size)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </>
            )}

            {/* Modal Tạo thư mục */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100"><h2 className="text-xl font-bold">New folder</h2></div>
                        <form onSubmit={handleCreateFolder} className="p-6">
                            <input autoFocus type="text" value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} placeholder="Enter folder's name..." className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-5 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                                <button type="submit" className="px-5 py-2 bg-blue-600 text-white rounded-lg">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Đổi tên */}
            {isRenameModalOpen && itemToRename && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100"><h2 className="text-xl font-bold">Rename {itemToRename.type === 'folder' ? 'folder' : 'file'}</h2></div>
                        <form onSubmit={handleRename} className="p-6">
                            <input autoFocus type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setIsRenameModalOpen(false)} className="px-5 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                                <button type="submit" className="px-5 py-2 bg-blue-600 text-white rounded-lg">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}