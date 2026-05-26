"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Search, Menu, Moon, Sun, Loader2, Briefcase, User } from "lucide-react";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "@/components/layout/sidebar";
import Link from "next/link";
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from "@/lib/api-client";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

function useGlobalSearch(q: string) {
  return useQuery({
    queryKey: ["global-search", q],
    queryFn: async () => {
      if (q.length < 2) return null;
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, { credentials: "include" });
      if (!res.ok) return null;
      const json = await res.json();
      return json.data;
    },
    enabled: q.length >= 2,
    staleTime: 10_000,
  });
}

export function Header() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: searchResults, isLoading: isSearchLoading } = useGlobalSearch(debouncedQuery);

  const user = session?.user as any;
  const displayName = user?.name || "Loading...";
  const roleDisplay = user?.role === "admin" ? "Manager/Admin" : "Freelance Dev";
  const avatarUrl = user?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}`;
  const initials = displayName.substring(0, 2).toUpperCase();

  const { data: notificationsData, isLoading: isNotifsLoading } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const notifications = notificationsData?.notifications || [];
  const unreadCount = notificationsData?.unreadCount || 0;

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-background px-6">
      <Sheet>
        <SheetTrigger
          className="inline-flex items-center justify-center rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground md:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64 border-r-0">
          <Sidebar role={user?.role} />
        </SheetContent>
      </Sheet>

      <div className="flex flex-1 items-center gap-4">
        {/* Search with custom dropdown */}
        <div className="relative w-full max-w-md hidden md:block" ref={searchRef}>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search projects, tasks, or workers..."
              className="w-full rounded-lg bg-muted/50 pl-9 border-none focus-visible:ring-1"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchOpen(e.target.value.length > 0);
              }}
              onFocus={() => { if (searchQuery.length > 0) setSearchOpen(true); }}
            />
          </div>

          {searchOpen && searchQuery.length >= 2 && (
            <div className="absolute top-full left-0 z-50 mt-1 w-full max-w-[400px] rounded-lg border bg-popover shadow-lg">
              <div className="max-h-[400px] overflow-auto p-2">
                {isSearchLoading ? (
                  <div className="flex items-center justify-center p-4 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" /> Searching...
                  </div>
                ) : !searchResults || (
                  (searchResults.projects?.length ?? 0) === 0 &&
                  (searchResults.workers?.length ?? 0) === 0 &&
                  (searchResults.tasks?.length ?? 0) === 0
                ) ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No results for &ldquo;{debouncedQuery}&rdquo;
                  </div>
                ) : (
                  <div className="space-y-4">
                    {searchResults.projects?.length > 0 && (
                      <div>
                        <div className="text-xs font-semibold uppercase text-muted-foreground px-2 py-1 mb-1">Projects</div>
                        {searchResults.projects.map((project: any) => (
                          <Link
                            key={project.id}
                            href={`/${user?.role}/projects`}
                            onClick={() => setSearchOpen(false)}
                            className="flex items-start gap-3 p-2 rounded-md hover:bg-muted transition-colors"
                          >
                            <div className="bg-blue-100 dark:bg-blue-900/30 p-1.5 rounded-md mt-0.5">
                              <Briefcase className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <div className="text-sm font-medium">{project.title}</div>
                              <div className="text-xs text-muted-foreground">{project.clientName}</div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}

                    {searchResults.workers?.length > 0 && (
                      <div>
                        <div className="text-xs font-semibold uppercase text-muted-foreground px-2 py-1 mb-1 mt-2 border-t pt-2">Workers</div>
                        {searchResults.workers.map((worker: any) => (
                          <Link
                            key={worker.id}
                            href={user?.role === "admin" ? "/admin/workers" : "#"}
                            onClick={() => setSearchOpen(false)}
                            className="flex items-center gap-3 p-2 rounded-md hover:bg-muted transition-colors"
                          >
                            <Avatar className="h-7 w-7">
                              <AvatarImage src={worker.avatarUrl} />
                              <AvatarFallback className="text-[10px]">{worker.fullName.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="text-sm font-medium">{worker.fullName}</div>
                              <div className="text-xs text-muted-foreground">{worker.email}</div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>

        {/* Notification bell — custom dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative inline-flex items-center justify-center rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            aria-label="Notifications"
          >
            <Bell className={cn("h-5 w-5 transition-all", unreadCount > 0 && "text-emerald-600 dark:text-emerald-400")} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-4 min-w-[16px] rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground flex items-center justify-center px-1">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full z-50 mt-1 w-80 rounded-lg border bg-popover shadow-lg">
              <div className="flex items-center justify-between border-b px-4 py-3">
                <span className="text-sm font-semibold">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllRead.mutate()}
                    className="text-xs text-blue-600 hover:underline dark:text-blue-400 disabled:opacity-50"
                    disabled={markAllRead.isPending}
                  >
                    Mark all as read
                  </button>
                )}
              </div>
              <div className="max-h-[350px] overflow-auto">
                {isNotifsLoading ? (
                  <div className="flex justify-center p-4"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
                ) : notifications.length === 0 ? (
                  <div className="p-8 text-center text-sm text-muted-foreground">
                    <Bell className="mx-auto h-8 w-8 text-muted-foreground/50 mb-2" />
                    Tidak ada notifikasi baru
                  </div>
                ) : (
                  <div className="flex flex-col">
                    {notifications.map((notif: any) => (
                      <div
                        key={notif.id}
                        className={cn(
                          "flex items-start gap-3 border-b p-4 text-sm transition-colors hover:bg-muted/50 cursor-pointer",
                          !notif.read && "bg-emerald-50/50 dark:bg-emerald-900/10"
                        )}
                        onClick={() => {
                          if (!notif.read) markRead.mutate(notif.id);
                          setNotifOpen(false);
                        }}
                      >
                        <div className="mt-0.5 rounded-full bg-slate-100 p-1.5 dark:bg-slate-800 shrink-0">
                          <Bell className={cn("h-4 w-4", !notif.read ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground")} />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className={cn("font-medium leading-none", !notif.read ? "text-foreground" : "text-muted-foreground")}>
                            {notif.title}
                          </p>
                          <p className="text-xs text-muted-foreground leading-snug">{notif.body}</p>
                          <p className="text-[10px] text-muted-foreground pt-1">
                            {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: idLocale })}
                          </p>
                        </div>
                        {!notif.read && <div className="h-2 w-2 mt-1.5 rounded-full bg-emerald-500 shrink-0" />}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

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
