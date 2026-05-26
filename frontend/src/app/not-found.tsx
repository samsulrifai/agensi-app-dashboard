import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 animate-in fade-in duration-500">
      <div className="flex max-w-[400px] flex-col items-center text-center space-y-6">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-900 shadow-sm">
          <FileQuestion className="h-12 w-12 text-slate-400 dark:text-slate-500" />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">404</h1>
          <h2 className="text-xl font-semibold tracking-tight text-slate-700 dark:text-slate-300">Page not found</h2>
          <p className="text-muted-foreground">
            Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
          </p>
        </div>
        <Link href="/">
          <Button className="mt-4" size="lg">Back to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
