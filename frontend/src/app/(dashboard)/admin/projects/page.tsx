"use client";

import { useState, useEffect, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Plus, Filter, Kanban, List, Star } from "lucide-react";
import { useAdminProjects, useCreateProject, useRateWorker } from "@/lib/api-client";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { SkeletonCard, SkeletonTable } from "@/components/ui/skeleton-card";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "sonner";

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
  progress?: number;
  daysUntilDeadline?: number;
  isUrgent?: boolean;
  taskCount?: number;
  workers?: { id: string; fullName: string; avatarUrl?: string; roleInProject?: string }[];
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
        
        {isDone && (
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <RateWorkerDialog project={project} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RateWorkerDialog({ project }: { project: Project }) {
  const [isOpen, setIsOpen] = useState(false);
  const [deadlineScore, setDeadlineScore] = useState(5);
  const [qualityScore, setQualityScore] = useState(5);
  const [communicationScore, setCommunicationScore] = useState(5);
  const [review, setReview] = useState("");
  
  const rateWorker = useRateWorker();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    rateWorker.mutate({
      projectId: project.id,
      deadlineScore,
      qualityScore,
      communicationScore,
      review,
    }, {
      onSuccess: () => {
        toast.success("Worker rated successfully");
        setIsOpen(false);
      },
      onError: (err: any) => {
        toast.error(err.message || "Failed to submit rating");
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger render={<Button size="sm" variant="outline" className="w-full gap-2 border-amber-200 text-amber-700 hover:bg-amber-50 hover:text-amber-800 dark:border-amber-900 dark:text-amber-400 dark:hover:bg-amber-900/20" />}>
          <Star className="h-4 w-4" /> Rate Worker
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Rate Worker Performance</DialogTitle>
            <DialogDescription>
              Evaluate the worker's performance for project <strong>{project.title}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Deadline</Label>
              <Input type="range" min="1" max="5" value={deadlineScore} onChange={(e) => setDeadlineScore(Number(e.target.value))} />
              <div className="text-xs text-right text-muted-foreground">{deadlineScore} / 5</div>
            </div>
            <div className="space-y-2">
              <Label>Quality</Label>
              <Input type="range" min="1" max="5" value={qualityScore} onChange={(e) => setQualityScore(Number(e.target.value))} />
              <div className="text-xs text-right text-muted-foreground">{qualityScore} / 5</div>
            </div>
            <div className="space-y-2">
              <Label>Communication</Label>
              <Input type="range" min="1" max="5" value={communicationScore} onChange={(e) => setCommunicationScore(Number(e.target.value))} />
              <div className="text-xs text-right text-muted-foreground">{communicationScore} / 5</div>
            </div>
            <div className="space-y-2">
              <Label>Review (Optional)</Label>
              <Textarea 
                placeholder="Leave a review for the worker..." 
                value={review}
                onChange={(e) => setReview(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={rateWorker.isPending}>
              {rateWorker.isPending ? "Submitting..." : "Submit Rating"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Skeleton Card ────────────────────────────────────────────────────────────

// Removed local SkeletonCard
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
  return (
    <Suspense fallback={<div className="space-y-6"><SkeletonCard className="h-20" /><SkeletonCard className="h-96" /></div>}>
      <AdminProjectsPageInner />
    </Suspense>
  );
}

function AdminProjectsPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Auto-open create dialog from dashboard "Create Project" button
  useEffect(() => {
    if (searchParams.get("create") === "true") {
      setIsCreateModalOpen(true);
      // Clean up URL
      router.replace("/admin/projects", { scroll: false });
    }
  }, [searchParams, router]);
  const [formData, setFormData] = useState({
    title: "",
    clientName: "",
    description: "",
    budget: "",
    deadline: "",
    priority: "medium",
  });

  const { data: projectsData, isLoading, isError } = useAdminProjects();
  const createProject = useCreateProject();

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.clientName || !formData.budget || !formData.deadline) {
      toast.error("Please fill in all required fields.");
      return;
    }

    createProject.mutate({
      ...formData,
      budget: Number(formData.budget),
      deadline: formData.deadline + "T23:59:59Z", // End of day UTC
    }, {
      onSuccess: () => {
        toast.success("Project created successfully!");
        setIsCreateModalOpen(false);
        setFormData({ title: "", clientName: "", description: "", budget: "", deadline: "", priority: "medium" });
      },
      onError: (err: any) => {
        toast.error(err.message || "Failed to create project");
      }
    });
  };

  const data = projectsData?.projects || [];

  // Group projects by status
  const grouped = COLUMNS.reduce<Record<string, Project[]>>(
    (acc, col) => {
      const projects = (data ?? []).filter(
        (p: Project) =>
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
    <div className="space-y-6 animate-in fade-in duration-500">
      <title>Admin Projects</title>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Project Management</h2>
          <p className="text-muted-foreground">Create, assign, and track all agency projects.</p>
        </div>
        
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger render={<Button className="bg-blue-600 hover:bg-blue-700" />}>
            <Plus className="h-4 w-4 mr-2" /> New Project
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <form onSubmit={handleCreateProject}>
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
                <DialogDescription>
                  Set up a new project. You can assign workers later.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Project Name</Label>
                    <Input id="title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required placeholder="e.g. Website Redesign" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clientName">Client Name</Label>
                    <Input id="clientName" value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} required placeholder="e.g. Acme Corp" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Project details and objectives..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="budget">Budget (Rp)</Label>
                    <Input id="budget" type="number" value={formData.budget} onChange={e => setFormData({...formData, budget: e.target.value})} required placeholder="e.g. 5000000" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deadline">Deadline</Label>
                    <Input id="deadline" type="date" value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={formData.priority} onValueChange={v => setFormData({...formData, priority: v ?? formData.priority})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createProject.isPending} className="bg-blue-600 hover:bg-blue-700 w-full">
                  {createProject.isPending ? "Creating..." : "Create Project"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="kanban" className="space-y-6">
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
          <Button variant="outline" size="icon" onClick={() => toast.info("Filter coming soon")}><Filter className="h-4 w-4" /></Button>
        </div>
        <TabsList>
          <TabsTrigger value="kanban"><Kanban className="h-4 w-4 mr-2" /> Board</TabsTrigger>
          <TabsTrigger value="list"><List className="h-4 w-4 mr-2" /> List</TabsTrigger>
        </TabsList>
      </div>

        {isError && (
          <div className="text-sm text-red-500 text-center py-4">
            Failed to load projects. Please try again.
          </div>
        )}

        <TabsContent value="kanban" className="m-0">
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
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setIsCreateModalOpen(true); }}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {isLoading ? (
                  <>
                    <SkeletonCard className="p-4" />
                    <SkeletonCard className="p-4" />
                  </>
                ) : grouped[col.key]?.length === 0 ? (
                  <div className="text-sm text-muted-foreground text-center py-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/50 dark:bg-slate-900/20">
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
        </TabsContent>

        <TabsContent value="list" className="m-0">
          <Card className="shadow-sm border-slate-200 dark:border-slate-800 overflow-hidden">
            <CardContent className="p-0 overflow-x-auto">
              <Table className="min-w-[800px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-4">Project Name</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Deadline</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead className="text-right pr-4">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="p-0">
                        <SkeletonTable rows={5} />
                      </TableCell>
                    </TableRow>
                  ) : data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="p-8">
                        <EmptyState 
                          icon={<Kanban className="h-8 w-8" />}
                          title="No projects found"
                          description="Get started by creating a new project."
                          action={{
                            label: "Create Project",
                            onClick: () => setIsCreateModalOpen(true)
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.map((project: Project) => (
                      <TableRow key={project.id}>
                        <TableCell className="pl-4 font-medium">{project.title}</TableCell>
                        <TableCell>{project.clientName}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {project.status.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>{getPriorityBadge(project.priority)}</TableCell>
                        <TableCell>{getDeadlineLabel(project.deadline)}</TableCell>
                        <TableCell className="w-[150px]">
                          <div className="flex items-center gap-2">
                            <Progress value={project.progress || 0} className="h-2" />
                            <span className="text-xs text-muted-foreground">{project.progress || 0}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right pr-4">
                          <Button variant="ghost" size="sm" onClick={() => toast.info(`Viewing: ${project.title}`)}>View</Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
