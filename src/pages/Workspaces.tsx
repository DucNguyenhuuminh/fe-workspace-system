import { useNavigate } from "react-router-dom";
import { Users, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/layout/AppLayout";

const workspaces = [
  { name: "Marketing Team", slug: "marketing-team", desc: "Tài liệu marketing và campaign", members: 8, files: 156, color: "bg-primary" },
  { name: "Phát triển sản phẩm", slug: "phat-trien-san-pham", desc: "Tài liệu kỹ thuật và thiết kế", members: 12, files: 284, color: "bg-purple-500" },
  { name: "HR & Admin", slug: "hr-admin", desc: "Chính sách và quy định nội bộ", members: 5, files: 92, color: "bg-emerald-500" },
  { name: "Sales", slug: "sales", desc: "Tài liệu bán hàng và báo cáo", members: 15, files: 347, color: "bg-orange-500" },
];

const Workspaces = () => {
  const navigate = useNavigate();
  return (
    <AppLayout>
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Workspaces</h1>
            <p className="text-muted-foreground text-sm mt-1">Teamwork space</p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Workspace
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workspaces.map((ws) => (
            <div
              key={ws.name}
              className="rounded-xl border border-border bg-card p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/workspaces/${ws.slug}`)}
            >
              <div className={`h-12 w-12 rounded-xl ${ws.color} flex items-center justify-center mb-4`}>
                <Users className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="text-base font-semibold text-foreground">{ws.name}</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">{ws.desc}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {ws.members} Members
                </span>
                <span>{ws.files} files</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default Workspaces;
