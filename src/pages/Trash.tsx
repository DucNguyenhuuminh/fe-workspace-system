import { useState } from "react";
import { LayoutList, LayoutGrid, MoreVertical, Folder, FileText, FileSpreadsheet, Presentation, Image, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import AppLayout from "@/components/layout/AppLayout";

const trashedFiles = [
  { name: "Old Report Q4.xlsx", type: "xlsx", date: "10/2/2026", size: "2.50 MB", deletedDate: "5/4/2026", icon: FileSpreadsheet, color: "text-emerald-500" },
  { name: "Draft Proposal.pdf", type: "pdf", date: "20/1/2026", size: "1.20 MB", deletedDate: "2/4/2026", icon: FileText, color: "text-destructive" },
  { name: "Archive 2025", type: "folder", date: "1/12/2025", size: "—", deletedDate: "28/3/2026", icon: Folder, color: "text-primary" },
  { name: "Old Presentation.pptx", type: "pptx", date: "15/11/2025", size: "4.00 MB", deletedDate: "25/3/2026", icon: Presentation, color: "text-orange-500" },
  { name: "Screenshot_old.jpg", type: "jpg", date: "10/10/2025", size: "800 KB", deletedDate: "20/3/2026", icon: Image, color: "text-purple-500" },
];

const TrashContextMenu = ({ align = "end" }: { align?: "end" | "start" }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <button className="text-muted-foreground hover:text-foreground">
        <MoreVertical className="h-4 w-4" />
      </button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align={align}>
      <DropdownMenuItem className="gap-2">
        <RotateCcw className="h-4 w-4" /> Restore
      </DropdownMenuItem>
      <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive">
        <Trash2 className="h-4 w-4" /> Delete 
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

const Trash = () => {
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  return (
    <AppLayout>
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Trash</h1>
            <p className="text-muted-foreground text-sm mt-1">All deleted files will be here</p>
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
            {trashedFiles.length > 0 && (
              <Button variant="destructive" className="gap-2">
                <Trash2 className="h-4 w-4" />
                Xóa tất cả
              </Button>
            )}
          </div>
        </div>

        {trashedFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Trash2 className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">Empty trash</h3>
            <p className="text-sm text-muted-foreground">Your deleted files will exist here</p>
          </div>
        ) : viewMode === "list" ? (
          <div className="rounded-xl border border-border bg-card">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-sm font-medium text-muted-foreground px-6 py-3">Name</th>
                  <th className="text-left text-sm font-medium text-muted-foreground px-6 py-3">Deleted Date</th>
                  <th className="text-left text-sm font-medium text-muted-foreground px-6 py-3">Size</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {trashedFiles.map((file) => (
                  <tr key={file.name} className="border-b border-border last:border-b-0 hover:bg-secondary/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <file.icon className={`h-5 w-5 ${file.color}`} />
                        <span className="text-sm font-medium text-foreground">{file.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{file.deletedDate}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{file.size}</td>
                    <td className="px-4 py-4">
                      <TrashContextMenu />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {trashedFiles.map((file) => (
              <div key={file.name} className="group relative rounded-xl border border-border bg-card p-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <TrashContextMenu align="end" />
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

export default Trash;
