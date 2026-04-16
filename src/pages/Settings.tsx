import { useState } from "react";
import { User, Bell, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import AppLayout from "@/components/layout/AppLayout";

const SettingsPage = () => {
  const [name, setName] = useState("Nguyễn Văn A");
  const [email, setEmail] = useState("user@company.com");
  const [notifications, setNotifications] = useState({
    newFile: true,
    shared: true,
    uploadComplete: false,
  });

  return (
    <AppLayout>
      <div className="max-w-3xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Cài đặt</h1>
          <p className="text-muted-foreground text-sm mt-1">Quản lý tài khoản và tùy chỉnh hệ thống</p>
        </div>

        {/* Personal info */}
        <div className="rounded-xl border border-border bg-card p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <User className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold text-foreground">Thông tin cá nhân</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Họ và tên</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} className="h-11" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Email</label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} className="h-11" />
            </div>
            <Button>Lưu thay đổi</Button>
          </div>
        </div>

        {/* Notifications */}
        <div className="rounded-xl border border-border bg-card p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold text-foreground">Thông báo</h2>
          </div>
          <div className="space-y-4">
            {[
              { key: "newFile" as const, label: "Thông báo khi có file mới" },
              { key: "shared" as const, label: "Thông báo khi được chia sẻ file" },
              { key: "uploadComplete" as const, label: "Thông báo hoàn thành upload" },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between py-2">
                <span className="text-sm text-foreground">{item.label}</span>
                <Checkbox
                  checked={notifications[item.key]}
                  onCheckedChange={(checked) =>
                    setNotifications((prev) => ({ ...prev, [item.key]: !!checked }))
                  }
                />
              </div>
            ))}
          </div>
        </div>

        {/* Security */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold text-foreground">Bảo mật</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Mật khẩu hiện tại</label>
              <Input type="password" placeholder="••••••••" className="h-11" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Mật khẩu mới</label>
              <Input type="password" placeholder="••••••••" className="h-11" />
            </div>
            <Button>Đổi mật khẩu</Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default SettingsPage;
