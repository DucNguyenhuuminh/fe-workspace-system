import { useState } from "react";
import { Link } from "react-router-dom";
import { User, Mail, Lock } from "lucide-react";
import { AuthInput } from "@/components/ui/auth-input";
import { Button } from "@/components/ui/button";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: integrate with backend
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md rounded-2xl bg-card p-8 shadow-lg">
        <div className="flex flex-col items-center mb-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary mb-4">
            <Lock className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-card-foreground">Đăng ký tài khoản</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Hệ thống sẽ tự động tạo <span className="text-primary font-medium">My Drive</span> cá nhân cho bạn
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <AuthInput
            label="Họ và tên"
            placeholder="Nguyễn Văn A"
            icon={<User className="h-5 w-5" />}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <AuthInput
            label="Email"
            type="email"
            placeholder="your@email.com"
            icon={<Mail className="h-5 w-5" />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <AuthInput
            label="Mật khẩu"
            type="password"
            placeholder="••••••••"
            icon={<Lock className="h-5 w-5" />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" className="w-full h-12 text-base font-semibold mt-2">
            Đăng ký
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Đã có tài khoản?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;