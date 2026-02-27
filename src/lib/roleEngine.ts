import type { UserRole } from './supabase';

/**
 * ROLE ENGINE V9 — Fase 1: Alicerce
 * 
 * 8 roles:
 *   visitor, registered_unfinished, member_free_legacy, member_paid,
 *   founder_paid, moderator, super_admin, banned
 * 
 * Três camadas de acesso:
 *   1. has_app_access       → entrar no app (feed, postar, comentar)
 *   2. has_leadership_access → governar (criar comunidade, moderar, manifesto)
 *   3. is_waiting_approval   → cadastrado mas aguardando aprovação
 * 
 * Roles legados (V7): member, founder, admin, user_free
 *   → normalizeRole() converte automaticamente para equivalentes V9
 */

// Mapeamento de roles legados V7 → V9
const LEGACY_ROLE_MAP: Record<string, UserRole> = {
  'member': 'member_free_legacy',
  'founder': 'founder_paid',
  'admin': 'super_admin',
  'user_free': 'member_free_legacy',
};

const VALID_ROLES: UserRole[] = [
  'visitor',
  'registered_unfinished',
  'member_free_legacy',
  'member_paid',
  'founder_paid',
  'moderator',
  'super_admin',
  'banned',
];

/** Normaliza o role vindo do banco (case-insensitive, sem espaços, migra legados) */
export function normalizeRole(raw: string | null | undefined): UserRole {
  if (!raw) return 'visitor';
  const cleaned = raw.trim().toLowerCase();

  // Primeiro: checar se já é V9 válido
  if (VALID_ROLES.includes(cleaned as UserRole)) return cleaned as UserRole;

  // Segundo: tentar mapear de role legado V7
  const mapped = LEGACY_ROLE_MAP[cleaned];
  if (mapped) {
    console.info(`[RoleEngine] Role legado "${raw}" → mapeado para "${mapped}"`);
    return mapped;
  }

  // Fallback seguro — role desconhecido = sem acesso
  console.warn(`[RoleEngine] Role desconhecido: "${raw}" → fallback para 'visitor'`);
  return 'visitor';
}

/** 
 * Acesso ao APP (Social Hub, Feed, Comunidades, postar, comentar)
 * registered_unfinished e banned NÃO têm acesso.
 */
export function hasAppAccess(role: UserRole | undefined | null): boolean {
  const r = normalizeRole(role);
  return r !== 'visitor' && r !== 'registered_unfinished' && r !== 'banned';
}

/** 
 * Está aguardando aprovação? (signed up mas não aprovado)
 */
export function isWaitingApproval(role: UserRole | undefined | null): boolean {
  return normalizeRole(role) === 'registered_unfinished';
}

/** 
 * Está banido?
 */
export function isBanned(role: UserRole | undefined | null): boolean {
  return normalizeRole(role) === 'banned';
}

/** 
 * Acesso de LIDERANÇA (criar comunidade, moderar, editar manifesto, gerenciar membros)
 * Requer: role de liderança + onboarding de liderança concluído
 * super_admin tem acesso independente de onboarding
 */
export function hasLeadershipAccess(
  role: UserRole | undefined | null,
  leadershipOnboardingDone?: boolean
): boolean {
  const r = normalizeRole(role);
  if (r === 'super_admin') return true;
  if (r === 'founder_paid' || r === 'moderator') {
    return leadershipOnboardingDone === true;
  }
  return false;
}

/** 
 * Acesso de MODERAÇÃO (deletar posts de outros, gerenciar comunidades designadas)
 */
export function hasModAccess(role: UserRole | undefined | null): boolean {
  const r = normalizeRole(role);
  return r === 'founder_paid' || r === 'moderator' || r === 'super_admin';
}

/** Checar se é super_admin (Mila) */
export function isSuperAdmin(role: UserRole | undefined | null): boolean {
  return normalizeRole(role) === 'super_admin';
}

/** Precisa de onboarding de liderança? */
export function needsLeadershipOnboarding(
  role: UserRole | undefined | null,
  leadershipOnboardingDone?: boolean
): boolean {
  const r = normalizeRole(role);
  if (r === 'founder_paid' || r === 'moderator') {
    return leadershipOnboardingDone !== true;
  }
  return false;
}

/** Página padrão para cada role */
export function getDefaultPage(role: UserRole | null | undefined): string {
  const r = normalizeRole(role);
  if (r === 'registered_unfinished') return 'waiting-room';
  if (r === 'banned') return 'banned';
  if (r === 'super_admin') return 'social-hub';
  if (r === 'member_free_legacy' || r === 'member_paid') return 'social-hub';
  if (r === 'founder_paid' || r === 'moderator') return 'social-hub';
  return 'home';
}

/** Hierarquia de poder — usado para verificar quem pode promover/rebaixar quem */
export function getRolePower(role: UserRole | undefined | null): number {
  const POWER: Record<UserRole, number> = {
    'visitor': 0,
    'banned': 0,
    'registered_unfinished': 1,
    'member_free_legacy': 10,
    'member_paid': 20,
    'founder_paid': 50,
    'moderator': 60,
    'super_admin': 100,
  };
  return POWER[normalizeRole(role)] ?? 0;
}
