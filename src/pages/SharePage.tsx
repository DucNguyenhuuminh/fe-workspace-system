import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { FileText, Download, Save, Lock, ArrowRight, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { shareService } from "@/services/shareService";
import { formatBytes } from "@/utils/fileUtils";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/authStore";

const SharePage = () => {
  const { token } = useParams<{ token: string }>();
  const { isAuthenticated } = useAuthStore(); // Kiểm tra xem user có đăng nhập không để cho phép Save
  
  const [fileInfo, setFileInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Trạng thái mật khẩu
  const [needsPassword, setNeedsPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordVerified, setPasswordVerified] = useState(false);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const data = await shareService.getSharedFile(token!);
        setFileInfo(data);
        if (data.hasPassword) {
          setNeedsPassword(true);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || "Link does not exist or has expired");
      } finally {
        setIsLoading(false);
      }
    };
    fetchInfo();
  }, [token]);

  const handleVerifyPassword = async () => {
    try {
      const res = await shareService.verifyPassword(token!, password);
      if (res.verified) {
        setNeedsPassword(false);
        setPasswordVerified(true);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Incorrect password");
    }
  };

  const handleView = async () => {
    try {
      toast.info("Opening file...");
      const data = await shareService.accessSharedFile(token!, 'view', passwordVerified ? password : undefined);
      if (data.url) window.open(data.url, '_blank');
    } catch (err) {
      toast.error("Failed to view file");
    }
  };

  const handleDownload = async () => {
    try {
      toast.info("Downloading...");
      const data = await shareService.accessSharedFile(token!, 'download', passwordVerified ? password : undefined);
      if (data.url) {
        const a = document.createElement("a");
        a.href = data.url;
        a.download = fileInfo.fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (err) {
      toast.error("No permission to download");
    }
  };

  const handleSaveToMySpace = async () => {
    try {
      const toastId = toast.loading("Saving to MySpace...");
      await shareService.saveToMySpace(token!, passwordVerified ? password : undefined, null);
      toast.success("Saved successfully! Please check your MySpace.", { id: toastId });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Error saving file");
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="h-8 w-8 animate-spin text-indigo-500" /></div>;

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4 opacity-80" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Access Denied</h2>
          <p className="text-slate-500">{error}</p>
        </div>
      </div>
    );
  }

  if (needsPassword) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-slate-100">
          <div className="h-12 w-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4"><Lock className="h-6 w-6" /></div>
          <h2 className="text-xl font-bold text-center text-slate-800 mb-2">Protected File</h2>
          <p className="text-center text-sm text-slate-500 mb-6">Please enter the password to view <strong className="text-slate-700">{fileInfo.fileName}</strong></p>
          
          <div className="space-y-4">
            <Input type="password" placeholder="Enter password..." value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleVerifyPassword()} className="h-12 text-center text-lg tracking-widest" />
            <Button onClick={handleVerifyPassword} className="w-full h-12 text-base bg-indigo-600 hover:bg-indigo-700">Confirm <ArrowRight className="h-4 w-4 ml-2" /></Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-2xl w-full flex flex-col md:flex-row border border-slate-100">
        
        {/* Phần hiển thị Icon File */}
        <div className="md:w-2/5 bg-gradient-to-br from-indigo-500 to-purple-600 p-12 flex flex-col items-center justify-center text-white">
          <div className="bg-white/20 p-6 rounded-2xl backdrop-blur-sm mb-6 shadow-inner">
            <FileText className="h-24 w-24 text-white" strokeWidth={1.5} />
          </div>
          <h3 className="font-bold text-center truncate w-full px-4" title={fileInfo.fileName}>{fileInfo.fileName}</h3>
          <p className="text-indigo-100 text-sm mt-2">{formatBytes(fileInfo.fileSize)}</p>
        </div>

        {/* Phần Thao tác */}
        <div className="md:w-3/5 p-8 flex flex-col justify-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Shared Document</h2>
          <p className="text-slate-500 mb-8 text-sm">You have been granted access to this document. Please select an action below.</p>

          <div className="space-y-4">
            <Button onClick={handleView} className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-base">
              <FileText className="h-5 w-5 mr-2" /> View Online
            </Button>
            
            {fileInfo.settings?.allowedDownload && (
              <Button onClick={handleDownload} variant="outline" className="w-full h-12 border-2 border-indigo-100 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-200 text-base">
                <Download className="h-5 w-5 mr-2" /> Download
              </Button>
            )}

            {fileInfo.settings?.allowedSave && (
              <Button 
                onClick={handleSaveToMySpace} 
                disabled={!isAuthenticated}
                variant="secondary" 
                className="w-full h-12 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-base mt-4"
              >
                <Save className="h-5 w-5 mr-2" /> 
                {isAuthenticated ? "Save a copy to MySpace" : "Log in to save to MySpace"}
              </Button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default SharePage;