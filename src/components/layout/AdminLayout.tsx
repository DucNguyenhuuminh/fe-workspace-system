import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, Users, FolderKanban, Files, LogOut, ArrowLeft 
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

const AdminLayout = () => {
  const { logout, user } = useAuthStore();
  const navigate = useNavigate();

  // Bảo vệ route: Nếu không phải Admin thì đá văng về trang chủ
  if (user?.globalRole !== 'SYSTEM_ADMIN') {
    navigate("/");
    return null;
  }

  const menuItems = [
    { name: "Tổng quan", path: "/admin", icon: LayoutDashboard },
    { name: "Quản lý Người dùng", path: "/admin/users", icon: Users },
    { name: "Quản lý Workspaces", path: "/admin/workspaces", icon: FolderKanban },
    { name: "Quản lý Tài nguyên", path: "/admin/files", icon: Files },
  ];

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden font-sans">
      {/* SIDEBAR DÀNH RIÊNG CHO ADMIN */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shadow-xl z-20">
        <div className="h-16 flex items-center px-6 border-b border-slate-700/50 bg-slate-950/50">
          <div className="h-8 w-8 bg-indigo-500 rounded-lg flex items-center justify-center mr-3 shadow-lg shadow-indigo-500/20">
            <span className="text-white font-bold text-lg">A</span>
          </div>
          <span className="text-lg font-bold text-white tracking-wide">Admin Panel</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/admin"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? "bg-indigo-600 text-white shadow-md" 
                    : "hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-700/50 space-y-2">
          <button 
            onClick={() => navigate("/")}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium text-sm">Back to User</span>
          </button>
          <button 
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium text-sm">LogOut</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto bg-slate-50/50">
        <div className="p-8">
          <Outlet /> {/* Nơi render các trang AdminDashboard, AdminUsers... */}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;