import { Link, useLocation } from "react-router-dom";
import { FolderOpen, Users, Settings, Upload, HardDrive, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

const navItems = [
  { label: "My Drive", icon: FolderOpen, path: "/drive" },
  { label: "Workspaces", icon: Users, path: "/workspaces" },
  { label: "Cài đặt", icon: Settings, path: "/settings" },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <aside className="w-[260px] flex flex-col border-r border-border bg-card min-h-screen">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
          <HardDrive className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="text-lg font-bold text-card-foreground">CloudDrive</span>
      </div>

      {/* Upload button */}
      <div className="px-4 mb-4">
        <Button className="w-full h-11 gap-2 text-base font-semibold">
          <Upload className="h-5 w-5" />
          Tải lên
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors mb-1",
                isActive
                  ? "text-primary bg-secondary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Storage indicator */}
      <div className="px-6 py-4 border-t border-border">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-muted-foreground">Dung lượng</span>
          <span className="font-medium text-foreground">15 GB / 100 GB</span>
        </div>
        <Progress value={15} className="h-2" />
      </div>

      {/* Help button */}
      <div className="px-6 pb-4 flex justify-end">
        <button className="text-muted-foreground hover:text-foreground">
          <HelpCircle className="h-5 w-5" />
        </button>
      </div>
    </aside>
  );
}
