import { useProfileContext } from './ProfileContext';
import {
  normalizeRole,
  hasAppAccess,
  hasLeadershipAccess,
  hasModAccess,
  isSuperAdmin,
  isWaitingApproval,
  isBanned,
  needsLeadershipOnboarding,
  getRolePower,
} from './roleEngine';
import type { UserRole } from './supabase';

/**
 * useRole — Hook centralizado de permissões
 * 
 * Usa ProfileContext para obter o usuário logado e expõe:
 * - role normalizado
 * - todas as verificações de permissão
 * - helpers de conveniência
 * 
 * Uso: const { role, canAccessApp, isAdmin, isWaiting } = useRole();
 */
export function useRole() {
  const { user, isLoading } = useProfileContext();

  const role: UserRole = normalizeRole(user?.role);

  return {
    /** Role normalizado do usuário atual */
    role,
    /** Objeto user completo (pode ser null se não logado) */
    user,
    /** Ainda carregando perfil? */
    isLoading,

    // ═══ Permissões ═══
    /** Pode acessar o app (Social Hub, Feed, Comunidades)? */
    canAccessApp: hasAppAccess(role),
    /** É super_admin (Mila)? */
    isAdmin: isSuperAdmin(role),
    /** Pode moderar (founder_paid, moderator, super_admin)? */
    canModerate: hasModAccess(role),
    /** Pode liderar (com onboarding feito)? */
    canLead: hasLeadershipAccess(role, user?.leadership_onboarding_done),
    /** Precisa completar onboarding de liderança? */
    needsLeaderOnboarding: needsLeadershipOnboarding(role, user?.leadership_onboarding_done),

    // ═══ Estados especiais ═══
    /** Cadastrado mas aguardando aprovação? */
    isWaiting: isWaitingApproval(role),
    /** Banido? */
    isBanned: isBanned(role),
    /** Visitante não logado? */
    isVisitor: role === 'visitor',
    /** Está logado (qualquer role exceto visitor)? */
    isLoggedIn: role !== 'visitor',

    // ═══ Helpers ═══
    /** Poder numérico do role (para comparações hierárquicas) */
    power: getRolePower(role),
  };
}
