import type { UserRole } from './supabase'

/**
 * ROLE ENGINE — Autoridade única de roteamento.
 * Modelo estratégico completo.
 */

const VALID_ROLES: UserRole[] = [
  'visitor',
  'registered_unfinished',
  'member_free_legacy',
  'member_paid',
  'founder_paid',
  'moderator',
  'super_admin'
]

export function normalizeRole(
  raw: string | null | undefined
): UserRole {
  if (!raw) return 'visitor'

  const cleaned = raw.trim().toLowerCase() as UserRole

  if (VALID_ROLES.includes(cleaned)) {
    return cleaned
  }

  console.warn(
    `[RoleEngine] Role desconhecido: "${raw}" → fallback para 'visitor'`
  )

  return 'visitor'
}

/**
 * Acesso ao APP
 * Pode acessar feed, comunidades, eventos.
 */
export function hasAppAccess(
  role: UserRole | undefined | null
): boolean {
  const r = normalizeRole(role)

  return (
    r === 'member_free_legacy' ||
    r === 'member_paid' ||
    r === 'founder_paid' ||
    r === 'moderator' ||
    r === 'super_admin'
  )
}

/**
 * Acesso de moderação
 */
export function hasModAccess(
  role: UserRole | undefined | null
): boolean {
  const r = normalizeRole(role)

  return (
    r === 'moderator' ||
    r === 'founder_paid' ||
    r === 'super_admin'
  )
}

/**
 * Página padrão por role
 */
export function getDefaultPage(
  role: UserRole | null | undefined
): string {
  const r = normalizeRole(role)

  if (
    r === 'member_free_legacy' ||
    r === 'member_paid' ||
    r === 'founder_paid' ||
    r === 'moderator' ||
    r === 'super_admin'
  ) {
    return 'social-hub'
  }

  return 'home'
}

/**
 * Super Admin
 */
export function isSuperAdmin(
  role: UserRole | null | undefined
): boolean {
  return normalizeRole(role) === 'super_admin'
}