/**
 * useInviteLinks — Hook para convites por link rastreado
 * v1.1: Crescimento viral controlado
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase, TIMEOUTS } from './supabase';

export interface InviteLink {
  id: string;
  inviter_id: string;
  code: string;
  max_uses: number;
  uses_count: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

export function useInviteLinks() {
  const [links, setLinks] = useState<InviteLink[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadLinks = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('invite_links')
        .select('*')
        .order('created_at', { ascending: false })
        .abortSignal(AbortSignal.timeout(TIMEOUTS.QUERY));

      if (error) throw error;
      setLinks((data || []) as InviteLink[]);
    } catch (err) {
      console.error('[useInviteLinks] Erro:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLinks();
  }, [loadLinks]);

  /** Gerar novo link de convite */
  const createInviteLink = useCallback(async (
    maxUses: number = 5,
    expiresInDays?: number
  ): Promise<{ success: boolean; code?: string; error?: string }> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false, error: 'Nao autenticado' };

      // Gerar codigo unico
      const code = generateInviteCode();

      const expiresAt = expiresInDays
        ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString()
        : null;

      const { error: insertError } = await supabase
        .from('invite_links')
        .insert({
          inviter_id: user.id,
          code,
          max_uses: Math.min(maxUses, 20), // max 20 usos por link
          expires_at: expiresAt,
        });

      if (insertError) throw insertError;

      await loadLinks();
      return { success: true, code };
    } catch (err: any) {
      console.error('[useInviteLinks] Erro ao criar:', err);
      return { success: false, error: err.message || 'Erro ao criar convite' };
    }
  }, [loadLinks]);

  /** Desativar link */
  const deactivateLink = useCallback(async (linkId: string) => {
    try {
      await supabase
        .from('invite_links')
        .update({ is_active: false })
        .eq('id', linkId);
      await loadLinks();
    } catch (err) {
      console.error('[useInviteLinks] Erro ao desativar:', err);
    }
  }, [loadLinks]);

  /** Gerar URL completa do convite */
  const getInviteURL = (code: string): string => {
    const baseUrl = window.location.origin;
    return `${baseUrl}?convite=${code}`;
  };

  return {
    links,
    isLoading,
    createInviteLink,
    deactivateLink,
    getInviteURL,
    refreshLinks: loadLinks,
    activeLinks: links.filter(l => l.is_active && l.uses_count < l.max_uses),
  };
}

/** Gerar codigo de convite legivel (6 chars alfanumericos) */
function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sem I, O, 0, 1 (evita confusao)
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}
