import { Search, Bell, User } from "lucide-react";
import { Input } from "@/components/ui/input";

export function AppHeader() {
  return (
    <header className="flex items-center justify-between h-16 px-8 border-b border-border bg-card">
      {/* Search bar */}
      <div className="relative flex-1 max-w-xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Hỏi tài liệu bất kỳ, ví dụ: Chính sách nghỉ phép là gì?..."
          className="pl-10 h-10 bg-secondary border-none"
        />
      </div>

      {/* Right section */}
      <div className="flex items-center gap-4 ml-4">
        <button className="relative text-muted-foreground hover:text-foreground">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-destructive" />
        </button>
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary">
            <User className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-sm font-medium text-foreground">Người dùng</span>
        </div>
      </div>
    </header>
  );
}
