export default function WorkspaceMain() {
  return (
    <div className="h-full flex flex-col">
      {/* 헤더 - 데스크톱에서만 표시 */}
      <header className="hidden lg:block border-b border-border p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-semibold">Main Workspace</h1>
          <p className="text-muted-foreground mt-1">
            Welcome to your workspace
          </p>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-6">
          {/* 콘텐츠 영역 */}
        </div>
      </div>
    </div>
  );
}
