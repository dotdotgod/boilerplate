import { useState } from "react";
import { Outlet, useLocation } from "react-router";
import { WorkspaceSidebar } from "./WorkspaceSidebar";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export default function WorkspaceLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  // 현재 경로에 따른 페이지 제목
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/workspace") return "Main Workspace";
    if (path === "/workspace/chat") return "Chat";
    return "Workspace";
  };

  return (
    <div className="flex h-screen bg-background">
      {/* 모바일 헤더 */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
        <div className="flex items-center h-14 px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(true)}
            className="h-9 w-9"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="ml-3 text-lg font-semibold">{getPageTitle()}</h1>
        </div>
      </header>

      {/* 모바일 배경 오버레이 */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* 사이드바 */}
      <WorkspaceSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      {/* 메인 콘텐츠 영역 */}
      <main className="flex-1 overflow-hidden">
        {/* 모바일에서 헤더 높이만큼 패딩 추가 */}
        <div className="h-full lg:h-full pt-14 lg:pt-0">
          <Outlet />
        </div>
      </main>
    </div>
  );
}