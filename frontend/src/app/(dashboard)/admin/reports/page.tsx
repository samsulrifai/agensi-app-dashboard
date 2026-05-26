"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Printer } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const fmt = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

export default function AdminReportsPage() {
  const [months, setMonths] = useState("6");

  const { data, isLoading } = useQuery({
    queryKey: ['reports-financial', months],
    queryFn: async () => {
      const res = await fetch(`/api/reports/financial?months=${months}`, { credentials: 'include' });
      const json = await res.json();
      return json.data;
    },
  });

  const chartData = data?.monthly?.map((m: any) => ({
    name: m.label?.split(' ')[0] ?? m.month,
    payout: m.total,
  })) ?? [];

  const summary = data?.summary;
  const totalPaid = (summary?.totalPaid ?? 0) + (summary?.totalApproved ?? 0);
  const byProject = data?.byProject ?? [];
  const byWorker = data?.byWorker ?? [];
  const byClient = data?.byClient ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Reports & Analytics</h2>
          <p className="text-muted-foreground">Generate comprehensive reports on finances and performance.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Printer className="h-4 w-4 mr-2" /> Print</Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700"><Download className="h-4 w-4 mr-2" /> Export PDF</Button>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap gap-4 items-end bg-white dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="space-y-2 w-full md:w-auto">
          <label className="text-sm font-medium">Timeframe</label>
          <Select value={months} onValueChange={(v) => setMonths(v ?? months)}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Last Month</SelectItem>
              <SelectItem value="3">Last 3 Months</SelectItem>
              <SelectItem value="6">Last 6 Months</SelectItem>
              <SelectItem value="12">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Total Payout (Period)", value: totalPaid, sub: null },
          { label: "Approved", value: summary?.totalApproved ?? 0, sub: null },
          { label: "Pending", value: summary?.totalPending ?? 0, sub: "Waiting approval" },
          { label: "Projects Completed", value: null, count: summary?.projectsCompleted ?? 0, sub: null },
        ].map((card, i) => (
          <Card key={i} className="shadow-sm border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.label}</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-8 w-36 animate-pulse bg-slate-200 dark:bg-slate-700 rounded" />
              ) : card.count !== undefined ? (
                <div className="text-3xl font-bold">{card.count}</div>
              ) : (
                <>
                  <div className="text-3xl font-bold">{fmt(card.value ?? 0)}</div>
                  {card.sub && <p className="text-xs text-amber-500 mt-1">{card.sub}</p>}
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Monthly Payout Chart */}
      <Card className="shadow-sm border-slate-200 dark:border-slate-800">
        <CardHeader>
          <CardTitle>Monthly Payouts</CardTitle>
          <CardDescription>Payout totals per month from approved invoices.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full mt-2">
            {isLoading ? (
              <div className="h-full w-full animate-pulse bg-slate-100 dark:bg-slate-800 rounded-lg" />
            ) : chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                No data for this period
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(v) => `Rp${(v / 1000000).toFixed(0)}M`} />
                  <Tooltip
                    formatter={(value: any) => [fmt(Number(value)), 'Payout']}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#f8fafc' }}
                    itemStyle={{ color: '#f8fafc' }}
                  />
                  <Bar dataKey="payout" name="Payout" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Breakdown Tables */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* By Project */}
        <Card className="shadow-sm border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-base">By Project</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead className="text-right">Payout</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><div className="h-4 w-28 animate-pulse bg-slate-200 dark:bg-slate-700 rounded" /></TableCell>
                      <TableCell><div className="h-4 w-20 animate-pulse bg-slate-200 dark:bg-slate-700 rounded" /></TableCell>
                      <TableCell><div className="h-4 w-20 animate-pulse bg-slate-200 dark:bg-slate-700 rounded ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : byProject.length === 0 ? (
                  <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-6">No data</TableCell></TableRow>
                ) : (
                  byProject.map((p: any, i: number) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{p.projectTitle}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{p.clientName}</TableCell>
                      <TableCell className="text-right">{fmt(p.paidOut)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* By Worker */}
        <Card className="shadow-sm border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-base">By Worker</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Worker</TableHead>
                  <TableHead className="text-right">Invoices</TableHead>
                  <TableHead className="text-right">Total Payout</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><div className="h-4 w-28 animate-pulse bg-slate-200 dark:bg-slate-700 rounded" /></TableCell>
                      <TableCell><div className="h-4 w-8 animate-pulse bg-slate-200 dark:bg-slate-700 rounded ml-auto" /></TableCell>
                      <TableCell><div className="h-4 w-24 animate-pulse bg-slate-200 dark:bg-slate-700 rounded ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : byWorker.length === 0 ? (
                  <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-6">No data</TableCell></TableRow>
                ) : (
                  byWorker.map((w: any, i: number) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{w.workerName}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{w.invoiceCount}</TableCell>
                      <TableCell className="text-right">{fmt(w.totalPayout)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* By Client */}
      {byClient.length > 0 && (
        <Card className="shadow-sm border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-base">By Client</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead className="text-right">Projects</TableHead>
                  <TableHead className="text-right">Total Payout</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {byClient.map((c: any, i: number) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{c.clientName}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{c.projectCount}</TableCell>
                    <TableCell className="text-right">{fmt(c.totalPayout)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
