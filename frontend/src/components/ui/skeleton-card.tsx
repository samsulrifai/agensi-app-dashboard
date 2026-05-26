import { cn } from "@/lib/utils";

interface SkeletonCardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SkeletonCard({ className, ...props }: SkeletonCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card text-card-foreground shadow-sm flex flex-col p-6 space-y-4",
        className
      )}
      {...props}
    >
      <div className="flex items-center space-x-4">
        <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
        <div className="space-y-2 flex-1">
          <div className="h-4 w-1/3 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
          <div className="h-3 w-1/4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        </div>
      </div>
      <div className="space-y-2 pt-4">
        <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        <div className="h-4 w-5/6 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-md border">
      <div className="border-b bg-muted/50 p-4">
        <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
      </div>
      <div className="divide-y">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4 flex items-center space-x-4">
            <div className="h-4 w-1/4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
            <div className="h-4 w-1/4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
            <div className="h-4 w-1/4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
            <div className="h-4 w-1/4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
