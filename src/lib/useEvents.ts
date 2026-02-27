import { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabase';
import type { Event, EventParticipant, EventType, RitualType, EventStatus, LocationType } from './supabase';

// ═══════════════════════════════════════════════════════════════
// HOOK useEvents — Fase 2 V8
// CRUD de eventos + participação + rituais
// ═══════════════════════════════════════════════════════════════

export interface EventWithMeta extends Event {
  host_name: string;
  host_photo: string | null;
  community_name: string | null;
  participant_count: number;
  is_participating: boolean;
  my_status: 'confirmed' | 'interested' | 'cancelled' | null;
}

export interface CreateEventInput {
  community_id?: string | null;
  title: string;
  description: string;
  event_type: EventType;
  ritual_type?: RitualType | null;
  starts_at: string;
  ends_at?: string | null;
  max_participants?: number | null;
  status?: EventStatus;
  location_type: LocationType;
  location_url?: string;
  location_address?: string;
  cover_image_url?: string | null;
}

// ─── Labels & Config ─────────────────────────────────────────

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  live: 'Live',
  workshop: 'Workshop',
  ritual: 'Ritual',
  encontro: 'Encontro',
  debate: 'Debate',
  oficina: 'Oficina',
  outro: 'Outro',
};

export const RITUAL_TYPE_LABELS: Record<RitualType, string> = {
  roda_de_escuta: 'Roda de Escuta',
  checkin_coletivo: 'Check-in Coletivo',
  sessao_de_foco: 'Sessao de Foco',
  desabafo_estruturado: 'Desabafo Estruturado',
  ritual_de_acolhimento: 'Ritual de Acolhimento',
  debate_guiado: 'Debate Guiado',
  reflexao_silenciosa: 'Reflexao Silenciosa',
};

export const RITUAL_TYPE_DESCRIPTIONS: Record<RitualType, string> = {
  roda_de_escuta: 'Cada pessoa fala, as outras escutam. Sem conselho, sem interrupcao. Escuta como ato de presenca.',
  checkin_coletivo: 'Como voce esta agora? Uma palavra, uma frase, um silencio. Todo mundo responde, ninguem julga.',
  sessao_de_foco: 'Body doubling coletivo. Cada um no seu, mas juntos. Presenca compartilhada como ancora.',
  desabafo_estruturado: 'Falar o que precisa sair. Com tempo, com contorno, sem plateia. Cru, mas seguro.',
  ritual_de_acolhimento: 'Para quem acabou de chegar. Apresentacao sem performance, integracao sem pressao.',
  debate_guiado: 'Um tema, regras claras, divergencia permitida. Pensar junto sem precisar concordar.',
  reflexao_silenciosa: 'Tema lancado, silencio coletivo, escrita individual. Pensar antes de falar.',
};

export const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  draft: 'Rascunho',
  published: 'Publicado',
  live: 'Ao Vivo',
  completed: 'Concluido',
  cancelled: 'Cancelado',
};

export const LOCATION_TYPE_LABELS: Record<LocationType, string> = {
  online: 'Online',
  presencial: 'Presencial',
  hibrido: 'Hibrido',
};

// ─── Hook Principal ──────────────────────────────────────────

interface UseEventsOptions {
  communityId?: string;
  eventType?: EventType;
  status?: EventStatus;
  upcoming?: boolean; // só eventos futuros
}

export function useEvents(options: UseEventsOptions = {}) {
  const [events, setEvents] = useState<EventWithMeta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEvents = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: { user: authUser } } = await supabase.auth.getUser();
      const currentUserId = authUser?.id;

      // Query base
      let query = supabase
        .from('events')
        .select('*')
        .order('starts_at', { ascending: true });

      // Filtros
      if (options.communityId) {
        query = query.eq('community_id', options.communityId);
      }
      if (options.eventType) {
        query = query.eq('event_type', options.eventType);
      }
      if (options.status) {
        query = query.eq('status', options.status);
      }
      if (options.upcoming) {
        query = query.gte('starts_at', new Date().toISOString());
        query = query.in('status', ['published', 'live']);
      }

      const { data: eventsData, error: eventsError } = await query;
      if (eventsError) throw eventsError;
      if (!eventsData || eventsData.length === 0) {
        setEvents([]);
        return;
      }

      // Buscar hosts (users)
      const hostIds = [...new Set(eventsData.map(e => e.host_id).filter(Boolean))];
      const communityIds = [...new Set(eventsData.map(e => e.community_id).filter(Boolean))];

      const [hostsResult, communitiesResult, participantsResult] = await Promise.all([
        hostIds.length > 0
          ? supabase.from('users').select('id, name, profile_photo').in('id', hostIds)
          : { data: [] },
        communityIds.length > 0
          ? supabase.from('communities').select('id, name').in('id', communityIds)
          : { data: [] },
        supabase.from('event_participants')
          .select('event_id, user_id, status')
          .in('event_id', eventsData.map(e => e.id))
          .neq('status', 'cancelled'),
      ]);

      const hostsMap: Record<string, { name: string; photo: string | null }> = {};
      (hostsResult.data || []).forEach((h: any) => {
        hostsMap[h.id] = { name: h.name, photo: h.profile_photo };
      });

      const communitiesMap: Record<string, string> = {};
      (communitiesResult.data || []).forEach((c: any) => {
        communitiesMap[c.id] = c.name;
      });

      // Contagem de participantes por evento
      const participantCountMap: Record<string, number> = {};
      const myParticipation: Record<string, { is: boolean; status: 'confirmed' | 'interested' | 'cancelled' }> = {};
      (participantsResult.data || []).forEach((p: any) => {
        participantCountMap[p.event_id] = (participantCountMap[p.event_id] || 0) + 1;
        if (p.user_id === currentUserId) {
          myParticipation[p.event_id] = { is: true, status: p.status };
        }
      });

      const enriched: EventWithMeta[] = eventsData.map((e: any) => ({
        ...e,
        host_name: hostsMap[e.host_id]?.name || 'Desconhecido',
        host_photo: hostsMap[e.host_id]?.photo || null,
        community_name: e.community_id ? (communitiesMap[e.community_id] || null) : null,
        participant_count: participantCountMap[e.id] || 0,
        is_participating: myParticipation[e.id]?.is || false,
        my_status: myParticipation[e.id]?.status || null,
      }));

      setEvents(enriched);
    } catch (err: unknown) {
      console.error('[useEvents] Erro:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar eventos');
    } finally {
      setIsLoading(false);
    }
  }, [options.communityId, options.eventType, options.status, options.upcoming]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // ─── Criar evento ──────────────────────────────────────────

  const createEvent = useCallback(async (input: CreateEventInput): Promise<Event | null> => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) throw new Error('Nao autenticado');

      const { data, error } = await supabase
        .from('events')
        .insert({
          ...input,
          host_id: authUser.id,
          ritual_type: input.event_type === 'ritual' ? input.ritual_type : null,
        })
        .select()
        .single();

      if (error) throw error;
      await loadEvents();
      return data;
    } catch (err: unknown) {
      console.error('[useEvents] Erro ao criar:', err);
      throw err;
    }
  }, [loadEvents]);

  // ─── Atualizar evento ──────────────────────────────────────

  const updateEvent = useCallback(async (eventId: string, updates: Partial<CreateEventInput>): Promise<void> => {
    try {
      const { error } = await supabase
        .from('events')
        .update(updates)
        .eq('id', eventId);

      if (error) throw error;
      await loadEvents();
    } catch (err: unknown) {
      console.error('[useEvents] Erro ao atualizar:', err);
      throw err;
    }
  }, [loadEvents]);

  // ─── Deletar evento ────────────────────────────────────────

  const deleteEvent = useCallback(async (eventId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;
      await loadEvents();
    } catch (err: unknown) {
      console.error('[useEvents] Erro ao deletar:', err);
      throw err;
    }
  }, [loadEvents]);

  // ─── Participar / Sair ─────────────────────────────────────

  const joinEvent = useCallback(async (eventId: string, status: 'confirmed' | 'interested' = 'confirmed'): Promise<void> => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) throw new Error('Nao autenticado');

      // Upsert: se já existe, atualiza o status
      const { error } = await supabase
        .from('event_participants')
        .upsert(
          { event_id: eventId, user_id: authUser.id, status },
          { onConflict: 'event_id,user_id' }
        );

      if (error) throw error;
      await loadEvents();
    } catch (err: unknown) {
      console.error('[useEvents] Erro ao participar:', err);
      throw err;
    }
  }, [loadEvents]);

  const leaveEvent = useCallback(async (eventId: string): Promise<void> => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) throw new Error('Nao autenticado');

      const { error } = await supabase
        .from('event_participants')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', authUser.id);

      if (error) throw error;
      await loadEvents();
    } catch (err: unknown) {
      console.error('[useEvents] Erro ao sair:', err);
      throw err;
    }
  }, [loadEvents]);

  return {
    events,
    isLoading,
    error,
    refreshEvents: loadEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    joinEvent,
    leaveEvent,
  };
}

// ─── Hook para detalhe de evento único ───────────────────────

export function useEventDetail(eventId: string | null) {
  const [event, setEvent] = useState<EventWithMeta | null>(null);
  const [participants, setParticipants] = useState<Array<{ user_id: string; name: string; photo: string | null; status: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    if (!eventId) { setIsLoading(false); return; }

    try {
      setIsLoading(true);
      const { data: { user: authUser } } = await supabase.auth.getUser();

      const { data: eventData, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (error) throw error;

      // Host info
      let hostName = 'Desconhecido';
      let hostPhoto: string | null = null;
      if (eventData.host_id) {
        const { data: hostData } = await supabase
          .from('users')
          .select('name, profile_photo')
          .eq('id', eventData.host_id)
          .single();
        if (hostData) { hostName = hostData.name; hostPhoto = hostData.profile_photo; }
      }

      // Community name
      let communityName: string | null = null;
      if (eventData.community_id) {
        const { data: commData } = await supabase
          .from('communities')
          .select('name')
          .eq('id', eventData.community_id)
          .single();
        if (commData) communityName = commData.name;
      }

      // Participants
      const { data: parts } = await supabase
        .from('event_participants')
        .select('user_id, status')
        .eq('event_id', eventId)
        .neq('status', 'cancelled');

      const userIds = (parts || []).map(p => p.user_id);
      let usersMap: Record<string, { name: string; photo: string | null }> = {};
      if (userIds.length > 0) {
        const { data: usersData } = await supabase
          .from('users')
          .select('id, name, profile_photo')
          .in('id', userIds);
        (usersData || []).forEach((u: any) => { usersMap[u.id] = { name: u.name, photo: u.profile_photo }; });
      }

      const enrichedParts = (parts || []).map(p => ({
        user_id: p.user_id,
        name: usersMap[p.user_id]?.name || 'Desconhecido',
        photo: usersMap[p.user_id]?.photo || null,
        status: p.status,
      }));

      const myPart = parts?.find(p => p.user_id === authUser?.id);

      setEvent({
        ...eventData,
        host_name: hostName,
        host_photo: hostPhoto,
        community_name: communityName,
        participant_count: enrichedParts.length,
        is_participating: !!myPart,
        my_status: (myPart?.status as any) || null,
      });
      setParticipants(enrichedParts);
    } catch (err) {
      console.error('[useEventDetail] Erro:', err);
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  useEffect(() => { load(); }, [load]);

  return { event, participants, isLoading, refresh: load };
}
