import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useQueryClient } from '@tanstack/react-query';
import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Singleton client so we don't recreate it on every render
const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

export function useRealtimeNotifications() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!session?.user?.id || !supabase) return;

    const userId = session.user.id;
    const channelName = `notifications:${userId}`;

    const channel = supabase.channel(channelName)
      .on(
        'broadcast',
        { event: 'new_notification' },
        (payload) => {
          console.log('Received real-time notification:', payload);
          
          // Show toast notification
          toast(payload.payload?.title || 'New Notification', {
            description: payload.payload?.body,
            action: {
              label: 'View',
              onClick: () => {
                // Could navigate to relevant page depending on payload.type
                console.log('Clicked notification:', payload.payload);
              }
            }
          });

          // Invalidate queries to update dropdown/badges
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Subscribed to realtime channel: ${channelName}`);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.user?.id, queryClient]);
}
