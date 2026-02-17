import type { UserRole } from './supabase';

export function hasAppAccess(role: UserRole | undefined | null): boolean {
  return role === 'member' || role === 'founder' || role === 'admin';
}

export function hasModAccess(role: UserRole | undefined | null): boolean {
  return role === 'founder' || role === 'admin';
}

export function getDefaultPage(role: UserRole | null | undefined): string {
  if (role === 'member' || role === 'founder' || role === 'admin') return 'social-hub';
  if (role === 'user_free') return 'index';
  return 'home';
}
export function normalizeRole(role: UserRole | string | null | undefined): UserRole {
  if (!role) return 'user_free';

  const normalized = String(role).toLowerCase().trim();

  if (normalized === 'member') return 'member';
  if (normalized === 'founder') return 'founder';
  if (normalized === 'admin') return 'admin';

  return 'user_free';
}
