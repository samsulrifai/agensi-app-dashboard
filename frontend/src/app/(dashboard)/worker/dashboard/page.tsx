"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Wallet, Star, Clock, ArrowUpRight, Activity } from "lucide-react";
import { useWorkerDashboard, useActiveTimer, useStartTimer, useStopTimer } from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";
import { TimeTracker } from "@/components/time-tracker";
import { SkeletonCard } from "@/components/ui/skeleton-card";
import { EmptyState } from "@/components/ui/empty-state";

export default function WorkerDashboardPage() {
  const { data, isLoading } = useWorkerDashboard();
  const { data: activeTimer } = useActiveTimer();
  const startTimer = useStartTimer();
  const stopTimer = useStopTimer();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SkeletonCard className="h-20" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <SkeletonCard className="h-[110px]" />
          <SkeletonCard className="h-[110px]" />
          <SkeletonCard className="h-[110px]" />
          <SkeletonCard className="h-[110px]" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <SkeletonCard className="col-span-4 h-[300px]" />
          <SkeletonCard className="col-span-3 h-[300px]" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { earnings, activeProjectsCount, projects, rating, recentNotifications } = data;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Overview</h2>
        <p className="text-muted-foreground">Welcome back, here is what&apos;s happening with your projects.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm border-slate-200 dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <Wallet className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(earnings?.thisMonth || 0)}</div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-slate-200 dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeProjectsCount || 0}</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200 dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
            <Wallet className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(earnings?.pending || 0)}</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200 dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Performance Rating</CardTitle>
            <Star className="h-4 w-4 text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(rating?.overall || 0).toFixed(1)} / 5.0</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 space-y-4">
          {/* Currently Tracking Widget */}
          {activeTimer && activeTimer.taskId && (
            <Card className="shadow-sm border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/50 dark:bg-emerald-900/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center text-emerald-800 dark:text-emerald-400">
                  <Activity className="h-4 w-4 mr-2 animate-pulse" />
                  Currently Tracking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="font-semibold text-lg">{activeTimer.taskTitle || 'Current Task'}</div>
                    <div className="text-sm text-muted-foreground">{activeTimer.projectTitle || 'Project'}</div>
                  </div>
                  <TimeTracker 
                    taskId={activeTimer.taskId}
                    isActive={true}
                    initialSeconds={Math.floor((new Date().getTime() - new Date(activeTimer.startedAt).getTime()) / 1000)}
                    onStart={(id) => startTimer.mutate(id)}
                    onStop={(id) => stopTimer.mutate(id)}
                    isPending={stopTimer.isPending}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Active Projects Widget */}
          <Card className="shadow-sm border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle>Active Projects</CardTitle>
            <CardDescription>You have {activeProjectsCount || 0} projects currently in progress.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {projects?.length === 0 ? (
              <EmptyState 
                icon={<Clock className="h-8 w-8" />}
                title="No active projects"
                description="You are currently not assigned to any projects."
              />
            ) : (
              projects?.map((project: any) => (
                <div key={project.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{project.title}</div>
                      <div className="text-xs text-muted-foreground">{project.clientName || 'Agency Project'}</div>
                    </div>
                    <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                      {project.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <Progress value={project.progress || 0} className="h-2" />
                </div>
              ))
            )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Notifications */}
        <Card className="col-span-3 shadow-sm border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest notifications and updates.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {(!recentNotifications || recentNotifications.length === 0) ? (
              <EmptyState 
                icon={<Activity className="h-8 w-8" />}
                title="No recent activity"
                description="You're all caught up!"
              />
            ) : (
              recentNotifications.map((notif: any) => (
                <div key={notif.id} className="flex gap-4 items-start">
                  <div className={`w-2 h-2 mt-2 rounded-full ${notif.isRead ? 'bg-slate-300 dark:bg-slate-700' : 'bg-emerald-500'}`} />
                  <div>
                    <p className="text-sm font-medium">{notif.title || notif.type}</p>
                    <p className="text-xs text-muted-foreground">{notif.message}</p>
                    <span className="text-[10px] text-muted-foreground">{new Date(notif.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
