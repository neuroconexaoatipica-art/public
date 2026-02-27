import { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabase';
import { useProfileContext } from './ProfileContext';
import { isSuperAdmin } from './roleEngine';

/**
 * useCommunityMembership — Hook para membership gate por comunidade
 * 
 * Verifica se o usuário é membro de uma comunidade específica.
 * Se a comunidade tem requires_approval = true, o user precisa
 * ser membro aprovado para ver o conteúdo.
 * 
 * Statuses de membership:
 * - 'approved' → membro ativo, pode ver e participar
 * - 'pending'  → pediu entrada, aguardando aprovação
 * - 'rejected' → pedido negado
 * - null       → nunca pediu entrada
 */

export type MembershipStatus = 'approved' | 'pending' | 'rejected' | null;

interface MembershipResult {
  /** Status do membership do user nesta comunidade */
  status: MembershipStatus;
  /** Pode ver o conteúdo da comunidade? */
  canView: boolean;
  /** Pode postar/interagir na comunidade? */
  canParticipate: boolean;
  /** A comunidade requer aprovação? */
  requiresApproval: boolean;
  /** Carregando? */
  isLoading: boolean;
  /** Pedir entrada na comunidade */
  requestEntry: (message?: string) => Promise<{ success: boolean; error?: string }>;
  /** Recarregar status */
  refresh: () => Promise<void>;
}

export function useCommunityMembership(communityId: string | undefined): MembershipResult {
  const { user } = useProfileContext();
  const [status, setStatus] = useState<MembershipStatus>(null);
  const [requiresApproval, setRequiresApproval] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // super_admin sempre tem acesso total
  const isAdmin = isSuperAdmin(user?.role);

  const loadMembership = useCallback(async () => {
    if (!communityId || !user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      // 1. Checar se a comunidade requer aprovação
      const { data: community } = await supabase
        .from('communities')
        .select('requires_approval, owner_id')
        .eq('id', communityId)
        .single();

      const reqApproval = community?.requires_approval ?? false;
      setRequiresApproval(reqApproval);

      // Se é o owner, sempre tem acesso
      if (community?.owner_id === user.id) {
        setStatus('approved');
        setIsLoading(false);
        return;
      }

      // Se não requer aprovação, todos os membros do app têm acesso
      if (!reqApproval) {
        setStatus('approved');
        setIsLoading(false);
        return;
      }

      // 2. Checar membership do user
      const { data: membership } = await supabase
        .from('community_members')
        .select('status')
        .eq('community_id', communityId)
        .eq('user_id', user.id)
        .single();

      if (membership) {
        setStatus(membership.status as MembershipStatus);
      } else {
        setStatus(null);
      }
    } catch (err) {
      console.error('[Membership] Erro ao verificar:', err);
      // Fallback: permitir acesso para não bloquear existentes
      setStatus('approved');
    } finally {
      setIsLoading(false);
    }
  }, [communityId, user?.id]);

  useEffect(() => {
    loadMembership();
  }, [loadMembership]);

  const requestEntry = useCallback(async (message?: string) => {
    if (!communityId || !user?.id) {
      return { success: false, error: 'Usuário não logado' };
    }

    try {
      const { error } = await supabase
        .from('community_members')
        .upsert(
          {
            community_id: communityId,
            user_id: user.id,
            status: 'pending',
            request_message: message || null,
          },
          { onConflict: 'community_id,user_id' }
        );

      if (error) throw error;

      setStatus('pending');
      return { success: true };
    } catch (err: any) {
      console.error('[Membership] Erro ao pedir entrada:', err);
      return { success: false, error: err.message || 'Erro ao enviar pedido' };
    }
  }, [communityId, user?.id]);

  // Permissões derivadas
  const canView = isAdmin || status === 'approved' || !requiresApproval;
  const canParticipate = isAdmin || status === 'approved' || !requiresApproval;

  return {
    status: isAdmin ? 'approved' : status,
    canView,
    canParticipate,
    requiresApproval,
    isLoading,
    requestEntry,
    refresh: loadMembership,
  };
}
