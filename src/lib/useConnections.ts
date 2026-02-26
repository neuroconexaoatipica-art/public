import { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabase';

export interface Connection { id: string; requester_id: string; target_id: string; status: 'pending' | 'accepted' | 'rejected' | 'blocked'; created_at: string; other_user?: { id: string; name: string; profile_photo: string | null; role: string }; }

export function useConnections() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [pendingReceived, setPendingReceived] = useState<Connection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setIsLoading(false); return; }
      const { data, error } = await supabase.from('connections').select('*').or(`requester_id.eq.${user.id},target_id.eq.${user.id}`).order('created_at', { ascending: false });
      if (error) throw error;
      const otherIds = [...new Set((data || []).map((c: any) => c.requester_id === user.id ? c.target_id : c.requester_id))];
      let usersMap: Record<string, any> = {};
      if (otherIds.length > 0) { const { data: users } = await supabase.from('users').select('id,name,profile_photo,role').in('id', otherIds); (users || []).forEach((u: any) => { usersMap[u.id] = u; }); }
      const enriched = (data || []).map((c: any) => { const otherId = c.requester_id === user.id ? c.target_id : c.requester_id; return { ...c, other_user: usersMap[otherId] || { id: otherId, name: 'Membro', profile_photo: null, role: 'member' } }; });
      setConnections(enriched);
      setPendingReceived(enriched.filter((c: any) => c.status === 'pending' && c.target_id === user.id));
    } catch (err) { console.error('[useConnections] Erro:', err); } finally { setIsLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const sendRequest = useCallback(async (targetId: string) => {
    try { const { data: { user } } = await supabase.auth.getUser(); if (!user) return { success: false, error: 'Nao autenticado' }; const { error } = await supabase.from('connections').insert({ requester_id: user.id, target_id: targetId }); if (error) throw error; await load(); return { success: true }; } catch (err: any) { return { success: false, error: err.message }; }
  }, [load]);

  const acceptRequest = useCallback(async (connectionId: string) => {
    try { await supabase.from('connections').update({ status: 'accepted', updated_at: new Date().toISOString() }).eq('id', connectionId); await load(); return { success: true }; } catch (err: any) { return { success: false, error: err.message }; }
  }, [load]);

  const rejectRequest = useCallback(async (connectionId: string) => {
    try { await supabase.from('connections').update({ status: 'rejected', updated_at: new Date().toISOString() }).eq('id', connectionId); await load(); return { success: true }; } catch (err: any) { return { success: false, error: err.message }; }
  }, [load]);

  const cancelRequest = useCallback(async (connectionId: string) => {
    try { await supabase.from('connections').delete().eq('id', connectionId); await load(); return { success: true }; } catch (err: any) { return { success: false, error: err.message }; }
  }, [load]);

  const getConnectionStatus = useCallback(async (targetId: string): Promise<'none' | 'pending_sent' | 'pending_received' | 'accepted' | 'blocked'> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 'none';
      const { data } = await supabase.from('connections').select('*').or(`and(requester_id.eq.${user.id},target_id.eq.${targetId}),and(requester_id.eq.${targetId},target_id.eq.${user.id})`).limit(1).single();
      if (!data) return 'none';
      if (data.status === 'accepted') return 'accepted';
      if (data.status === 'blocked') return 'blocked';
      if (data.requester_id === user.id) return 'pending_sent';
      return 'pending_received';
    } catch { return 'none'; }
  }, []);

  return { connections, pendingReceived, isLoading, sendRequest, acceptRequest, rejectRequest, cancelRequest, getConnectionStatus, refresh: load };
}
