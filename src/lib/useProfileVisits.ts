import { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabase';

export interface ProfileVisit {
  id: string;
  visitor_id: string;
  visited_id: string;
  visited_at: string;
  visitor_data?: { id: string; name: string; profile_photo: string | null };
}

export function useProfileVisits(userId?: string) {
  const [visits, setVisits] = useState<ProfileVisit[]>([]);
  const [visitCount, setVisitCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const targetId = userId || user?.id;
      if (!targetId) { setIsLoading(false); return; }

      // Buscar visitas dos ultimos 30 dias
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from('profile_visits')
        .select('*')
        .eq('visited_id', targetId)
        .gte('visited_at', thirtyDaysAgo)
        .order('visited_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Enriquecer com dados do visitante
      const visitorIds = [...new Set((data || []).map(v => v.visitor_id))];
      let visitorsMap: Record<string, any> = {};
      if (visitorIds.length > 0) {
        const { data: visitors } = await supabase
          .from('users').select('id, name, profile_photo').in('id', visitorIds);
        (visitors || []).forEach(v => { visitorsMap[v.id] = v; });
      }

      const enriched = (data || []).map(v => ({
        ...v,
        visitor_data: visitorsMap[v.visitor_id] || { id: v.visitor_id, name: 'Alguem', profile_photo: null }
      }));

      setVisits(enriched);
      setVisitCount(visitorIds.length); // Visitantes unicos
    } catch (err) {
      console.error('[useProfileVisits] Erro:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  // Registrar visita ao perfil de outro usuario
  const registerVisit = useCallback(async (visitedId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.id === visitedId) return; // Nao registra visita propria

      await supabase.from('profile_visits').insert({
        visitor_id: user.id,
        visited_id: visitedId,
      }).then(() => {}).catch(() => {}); // Silencioso — duplicata do dia e ignorada pela UNIQUE constraint
    } catch {
      // Silencioso
    }
  }, []);

  return { visits, visitCount, isLoading, registerVisit, refresh: load };
}
