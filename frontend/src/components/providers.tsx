"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { useState } from "react";

import { useRealtimeNotifications } from "@/hooks/use-realtime-notifications";

function RealtimeNotificationsProvider({ children }: { children: React.ReactNode }) {
  useRealtimeNotifications();
  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <RealtimeNotificationsProvider>
          {children}
        </RealtimeNotificationsProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
