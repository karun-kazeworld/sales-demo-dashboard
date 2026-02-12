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

    fetchConversations();

    // Wait for auth session before setting up real-time
    const setupRealtime = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      // Real-time subscription for conversations
      const subscription = supabase
        .channel('public:conversations')
        .on('postgres_changes', 
          { event: 'INSERT', schema: 'public', table: 'conversations' },
          async (payload) => {
            // Refresh all conversations data
            const { data } = await getConversations(productId, executiveId);
            if (data) {
              setConversations(data);
            }
          }
        )
        .on('postgres_changes', 
          { event: 'UPDATE', schema: 'public', table: 'conversations' },
          async (payload) => {
            // Refresh all conversations data
            const { data } = await getConversations(productId, executiveId);
            if (data) {
              setConversations(data);
            }
          }
        )
        .on('postgres_changes', 
          { event: 'DELETE', schema: 'public', table: 'conversations' },
          async (payload) => {
            // Refresh all conversations data
            const { data } = await getConversations(productId, executiveId);
            if (data) {
              setConversations(data);
            }
          }
        )
        .subscribe();

      return subscription;
    };

    const subscriptionPromise = setupRealtime();

    return () => {
      subscriptionPromise.then(subscription => subscription?.unsubscribe());
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
