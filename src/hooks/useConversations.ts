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
    const setupRealtime = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('🔐 Auth session check:', session ? 'Valid' : 'No session');
        
        if (!session) {
          console.log('❌ No auth session, skipping realtime setup');
          return null;
        }

        console.log('🔄 Setting up realtime subscription...');

        // Real-time subscription for conversations
        const subscription = supabase
          .channel(`conversations-${Date.now()}`) // Unique channel name to prevent conflicts
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
            }
          });

        return subscription;
      } catch (error) {
        console.error('❌ Realtime setup error:', error);
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
