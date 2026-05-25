"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Wallet, Users, LayoutDashboard, AlertCircle, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DashboardStats {
  activeProjects: number;
  totalWorkers: number;
  totalPayoutMTD: number;
  deltaPercent: number;
  pendingInvoicesCount: number;
  pendingAmount: number;
  overdueProjects: number;
}

interface ProjectTask {
  status: string;
}

interface Project {
  id: string;
  title: string;
  clientName: string;
  status: string;
  priority: string;
  deadline: string;
  tasks: ProjectTask[];
}

interface Invoice {
  id: string;
  amount: number;
  status: string;
  invoiceDate: string;
  notes?: string;
  worker: { fullName: string; email: string };
  project: { title: string };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatRupiah = (amount: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);

const calcProgress = (tasks: ProjectTask[]) => {
  if (!tasks || tasks.length === 0) return 0;
  const done = tasks.filter((t) => t.status === "done").length;
  return Math.round((done / tasks.length) * 100);
};

const statusBadge = (status: string) => {
  switch (status) {
    case "in_progress":
      return (
        <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
          In Progress
        </Badge>
      );
    case "review":
      return (
        <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
          Review
        </Badge>
      );
    case "done":
      return (
        <Badge variant="outline" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
          Done
        </Badge>
      );
    case "todo":
    default:
      return (
        <Badge variant="outline" className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400">
          To Do
        </Badge>
      );
  }
};

// ─── Skeleton helpers ─────────────────────────────────────────────────────────

const KpiSkeleton = () => (
  <div className="h-[110px] rounded-lg animate-pulse bg-slate-200 dark:bg-slate-700" />
);

const RowSkeleton = () => (
  <TableRow>
    {[...Array(5)].map((_, i) => (
      <TableCell key={i}>
        <div className="h-4 rounded animate-pulse bg-slate-200 dark:bg-slate-700" />
      </TableCell>
    ))}
  </TableRow>
);

const InvoiceSkeleton = () => (
  <div className="h-[96px] rounded-lg animate-pulse bg-slate-200 dark:bg-slate-700" />
);

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const queryClient = useQueryClient();

  // KPI Stats
  const {
    data: statsData,
    isLoading: statsLoading,
    isError: statsError,
  } = useQuery<{ success: boolean; data: DashboardStats }>({
    queryKey: ["dashboard-stats"],
    queryFn: () =>
      fetch("/api/admin/dashboard/stats", { credentials: "include" }).then((r) => r.json()),
  });

  // Recent Projects
  const {
    data: projectsData,
    isLoading: projectsLoading,
    isError: projectsError,
  } = useQuery<{ success: boolean; data: { projects: Project[]; total: number } }>({
    queryKey: ["projects", "dashboard"],
    queryFn: () =>
      fetch("/api/projects?limit=5&status=in_progress,review,todo", { credentials: "include" }).then(
        (r) => r.json()
      ),
  });

  // Pending Invoices
  const {
    data: invoicesData,
    isLoading: invoicesLoading,
    isError: invoicesError,
  } = useQuery<{ success: boolean; data: { invoices: Invoice[] } }>({
    queryKey: ["invoices", "pending"],
    queryFn: () =>
      fetch("/api/invoices?status=pending", { credentials: "include" }).then((r) => r.json()),
  });

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/invoices/${id}/approve`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      fetch(`/api/invoices/${id}/reject`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });

  const handleReject = (id: string) => {
    const reason = window.prompt("Alasan penolakan:");
    if (reason === null) return; // cancelled
    rejectMutation.mutate({ id, reason });
  };

  const stats = statsData?.data;
  const projects = projectsData?.data?.projects ?? [];
  const invoices = invoicesData?.data?.invoices ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Admin Overview</h2>
          <p className="text-muted-foreground">Monitor platform performance and team workload.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Generate Report</Button>
          <Button className="bg-blue-600 hover:bg-blue-700">Create Project</Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsLoading ? (
          <>
            <KpiSkeleton />
            <KpiSkeleton />
            <KpiSkeleton />
            <KpiSkeleton />
          </>
        ) : statsError || !stats ? (
          <div className="col-span-4 text-sm text-destructive">Gagal memuat statistik.</div>
        ) : (
          <>
            {/* Total Revenue MTD */}
            <Card className="shadow-sm border-slate-200 dark:border-slate-800">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue (MTD)</CardTitle>
                <Wallet className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatRupiah(stats.totalPayoutMTD)}</div>
                <p className="text-xs text-emerald-500 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {stats.deltaPercent >= 0 ? "+" : ""}
                  {stats.deltaPercent}% from last month
                </p>
              </CardContent>
            </Card>

            {/* Total Payouts / Pending */}
            <Card className="shadow-sm border-slate-200 dark:border-slate-800">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Payouts</CardTitle>
                <Wallet className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatRupiah(stats.totalPayoutMTD)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatRupiah(stats.pendingAmount)} pending approval
                </p>
              </CardContent>
            </Card>

            {/* Active Projects */}
            <Card className="shadow-sm border-slate-200 dark:border-slate-800">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                <LayoutDashboard className="h-4 w-4 text-navy-500 dark:text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeProjects}</div>
                <p className="text-xs text-amber-500 flex items-center mt-1">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {stats.overdueProjects} over budget/deadline
                </p>
              </CardContent>
            </Card>

            {/* Active Workers */}
            <Card className="shadow-sm border-slate-200 dark:border-slate-800">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Active Workers</CardTitle>
                <Users className="h-4 w-4 text-slate-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalWorkers}</div>
                <p className="text-xs text-emerald-500 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {stats.pendingInvoicesCount} pending invoice(s)
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Project Status Table */}
        <Card className="col-span-5 shadow-sm border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle>Project Status</CardTitle>
            <CardDescription>Recent projects and their current progress.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project Name</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projectsLoading ? (
                  <>
                    <RowSkeleton />
                    <RowSkeleton />
                    <RowSkeleton />
                  </>
                ) : projectsError ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-sm text-destructive">
                      Gagal memuat data proyek.
                    </TableCell>
                  </TableRow>
                ) : projects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-sm text-muted-foreground">
                      Tidak ada proyek aktif.
                    </TableCell>
                  </TableRow>
                ) : (
                  projects.map((project) => {
                    const progress = calcProgress(project.tasks);
                    return (
                      <TableRow key={project.id}>
                        <TableCell className="font-medium">{project.title}</TableCell>
                        <TableCell>{project.clientName}</TableCell>
                        <TableCell className="w-[150px]">
                          <div className="flex items-center gap-2">
                            <Progress value={progress} className="h-2" />
                            <span className="text-xs text-muted-foreground">{progress}%</span>
                          </div>
                        </TableCell>
                        <TableCell>{statusBadge(project.status)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Pending Invoices */}
        <Card className="col-span-2 shadow-sm border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle>Action Required</CardTitle>
            <CardDescription>Pending invoices needing approval.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {invoicesLoading ? (
              <>
                <InvoiceSkeleton />
                <InvoiceSkeleton />
              </>
            ) : invoicesError ? (
              <p className="text-sm text-destructive">Gagal memuat invoice.</p>
            ) : invoices.length === 0 ? (
              <p className="text-sm text-muted-foreground">Tidak ada invoice pending.</p>
            ) : (
              invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex flex-col gap-2 p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-sm">{invoice.worker.fullName}</div>
                      <div className="text-xs text-muted-foreground">{invoice.project.title}</div>
                    </div>
                    <div className="font-bold text-sm">{formatRupiah(invoice.amount)}</div>
                  </div>
                  <div className="flex gap-2 mt-3 w-full">
                    <Button
                      size="sm"
                      className="flex-1 h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={() => approveMutation.mutate(invoice.id)}
                      disabled={approveMutation.isPending || rejectMutation.isPending}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="flex-1 h-8 text-xs"
                      onClick={() => handleReject(invoice.id)}
                      disabled={approveMutation.isPending || rejectMutation.isPending}
                    >
                      Reject
                    </Button>
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
