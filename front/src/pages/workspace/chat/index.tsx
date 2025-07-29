import { ChatInterface } from '@/components/chat/ChatInterface';

export default function ChatPage() {
  return (
    <div className="h-full flex flex-col">
      {/* 헤더 - 데스크톱에서만 표시 */}
      <header className="hidden lg:block border-b border-border p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-semibold">AI Assistant</h1>
          <p className="text-muted-foreground mt-1">
            Chat with AI to help with your tasks
          </p>
        </div>
      </header>
      
      {/* 메인 콘텐츠 */}
      <div className="flex-1 overflow-hidden p-6">
        <ChatInterface />
      </div>
    </div>
  );
}