import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { AuthDialog } from "./auth-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { User, LogOut, Settings, Heart, Loader2 } from "lucide-react";

export function UserMenu() {
  const { user, isLoading, logout } = useAuth();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { toast } = useToast();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      toast({ title: "Signed out", description: "You have been signed out successfully." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to sign out", variant: "destructive" });
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (isLoading) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    );
  }

  if (!user) {
    return (
      <>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setAuthDialogOpen(true)}
          data-testid="button-sign-in"
        >
          <User className="h-4 w-4 mr-2" />
          Sign In
        </Button>
        <AuthDialog 
          open={authDialogOpen} 
          onOpenChange={setAuthDialogOpen} 
          defaultMode="login"
        />
      </>
    );
  }

  const initials = user.username.slice(0, 2).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative"
          data-testid="button-user-menu"
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-chart-1 text-white text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span className="font-medium" data-testid="text-username">{user.username}</span>
            {user.email && (
              <span className="text-xs text-muted-foreground" data-testid="text-email">{user.email}</span>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem data-testid="menu-item-favorites">
          <Heart className="mr-2 h-4 w-4" />
          <span>My Favorites</span>
        </DropdownMenuItem>
        <DropdownMenuItem data-testid="menu-item-settings">
          <Settings className="mr-2 h-4 w-4" />
          <span>Alert Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={handleLogout} 
          disabled={isLoggingOut}
          data-testid="menu-item-logout"
        >
          {isLoggingOut ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="mr-2 h-4 w-4" />
          )}
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
