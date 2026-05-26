"use client";

import { useState, useEffect } from "react";
import { Bell, Search, Menu, Moon, Sun, Loader2, FileText, Briefcase, User } from "lucide-react";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "@/components/layout/sidebar";
import { useGlobalSearch } from "@/lib/api-client";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import Link from "next/link";

export function Header() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [popoverOpen, setPopoverOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: searchResults, isLoading: isSearchLoading } = useGlobalSearch(debouncedQuery);

  const user = session?.user as any;
  
  const displayName = user?.name || "Loading...";
  const roleDisplay = user?.role === 'admin' ? 'Manager/Admin' : 'Freelance Dev';
  const avatarUrl = user?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}`;
  const initials = displayName.substring(0, 2).toUpperCase();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPopoverOpen(e.target.value.length > 0);
  };

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
        <div className="relative w-full max-w-md hidden md:flex items-center">
          <Popover open={popoverOpen && searchQuery.length > 0} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <div className="relative w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search projects, tasks, or workers..."
                  className="w-full rounded-lg bg-muted/50 pl-9 border-none focus-visible:ring-1"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => { if (searchQuery.length > 0) setPopoverOpen(true); }}
                />
              </div>
            </PopoverTrigger>
            <PopoverContent 
              className="w-[400px] p-0" 
              align="start" 
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              <div className="max-h-[400px] overflow-auto p-2">
                {isSearchLoading ? (
                  <div className="flex items-center justify-center p-4 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" /> Searching...
                  </div>
                ) : !searchResults || (searchResults.projects?.length === 0 && searchResults.workers?.length === 0 && searchResults.invoices?.length === 0) ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No results found for "{debouncedQuery}"
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Projects */}
                    {searchResults.projects?.length > 0 && (
                      <div>
                        <div className="text-xs font-semibold uppercase text-muted-foreground px-2 py-1 mb-1">Projects</div>
                        {searchResults.projects.map((project: any) => (
                          <Link 
                            key={project.id} 
                            href={`/${user?.role}/projects`}
                            onClick={() => setPopoverOpen(false)}
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
                    
                    {/* Workers */}
                    {searchResults.workers?.length > 0 && (
                      <div>
                        <div className="text-xs font-semibold uppercase text-muted-foreground px-2 py-1 mb-1 mt-2 border-t pt-2">Workers</div>
                        {searchResults.workers.map((worker: any) => (
                          <Link 
                            key={worker.id} 
                            href={user?.role === 'admin' ? '/admin/workers' : '#'}
                            onClick={() => setPopoverOpen(false)}
                            className="flex items-center gap-3 p-2 rounded-md hover:bg-muted transition-colors"
                          >
                            <Avatar className="h-7 w-7">
                              <AvatarImage src={worker.avatarUrl} />
                              <AvatarFallback className="text-[10px]">{worker.fullName.substring(0,2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="text-sm font-medium">{worker.fullName}</div>
                              <div className="text-xs text-muted-foreground">{worker.email}</div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                    
                    {/* Invoices */}
                    {searchResults.invoices?.length > 0 && (
                      <div>
                        <div className="text-xs font-semibold uppercase text-muted-foreground px-2 py-1 mb-1 mt-2 border-t pt-2">Invoices</div>
                        {searchResults.invoices.map((invoice: any) => (
                          <Link 
                            key={invoice.id} 
                            href={`/${user?.role}/finance`}
                            onClick={() => setPopoverOpen(false)}
                            className="flex items-start gap-3 p-2 rounded-md hover:bg-muted transition-colors"
                          >
                            <div className="bg-emerald-100 dark:bg-emerald-900/30 p-1.5 rounded-md mt-0.5">
                              <FileText className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                              <div className="text-sm font-medium">Rp {invoice.amount.toLocaleString()}</div>
                              <div className="text-xs text-muted-foreground">Invoice #{invoice.id.substring(0,8)}</div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
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
