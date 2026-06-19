import { useState, useEffect } from "react";
import { Link, Copy, Trash2, Clock, Lock, Shield, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { shareService } from "@/services/shareService";
import { toast } from "sonner";
import { formatDate } from "@/utils/fileUtils";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileId: string | null;
  fileName: string;
}

const ShareModal = ({ isOpen, onClose, fileId, fileName }: ShareModalProps) => {
  const [links, setLinks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Form states
  const [expiresIn, setExpiresIn] = useState<string>("0");
  const [password, setPassword] = useState("");
  const [allowedDownload, setAllowedDownload] = useState(true);
  const [allowedSave, setAllowedSave] = useState(true);

  useEffect(() => {
    if (isOpen && fileId) fetchLinks();
  }, [isOpen, fileId]);

  const fetchLinks = async () => {
    if (!fileId) return;
    setIsLoading(true);
    try {
      const data = await shareService.getShareLinks(fileId);
      setLinks(data);
    } catch (error) {
      toast.error("Unable to load the list of links");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateLink = async () => {
    if (!fileId) return;
    setIsGenerating(true);
    try {
      const payload = {
        permissions: allowedDownload ? ['view', 'download', 'save'] : ['view'],
        expiresInHours: expiresIn === "0" ? null : parseInt(expiresIn),
        password: password || null,
        settings: { allowedDownload, allowedSave }
      };

      const newLink = await shareService.createShareLink(fileId, payload);
      toast.success("Link created successfully");
      
      // Reset form & reload list
      setPassword("");
      fetchLinks();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error creating link");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRevoke = async (token: string) => {
    if (!fileId) return;
    try {
      await shareService.revokeShareLink(fileId, token);
      toast.success("Link has been removed");
      fetchLinks();
    } catch (error) {
      toast.error("Error when retrieving link");
    }
  };

  const handleCopy = (token: string) => {
    const url = `${window.location.origin}/share/${token}`;
    navigator.clipboard.writeText(url);
    toast.success("The link has been copied to the clipboard");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Link className="h-5 w-5 text-indigo-500" />
            Chia sẻ: <span className="text-slate-500 font-normal truncate">{fileName}</span>
          </DialogTitle>
        </DialogHeader>

        {/* --- FORM TẠO LINK MỚI --- */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
          <h3 className="font-semibold text-sm text-slate-800">Create a new link</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-500 flex items-center gap-1"><Clock className="h-3 w-3"/>Expires after</label>
              <Select value={expiresIn} onValueChange={setExpiresIn}>
                <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Never</SelectItem>
                  <SelectItem value="1">1 hour</SelectItem>
                  <SelectItem value="24">1 day</SelectItem>
                  <SelectItem value="168">7 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-500 flex items-center gap-1"><Lock className="h-3 w-3"/> Password (Optional)</label>
              <Input type="text" placeholder="Leave blank if public..." value={password} onChange={(e) => setPassword(e.target.value)} className="bg-white" />
            </div>
          </div>

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input type="checkbox" checked={allowedDownload} onChange={(e) => setAllowedDownload(e.target.checked)} className="rounded text-indigo-600 border-slate-300 focus:ring-indigo-500" />
              Allow download
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input type="checkbox" checked={allowedSave} onChange={(e) => setAllowedSave(e.target.checked)} disabled={!allowedDownload} className="rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 disabled:opacity-50" />
              Allow saving to MySpace
            </label>
            
            <Button onClick={handleGenerateLink} disabled={isGenerating} className="ml-auto bg-indigo-600 hover:bg-indigo-700">
              {isGenerating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Link className="h-4 w-4 mr-2" />}
              Create Link
            </Button>
          </div>
        </div>

        {/* --- DANH SÁCH LINK ĐÃ TẠO --- */}
        <div className="mt-2 space-y-3">
          <h3 className="font-semibold text-sm text-slate-800">The links are working</h3>
          <div className="max-h-[250px] overflow-y-auto space-y-2 pr-1">
            {isLoading ? (
              <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-slate-400" /></div>
            ) : links.length === 0 ? (
              <p className="text-center text-sm text-slate-500 py-4">No links have been created yet</p>
            ) : (
              links.map((link) => (
                <div key={link.token} className={`p-3 rounded-lg border flex items-center justify-between ${link.isRevoked ? 'bg-red-50 border-red-100 opacity-60' : 'bg-white border-slate-200'}`}>
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-slate-700 truncate w-48">{window.location.origin}/share/{link.token}</span>
                      {link.password && <Lock className="h-3 w-3 text-amber-500" aria-label="Have password" />}
                      {!link.settings?.allowedDownload && <Shield className="h-3 w-3 text-red-400" aria-label="Block downloads" />}
                    </div>
                    <p className="text-xs text-slate-500">
                      Tạo lúc: {formatDate(link.createdAt)} 
                      {link.expiredAt && ` • Expired: ${formatDate(link.expiredAt)}`}
                      {link.isRevoked && <span className="text-red-500 font-medium ml-2">(Revoked)</span>}
                    </p>
                  </div>
                  
                  {!link.isRevoked && (
                    <div className="flex items-center gap-1 shrink-0">
                      <Button variant="outline" size="sm" className="h-8" onClick={() => handleCopy(link.token)}>
                        <Copy className="h-4 w-4 mr-1" /> Copy
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleRevoke(link.token)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareModal;