import { useRef, useEffect, useCallback } from "react";
import { useChat } from "@ai-sdk/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Send, User, Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import axios from "axios";
import { useNavigate } from "react-router";

export function ChatInterface() {
  const { setAccessToken, reset } = useAuthStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const handleRefreshToken = useCallback(async () => {
    try {
      const response = await axios.post(
        "/v1/user/refresh",
        {},
        {
          withCredentials: true,
        }
      );
      const { accessToken: newAccessToken } = response.data;
      setAccessToken(newAccessToken);
      return newAccessToken;
    } catch (error) {
      reset();
      navigate("/sign-in", { replace: true });
      throw error;
    }
  }, [setAccessToken, reset, navigate]);

  const customFetch = useCallback(
    async (input: RequestInfo | URL, init?: RequestInit) => {
      const response = await fetch(input, {
        ...init,
        headers: {
          ...init?.headers,
          Authorization: `Bearer ${useAuthStore.getState().getAccessToken()}`,
        },
      });

      // Handle 401 error
      if (response.status === 401) {
        // Try to refresh token
        const newAccessToken = await handleRefreshToken();

        // Retry with new token
        return fetch(input, {
          ...init,
          headers: {
            ...init?.headers,
            Authorization: `Bearer ${newAccessToken}`,
          },
        });
      }

      return response;
    },
    [handleRefreshToken]
  );

  const { messages, input, handleInputChange, handleSubmit, isLoading, error } =
    useChat({
      api: "/v1/ai-agent/stream",
      body: {
        model: "gemini-2.0-flash",
        maxTokens: 10000,
      },
      fetch: customFetch,
      onError: (error) => {
        console.error("Chat error:", error);
      },
    });

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    handleSubmit(e);
  };

  return (
    <div className="flex flex-col h-full w-full">
      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardHeader className="flex-none">
          <CardTitle>AI Chat Assistant</CardTitle>
          <CardDescription>
            <span>Chat with Gemini 2.5 Pro</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col overflow-y-auto p-0">
          <ScrollArea className="flex-1">
            <div className="space-y-4 p-4">
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  Start a conversation by typing a message below
                </div>
              )}
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {message.role === "assistant" && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      "rounded-lg px-4 py-3 max-w-[80%]",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({ children }) => (
                          <p className="mb-2 last:mb-0 text-sm">{children}</p>
                        ),
                        h1: ({ children }) => (
                          <h1 className="text-xl font-bold mb-2 mt-3">
                            {children}
                          </h1>
                        ),
                        h2: ({ children }) => (
                          <h2 className="text-lg font-bold mb-2 mt-3">
                            {children}
                          </h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className="text-base font-bold mb-1 mt-2">
                            {children}
                          </h3>
                        ),
                        ul: ({ children }) => (
                          <ul className="list-disc pl-5 my-2 space-y-1 text-sm">
                            {children}
                          </ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="list-decimal pl-5 my-2 space-y-1 text-sm">
                            {children}
                          </ol>
                        ),
                        li: ({ children }) => <li>{children}</li>,
                        code: ({ className, children }) => {
                          const isInline = !className;
                          return isInline ? (
                            <code
                              className={cn(
                                "px-1 py-0.5 rounded text-xs font-mono",
                                message.role === "user"
                                  ? "bg-primary-foreground/20"
                                  : "bg-muted-foreground/20"
                              )}
                            >
                              {children}
                            </code>
                          ) : (
                            <code className="block p-3 rounded text-xs font-mono overflow-x-auto bg-black/5 dark:bg-white/5">
                              {children}
                            </code>
                          );
                        },
                        pre: ({ children }) => (
                          <pre className="my-2">{children}</pre>
                        ),
                        strong: ({ children }) => (
                          <strong className="font-semibold">{children}</strong>
                        ),
                        em: ({ children }) => (
                          <em className="italic">{children}</em>
                        ),
                        a: ({ href, children }) => (
                          <a
                            href={href}
                            className={cn(
                              "underline hover:no-underline",
                              message.role === "user"
                                ? "text-primary-foreground"
                                : "text-primary"
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {children}
                          </a>
                        ),
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-4 border-muted-foreground/30 pl-4 my-2 italic text-sm">
                            {children}
                          </blockquote>
                        ),
                        hr: () => (
                          <hr className="my-4 border-muted-foreground/30" />
                        ),
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                  {message.role === "user" && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted rounded-lg px-4 py-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              )}
              {error && (
                <div className="text-center text-destructive text-sm">
                  Error: {error?.message || String(error)}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
      <div className="flex-none bg-background p-4">
        <form onSubmit={onSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            size="icon"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
