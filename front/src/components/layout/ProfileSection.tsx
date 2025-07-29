import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/auth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Settings, LogOut, Mail } from "lucide-react";

export function ProfileSection() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  const { logout } = useUserProfile();

  const handleLogout = async () => {
    await logout();
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="p-4 border-t border-border">
        <div className="text-sm text-muted-foreground">
          Login required
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border-t border-border space-y-3">
      {/* 사용자 정보 */}
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium truncate">{user.name}</span>
            {user.is_verified ? (
              <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                Verified
              </Badge>
            ) : (
              <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                Unverified
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Mail className="h-3 w-3" />
            <span className="truncate">{user.email}</span>
          </div>
        </div>
      </div>

      {/* 액션 버튼들 */}
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 h-8 gap-2"
        >
          <Settings className="h-3 w-3" />
          Settings
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-2"
          onClick={handleLogout}
        >
          <LogOut className="h-3 w-3" />
          Logout
        </Button>
      </div>
    </div>
  );
}