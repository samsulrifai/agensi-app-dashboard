'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, FileCheck2, FileX2, Eye, Download, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface Invoice {
  id: string;
  amount: number;
  status: 'pending' | 'approved' | 'paid' | 'rejected';
  invoiceDate: string;
  dueDate?: string;
  notes?: string;
  rejectionReason?: string;
  worker: { fullName: string; email: string };
  project: { title: string; clientName?: string };
}

function formatRupiah(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function StatusBadge({ status }: { status: Invoice['status'] }) {
  switch (status) {
    case 'pending':
      return (
        <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
          Needs Review
        </Badge>
      );
    case 'approved':
      return (
        <Badge variant="outline" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
          Approved
        </Badge>
      );
    case 'paid':
      return (
        <Badge variant="outline" className="bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300">
          Paid
        </Badge>
      );
    case 'rejected':
      return (
        <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
          Rejected
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export default function AdminFinancePage() {
  const [search, setSearch] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<{ invoices: Invoice[] }>({
    queryKey: ['invoices'],
    queryFn: async () => {
      const res = await fetch('/api/invoices', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch invoices');
      const json = await res.json();
      return json.data;
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/invoices/${id}/approve`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error('Failed to approve invoice');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const res = await fetch(`/api/invoices/${id}/reject`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) throw new Error('Failed to reject invoice');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });

  const handleApprove = (id: string) => {
    approveMutation.mutate(id);
  };

  const handleReject = (id: string) => {
    const reason = window.prompt('Alasan penolakan:');
    if (reason !== null) {
      rejectMutation.mutate({ id, reason });
    }
  };

  const invoices = data?.invoices ?? [];
  const filtered = invoices.filter((inv) => {
    const q = search.toLowerCase();
    return (
      inv.worker.fullName.toLowerCase().includes(q) ||
      inv.project.title.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Finance &amp; Approvals</h2>
          <p className="text-muted-foreground">Review worker invoices and manage payouts.</p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" /> Export CSV
        </Button>
      </div>

      <Card className="shadow-sm border-slate-200 dark:border-slate-800">
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4">
          <div>
            <CardTitle>Invoice Queue</CardTitle>
            <CardDescription>Invoices waiting for your review and approval.</CardDescription>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search invoices..."
              className="pl-9 w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Worker</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" /></TableCell>
                    <TableCell><div className="h-4 w-40 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" /></TableCell>
                    <TableCell><div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" /></TableCell>
                    <TableCell><div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" /></TableCell>
                    <TableCell><div className="h-5 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" /></TableCell>
                    <TableCell className="text-right"><div className="h-8 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    Tidak ada invoice ditemukan.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((invoice) => {
                  const isPending = invoice.status === 'pending';
                  return (
                    <TableRow
                      key={invoice.id}
                      className={
                        isPending
                          ? 'bg-amber-50/50 dark:bg-amber-900/5 hover:bg-amber-50 dark:hover:bg-amber-900/10'
                          : undefined
                      }
                    >
                      <TableCell>
                        <div className="font-medium">{invoice.worker.fullName}</div>
                      </TableCell>
                      <TableCell>{invoice.project.title}</TableCell>
                      <TableCell>{formatDate(invoice.invoiceDate)}</TableCell>
                      <TableCell className={isPending ? 'font-semibold' : undefined}>
                        {formatRupiah(invoice.amount)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={invoice.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant={isPending ? 'outline' : 'ghost'}
                            size="icon"
                            className="h-8 w-8 text-blue-600 border-blue-200 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/20"
                            title="Detail"
                            onClick={() => setSelectedInvoice(invoice)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {isPending && (
                            <>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-900/20"
                                title="Approve"
                                onClick={() => handleApprove(invoice.id)}
                                disabled={approveMutation.isPending}
                              >
                                <FileCheck2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                                title="Reject"
                                onClick={() => handleReject(invoice.id)}
                                disabled={rejectMutation.isPending}
                              >
                                <FileX2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>


      {/* Invoice Detail Modal */}
      <Dialog open={!!selectedInvoice} onOpenChange={(open) => !open && setSelectedInvoice(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detail Invoice</DialogTitle>
            <DialogDescription>
              {selectedInvoice?.worker.fullName} — {selectedInvoice?.project.title}
            </DialogDescription>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="space-y-1">
                  <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">Worker</p>
                  <p className="font-medium">{selectedInvoice.worker.fullName}</p>
                  <p className="text-muted-foreground text-xs">{selectedInvoice.worker.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">Project</p>
                  <p className="font-medium">{selectedInvoice.project.title}</p>
                  {selectedInvoice.project.clientName && (
                    <p className="text-muted-foreground text-xs">{selectedInvoice.project.clientName}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">Amount</p>
                  <p className="font-bold text-lg">{formatRupiah(selectedInvoice.amount)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">Status</p>
                  <StatusBadge status={selectedInvoice.status} />
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">Tanggal Diajukan</p>
                  <p>{formatDate(selectedInvoice.invoiceDate)}</p>
                </div>
                {selectedInvoice.dueDate && (
                  <div className="space-y-1">
                    <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">Jatuh Tempo</p>
                    <p>{formatDate(selectedInvoice.dueDate)}</p>
                  </div>
                )}
              </div>
              {selectedInvoice.notes && (
                <div className="space-y-1 border-t pt-3">
                  <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">Catatan</p>
                  <p className="text-sm">{selectedInvoice.notes}</p>
                </div>
              )}
              {selectedInvoice.rejectionReason && (
                <div className="space-y-1 border-t pt-3">
                  <p className="text-red-500 text-xs font-medium uppercase tracking-wide">Alasan Penolakan</p>
                  <p className="text-sm text-red-600 dark:text-red-400">{selectedInvoice.rejectionReason}</p>
                </div>
              )}
              {selectedInvoice.status === 'pending' && (
                <div className="flex gap-2 border-t pt-3">
                  <Button
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white"
                    onClick={() => { handleApprove(selectedInvoice.id); setSelectedInvoice(null); }}
                    disabled={approveMutation.isPending}
                  >
                    <FileCheck2 className="h-4 w-4 mr-2" /> Approve
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => { handleReject(selectedInvoice.id); setSelectedInvoice(null); }}
                    disabled={rejectMutation.isPending}
                  >
                    <X className="h-4 w-4 mr-2" /> Reject
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
