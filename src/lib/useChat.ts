import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from './supabase';
import type { User } from './supabase';

export interface ChatMessage {
  id: string;
  community_id: string;
  author_id: string;
  content: string;
  reply_to: string | null;
  is_deleted: boolean;
  created_at: string;
  author_data?: Pick<User, 'id' | 'name' | 'display_name' | 'profile_photo' | 'role'>;
}

export function useChat(communityId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const loadMessages = useCallback(async () => {
    if (!communityId) { setIsLoading(false); return; }
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('community_messages')
        .select('*')
        .eq('community_id', communityId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) throw error;

      // Enriquecer com dados do autor
      const authorIds = [...new Set((data || []).map(m => m.author_id))];
      let authorsMap: Record<string, any> = {};
      if (authorIds.length > 0) {
        const { data: authors } = await supabase
          .from('users').select('id, name, display_name, profile_photo, role').in('id', authorIds);
        (authors || []).forEach(a => { authorsMap[a.id] = a; });
      }

      const enriched = (data || []).map(m => ({
        ...m,
        author_data: authorsMap[m.author_id] || { id: m.author_id, name: 'Membro', profile_photo: null, role: 'member' }
      }));

      setMessages(enriched);
    } catch (err) {
      console.error('[useChat] Erro:', err);
    } finally {
      setIsLoading(false);
    }
  }, [communityId]);

  // Realtime
  useEffect(() => {
    loadMessages();

    if (!communityId) return;

    const channel = supabase
      .channel(`chat-${communityId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'community_messages',
        filter: `community_id=eq.${communityId}`,
      }, async (payload) => {
        const newMsg = payload.new as ChatMessage;
        // Buscar autor
        const { data: author } = await supabase
          .from('users').select('id, name, display_name, profile_photo, role').eq('id', newMsg.author_id).single();
        setMessages(prev => [...prev, { ...newMsg, author_data: author || { id: newMsg.author_id, name: 'Membro', profile_photo: null, role: 'member' } }]);
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
    };
  }, [communityId, loadMessages]);

  const sendMessage = useCallback(async (content: string, replyTo?: string) => {
    if (!communityId) return { success: false, error: 'Sem comunidade' };
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false, error: 'Nao autenticado' };

      const { error } = await supabase.from('community_messages').insert({
        community_id: communityId,
        author_id: user.id,
        content: content.trim(),
        reply_to: replyTo || null,
      });

      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }, [communityId]);

  const deleteMessage = useCallback(async (messageId: string) => {
    try {
      await supabase.from('community_messages').update({ is_deleted: true }).eq('id', messageId);
      setMessages(prev => prev.filter(m => m.id !== messageId));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }, []);

  return { messages, isLoading, sendMessage, deleteMessage, refresh: loadMessages };
}