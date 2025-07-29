import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, MessageSquare, Clock, MoreHorizontal } from "lucide-react";

// Temporary session data (will be fetched from API later)
const mockSessions = [
  {
    id: "1",
    title: "New Project Planning",
    lastMessage: "We discussed the project structure...",
    updatedAt: "2024-01-20T10:30:00Z",
    messageCount: 12,
    status: "active",
  },
  {
    id: "2", 
    title: "UI Design Review",
    lastMessage: "The component design is almost complete...",
    updatedAt: "2024-01-19T16:45:00Z",
    messageCount: 8,
    status: "completed",
  },
  {
    id: "3",
    title: "API Specification Review",
    lastMessage: "Let's review the endpoint structure again...",
    updatedAt: "2024-01-18T14:20:00Z", 
    messageCount: 15,
    status: "active",
  },
];

function formatRelativeTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = (now.getTime() - date.getTime()) / 1000;
  
  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
}

export default function WorkspaceSessions() {
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <header className="border-b border-border p-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Sessions</h1>
            <p className="text-muted-foreground mt-1">
              Manage and continue your conversation sessions
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Session
          </Button>
        </div>
      </header>

      {/* Session List */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-6">
          {mockSessions.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No sessions yet</h3>
              <p className="text-muted-foreground mb-4">
                Start your first conversation session
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Start New Session
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {mockSessions.map((session) => (
                <div
                  key={session.id}
                  className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <MessageSquare className="h-5 w-5 text-primary" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium truncate">{session.title}</h3>
                        <Badge 
                          variant={session.status === "active" ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {session.status === "active" ? "Active" : "Completed"}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {session.lastMessage}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {session.messageCount} messages
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatRelativeTime(session.updatedAt)}
                        </span>
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}