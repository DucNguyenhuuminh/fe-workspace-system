import { useState } from "react";
import { User, Bell, Shield, Palette, Globe, HardDrive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import AppLayout from "@/components/layout/AppLayout";

const SettingsPage = () => {
  const [name, setName] = useState("Nguyễn Văn A");
  const [email, setEmail] = useState("user@company.com");
  const [language, setLanguage] = useState("vi");
  const [theme, setTheme] = useState("light");
  const [twoFactor, setTwoFactor] = useState(false);
  const [notifications, setNotifications] = useState({
    sharedFile: true,
    workspaceInvite: true,
    uploadComplete: false,
    comments: true,
    trashActivity: false,
  });

  const usedStorage = 6.4;
  const totalStorage = 15;
  const usedPercent = (usedStorage / totalStorage) * 100;

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Cài đặt</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Quản lý tài khoản và tùy chỉnh hệ thống
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Profile summary */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile card */}
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex flex-col items-center text-center">
                <div className="h-24 w-24 rounded-full bg-primary flex items-center justify-center mb-4">
                  <User className="h-12 w-12 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{name}</h3>
                <p className="text-sm text-muted-foreground">{email}</p>
                <Button variant="outline" size="sm" className="mt-4 w-full">
                  Đổi ảnh đại diện
                </Button>
              </div>
            </div>

            {/* Storage card */}
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <HardDrive className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-base font-semibold text-foreground">
                  Dung lượng lưu trữ
                </h2>
              </div>
              <Progress value={usedPercent} className="h-2 mb-3" />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Đã dùng {usedStorage} GB
                </span>
                <span className="text-foreground font-medium">
                  {totalStorage} GB
                </span>
              </div>
              <Button variant="outline" size="sm" className="w-full mt-4">
                Nâng cấp dung lượng
              </Button>
            </div>

            {/* Preferences card */}
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <Palette className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-base font-semibold text-foreground">
                  Tùy chỉnh giao diện
                </h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Giao diện
                  </label>
                  <Select value={theme} onValueChange={setTheme}>
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Sáng</SelectItem>
                      <SelectItem value="dark">Tối</SelectItem>
                      <SelectItem value="system">Theo hệ thống</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Ngôn ngữ
                  </label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vi">Tiếng Việt</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Right column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal info */}
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <User className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-lg font-semibold text-foreground">
                  Thông tin cá nhân
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Họ và tên
                  </label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-11"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Email
                  </label>
                  <Input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Số điện thoại
                  </label>
                  <Input placeholder="+84..." className="h-11" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Phòng ban
                  </label>
                  <Input placeholder="Vd: Marketing" className="h-11" />
                </div>
              </div>
              <div className="mt-6">
                <Button>Lưu thay đổi</Button>
              </div>
            </div>

            {/* Notifications */}
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-lg font-semibold text-foreground">
                  Thông báo
                </h2>
              </div>
              <div className="space-y-1">
                {[
                  {
                    key: "sharedFile" as const,
                    label: "Khi có người chia sẻ file với bạn",
                    desc: "Nhận thông báo khi đồng nghiệp chia sẻ tài liệu",
                  },
                  {
                    key: "workspaceInvite" as const,
                    label: "Khi được thêm vào workspace mới",
                    desc: "Nhận thông báo khi tham gia workspace",
                  },
                  {
                    key: "uploadComplete" as const,
                    label: "Khi upload file hoàn tất",
                    desc: "Nhận thông báo sau khi tải lên thành công",
                  },
                  {
                    key: "comments" as const,
                    label: "Khi có bình luận mới trên tài liệu",
                    desc: "Nhận thông báo khi có người bình luận",
                  },
                  {
                    key: "trashActivity" as const,
                    label: "Khi file được chuyển vào thùng rác",
                    desc: "Nhận thông báo khi tài liệu bị xóa",
                  },
                ].map((item, idx, arr) => (
                  <div
                    key={item.key}
                    className={`flex items-center justify-between py-3 ${
                      idx !== arr.length - 1 ? "border-b border-border" : ""
                    }`}
                  >
                    <div className="flex-1 pr-4">
                      <p className="text-sm font-medium text-foreground">
                        {item.label}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                    <Checkbox
                      checked={notifications[item.key]}
                      onCheckedChange={(checked) =>
                        setNotifications((prev) => ({
                          ...prev,
                          [item.key]: !!checked,
                        }))
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Mật khẩu hiện tại
                  </label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className="h-11"
                  />
                </div>
                <div className="hidden md:block" />
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Mật khẩu mới
                  </label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className="h-11"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Xác nhận mật khẩu mới
                  </label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className="h-11"
                  />
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between py-3 border-t border-border">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Xác thực 2 lớp (2FA)
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Bảo vệ tài khoản bằng mã xác thực bổ sung
                  </p>
                </div>
                <Switch checked={twoFactor} onCheckedChange={setTwoFactor} />
              </div>
              <div className="mt-6 flex gap-3">
                <Button>Đổi mật khẩu</Button>
                <Button variant="outline">Đăng xuất khỏi tất cả thiết bị</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default SettingsPage;
