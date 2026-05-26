import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const fetcher = async (url: string, options?: RequestInit) => {
  const res = await fetch(url, options);
  const data = await res.json();
  if (!res.ok) {
    const msg = typeof data.error === 'string' ? data.error : data.error?.message || "An error occurred";
    throw new Error(msg);
  }
  return data.data || data;
};

// -- Worker Queries --
export const useWorkerDashboard = () => useQuery({
  queryKey: ['worker-dashboard'],
  queryFn: async () => {
    const res = await fetch('/api/workers/me/dashboard');
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Error');
    return json.data; // { earnings, activeProjectsCount, projects, rating, ... }
  },
});

export const useWorkerProjects = () => useQuery({
  queryKey: ['worker-projects'],
  queryFn: async () => {
    const res = await fetch('/api/workers/me/projects');
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Error');
    return json.data?.projects ?? json.data ?? []; // array of projects
  },
});

export const useWorkerInvoices = () => useQuery({
  queryKey: ['worker-invoices'],
  queryFn: async () => {
    const res = await fetch('/api/invoices');
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Error');
    return json.data?.invoices ?? json.data ?? []; // array of invoices
  },
});

export const useWorkerStats = () => useQuery({
  queryKey: ['worker-stats'],
  queryFn: async () => {
    const res = await fetch('/api/workers/me/stats');
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Error');
    return json.data;
  },
});

export const useActiveTimer = () => useQuery({
  queryKey: ['active-timer'],
  queryFn: async () => {
    const res = await fetch('/api/workers/me/active-timer');
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Error');
    return json.data;
  },
});

export const useRatingTrend = () => useQuery({
  queryKey: ['rating-trend'],
  queryFn: async () => {
    const res = await fetch('/api/workers/me/rating-trend');
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Error');
    return Array.isArray(json.data) ? json.data : json.data?.months ?? [];
  },
});


// -- Admin Queries --
export const useAdminDashboard = () => useQuery({
  queryKey: ['admin-dashboard'],
  queryFn: () => fetcher('/api/admin/dashboard'),
});

export const useAdminProjects = () => useQuery({
  queryKey: ['admin-projects'],
  queryFn: () => fetcher('/api/projects'),
});

export const useAdminWorkers = () => useQuery({
  queryKey: ['admin-workers'],
  queryFn: () => fetcher('/api/workers'),
});

export const useAdminInvoices = () => useQuery({
  queryKey: ['admin-invoices'],
  queryFn: () => fetcher('/api/invoices'),
});

// -- Mutations --
export const useStartTimer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => fetcher(`/api/tasks/${taskId}/time/start`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['worker-projects'] });
      queryClient.invalidateQueries({ queryKey: ['active-timer'] });
    },
  });
};

export const useStopTimer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => fetcher(`/api/tasks/${taskId}/time/stop`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['worker-projects'] });
      queryClient.invalidateQueries({ queryKey: ['active-timer'] });
    },
  });
};

export const useCompleteTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => fetcher(`/api/tasks/${taskId}/complete`, { method: 'POST' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['worker-projects'] }),
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (projectId: string) => fetcher(`/api/projects/${projectId}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-projects'] }),
  });
};

export const useRateWorker = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => fetcher('/api/ratings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-projects'] }),
  });
};

export const useGlobalSearch = (query: string) => {
  return useQuery({
    queryKey: ['global-search', query],
    queryFn: () => fetcher(`/api/search?q=${encodeURIComponent(query)}`),
    enabled: query.length >= 2,
    staleTime: 60 * 1000,
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => fetcher('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-projects'] }),
  });
};

export const useInviteWorker = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => fetcher('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, role: "worker" }),
    }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-workers'] }),
  });
};

export const useSubmitInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => fetcher('/api/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['worker-invoices'] }),
  });
};

export const useNotifications = () => {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: () => fetcher('/api/notifications?limit=10'),
    refetchInterval: 30000, // Fallback if realtime fails
  });
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => fetcher(`/api/notifications/${id}/read`, { method: 'PUT' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => fetcher('/api/notifications/read-all', { method: 'PUT' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });
};
