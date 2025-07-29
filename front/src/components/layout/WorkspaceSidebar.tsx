import { NavLink } from "react-router";
import { Button } from "@/components/ui/button";
import { Plus, Home, MessageSquare } from "lucide-react";
import { ProfileSection } from "./ProfileSection";

export function WorkspaceSidebar() {
  const navigationItems = [
    {
      to: "/workspace",
      icon: Home,
      label: "Main",
      exact: true,
    },
    {
      to: "/workspace/sessions",
      icon: MessageSquare, 
      label: "Sessions",
      exact: false,
    },
  ];

  return (
    <div className="w-80 bg-muted/30 border-r border-border flex flex-col">
      {/* 헤더 - 새 작업 버튼 */}
      <div className="p-4 border-b border-border">
        <Button 
          className="w-full flex items-center gap-2 justify-start"
          variant="outline"
        >
          <Plus className="h-4 w-4" />
          New Task
        </Button>
      </div>

      {/* 네비게이션 메뉴 */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.exact}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* 하단 프로필 섹션 */}
      <ProfileSection />
    </div>
  );
}