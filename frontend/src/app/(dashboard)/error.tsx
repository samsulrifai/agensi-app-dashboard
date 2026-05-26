"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full flex-col items-center justify-center p-4">
      <div className="flex max-w-[400px] flex-col items-center text-center space-y-4 border rounded-xl p-8 bg-card shadow-sm">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
          <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold">Something went wrong</h2>
          <p className="text-muted-foreground text-sm">
            We encountered an error loading this section. You can try recovering by clicking the button below.
          </p>
        </div>
        <Button onClick={() => reset()} className="mt-4">
          Try Again
        </Button>
      </div>
    </div>
  );
}
