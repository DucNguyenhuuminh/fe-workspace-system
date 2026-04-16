import { useState } from "react";
import { LayoutList, LayoutGrid, MoreVertical, Folder, FileText, FileSpreadsheet, Presentation, Image, Pencil, Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import AppLayout from "@/components/layout/AppLayout";

const files = [
  { name: "Dự án 2026", type: "folder", date: "20/3/2026", size: "—", icon: Folder, color: "text-primary" },
  { name: "Quy định nghỉ phép 2026.pdf", type: "pdf", date: "15/1/2026", size: "1.95 MB", icon: FileText, color: "text-destructive" },
  { name: "Báo cáo Q1 2026.xlsx", type: "xlsx", date: "10/3/2026", size: "5.00 MB", icon: FileSpreadsheet, color: "text-emerald-500" },
  { name: "Presentation_2024.pptx", type: "pptx", date: "28/2/2026", size: "2.00 GB", icon: Presentation, color: "text-orange-500" },
  { name: "Team Photo.jpg", type: "jpg", date: "15/3/2026", size: "3.00 MB", icon: Image, color: "text-purple-500" },
];

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

const MyDrive = () => {
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  return (
    <AppLayout>
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Drive</h1>
            <p className="text-muted-foreground text-sm mt-1">Quản lý file cá nhân của bạn</p>
          </div>
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
              <div
                key={file.name}
                className="group relative rounded-xl border border-border bg-card p-4 hover:shadow-md transition-shadow cursor-pointer"
              >
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

export default MyDrive;
