import { useState, useEffect } from "react";
import { Link, Copy, Trash2, Check, X, Loader2, Users, CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { workspaceInviteService } from "@/services/inviteService";
import { toast } from "sonner";
import { formatDate } from "@/utils/fileUtils";

interface InviteManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
}

const InviteManagerModal = ({ isOpen, onClose, workspaceId }: InviteManagerModalProps) => {
  const [activeTab, setActiveTab] = useState<'links' | 'requests'>('links');
  const [links, setLinks] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [expiresIn, setExpiresIn] = useState<string>("0");
  const [autoApprove, setAutoApprove] = useState(false);

  useEffect(() => {
    if (isOpen) {
      activeTab === 'links' ? fetchLinks() : fetchRequests();
    }
  }, [isOpen, activeTab]);

  const fetchLinks = async () => {
    setIsLoading(true);
    try {
      const data = await workspaceInviteService.getInviteLinks(workspaceId);
      setLinks(data);
    } catch (e) { toast.error("Lỗi tải danh sách link"); }
    finally { setIsLoading(false); }
  };

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const data = await workspaceInviteService.getJoinRequests(workspaceId);
      setRequests(data);
    } catch (e) { toast.error("Lỗi tải danh sách yêu cầu"); }
    finally { setIsLoading(false); }
  };

  const handleCreateLink = async () => {
    try {
      await workspaceInviteService.createInviteLink(workspaceId, {
        expiresInHours: expiresIn === "0" ? null : expiresIn,
        autoApprove
      });
      toast.success("Tạo link thành công");
      fetchLinks();
    } catch (e) { toast.error("Tạo link thất bại"); }
  };

  const handleReviewRequest = async (reqId: string, action: 'approve' | 'reject') => {
    try {
      await workspaceInviteService.reviewRequest(workspaceId, reqId, action);
      toast.success(`Đã ${action === 'approve' ? 'chấp nhận' : 'từ chối'} yêu cầu`);
      fetchRequests();
    } catch (e) { toast.error("Xử lý thất bại"); }
  };

  const handleApproveAll = async () => {
    try {
      const res = await workspaceInviteService.approveAllRequests(workspaceId);
      toast.success(`Đã phê duyệt ${res.approved} yêu cầu`);
      fetchRequests();
    } catch (e) { toast.error("Xử lý thất bại"); }
  };

  const handleCopy = (token: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/invite/${token}`);
    toast.success("Đã copy link!");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[650px] bg-slate-50">
        <DialogHeader>
          <DialogTitle className="text-xl">Quản lý lời mời tham gia</DialogTitle>
        </DialogHeader>

        {/* --- TABS --- */}
        <div className="flex gap-2 border-b border-slate-200 pb-2">
          <button onClick={() => setActiveTab('links')} className={`px-4 py-2 font-medium text-sm rounded-lg transition-colors ${activeTab === 'links' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-100'}`}>Danh sách Link</button>
          <button onClick={() => setActiveTab('requests')} className={`px-4 py-2 font-medium text-sm rounded-lg transition-colors flex items-center gap-2 ${activeTab === 'requests' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-100'}`}>
            Duyệt yêu cầu
            {requests.length > 0 && <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{requests.length}</span>}
          </button>
        </div>

        {/* --- TAB 1: LINKS --- */}
        {activeTab === 'links' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-end gap-4">
              <div className="flex-1 space-y-1.5">
                <label className="text-xs font-medium text-slate-500">Hết hạn sau</label>
                <Select value={expiresIn} onValueChange={setExpiresIn}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Không giới hạn</SelectItem>
                    <SelectItem value="24">1 ngày</SelectItem>
                    <SelectItem value="168">7 ngày</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2 pb-2">
                <input type="checkbox" checked={autoApprove} onChange={(e) => setAutoApprove(e.target.checked)} className="rounded text-indigo-600 w-4 h-4" />
                <label className="text-sm font-medium text-slate-700">Duyệt tự động</label>
              </div>
              <Button onClick={handleCreateLink} className="bg-indigo-600"><Link className="h-4 w-4 mr-2"/> Tạo mới</Button>
            </div>

            <div className="max-h-[300px] overflow-y-auto space-y-2">
              {isLoading ? <div className="text-center py-4"><Loader2 className="h-5 w-5 animate-spin mx-auto text-indigo-500"/></div> : 
               links.map(link => (
                <div key={link.token} className={`bg-white p-3 rounded-lg border flex items-center justify-between ${link.isRevoked ? 'opacity-50' : ''}`}>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">.../invite/{link.token.substring(0,8)}...</span>
                      {link.autoApprove && <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded uppercase font-bold">Auto</span>}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Tạo lúc: {formatDate(link.createdAt)}</p>
                  </div>
                  {!link.isRevoked && (
                    <div className="flex gap-1">
                      <Button variant="outline" size="icon" onClick={() => handleCopy(link.token)}><Copy className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50" onClick={() => { workspaceInviteService.revokeInviteLink(workspaceId, link.token); fetchLinks(); }}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- TAB 2: REQUESTS --- */}
        {activeTab === 'requests' && (
          <div className="space-y-4">
             {requests.length > 0 && (
                <div className="flex justify-end">
                  <Button variant="outline" className="text-emerald-600 border-emerald-200 hover:bg-emerald-50" onClick={handleApproveAll}>
                    <CheckCircle2 className="h-4 w-4 mr-2" /> Duyệt tất cả
                  </Button>
                </div>
             )}
            <div className="max-h-[350px] overflow-y-auto space-y-2">
              {isLoading ? <div className="text-center py-4"><Loader2 className="h-5 w-5 animate-spin mx-auto text-indigo-500"/></div> : 
               requests.length === 0 ? <p className="text-center text-slate-500 text-sm py-8">Không có yêu cầu nào đang chờ.</p> :
               requests.map(req => (
                <div key={req._id} className="bg-white p-3 rounded-lg border flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 bg-indigo-50 rounded-full flex items-center justify-center"><Users className="h-5 w-5 text-indigo-500"/></div>
                    <div className="truncate">
                      <p className="text-sm font-semibold text-slate-800">{req.userName || req.userEmail}</p>
                      {req.message && <p className="text-xs text-slate-500 italic mt-0.5 truncate max-w-[200px]">"{req.message}"</p>}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50" onClick={() => handleReviewRequest(req._id, 'reject')}><X className="h-4 w-4 mr-1"/> Từ chối</Button>
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => handleReviewRequest(req._id, 'approve')}><Check className="h-4 w-4 mr-1"/> Chấp thuận</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default InviteManagerModal;