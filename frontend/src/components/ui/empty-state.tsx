import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon, title, description, action, className, ...props }: EmptyStateProps) {
  return (
    <div 
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center min-h-[400px] border border-dashed rounded-lg bg-slate-50/50 dark:bg-slate-900/20",
        className
      )}
      {...props}
    >
      {icon && (
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-muted-foreground">
          {icon}
        </div>
      )}
      <h3 className="text-xl font-semibold">{title}</h3>
      {description && (
        <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
          {description}
        </p>
      )}
      {action && (
        <div className="mt-6">
          <Button onClick={action.onClick}>{action.label}</Button>
        </div>
      )}
    </div>
  );
}
