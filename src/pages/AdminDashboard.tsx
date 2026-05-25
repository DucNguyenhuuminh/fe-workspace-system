import { useEffect, useState } from "react";
import { Users, HardDrive, ShieldCheck, Database, Zap, Loader2, Files} from "lucide-react";
import { adminService } from "@/services/adminService";
import { toast } from "sonner";

const AdminDashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminService.getStats();
        setStats(data);
      } catch (error) {
        toast.error("Không thể tải dữ liệu thống kê");
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) return <div className="flex h-[80vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-indigo-500" /></div>;
  if (!stats) return null;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Tổng quan Hệ thống</h1>
        <p className="text-slate-500 mt-2">Theo dõi tình trạng hoạt động và tài nguyên của toàn hệ thống.</p>
      </div>

      {/* Hàng 1: Thống kê cơ bản */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-xl"><Users className="h-8 w-8" /></div>
          <div>
            <p className="text-sm font-medium text-slate-500">Người dùng (Active)</p>
            <h3 className="text-3xl font-bold text-slate-800">{stats.users.active} <span className="text-sm text-slate-400 font-normal">/ {stats.users.total}</span></h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl"><Database className="h-8 w-8" /></div>
          <div>
            <p className="text-sm font-medium text-slate-500">Workspaces</p>
            <h3 className="text-3xl font-bold text-slate-800">{stats.workspaces.total}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5">
          <div className="p-4 bg-orange-50 text-orange-600 rounded-xl"><Files className="h-8 w-8" /></div>
          <div>
            <p className="text-sm font-medium text-slate-500">Tổng Documents</p>
            <h3 className="text-3xl font-bold text-slate-800">{stats.files.totalDocuments}</h3>
          </div>
        </div>
      </div>

      {/* Hàng 2: Điểm nhấn - Thống kê Deduplication */}
      <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none"><HardDrive className="h-64 w-64" /></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <Zap className="h-6 w-6 text-yellow-400" />
            <h2 className="text-2xl font-bold tracking-wide">Hiệu năng Nén dữ liệu (Deduplication)</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <p className="text-indigo-200 text-sm font-medium mb-1">Dung lượng thực tế (Storage Used)</p>
              <p className="text-4xl font-black">{stats.files.totalSizeGB} <span className="text-xl font-medium text-indigo-300">GB</span></p>
              <p className="text-sm text-indigo-300 mt-2">({stats.files.totalPhysicalFiles} file vật lý)</p>
            </div>
            
            <div className="border-l border-indigo-700 pl-8">
              <p className="text-emerald-300 text-sm font-medium mb-1">Dung lượng tiết kiệm được</p>
              <p className="text-4xl font-black text-emerald-400">{stats.files.savedSizeGB} <span className="text-xl font-medium">GB</span></p>
            </div>

            <div className="border-l border-indigo-700 pl-8">
              <p className="text-yellow-200 text-sm font-medium mb-1">Tỷ lệ tiết kiệm</p>
              <p className="text-5xl font-black text-yellow-400">{stats.files.savedPercentage}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;