import { Outlet } from "react-router";
import { WorkspaceSidebar } from "./WorkspaceSidebar";

export default function WorkspaceLayout() {
  return (
    <div className="flex h-screen bg-background">
      {/* 사이드바 */}
      <WorkspaceSidebar />
      
      {/* 메인 콘텐츠 영역 */}
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}