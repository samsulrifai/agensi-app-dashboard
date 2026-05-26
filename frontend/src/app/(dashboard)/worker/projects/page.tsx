"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Clock, Play, FileUp, MessageSquare, MoreVertical, Calendar, History, Folder } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { useWorkerProjects, useStartTimer, useStopTimer, useCompleteTask, useActiveTimer } from "@/lib/api-client";
import { FileUploader } from "@/components/ui/file-uploader";
import { TimeTracker } from "@/components/time-tracker";
import { SkeletonCard } from "@/components/ui/skeleton-card";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "sonner";

export default function WorkerProjectsPage() {
  const { data: projects, isLoading } = useWorkerProjects();
  const { data: activeTimer } = useActiveTimer();
  
  const startTimer = useStartTimer();
  const stopTimer = useStopTimer();
  const completeTask = useCompleteTask();

  if (isLoading) {
    return (
      <div className="space-y-6">
      <title>Worker Projects</title>
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  const activeProjects = projects?.filter((p: any) => p.status === 'in_progress' || p.status === 'todo') || [];
  const reviewProjects = projects?.filter((p: any) => p.status === 'review') || [];
  const completedProjects = projects?.filter((p: any) => p.status === 'done') || [];

  const handleStartTimer = (taskId: string) => {
    startTimer.mutate(taskId, {
      onSuccess: () => toast.success("Timer started!"),
      onError: (err: any) => toast.error(err.message || "Failed to start timer"),
    });
  };

  const handleStopTimer = (taskId: string) => {
    stopTimer.mutate(taskId, {
      onSuccess: () => toast.success("Timer stopped!"),
      onError: (err: any) => toast.error(err.message || "Failed to stop timer"),
    });
  };

  const handleCompleteTask = (taskId: string) => {
    completeTask.mutate(taskId, {
      onSuccess: () => toast.success("Task marked as done!"),
      onError: (err: any) => toast.error(err.message || "Failed to complete task"),
    });
  };

  const renderProjectList = (projectList: any[]) => {
    if (projectList.length === 0) {
      return (
        <EmptyState 
          icon={<Folder className="h-8 w-8" />}
          title="No projects found"
          description="You don't have any projects in this category at the moment."
          className="mt-6"
        />
      );
    }
    
    return projectList.map((project) => (
      <Card key={project.id} className="border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden mb-6 mt-6">
        <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-6 py-4 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-bold">{project.title}</h3>
              {project.isUrgent && (
                <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800 animate-pulse">
                  Urgent: {project.daysUntilDeadline} days left
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">Client: {project.clientName}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}>
              <MoreVertical className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>View Details</DropdownMenuItem>
              <DropdownMenuItem>Contact Admin</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardContent className="p-6">
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium text-slate-700 dark:text-slate-300">Overall Progress</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">{project.progress}%</span>
            </div>
            <Progress value={project.progress} className="h-2.5" />
          </div>
          
          <div className="space-y-4">
            <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Assigned Tasks</h4>
            
            {project.tasks.length === 0 && (
              <div className="text-sm text-muted-foreground italic">No tasks assigned.</div>
            )}

            {project.tasks.map((task: any) => (
              <div key={task.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{task.title}</span>
                    <Badge variant={task.status === 'done' ? 'default' : 'outline'} className="text-xs">
                      {task.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> Due {new Date(task.deadline).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {Math.round(task.loggedMinutes / 60 * 10) / 10}h logged
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <TimeTracker
                    variant="compact"
                    taskId={task.id}
                    isActive={activeTimer?.taskId === task.id}
                    initialSeconds={activeTimer?.taskId === task.id ? Math.floor((new Date().getTime() - new Date(activeTimer.startedAt).getTime()) / 1000) : 0}
                    onStart={handleStartTimer}
                    onStop={handleStopTimer}
                    isPending={startTimer.isPending || stopTimer.isPending}
                  />
                  
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleCompleteTask(task.id)}
                    disabled={task.status === 'done' || completeTask.isPending}
                    className="bg-white dark:bg-slate-950"
                  >
                    Done
                  </Button>
                  
                  <Dialog>
                    <DialogTrigger>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <History className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Time Logs: {task.title}</DialogTitle>
                        <DialogDescription>History of time tracked for this task.</DialogDescription>
                      </DialogHeader>
                      <div className="max-h-[300px] overflow-auto mt-4">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Start</TableHead>
                              <TableHead>End</TableHead>
                              <TableHead>Duration</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {(!task.timeLogs || task.timeLogs.length === 0) && (
                              <TableRow>
                                <TableCell colSpan={3} className="text-center text-muted-foreground">No time logs yet.</TableCell>
                              </TableRow>
                            )}
                            {task.timeLogs?.map((log: any, idx: number) => (
                              <TableRow key={idx}>
                                <TableCell>{new Date(log.startTime).toLocaleString()}</TableCell>
                                <TableCell>{log.endTime ? new Date(log.endTime).toLocaleString() : 'In Progress'}</TableCell>
                                <TableCell>{log.durationMinutes ? `${log.durationMinutes} min` : '-'}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 px-6 py-4 flex gap-3">
          <Dialog>
            <DialogTrigger>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                <FileUp className="h-4 w-4 mr-2" /> Upload Deliverable
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Upload Deliverable</DialogTitle>
                <DialogDescription>
                  Upload your completed work for project {project.title}.
                </DialogDescription>
              </DialogHeader>
              <FileUploader 
                bucket="deliverables"
                maxSizeMB={20}
                onUploadComplete={(url) => {
                  toast.success("Deliverable uploaded successfully!");
                  // Here you would typically call an API to save the URL to the project
                }}
              />
            </DialogContent>
          </Dialog>
          
          <Button size="sm" variant="outline">
            <MessageSquare className="h-4 w-4 mr-2" /> Discussion
          </Button>
        </CardFooter>
      </Card>
    ));
  };

  return (
    <div className="space-y-6 max-w-5xl animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">My Projects</h2>
        <p className="text-muted-foreground">Manage your assigned projects and track your tasks.</p>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList>
          <TabsTrigger value="active">Active ({activeProjects.length})</TabsTrigger>
          <TabsTrigger value="review">In Review ({reviewProjects.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedProjects.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="active">
          {renderProjectList(activeProjects)}
        </TabsContent>
        <TabsContent value="review">
          {renderProjectList(reviewProjects)}
        </TabsContent>
        <TabsContent value="completed">
          {renderProjectList(completedProjects)}
        </TabsContent>
      </Tabs>
    </div>
  );
}
