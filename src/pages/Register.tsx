import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, Loader2 } from "lucide-react"; // Thêm Loader2 cho hiệu ứng loading
import { AuthInput } from "@/components/ui/auth-input";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/authStore";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const navigate = useNavigate();
  const { register, isLoading } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Kiểm tra cơ bản
    if (!name || !email || !password) return;

    try {
      // Backend của bạn yêu cầu body có dạng: { email, password, username, globalRole }
      await register({ 
        username: name, 
        email, 
        password, 
        globalRole: "USER" 
      });
      
      // Chuyển hướng về trang đăng nhập sau khi thành công
      navigate("/login");
    } catch (error) {
      // Lỗi đã được Toast xử lý bên trong useAuthStore, 
      // ở đây không cần làm gì thêm, form vẫn giữ nguyên để người dùng sửa.
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md rounded-2xl bg-card p-8 shadow-lg">
        <div className="flex flex-col items-center mb-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary mb-4">
            <Lock className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-card-foreground">Register an account</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            System will automatically create <span className="text-primary font-medium">My Space</span> for you 
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <AuthInput
            label="Your name"
            placeholder="Nguyen Van A"
            icon={<User className="h-5 w-5" />}
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isLoading}
          />
          <AuthInput
            label="Email"
            type="email"
            placeholder="your@email.com"
            icon={<Mail className="h-5 w-5" />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />
          <AuthInput
            label="Password"
            type="password"
            placeholder="••••••••"
            icon={<Lock className="h-5 w-5" />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />
          
          <Button 
            type="submit" 
            className="w-full h-12 text-base font-semibold mt-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Sign now"
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;