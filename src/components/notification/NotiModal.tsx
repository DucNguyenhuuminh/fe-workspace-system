import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Bell, Check, Trash2, Loader2, File, Users, Folder, Info, ShieldCheck, UserCheck, UserPlus, Share2, DownloadCloud, XCircle } from "lucide-react";
import { useNotiStore } from "@/stores/notiStore";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

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
    case 'USER_REGISTERED': 
      return { icon: UserCheck, color: "text-purple-500", bg: "bg-purple-500/10" };
    case 'PASSWORD_RESET': 
      return { icon: ShieldCheck, color: "text-rose-500", bg: "bg-rose-500/10" };
    case 'JOIN_REQUEST':
      return { icon: UserPlus, color: "text-indigo-500", bg: "bg-indigo-500/10" };
    case 'JOIN_REJECTED': 
      return { icon: XCircle, color: "text-red-500", bg: "bg-red-500/10" };
    case 'SHARE_ACCESSED':
      return { icon: Share2, color: "text-teal-500", bg: "bg-teal-500/10" };
    case 'SHARE_SAVED':
      return { icon: DownloadCloud, color: "text-cyan-600", bg: "bg-cyan-600/10" };
    default: 
      return { icon: Bell, color: "text-slate-500", bg: "bg-slate-100" };
  }
};

export function NotificationModal() {
  const navigate = useNavigate();
  const { 
    isModalOpen, setModalOpen,
    notifications, unreadCount, isLoading, hasMore, page,
    fetchNotifications, markAsRead, markAllAsRead, deleteNoti 
  } = useNotiStore();

  return (
    <Dialog open={isModalOpen} onOpenChange={setModalOpen}>
      <DialogContent className="sm:max-w-[700px] bg-[#f4f6fc] p-6 border-none shadow-2xl">
        
        {/* HEADER CỦA MODAL */}
        <DialogHeader className="mb-4 flex flex-row items-center justify-between pr-6">
          <DialogTitle className="text-xl font-semibold text-slate-800 flex items-center gap-2">
            <Bell className="h-5 w-5 text-indigo-500" /> All notifications
          </DialogTitle>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" className="gap-2 border-indigo-200 text-indigo-600 hover:bg-indigo-50" onClick={markAllAsRead}>
              <Check className="h-4 w-4" /> Mark as read all
            </Button>
          )}
        </DialogHeader>

        {/* NỘI DUNG (CUỘN ĐƯỢC) */}
        <div className="border border-slate-200 rounded-2xl divide-y divide-slate-100 max-h-[60vh] overflow-y-auto bg-white shadow-sm hide-scrollbar">
          {notifications.length === 0 && !isLoading ? (
            <div className="flex flex-col items-center justify-center p-16 text-muted-foreground">
              <Bell className="h-12 w-12 opacity-20 mb-3" />
              <p>You haven't received any notifications yet</p>
            </div>
          ) : (
            notifications.map((noti) => {
              const { icon: NotiIcon, color, bg } = getNotiStyle(noti.type);
              
              return (
                <div 
                  key={noti._id}
                  className={`flex items-start gap-4 p-4 hover:bg-slate-50 transition-colors cursor-pointer group relative ${!noti.isRead ? 'bg-indigo-50/30' : ''}`}
                  onClick={() => {
                    if (!noti.isRead) markAsRead(noti._id);
                    if (noti.actionUrl) {
                      setModalOpen(false); // Đóng modal trước khi chuyển trang
                      navigate(noti.actionUrl);
                    }
                  }}
                >
                  {/* Chấm xanh báo chưa đọc */}
                  {!noti.isRead && (
                    <div className="absolute top-1/2 -translate-y-1/2 left-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  )}
                  
                  <div className={`mt-0.5 h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${bg}`}>
                    <NotiIcon className={`h-5 w-5 ${color}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0 pr-4">
                    <p className={`text-[15px] mb-0.5 ${!noti.isRead ? 'font-bold text-slate-800' : 'font-medium text-slate-700'}`}>
                      {noti.title}
                    </p>
                    <p className="text-[13.5px] text-slate-500 leading-relaxed">
                      {noti.message}
                    </p>
                    <span className="text-[11px] text-slate-400 mt-2 block font-medium uppercase tracking-wider">
                      {formatDistanceToNow(new Date(noti.createdAt), { addSuffix: true, locale: vi })}
                    </span>
                  </div>

                  <button 
                    onClick={(e) => { e.stopPropagation(); deleteNoti(noti._id); }}
                    className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-500 transition-all shrink-0 rounded-lg hover:bg-red-50"
                    title="Delete notification"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* NÚT TẢI THÊM NẰM Ở DƯỚI CÙNG MODAL */}
        {hasMore && (
          <div className="flex justify-center mt-4">
            <Button 
              variant="secondary" 
              onClick={() => fetchNotifications(page + 1)} 
              disabled={isLoading}
              className="w-[200px] bg-slate-200 hover:bg-slate-300 text-slate-700"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {isLoading ? "Đang tải..." : "Tải thêm cũ hơn"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}