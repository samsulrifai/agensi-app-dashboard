"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Printer } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const fmt = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

export default function AdminReportsPage() {
  const [months, setMonths] = useState("6");

  const { data, isLoading } = useQuery({
    queryKey: ['reports-financial', months],
    queryFn: async () => {
      const res = await fetch(`/api/reports/financial?months=${months}`);
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

      <div className="flex flex-wrap gap-4 items-end bg-white dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="space-y-2 w-full md:w-auto">
          <label className="text-sm font-medium">Report Type</label>
          <Select defaultValue="financial">
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="financial">Financial Overview</SelectItem>
              <SelectItem value="performance">Worker Performance</SelectItem>
              <SelectItem value="projects">Project Status</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 w-full md:w-auto">
          <label className="text-sm font-medium">Timeframe</label>
          <Select value={months} onValueChange={(v) => setMonths(v ?? months)}>
            <SelectTrigger className="w-full md:w-[150px]">
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

        <Button variant="secondary" className="w-full md:w-auto mt-4 md:mt-0">Generate</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-sm border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Dibayar (YTD)</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-8 w-36 animate-pulse bg-slate-200 dark:bg-slate-700 rounded" />
            ) : (
              <div className="text-3xl font-bold">{fmt(totalPaid)}</div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Disetujui (Approved)</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-8 w-36 animate-pulse bg-slate-200 dark:bg-slate-700 rounded" />
            ) : (
              <div className="text-3xl font-bold">{fmt(summary?.totalApproved ?? 0)}</div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Menunggu Persetujuan</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-8 w-36 animate-pulse bg-slate-200 dark:bg-slate-700 rounded" />
            ) : (
              <>
                <div className="text-3xl font-bold">{fmt(summary?.totalPending ?? 0)}</div>
                <p className="text-xs text-amber-500 mt-1">Waiting for approval</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Chart */}
      <Card className="shadow-sm border-slate-200 dark:border-slate-800">
        <CardHeader>
          <CardTitle>
            Monthly Payouts ({months === "1" ? "Last Month" : months === "12" ? "Last Year" : `Last ${months} Months`})
          </CardTitle>
          <CardDescription>Monthly payout performance from real invoice data.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] w-full mt-4">
            {isLoading ? (
              <div className="h-full w-full animate-pulse bg-slate-100 dark:bg-slate-800 rounded-lg" />
            ) : chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                No data available for this period
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
    </div>
  );
}
