import { User } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { SearchBar } from "./SearchBar";
import { NotificationDropdown } from "./NotificationDropdown"; // Import Component vừa tách

export function AppHeader() {
  const { user } = useAuthStore();

  const displayName = user?.username;
  const avatarInitial = user?.username ? user.username.charAt(0).toUpperCase() : "";

  return (
    <header className="flex items-center justify-between h-16 px-8 border-b border-border bg-card relative z-30">
      
      {/* Khối Tìm kiếm */}
      <SearchBar />

      {/* Khối Right section (Thông báo & Avatar) */}
      <div className="flex items-center gap-3 ml-4">
        
        {/* COMPONENT THÔNG BÁO ĐÃ ĐƯỢC TÁCH */}
        <NotificationDropdown />

        {/* Khối hiển thị User */}
        <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity pl-3 border-l border-border/60">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs border border-primary/20 shadow-sm">
            {avatarInitial ? <span>{avatarInitial}</span> : <User className="h-4 w-4" />}
          </div>
          <span className="text-sm font-semibold text-foreground truncate max-w-[120px]">
            {displayName}
          </span>
        </div>
      </div>
    </header>
  );
}