"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertOctagon } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
          <div className="flex max-w-[400px] flex-col items-center text-center space-y-6">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20 shadow-sm">
              <AlertOctagon className="h-12 w-12 text-red-600 dark:text-red-400" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">Something went wrong!</h1>
              <p className="text-muted-foreground text-sm">
                A critical error occurred. Please try again or contact support if the issue persists.
              </p>
            </div>
            <div className="flex gap-4 mt-4">
              <Button onClick={() => window.location.reload()} variant="outline">
                Reload Page
              </Button>
              <Button onClick={() => reset()}>
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
