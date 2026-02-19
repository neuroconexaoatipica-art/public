import type { UserRole } from './supabase';

/**
 * ROLE ENGINE — Autoridade única de roteamento.
 * role é o campo que decide TUDO. access_released não é mais consultado.
 * Roles ativos: visitor, member, founder, admin
 * user_free foi aposentado na migração V7 (member direto).
 */

/** Normaliza o role vindo do banco (case-insensitive, sem espaços) */
export function normalizeRole(raw: string | null | undefined): UserRole {
  if (!raw) return 'visitor';
  const cleaned = raw.trim().toLowerCase();
  const validRoles: UserRole[] = ['admin', 'founder', 'member', 'visitor'];
  if (validRoles.includes(cleaned as UserRole)) return cleaned as UserRole;
  // fallback seguro — role desconhecido = sem acesso
  console.warn(`[RoleEngine] Role desconhecido: "${raw}" → fallback para 'visitor'`);
  return 'visitor';
}

/** Acesso ao APP (Social Hub, Feed, Comunidades com postagem) */
export function hasAppAccess(role: UserRole | undefined | null): boolean {
  const r = normalizeRole(role);
  return r === 'member' || r === 'founder' || r === 'admin';
}

/** Acesso de moderação (deletar posts de outros, gerenciar comunidades) */
export function hasModAccess(role: UserRole | undefined | null): boolean {
  const r = normalizeRole(role);
  return r === 'founder' || r === 'admin';
}

/** Página padrão para cada role */
export function getDefaultPage(role: UserRole | null | undefined): string {
  const r = normalizeRole(role);
  if (r === 'member' || r === 'founder' || r === 'admin') return 'social-hub';
  return 'home';normalizeRole
}
