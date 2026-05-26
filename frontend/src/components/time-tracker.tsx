"use client";

import { useState, useEffect } from "react";
import { Play, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TimeTrackerProps {
  taskId: string;
  isActive?: boolean;
  initialSeconds?: number;
  onStart: (taskId: string) => void;
  onStop: (taskId: string) => void;
  isPending?: boolean;
  className?: string;
  variant?: "compact" | "full";
}

export function TimeTracker({
  taskId,
  isActive = false,
  initialSeconds = 0,
  onStart,
  onStop,
  isPending = false,
  className,
  variant = "full",
}: TimeTrackerProps) {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    setSeconds(initialSeconds);
  }, [initialSeconds, isActive]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive]);

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  if (variant === "compact") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        {isActive && (
          <span className="relative flex h-2 w-2 mr-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        )}
        <span className={cn("font-mono text-sm", isActive ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-muted-foreground")}>
          {formatTime(seconds)}
        </span>
        {isActive ? (
          <Button 
            size="icon" 
            variant="outline" 
            className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200" 
            onClick={() => onStop(taskId)}
            disabled={isPending}
          >
            <Square className="h-3 w-3 fill-current" />
          </Button>
        ) : (
          <Button 
            size="icon" 
            variant="outline" 
            className="h-7 w-7 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200" 
            onClick={() => onStart(taskId)}
            disabled={isPending}
          >
            <Play className="h-3 w-3 fill-current" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md p-1.5", className)}>
      <div className="flex items-center justify-center bg-slate-100 dark:bg-slate-900 rounded px-3 py-1.5 min-w-[100px]">
        {isActive && (
          <span className="relative flex h-2.5 w-2.5 mr-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
        )}
        <span className={cn("font-mono font-medium tracking-wider", isActive ? "text-emerald-600 dark:text-emerald-400" : "text-slate-600 dark:text-slate-300")}>
          {formatTime(seconds)}
        </span>
      </div>
      
      {isActive ? (
        <Button 
          size="sm" 
          variant="destructive" 
          className="h-8 gap-1.5" 
          onClick={() => onStop(taskId)}
          disabled={isPending}
        >
          <Square className="h-3.5 w-3.5 fill-current" /> Stop
        </Button>
      ) : (
        <Button 
          size="sm" 
          className="h-8 gap-1.5 bg-emerald-600 hover:bg-emerald-700" 
          onClick={() => onStart(taskId)}
          disabled={isPending}
        >
          <Play className="h-3.5 w-3.5 fill-current" /> Start
        </Button>
      )}
    </div>
  );
}
