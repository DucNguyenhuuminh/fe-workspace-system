import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { LayoutList, LayoutGrid, MoreVertical, Folder, FileText, FileSpreadsheet, Pencil, Download, Trash2, ArrowLeft, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import AppLayout from "@/components/layout/AppLayout";

const workspaceFiles: Record<string, { name: string; type: string; date: string; size: string; icon: any; color: string }[]> = {
  "marketing-team": [
    { name: "Campaign Q1 2026", type: "folder", date: "1/3/2026", size: "—", icon: Folder, color: "text-primary" },
    { name: "Marketing Strategy.pdf", type: "pdf", date: "15/3/2026", size: "4.00 MB", icon: FileText, color: "text-destructive" },
    { name: "Social Media Plan.xlsx", type: "xlsx", date: "20/3/2026", size: "1.00 MB", icon: FileSpreadsheet, color: "text-emerald-500" },
  ],
  "phat-trien-san-pham": [
    { name: "Technical Docs", type: "folder", date: "5/3/2026", size: "—", icon: Folder, color: "text-primary" },
    { name: "API Specs.pdf", type: "pdf", date: "10/3/2026", size: "2.50 MB", icon: FileText, color: "text-destructive" },
  ],
  "hr-admin": [
    { name: "Policies 2026", type: "folder", date: "1/1/2026", size: "—", icon: Folder, color: "text-primary" },
    { name: "Employee Handbook.pdf", type: "pdf", date: "15/1/2026", size: "3.00 MB", icon: FileText, color: "text-destructive" },
  ],
  "sales": [
    { name: "Q1 Reports", type: "folder", date: "1/3/2026", size: "—", icon: Folder, color: "text-primary" },
    { name: "Sales Report.xlsx", type: "xlsx", date: "20/3/2026", size: "5.00 MB", icon: FileSpreadsheet, color: "text-emerald-500" },
  ],
};

const workspaceNames: Record<string, { name: string; desc: string }> = {
  "marketing-team": { name: "Marketing Team", desc: "Workspace nhóm" },
  "phat-trien-san-pham": { name: "Phát triển sản phẩm", desc: "Workspace nhóm" },
  "hr-admin": { name: "HR & Admin", desc: "Workspace nhóm" },
  "sales": { name: "Sales", desc: "Workspace nhóm" },
};

const FileContextMenu = ({ align = "end" }: { align?: "end" | "start" }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <button className="text-muted-foreground hover:text-foreground">
        <MoreVertical className="h-4 w-4" />
      </button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align={align}>
      <DropdownMenuItem className="gap-2">
        <Pencil className="h-4 w-4" /> Đổi tên
      </DropdownMenuItem>
      <DropdownMenuItem className="gap-2">
        <Download className="h-4 w-4" /> Tải xuống
      </DropdownMenuItem>
      <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive">
        <Trash2 className="h-4 w-4" /> Xóa
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

const WorkspaceDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const ws = workspaceNames[slug || ""] || { name: "Workspace", desc: "Workspace nhóm" };
  const files = workspaceFiles[slug || ""] || [];

  return (
    <AppLayout>
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/workspaces")} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{ws.name}</h1>
              <p className="text-muted-foreground text-sm mt-1">{ws.desc}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1">
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => setViewMode("list")}
              >
                <LayoutList className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
            <Button className="gap-2">
              <Settings className="h-4 w-4" />
              Quản lý thành viên
            </Button>
          </div>
        </div>

        {viewMode === "list" ? (
          <div className="rounded-xl border border-border bg-card">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-sm font-medium text-muted-foreground px-6 py-3">Tên</th>
                  <th className="text-left text-sm font-medium text-muted-foreground px-6 py-3">Ngày tạo</th>
                  <th className="text-left text-sm font-medium text-muted-foreground px-6 py-3">Kích thước</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {files.map((file) => (
                  <tr key={file.name} className="border-b border-border last:border-b-0 hover:bg-secondary/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <file.icon className={`h-5 w-5 ${file.color}`} />
                        <span className="text-sm font-medium text-foreground">{file.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{file.date}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{file.size}</td>
                    <td className="px-4 py-4">
                      <FileContextMenu />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {files.map((file) => (
              <div key={file.name} className="group relative rounded-xl border border-border bg-card p-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <FileContextMenu align="end" />
                </div>
                <file.icon className={`h-10 w-10 ${file.color} mb-3`} />
                <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{file.size}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default WorkspaceDetail;
