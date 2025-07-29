export default function MainPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 */}
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">Boilerplate App</h1>
            </div>
            <nav className="flex space-x-4">
              <a href="/sign-in" className="text-muted-foreground hover:text-foreground">
                Sign In
              </a>
              <a href="/sign-up" className="text-muted-foreground hover:text-foreground">
                Sign Up
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
            Welcome to Boilerplate
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            A modern React TypeScript boilerplate with authentication, state management, and more.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <a
              href="/workspace"
              className="rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Get started
            </a>
            <a href="/sign-up" className="text-sm font-semibold leading-6 text-foreground">
              Sign up <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>

        {/* 특징 섹션 */}
        <div className="mt-16">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-foreground">Modern Stack</h3>
              <p className="mt-2 text-muted-foreground">
                Built with React 18, TypeScript, Vite, and Tailwind CSS
              </p>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-foreground">Authentication</h3>
              <p className="mt-2 text-muted-foreground">
                Complete auth system with JWT tokens and protected routes
              </p>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-foreground">State Management</h3>
              <p className="mt-2 text-muted-foreground">
                Zustand for efficient and scalable state management
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
