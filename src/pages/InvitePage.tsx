import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Users, ShieldCheck, Loader2, ArrowRight, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { workspaceInviteService } from "@/services/inviteService";
import { useAuthStore } from "@/stores/authStore";

const InvitePage = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  
  const [inviteInfo, setInviteInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [joinMessage, setJoinMessage] = useState("");
  const [joinStatus, setJoinStatus] = useState<'none' | 'pending' | 'approved'>('none');

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const data = await workspaceInviteService.getInviteInfo(token!);
        setInviteInfo(data);
      } catch (err: any) {
        setError(err.response?.data?.message || "The link is invalid or has expired");
      } finally {
        setIsLoading(false);
      }
    };
    fetchInfo();
  }, [token]);

  const handleJoin = async () => {
    if (!isAuthenticated) {
      toast.warning("Please log in to join Workspace!");
      navigate('/login'); // Có thể truyền thêm state redirect back về trang này
      return;
    }

    setIsJoining(true);
    try {
      const data = await workspaceInviteService.joinWorkspace(token!, joinMessage);
      setJoinStatus(data.status);
      toast.success(data.status === 'approved' ? "Successfully joined" : "Request to participate has been submitted");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "An error occurred while joining");
    } finally {
      setIsJoining(false);
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="h-8 w-8 animate-spin text-indigo-500" /></div>;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md w-full">
          <ShieldCheck className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Unable to access</h2>
          <p className="text-slate-500">{error}</p>
          <Button onClick={() => navigate('/')} className="mt-6 w-full">Back to homepage</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden max-w-md w-full border border-slate-100 p-8">
        
        <div className="h-16 w-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Users className="h-8 w-8" />
        </div>
        
        <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">Invitation to participate</h2>
        <p className="text-center text-lg font-semibold text-indigo-600 mb-6">{inviteInfo.workspaceName}</p>
        
        <div className="flex justify-center gap-6 mb-8 border-y border-slate-100 py-4">
          <div className="text-center">
            <p className="text-xl font-bold text-slate-800">{inviteInfo.memberCount}</p>
            <p className="text-xs text-slate-500 uppercase tracking-wider">Members</p>
          </div>
          <div className="text-center border-l border-slate-100 pl-6">
            <p className="text-xl font-bold text-slate-800">
              {inviteInfo.autoApprove ? <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto" /> : <Clock className="h-6 w-6 text-amber-500 mx-auto" />}
            </p>
            <p className="text-xs text-slate-500 uppercase tracking-wider">Approve</p>
          </div>
        </div>

        {joinStatus === 'none' ? (
          <div className="space-y-4">
            {!inviteInfo.autoApprove && (
              <Input 
                placeholder="Message for Admin (Optional)..." 
                value={joinMessage} 
                onChange={(e) => setJoinMessage(e.target.value)} 
                className="bg-slate-50 h-12"
              />
            )}
            <Button onClick={handleJoin} disabled={isJoining} className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-base">
              {isJoining ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
              Join Workspace
            </Button>
          </div>
        ) : joinStatus === 'approved' ? (
          <div className="text-center space-y-4">
            <div className="p-4 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-medium">You have become a member</div>
            <Button onClick={() => navigate(`/workspaces/${inviteInfo.workspaceId}`)} className="w-full h-12">Đi tới Workspace <ArrowRight className="h-4 w-4 ml-2"/></Button>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <div className="p-4 bg-amber-50 text-amber-700 rounded-xl text-sm font-medium">The request has been submitted. Please wait for administrator approval</div>
            <Button variant="outline" onClick={() => navigate('/')} className="w-full h-12">Back to homepage</Button>
          </div>
        )}

      </div>
    </div>
  );
};

export default InvitePage;