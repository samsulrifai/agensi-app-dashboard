"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Play, FileUp, MessageSquare, MoreVertical, Calendar } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { useWorkerProjects, useStartTimer, useCompleteTask } from "@/lib/api-client";
import { FileUploader } from "@/components/ui/file-uploader";
import { toast } from "sonner";

export default function WorkerProjectsPage() {
  const { data: projects, isLoading } = useWorkerProjects();
  const startTimer = useStartTimer();
  const completeTask = useCompleteTask();

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading projects...</div>;
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

  const handleCompleteTask = (taskId: string) => {
    completeTask.mutate(taskId, {
      onSuccess: () => toast.success("Task marked as done!"),
      onError: (err: any) => toast.error(err.message || "Failed to complete task"),
    });
  };

  const renderProjectList = (projectList: any[]) => {
    if (projectList.length === 0) {
      return <div className="text-center p-8 text-muted-foreground border rounded-lg border-dashed mt-6">No projects found.</div>;
    }
    
    return projectList.map((project) => (
      <Card key={project.id} className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mb-6 mt-6">
        <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-6 py-4 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-bold">{project.title}</h3>
              {project.isUrgent && (
                <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800">
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
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleStartTimer(task.id)}
                    disabled={task.status === 'done' || startTimer.isPending}
                    className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:border-emerald-800 dark:hover:bg-emerald-900/20"
                  >
                    <Play className="h-3 w-3 mr-1" /> Start Timer
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleCompleteTask(task.id)}
                    disabled={task.status === 'done' || completeTask.isPending}
                    className="bg-white dark:bg-slate-950"
                  >
                    Done
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 px-6 py-4 flex gap-3">
          <Dialog>
            <DialogTrigger asChild>
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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">My Projects</h2>
          <p className="text-muted-foreground">Manage your active tasks and track your time.</p>
        </div>
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
