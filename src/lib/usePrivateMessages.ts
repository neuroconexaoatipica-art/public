import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from './supabase';

export interface PrivateMessage { id: string; sender_id: string; receiver_id: string; content: string; is_read: boolean; created_at: string; sender_data?: { id: string; name: string; profile_photo: string | null }; }
export interface Conversation { other_user_id: string; other_user_name: string; other_user_photo: string | null; last_message: string; last_message_at: string; unread_count: number; }

export function usePrivateMessages(otherUserId?: string) {
  const [messages, setMessages] = useState<PrivateMessage[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const loadMessages = useCallback(async () => {
    if (!otherUserId) return;
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase.from('private_messages').select('*').or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`).order('created_at', { ascending: true }).limit(200);
      if (error) throw error;
      if (data && data.length > 0) {
        const unreadIds = data.filter((m: any) => m.receiver_id === user.id && !m.is_read).map((m: any) => m.id);
        if (unreadIds.length > 0) await supabase.from('private_messages').update({ is_read: true }).in('id', unreadIds);
      }
      const senderIds = [...new Set((data || []).map((m: any) => m.sender_id))];
      let sendersMap: Record<string, any> = {};
      if (senderIds.length > 0) { const { data: senders } = await supabase.from('users').select('id,name,profile_photo').in('id', senderIds); (senders || []).forEach((s: any) => { sendersMap[s.id] = s; }); }
      setMessages((data || []).map((m: any) => ({ ...m, sender_data: sendersMap[m.sender_id] || { id: m.sender_id, name: 'Membro', profile_photo: null } })));
    } catch (err) { console.error('[usePrivateMessages] Erro:', err); } finally { setIsLoading(false); }
  }, [otherUserId]);

  const loadConversations = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase.from('private_messages').select('*').or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`).order('created_at', { ascending: false });
      if (error) throw error;
      const convMap: Record<string, { messages: any[]; unread: number }> = {};
      (data || []).forEach((m: any) => { const otherId = m.sender_id === user.id ? m.receiver_id : m.sender_id; if (!convMap[otherId]) convMap[otherId] = { messages: [], unread: 0 }; convMap[otherId].messages.push(m); if (m.receiver_id === user.id && !m.is_read) convMap[otherId].unread++; });
      const otherIds = Object.keys(convMap);
      let usersMap: Record<string, any> = {};
      if (otherIds.length > 0) { const { data: users } = await supabase.from('users').select('id,name,profile_photo').in('id', otherIds); (users || []).forEach((u: any) => { usersMap[u.id] = u; }); }
      const convList: Conversation[] = otherIds.map(otherId => { const conv = convMap[otherId]; const lastMsg = conv.messages[0]; const otherUser = usersMap[otherId] || { name: 'Membro', profile_photo: null }; return { other_user_id: otherId, other_user_name: otherUser.name, other_user_photo: otherUser.profile_photo, last_message: lastMsg.content, last_message_at: lastMsg.created_at, unread_count: conv.unread }; }).sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime());
      setConversations(convList);
    } catch (err) { console.error('[usePrivateMessages] Erro conversas:', err); } finally { setIsLoading(false); }
  }, []);

  useEffect(() => {
    if (otherUserId) loadMessages(); else loadConversations();
    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const channel = supabase.channel('dm-realtime').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'private_messages', filter: `receiver_id=eq.${user.id}` }, (payload: any) => {
        const newMsg = payload.new as PrivateMessage;
        if (otherUserId && newMsg.sender_id === otherUserId) { setMessages(prev => [...prev, newMsg]); supabase.from('private_messages').update({ is_read: true }).eq('id', newMsg.id); }
        else loadConversations();
      }).subscribe();
      channelRef.current = channel;
      return () => { supabase.removeChannel(channel); };
    };
    const cleanup = setupRealtime();
    return () => { cleanup.then(fn => fn?.()); };
  }, [otherUserId, loadMessages, loadConversations]);

  const sendMessage = useCallback(async (receiverId: string, content: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false, error: 'Nao autenticado' };
      const { error } = await supabase.from('private_messages').insert({ sender_id: user.id, receiver_id: receiverId, content: content.trim() });
      if (error) throw error;
      return { success: true };
    } catch (err: any) { return { success: false, error: err.message }; }
  }, []);

  return { messages, conversations, isLoading, sendMessage, refresh: otherUserId ? loadMessages : loadConversations };
}
