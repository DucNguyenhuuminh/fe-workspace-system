import { Search, Bell, User, FileText, Users, Upload, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";

const notifications = [
  {
    id: 1,
    icon: FileText,
    color: "text-primary",
    title: "File mới được chia sẻ",
    description: "Nguyễn Văn B đã chia sẻ 'Báo cáo Q1 2026.xlsx' với bạn",
    time: "5 phút trước",
    unread: true,
  },
  {
    id: 2,
    icon: Users,
    color: "text-emerald-500",
    title: "Thêm vào Workspace",
    description: "Bạn đã được thêm vào workspace 'Marketing Team'",
    time: "1 giờ trước",
    unread: true,
  },
  {
    id: 3,
    icon: Upload,
    color: "text-orange-500",
    title: "Upload hoàn tất",
    description: "File 'Presentation_2024.pptx' đã được tải lên thành công",
    time: "3 giờ trước",
    unread: true,
  },
  {
    id: 4,
    icon: FileText,
    color: "text-primary",
    title: "Bình luận mới",
    description: "Trần Thị C đã bình luận trong 'Quy định nghỉ phép 2026.pdf'",
    time: "Hôm qua",
    unread: false,
  },
  {
    id: 5,
    icon: Trash2,
    color: "text-destructive",
    title: "File đã được xóa",
    description: "'Tài liệu cũ.docx' đã được chuyển vào thùng rác",
    time: "2 ngày trước",
    unread: false,
  },
  {
    id: 6,
    icon: Users,
    color: "text-emerald-500",
    title: "Thành viên mới",
    description: "Lê Văn D đã tham gia workspace 'Dự án 2026'",
    time: "3 ngày trước",
    unread: false,
  },
  {
    id: 7,
    icon: FileText,
    color: "text-primary",
    title: "Cập nhật tài liệu",
    description: "'Kế hoạch năm 2026.docx' đã được cập nhật",
    time: "1 tuần trước",
    unread: false,
  },
];

export function AppHeader() {
  const unreadCount = notifications.filter((n) => n.unread).length;

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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="relative text-muted-foreground hover:text-foreground outline-none">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-destructive" />
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-96 p-0">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">Thông báo</h3>
              {unreadCount > 0 && (
                <span className="text-xs text-muted-foreground">
                  {unreadCount} chưa đọc
                </span>
              )}
            </div>
            <ScrollArea className="h-[400px]">
              <div className="py-1">
                {notifications.map((notif) => (
                  <button
                    key={notif.id}
                    className="w-full flex items-start gap-3 px-4 py-3 hover:bg-secondary transition-colors text-left"
                  >
                    <div className={`mt-0.5 ${notif.color}`}>
                      <notif.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-foreground truncate">
                          {notif.title}
                        </p>
                        {notif.unread && (
                          <span className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {notif.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {notif.time}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
            <div className="border-t border-border px-4 py-2">
              <button className="w-full text-center text-sm text-primary hover:underline py-1">
                Đánh dấu tất cả đã đọc
              </button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

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
