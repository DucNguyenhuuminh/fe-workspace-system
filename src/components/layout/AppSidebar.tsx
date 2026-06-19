import { useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { FolderOpen, Users, Settings, Upload, HardDrive, Trash2, Loader2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

// Import các Store và Hook tải file
import { useDriveStore } from "@/stores/driveStore";
import { useFileUpload } from "@/hooks/use-upload"; // Sửa lại đường dẫn nếu cần

const navItems = [
  { label: "My Space", icon: FolderOpen, path: "/" },
  { label: "Workspaces", icon: Users, path: "/workspaces" },
  { label: "Trash", icon: Trash2, path: "/trash" },
  { label: "Settings", icon: Settings, path: "/settings" },
];

export function AppSidebar() {
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentFolderInfo = useDriveStore((state) => state.currentFolderInfo);
  const workspaceMatch = location.pathname.match(/\/workspaces\/([a-zA-Z0-9_-]+)/);
  const currentWorkspaceId = workspaceMatch ? workspaceMatch[1] : null;
  const currentFolderId = currentFolderInfo?._id || null;

  const { uploadFile, progress, isUploading } = useFileUpload({
    workspaceId: currentWorkspaceId,
    folderId: currentFolderId,
  });

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadFile(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <>
      <aside className="w-[260px] flex flex-col border-r border-border bg-card min-h-screen relative z-10">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <HardDrive className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-card-foreground">CloudSpace</span>
        </div>

        {/* Upload button & Hidden Input */}
        <div className="px-4 mb-4">
          <input 
            type="file" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
          />
          <Button 
            className="w-full h-11 gap-2 text-base font-semibold transition-all"
            onClick={handleUploadClick}
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <Upload className="h-5 w-5" />
                Upload
              </>
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || 
                            (item.path !== "/" && location.pathname.startsWith(item.path));
                            
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
      </aside>

      {isUploading && uploadFile && (
        <div className="fixed bottom-6 right-6 w-80 bg-card border border-border shadow-2xl rounded-xl z-50 overflow-hidden animate-in slide-in-from-bottom-5">
          <div className="bg-secondary/50 px-4 py-3 border-b border-border flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">Uploading an item...</span>
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
          
          <div className="p-4 flex items-center gap-4">
            {/* Box Icon */}
            <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center shrink-0">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            
            {/* Box thông tin */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate mb-1" title={uploadFile.name}>
                {uploadFile.name}
              </p>
              <div className="flex items-center gap-3">
                <Progress value={progress} className="h-1.5 flex-1" />
                <span className="text-xs font-medium text-muted-foreground w-8 text-right">
                  {progress}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}