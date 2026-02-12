import { useState, useEffect } from 'react';
import { getConversations, supabase } from '../services/supabase';
import { Conversation } from '../types/database';

export function useConversations(productId?: string, executiveId?: string) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchConversations() {
      try {
        const { data, error } = await getConversations(productId, executiveId);
        
        if (error) throw error;
        setConversations(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    console.log('🔄 useConversations: Effect triggered', { productId, executiveId });
    fetchConversations();

    // Wait for auth session before setting up real-time
    const setupRealtime = async (retryCount = 0) => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('🔐 Auth session check:', session ? 'Valid' : 'No session');
        
        if (!session) {
          console.log('❌ No auth session, skipping realtime setup');
          return null;
        }

        console.log(`🔄 Setting up realtime subscription... (attempt ${retryCount + 1})`);

        // Real-time subscription with retry logic for production
        const subscription = supabase
          .channel(`conversations-${Date.now()}`)
          .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'conversations' },
            async (payload) => {
              console.log('📡 Realtime event received:', payload.eventType, (payload.new as any)?.id);
              // Refresh all conversations data
              const { data } = await getConversations(productId, executiveId);
              if (data) {
                console.log('📊 Refreshed conversations count:', data.length);
                setConversations(data);
              }
            }
          )
          .subscribe((status) => {
            console.log('📡 Realtime subscription status:', status);
            if (status === 'SUBSCRIBED') {
              console.log('✅ Realtime connected successfully');
            } else if (status === 'CLOSED' || status === 'TIMED_OUT') {
              console.log('❌ Realtime connection failed:', status);
              
              // Retry up to 3 times with exponential backoff
              if (retryCount < 3) {
                const delay = Math.pow(2, retryCount) * 2000; // 2s, 4s, 8s
                console.log(`🔄 Retrying connection in ${delay/1000}s... (${retryCount + 1}/3)`);
                setTimeout(() => {
                  setupRealtime(retryCount + 1);
                }, delay);
              } else {
                console.log('❌ Max retries reached. Realtime disabled for this session.');
              }
            }
          });

        return subscription;
      } catch (error) {
        console.error('❌ Realtime setup error:', error);
        
        // Retry on error too
        if (retryCount < 3) {
          const delay = Math.pow(2, retryCount) * 2000;
          console.log(`🔄 Retrying after error in ${delay/1000}s...`);
          setTimeout(() => {
            setupRealtime(retryCount + 1);
          }, delay);
        }
        return null;
      }
    };

    const subscriptionPromise = setupRealtime();

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up realtime subscription...');
      subscriptionPromise.then(subscription => {
        if (subscription) {
          console.log('🔌 Unsubscribing from realtime');
          subscription.unsubscribe();
        }
      }).catch(error => {
        console.error('❌ Cleanup error:', error);
      });
    };
  }, [productId, executiveId]);

  const addConversation = async (conversationData: Partial<Conversation>) => {
    try {
      // Mock implementation for now
      const newConversation = {
        id: `conv-${Date.now()}`,
        ...conversationData,
        created_at: new Date().toISOString()
      } as Conversation;
      
      setConversations(prev => [newConversation, ...prev]);
      return { data: newConversation, error: null };
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Unknown error';
      return { data: null, error };
    }
  };

  const refreshConversations = async () => {
    setLoading(true);
    try {
      const { data, error } = await getConversations(productId, executiveId);
      
      if (error) throw error;
      setConversations(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return { conversations, loading, error, addConversation, refreshConversations };
}
