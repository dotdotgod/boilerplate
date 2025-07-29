import { NavLink } from "react-router";
import { Button } from "@/components/ui/button";
import { Plus, Home, MessageSquare, X } from "lucide-react";
import { ProfileSection } from "./ProfileSection";

interface WorkspaceSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function WorkspaceSidebar({ isOpen = true, onClose }: WorkspaceSidebarProps) {
  const navigationItems = [
    {
      to: "/workspace",
      icon: Home,
      label: "Main",
      exact: true,
    },
    {
      to: "/workspace/chat",
      icon: MessageSquare, 
      label: "Chat",
      exact: false,
    },
  ];

  const handleNavClick = () => {
    // 모바일에서 메뉴 항목 클릭 시 사이드바 닫기
    if (window.innerWidth < 1024 && onClose) {
      onClose();
    }
  };

  return (
    <div 
      className={`
        w-80 bg-muted border-r border-border flex flex-col
        fixed lg:static inset-y-0 left-0 z-50
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}
    >
      {/* 헤더 - 새 작업 버튼 + 모바일 닫기 버튼 */}
      <div className="p-4 border-b border-border flex items-center gap-2">
        <Button 
          className="flex-1 flex items-center gap-2 justify-start"
          variant="outline"
        >
          <Plus className="h-4 w-4" />
          New Task
        </Button>
        {/* 모바일 닫기 버튼 */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="lg:hidden"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* 네비게이션 메뉴 */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.exact}
            onClick={handleNavClick}
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