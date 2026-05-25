"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Plus, Filter, Kanban, List } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ProjectWorker {
  worker: {
    fullName: string;
    avatarUrl?: string;
  };
}

interface Project {
  id: string;
  title: string;
  clientName: string;
  status: "todo" | "in_progress" | "review" | "done";
  priority: "critical" | "high" | "medium" | "low";
  deadline: string;
  tasks?: { status: string }[];
  projectWorkers?: ProjectWorker[];
  completedAt?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getPriorityBadge(priority: Project["priority"]) {
  switch (priority) {
    case "critical":
      return (
        <Badge variant="outline" className="text-xs text-red-600 border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
          Critical
        </Badge>
      );
    case "high":
      return (
        <Badge variant="outline" className="text-xs text-amber-600 border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400">
          High
        </Badge>
      );
    case "medium":
      return (
        <Badge variant="outline" className="text-xs text-blue-600 border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400">
          Medium
        </Badge>
      );
    case "low":
    default:
      return (
        <Badge variant="outline" className="text-xs text-slate-600 border-slate-200 bg-slate-50 dark:bg-slate-900/20 dark:border-slate-700 dark:text-slate-400">
          Low
        </Badge>
      );
  }
}

function getDeadlineLabel(deadline: string) {
  const daysLeft = Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / 86400000);

  if (daysLeft < 0) {
    return <div className="text-xs font-medium text-red-600 dark:text-red-400">Overdue</div>;
  }
  if (daysLeft <= 3) {
    return (
      <div className="text-xs font-medium text-amber-600 dark:text-amber-400">
        {daysLeft} days left
      </div>
    );
  }
  return (
    <div className="text-xs text-muted-foreground">
      Due {new Date(deadline).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
    </div>
  );
}

// ─── Project Card ─────────────────────────────────────────────────────────────

function ProjectCard({ project }: { project: Project }) {
  const isDone = project.status === "done";
  const visibleWorkers = (project.projectWorkers ?? []).slice(0, 3);

  return (
    <Card
      className={
        isDone
          ? "opacity-70 bg-slate-50 dark:bg-slate-900/50 shadow-none border-dashed border-slate-200 dark:border-slate-800"
          : "cursor-pointer hover:border-blue-500 transition-colors shadow-sm"
      }
    >
      <CardHeader className="p-4 pb-2">
        {!isDone && (
          <div className="flex justify-between items-start mb-2">
            {getPriorityBadge(project.priority)}
          </div>
        )}
        <CardTitle className={`text-base${isDone ? " line-through text-slate-500" : ""}`}>
          {project.title}
        </CardTitle>
        <CardDescription className="text-xs">{project.clientName}</CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0 text-sm">
        <div className="flex justify-between items-center mt-4">
          {isDone ? (
            <div className="text-xs text-emerald-600 dark:text-emerald-500">
              Completed {new Date(project.deadline).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
            </div>
          ) : (
            getDeadlineLabel(project.deadline)
          )}
          <div className={`flex -space-x-2${isDone ? " grayscale" : ""}`}>
            {visibleWorkers.map((pw, i) => (
              <Avatar key={i} className="h-6 w-6 border-2 border-background">
                {pw.worker.avatarUrl ? (
                  <AvatarImage src={pw.worker.avatarUrl} alt={pw.worker.fullName} />
                ) : (
                  <AvatarFallback className="text-[10px]">
                    {pw.worker.fullName.charAt(0)}
                  </AvatarFallback>
                )}
              </Avatar>
            ))}
            {(project.projectWorkers?.length ?? 0) === 0 && (
              <Avatar className="h-6 w-6 border-2 border-background">
                <AvatarFallback className="text-[10px]">?</AvatarFallback>
              </Avatar>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Skeleton Card ────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-4 space-y-3 animate-pulse">
      <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
      <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded" />
      <div className="h-3 w-1/2 bg-slate-100 dark:bg-slate-800 rounded" />
      <div className="flex justify-between items-center pt-2">
        <div className="h-3 w-16 bg-slate-100 dark:bg-slate-800 rounded" />
        <div className="flex -space-x-2">
          <div className="h-6 w-6 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-background" />
          <div className="h-6 w-6 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-background" />
        </div>
      </div>
    </div>
  );
}

// ─── Kanban Column ────────────────────────────────────────────────────────────

interface ColumnConfig {
  key: Project["status"];
  label: string;
  dotClass: string;
}

const COLUMNS: ColumnConfig[] = [
  { key: "todo",        label: "To Do",       dotClass: "bg-slate-400" },
  { key: "in_progress", label: "In Progress",  dotClass: "bg-blue-500" },
  { key: "review",      label: "In Review",    dotClass: "bg-amber-500" },
  { key: "done",        label: "Done",         dotClass: "bg-emerald-500" },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminProjectsPage() {
  const [search, setSearch] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const res = await fetch("/api/projects", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch projects");
      const json = await res.json();
      return json.data.projects as Project[];
    },
  });

  // Group projects by status
  const grouped = COLUMNS.reduce<Record<string, Project[]>>(
    (acc, col) => {
      const projects = (data ?? []).filter(
        (p) =>
          p.status === col.key &&
          (search === "" ||
            p.title.toLowerCase().includes(search.toLowerCase()) ||
            p.clientName.toLowerCase().includes(search.toLowerCase()))
      );
      acc[col.key] = projects;
      return acc;
    },
    {} as Record<string, Project[]>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Project Management</h2>
          <p className="text-muted-foreground">Create, assign, and track all agency projects.</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" /> New Project
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search projects..."
              className="pl-9 w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon"><Filter className="h-4 w-4" /></Button>
        </div>
        <Tabs defaultValue="kanban" className="w-full sm:w-auto self-end sm:self-auto">
          <TabsList>
            <TabsTrigger value="kanban"><Kanban className="h-4 w-4 mr-2" /> Board</TabsTrigger>
            <TabsTrigger value="list"><List className="h-4 w-4 mr-2" /> List</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isError && (
        <div className="text-sm text-red-500 text-center py-4">
          Failed to load projects. Please try again.
        </div>
      )}

      {/* Kanban Board */}
      <div className="grid md:grid-cols-4 gap-6 items-start overflow-x-auto pb-4">
        {COLUMNS.map((col) => (
          <div key={col.key} className="flex flex-col gap-4 min-w-[280px]">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${col.dotClass}`} />
                {col.label}
                <Badge variant="secondary" className="ml-1">
                  {isLoading ? "—" : (grouped[col.key]?.length ?? 0)}
                </Badge>
              </h3>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {isLoading ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : grouped[col.key]?.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                No projects
              </div>
            ) : (
              grouped[col.key].map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
