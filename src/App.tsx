import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Loader2 } from "lucide-react";

import { useAuthStore } from "@/stores/authStore";

import Login from "./pages/Login";
import Register from "./pages/Register";
import MyDrive from "./pages/MySpace";
import Workspaces from "./pages/Workspaces";
import WorkspaceDetail from "./pages/WorkspaceDetails";
import SettingsPage from "./pages/Settings";
import Trash from "./pages/Trash";
import AdminLayout from "@/components/layout/AdminLayout";
import AdminDashboard from "@/pages/AdminDashboard";
import SharePage from "@/pages/SharePage";
import InvitePage from "@/pages/InvitePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const { fetchProfile, user } = useAuthStore();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      const token = localStorage.getItem("accessToken");

      if (token && !user) {
        try {
          await fetchProfile();
        } catch (error) {
          console.error("Token không hợp lệ hoặc đã hết hạn", error);
        }
      }
      setIsInitializing(false);
    };

    initializeApp();
  }, [fetchProfile, user]);

  if (isInitializing) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground font-medium text-sm">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<MyDrive />} />
            <Route path="/workspaces" element={<Workspaces />} />
            <Route path="/workspaces/:id" element={<WorkspaceDetail />} /> 
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/trash" element={<Trash />} />
            <Route path="/share/:token" element={<SharePage />} />
            <Route path="/invite/:token" element={<InvitePage />} />
            <Route path="*" element={<NotFound />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;