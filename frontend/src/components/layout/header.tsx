"use client";

import { Bell, Search, Menu } from "lucide-react";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Header() {
  const { data: session } = useSession();
  const user = session?.user as any;
  
  const displayName = user?.name || "Loading...";
  const roleDisplay = user?.role === 'admin' ? 'Manager/Admin' : 'Freelance Dev';
  const avatarUrl = user?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}`;
  const initials = displayName.substring(0, 2).toUpperCase();

  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-background px-6">
      <Button variant="ghost" size="icon" className="md:hidden">
        <Menu className="h-5 w-5" />
      </Button>
      
      <div className="flex flex-1 items-center gap-4">
        <div className="relative w-full max-w-md hidden md:flex items-center">
          <Search className="absolute left-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search projects, tasks, or workers..."
            className="w-full rounded-lg bg-muted/50 pl-9 border-none focus-visible:ring-1"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-destructive" />
        </Button>
        
        <div className="flex items-center gap-3 border-l pl-4">
          <div className="hidden flex-col items-end text-sm md:flex">
            <span className="font-medium leading-none">{displayName}</span>
            <span className="text-xs text-muted-foreground mt-1">{roleDisplay}</span>
          </div>
          <Avatar className="h-8 w-8">
            <AvatarImage src={avatarUrl} alt="Avatar" />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
