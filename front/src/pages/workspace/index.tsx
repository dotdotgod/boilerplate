export default function WorkspaceMain() {
  return (
    <div className="h-full flex flex-col">
      {/* 헤더 */}
      <header className="border-b border-border p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-semibold">Main Workspace</h1>
          <p className="text-muted-foreground mt-1">
            Start a new task or continue with recent work
          </p>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-6 space-y-8">
          {/* 빠른 시작 섹션 */}
          <section>
            <h2 className="text-lg font-medium mb-4">Quick Start</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <h3 className="font-medium mb-2">New Project</h3>
                <p className="text-sm text-muted-foreground">
                  Start a new project
                </p>
              </div>
              
              <div className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <h3 className="font-medium mb-2">Use Template</h3>
                <p className="text-sm text-muted-foreground">
                  Start quickly with pre-made templates
                </p>
              </div>
              
              <div className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <h3 className="font-medium mb-2">Upload File</h3>
                <p className="text-sm text-muted-foreground">
                  Upload existing files to work with
                </p>
              </div>
            </div>
          </section>

          {/* 최근 활동 섹션 */}
          <section>
            <h2 className="text-lg font-medium mb-4">Recent Activity</h2>
            <div className="space-y-3">
              <div className="p-4 border border-border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">No activity yet</h3>
                    <p className="text-sm text-muted-foreground">
                      Start your first task
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Just now
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
