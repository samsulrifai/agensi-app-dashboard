"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Download, Search } from "lucide-react";
import { useWorkerInvoices, useWorkerProjects, useSubmitInvoice } from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

export default function WorkerFinancePage() {
  const { data: invoices, isLoading } = useWorkerInvoices();
  const { data: projects } = useWorkerProjects();
  const submitInvoice = useSubmitInvoice();

  const [isOpen, setIsOpen] = useState(false);
  const [projectId, setProjectId] = useState("");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !amount) {
      toast.error("Please select a project and enter an amount");
      return;
    }

    submitInvoice.mutate({
      projectId,
      amount: Number(amount),
      notes,
    }, {
      onSuccess: () => {
        toast.success("Invoice submitted successfully");
        setIsOpen(false);
        setProjectId("");
        setAmount("");
        setNotes("");
      },
      onError: (err: any) => {
        toast.error(err.message || "Failed to submit invoice");
      }
    });
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "pending":
        return <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">Pending</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">Approved</Badge>;
      case "paid":
        return <Badge variant="outline" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">Paid</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Finance & Invoices</h2>
          <p className="text-muted-foreground">Manage your payouts and submit new invoices.</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger render={<Button className="bg-emerald-600 hover:bg-emerald-700" />}>
            <Plus className="h-4 w-4 mr-2" /> Submit Invoice
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Submit Invoice</DialogTitle>
                <DialogDescription>
                  Create a new invoice for a completed milestone or project.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="project">Project</Label>
                  <Select value={projectId} onValueChange={(val) => setProjectId(val || "")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects?.map((p: any) => (
                        <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                      ))}
                      {projects?.length === 0 && (
                        <SelectItem value="none" disabled>No active projects</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (Rp)</Label>
                  <Input 
                    id="amount" 
                    placeholder="e.g. 5000000" 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea 
                    id="notes" 
                    placeholder="Describe the work completed..." 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="file">Attachment (Optional)</Label>
                  <Input id="file" type="file" />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={submitInvoice.isPending} className="bg-emerald-600 hover:bg-emerald-700 w-full">
                  {submitInvoice.isPending ? "Submitting..." : "Submit Invoice"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-sm border-slate-200 dark:border-slate-800">
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle>Invoice History</CardTitle>
            <CardDescription>A list of your recent invoices and their status.</CardDescription>
          </div>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search invoices..."
              className="w-full pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground animate-pulse">Loading invoices...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice ID</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No invoices found.</TableCell>
                  </TableRow>
                )}
                {invoices?.map((invoice: any) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">INV-{new Date(invoice.createdAt).getFullYear()}-{invoice.id.substring(0,4).toUpperCase()}</TableCell>
                    <TableCell>{invoice.project?.title || 'Unknown Project'}</TableCell>
                    <TableCell>{new Date(invoice.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>{formatCurrency(invoice.amount)}</TableCell>
                    <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon"><Download className="h-4 w-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
