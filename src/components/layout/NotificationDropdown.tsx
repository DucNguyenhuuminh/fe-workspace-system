import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, File, Users, Folder, Info, Check, Trash2 } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotiStore } from "@/stores/notiStore";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

// Hàm ánh xạ Icon và Màu sắc dựa trên Type của Backend
const getNotiStyle = (type: string) => {
  switch (type) {
    case 'FILE_MERGED':
    case 'FILE_RESTORED':
      return { icon: File, color: "text-blue-500", bg: "bg-blue-500/10" };
    case 'WORKSPACE_CREATED':
    case 'WORKSPACE_DELETED':
      return { icon: Folder, color: "text-emerald-500", bg: "bg-emerald-500/10" };
    case 'MEMBER_ADDED':
    case 'MEMBER_REMOVED':
    case 'MEMBER_PERMISSION':
      return { icon: Users, color: "text-orange-500", bg: "bg-orange-500/10" };
    default:
      return { icon: Info, color: "text-muted-foreground", bg: "bg-secondary" };
  }
};

export function NotificationDropdown() {
  const navigate = useNavigate();
  const { 
    notifications, 
    unreadCount, 
    fetchNotifications, 
    markAsRead, 
    markAllAsRead, 
    deleteNoti 
  } = useNotiStore();

  useEffect(() => {
    fetchNotifications(1);
  }, [fetchNotifications]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative h-9 w-9 flex items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors outline-none focus:ring-0">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-destructive border-2 border-card" />
          )}
        </button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-[380px] p-0 flex flex-col shadow-2xl border-border animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between bg-card sticky top-0 z-10">
          <h3 className="font-semibold text-sm">Thông báo</h3>
          {unreadCount > 0 && (
            <button 
              onClick={(e) => { e.preventDefault(); markAllAsRead(); }}
              className="text-[11px] font-medium text-primary hover:underline flex items-center gap-1"
            >
              <Check className="h-3 w-3" /> Đánh dấu đã đọc tất cả
            </button>
          )}
        </div>

        {/* Content */}
        {notifications.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground text-sm flex flex-col items-center gap-2">
            <Bell className="h-10 w-10 opacity-10" />
            <p>Bạn chưa có thông báo nào</p>
          </div>
        ) : (
          <ScrollArea className="max-h-[420px]">
            <div className="flex flex-col">
              {notifications.map((noti) => {
                const { icon: NotiIcon, color, bg } = getNotiStyle(noti.type);
                
                return (
                  <div 
                    key={noti._id}
                    className={`flex gap-3 p-4 border-b border-border/40 hover:bg-secondary/40 transition-colors group relative cursor-pointer ${!noti.isRead ? 'bg-primary/[0.03]' : ''}`}
                    onClick={() => {
                      if (!noti.isRead) markAsRead(noti._id);
                      if (noti.actionUrl) navigate(noti.actionUrl);
                    }}
                  >
                    {/* Status Dot */}
                    {!noti.isRead && (
                      <div className="absolute top-1/2 -translate-y-1/2 left-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
                    )}

                    <div className={`mt-0.5 h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${bg}`}>
                      <NotiIcon className={`h-4.5 w-4.5 ${color}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className={`text-[13px] mb-0.5 leading-snug ${!noti.isRead ? 'font-bold text-foreground' : 'font-medium text-foreground/70'}`}>
                        {noti.title}
                      </p>
                      <p className="text-[12px] text-muted-foreground line-clamp-2 leading-relaxed">
                        {noti.message}
                      </p>
                      <span className="text-[10px] text-muted-foreground/60 mt-2 block font-medium uppercase tracking-tight">
                        {formatDistanceToNow(new Date(noti.createdAt), { addSuffix: true, locale: vi })}
                      </span>
                    </div>

                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNoti(noti._id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-muted-foreground hover:text-destructive transition-all shrink-0 self-start mt-1 rounded-md hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}

        {/* Footer */}
        <div className="p-2 border-t border-border bg-muted/30 text-center">
            <button className="text-[11px] font-semibold text-muted-foreground hover:text-primary transition-colors">
                Xem tất cả thông báo
            </button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}