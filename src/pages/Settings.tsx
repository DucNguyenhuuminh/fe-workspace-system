import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Bell, Shield, Palette, Globe, HardDrive, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import AppLayout from "@/components/layout/AppLayout";
import { useAuthStore } from "@/stores/authStore";
import { useSettings } from "@/hooks/use-settings"; // Import hook mới

const SettingsPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  
  // Lấy các hàm xử lý từ hook useSettings
  const { isUpdatingProfile, isChangingPassword, updateProfile, changePassword } = useSettings();

  // State Profile
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // State Password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // State Options
  const [twoFactor, setTwoFactor] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.username);
      setEmail(user.email);
    }
  }, [user]);

  const handleLogout = () => {
    logout(); 
  };

  // Action: Lưu thông tin cá nhân
  const handleSaveProfile = () => {
    if (!name.trim()) return;
    updateProfile({ username: name });
  };

  // Action: Đổi mật khẩu
  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      // Thay vì alert, bạn có thể dùng toast ở đây nếu cần
      return; 
    }
    if (newPassword !== confirmPassword) {
      // Toast báo lỗi mật khẩu không khớp (cần import toast từ sonner)
      return; 
    }

    const success = await changePassword({ currentPassword, newPassword });
    if (success) {
      // Xóa trắng form sau khi đổi thành công
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const usedStorage = 6.4; 
  const totalStorage = 15;
  const usedPercent = (usedStorage / totalStorage) * 100;

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Cài đặt</h1>
          <p className="text-muted-foreground text-sm mt-1">Quản lý tài khoản và tùy chỉnh hệ thống</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cột trái */}
          <div className="lg:col-span-1 space-y-6">
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex flex-col items-center text-center">
                <div className="h-24 w-24 rounded-full bg-primary flex items-center justify-center mb-4">
                  <User className="h-12 w-12 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{name || "User"}</h3>
                <p className="text-sm text-muted-foreground">{email}</p>
                <div className="mt-2 text-xs px-2 py-1 bg-secondary rounded-full font-medium">
                  Vai trò: {user?.globalRole === "SYSTEM_ADMIN" ? "Quản trị viên" : "Người dùng"}
                </div>
              </div>
            </div>
            
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <HardDrive className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-base font-semibold text-foreground">Dung lượng lưu trữ</h2>
              </div>
              <Progress value={usedPercent} className="h-2 mb-3" />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Đã dùng {usedStorage} GB</span>
                <span className="text-foreground font-medium">{totalStorage} GB</span>
              </div>
              <Button variant="outline" size="sm" className="w-full mt-4">Nâng cấp dung lượng</Button>
            </div>
          </div>

          {/* Cột phải */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <User className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-lg font-semibold text-foreground">Thông tin cá nhân</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Họ và tên</label>
                  <Input 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    className="h-11" 
                    disabled={isUpdatingProfile}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Email</label>
                  <Input value={email} disabled className="h-11 bg-muted" />
                </div>
              </div>
              <div className="mt-6">
                <Button onClick={handleSaveProfile} disabled={isUpdatingProfile} className="gap-2">
                  {isUpdatingProfile && <Loader2 className="h-4 w-4 animate-spin" />}
                  Lưu thay đổi
                </Button>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-lg font-semibold text-foreground">Bảo mật</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Mật khẩu hiện tại</label>
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    className="h-11"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    disabled={isChangingPassword}
                  />
                </div>
                <div className="hidden md:block" />
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Mật khẩu mới</label>
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    className="h-11"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={isChangingPassword}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Xác nhận mật khẩu mới</label>
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    className="h-11"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isChangingPassword}
                  />
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between py-3 border-t border-border">
                <div>
                  <p className="text-sm font-medium text-foreground">Xác thực 2 lớp (2FA)</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Bảo vệ tài khoản bằng mã xác thực bổ sung</p>
                </div>
                <Switch checked={twoFactor} onCheckedChange={setTwoFactor} />
              </div>
              <div className="mt-6 flex gap-3">
                <Button onClick={handleChangePassword} disabled={isChangingPassword} className="gap-2">
                  {isChangingPassword && <Loader2 className="h-4 w-4 animate-spin" />}
                  Đổi mật khẩu
                </Button>
                <Button variant="outline" className="text-destructive" onClick={handleLogout}>
                  Đăng xuất khỏi thiết bị này
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default SettingsPage;