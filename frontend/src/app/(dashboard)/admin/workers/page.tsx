'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Filter, Star, Briefcase, Mail } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Worker {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  skills: string[];
  isActive: boolean;
  _count: {
    projectWorkers: number;
    ratings: number;
  };
  avgRating?: number;
}

interface WorkersResponse {
  success: boolean;
  data: {
    workers: Worker[];
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function getWorkloadBadge(projectCount: number) {
  if (projectCount >= 4) {
    return (
      <Badge
        variant="outline"
        className="text-[10px] text-amber-600 border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400"
      >
        Overload
      </Badge>
    );
  }
  if (projectCount <= 1) {
    return (
      <Badge
        variant="outline"
        className="text-[10px] text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400"
      >
        Available
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className="text-[10px] text-blue-600 border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400"
    >
      Active
    </Badge>
  );
}

function getWorkloadIconColor(projectCount: number): string {
  if (projectCount >= 4) return 'text-amber-500';
  if (projectCount <= 1) return 'text-emerald-500';
  return 'text-blue-500';
}

// ─── Skeleton Row ─────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
          <div className="space-y-1.5">
            <div className="h-3.5 w-28 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
            <div className="h-3 w-36 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex gap-1">
          <div className="h-5 w-14 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
          <div className="h-5 w-14 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
        </div>
      </TableCell>
      <TableCell>
        <div className="h-5 w-28 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
      </TableCell>
      <TableCell>
        <div className="h-5 w-16 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <div className="h-8 w-8 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
          <div className="h-8 w-24 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
        </div>
      </TableCell>
    </TableRow>
  );
}

// ─── Page Component ───────────────────────────────────────────────────────────

export default function AdminWorkersPage() {
  const [search, setSearch] = useState('');

  const { data, isLoading, isError } = useQuery<WorkersResponse>({
    queryKey: ['workers'],
    queryFn: async () => {
      const res = await fetch('/api/workers', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch workers');
      return res.json();
    },
  });

  const allWorkers: Worker[] = data?.data?.workers ?? [];

  // Client-side search filter
  const filtered = allWorkers.filter((w) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      w.fullName.toLowerCase().includes(q) ||
      w.skills.join(' ').toLowerCase().includes(q)
    );
  });

  const activeCount = allWorkers.filter((w) => w.isActive).length;
  const inactiveCount = allWorkers.filter((w) => !w.isActive).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Worker Directory</h2>
          <p className="text-muted-foreground">Manage your team, view workloads, and track performance.</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700">Invite Worker</Button>
      </div>

      <Card className="shadow-sm border-slate-200 dark:border-slate-800">
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by name or skill..."
                className="pl-9 w-full"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon"><Filter className="h-4 w-4" /></Button>
          </div>
          <div className="flex gap-2">
            <Badge
              variant="secondary"
              className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
            >
              {isLoading ? '—' : `${activeCount} Active`}
            </Badge>
            <Badge variant="outline" className="text-slate-500">
              {isLoading ? '—' : `${inactiveCount} Inactive`}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Worker</TableHead>
                <TableHead>Skills</TableHead>
                <TableHead>Active Workload</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <>
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                </>
              )}

              {isError && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-sm text-red-500 py-8">
                    Gagal memuat data workers. Silakan coba lagi.
                  </TableCell>
                </TableRow>
              )}

              {!isLoading && !isError && filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-8">
                    Tidak ada worker yang ditemukan.
                  </TableCell>
                </TableRow>
              )}

              {!isLoading && !isError && filtered.map((worker) => {
                const projectCount = worker._count.projectWorkers;
                const visibleSkills = worker.skills.slice(0, 3);
                const extraSkills = worker.skills.length - 3;

                return (
                  <TableRow key={worker.id}>
                    {/* Worker identity */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={worker.avatarUrl} />
                          <AvatarFallback>{getInitials(worker.fullName)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{worker.fullName}</div>
                          <div className="text-xs text-muted-foreground">{worker.email}</div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Skills */}
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {visibleSkills.map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-[10px]">
                            {skill}
                          </Badge>
                        ))}
                        {extraSkills > 0 && (
                          <Badge variant="secondary" className="text-[10px]">
                            +{extraSkills}
                          </Badge>
                        )}
                      </div>
                    </TableCell>

                    {/* Workload */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Briefcase className={`h-4 w-4 ${getWorkloadIconColor(projectCount)}`} />
                        <span className="text-sm font-medium">
                          {projectCount} {projectCount === 1 ? 'Project' : 'Projects'}
                        </span>
                        {getWorkloadBadge(projectCount)}
                      </div>
                    </TableCell>

                    {/* Rating */}
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-emerald-500 fill-emerald-500" />
                        <span className="font-medium">
                          {worker.avgRating != null ? worker.avgRating.toFixed(1) : '—'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ({worker._count.ratings})
                        </span>
                      </div>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon">
                          <Mail className="h-4 w-4 text-slate-500" />
                        </Button>
                        <Button variant="outline" size="sm">View Profile</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
