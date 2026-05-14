import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, HardDrive, ArrowRight, Loader2 } from "lucide-react"; // Thêm Loader2
import { AuthInput } from "@/components/ui/auth-input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/stores/authStore";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Kiểm tra cơ bản
    if (!email || !password) return;

    try {
      // Gọi hàm login từ Zustand store
      await login({ email, password });
      
      // Đăng nhập thành công thì điều hướng vào trang quản lý file
      navigate("/"); 
    } catch (error) {
      // Lỗi (sai pass, tài khoản không tồn tại, bị ban...) đã được Toast xử lý hiển thị ở useAuthStore
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md rounded-2xl bg-card p-8 shadow-lg">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
              <HardDrive className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-card-foreground">CloudSpace</span>
          </div>

          <h1 className="text-3xl font-bold text-card-foreground mb-2">Welcome back</h1>
          <p className="text-muted-foreground mb-8">Login for continuing smart management file</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AuthInput
              label="Email"
              type="email"
              placeholder="your@email.com"
              icon={<Mail className="h-5 w-5" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-foreground">Password</label>
              </div>
              
              {/* Khối Input và Icon */}
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Lock className="h-5 w-5" />
                </span>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="flex h-12 w-full rounded-lg border border-input bg-card pl-12 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              {/* Khối Quên mật khẩu được đưa xuống dưới */}
              <div className="flex justify-end mt-2">
                <Link to="/forgot-password" className="text-sm font-medium text-primary hover:underline">
                  Forget password?
                </Link>
              </div>
            </div>                
            
            <Button 
              type="submit" 
              className="w-full h-12 text-base font-semibold mt-2 gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Login <ArrowRight className="h-5 w-5" />
                </>
              )}
            </Button>
          </form>

          <div className="relative my-6">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-4 text-sm text-muted-foreground">
              or
            </span>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            No account yet?{" "}
            <Link to="/register" className="font-medium text-primary hover:underline">
              Register now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;