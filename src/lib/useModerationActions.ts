/**
 * useModerationActions — Hook para log imutavel de acoes moderativas
 * v1.1: Protecao juridica + rastreabilidade completa
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase, TIMEOUTS } from './supabase';
import { cleanTextInput } from './security';

export type ModerationActionType =
  | 'warning'
  | 'post_removed'
  | 'comment_removed'
  | 'user_suspended'
  | 'user_banned'
  | 'community_suspended'
  | 'founder_demoted'
  | 'report_resolved'
  | 'report_dismissed';

export interface ModerationAction {
  id: string;
  moderator_id: string;
  target_user_id: string | null;
  target_post_id: string | null;
  target_community_id: string | null;
  action_type: ModerationActionType;
  reason: string;
  notes: string | null;
  evidence_urls: string[] | null;
  is_reversible: boolean;
  reversed_at: string | null;
  reversed_by: string | null;
  created_at: string;
  // Joined
  moderator_name?: string;
  target_user_name?: string;
}

export function useModerationActions() {
  const [actions, setActions] = useState<ModerationAction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadActions = useCallback(async (limit: number = 50) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('moderation_actions')
        .select(`
          *,
          moderator:moderator_id (name, display_name),
          target_user:target_user_id (name, display_name)
        `)
        .order('created_at', { ascending: false })
        .limit(limit)
        .abortSignal(AbortSignal.timeout(TIMEOUTS.QUERY));

      if (fetchError) throw fetchError;

      const mapped: ModerationAction[] = (data || []).map((a: any) => ({
        ...a,
        moderator_name: a.moderator?.display_name || a.moderator?.name || 'Moderador',
        target_user_name: a.target_user?.display_name || a.target_user?.name || null,
      }));

      setActions(mapped);
    } catch (err: any) {
      console.error('[useModerationActions] Erro:', err);
      setError(err.message || 'Erro ao carregar acoes');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadActions();
  }, [loadActions]);

  /** Registrar nova acao moderativa (LOG IMUTAVEL) */
  const logAction = useCallback(async (params: {
    targetUserId?: string;
    targetPostId?: string;
    targetCommunityId?: string;
    actionType: ModerationActionType;
    reason: string;
    notes?: string;
    evidenceUrls?: string[];
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false, error: 'Nao autenticado' };

      const cleanedReason = cleanTextInput(params.reason, 1000);
      if (!cleanedReason) return { success: false, error: 'Razao e obrigatoria' };

      const { error: insertError } = await supabase
        .from('moderation_actions')
        .insert({
          moderator_id: user.id,
          target_user_id: params.targetUserId || null,
          target_post_id: params.targetPostId || null,
          target_community_id: params.targetCommunityId || null,
          action_type: params.actionType,
          reason: cleanedReason,
          notes: params.notes ? cleanTextInput(params.notes, 2000) : null,
          evidence_urls: params.evidenceUrls || null,
        });

      if (insertError) throw insertError;

      await loadActions();
      return { success: true };
    } catch (err: any) {
      console.error('[useModerationActions] Erro ao registrar:', err);
      return { success: false, error: err.message || 'Erro ao registrar acao' };
    }
  }, [loadActions]);

  /** Reverter acao (somente super_admin) */
  const reverseAction = useCallback(async (
    actionId: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false, error: 'Nao autenticado' };

      const { error: updateError } = await supabase
        .from('moderation_actions')
        .update({
          reversed_at: new Date().toISOString(),
          reversed_by: user.id,
        })
        .eq('id', actionId)
        .eq('is_reversible', true);

      if (updateError) throw updateError;

      await loadActions();
      return { success: true };
    } catch (err: any) {
      console.error('[useModerationActions] Erro ao reverter:', err);
      return { success: false, error: err.message || 'Erro ao reverter acao' };
    }
  }, [loadActions]);

  return {
    actions,
    isLoading,
    error,
    logAction,
    reverseAction,
    refreshActions: loadActions,
    // Computed
    activeActions: actions.filter(a => !a.reversed_at),
    reversedActions: actions.filter(a => a.reversed_at),
  };
}

/** Labels para tipos de acao */
export const ACTION_TYPE_LABELS: Record<ModerationActionType, string> = {
  warning: 'Advertencia',
  post_removed: 'Post removido',
  comment_removed: 'Comentario removido',
  user_suspended: 'Usuario suspenso',
  user_banned: 'Usuario banido',
  community_suspended: 'Comunidade suspensa',
  founder_demoted: 'Founder rebaixado',
  report_resolved: 'Denuncia resolvida',
  report_dismissed: 'Denuncia dispensada',
};
