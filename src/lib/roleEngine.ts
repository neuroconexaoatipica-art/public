import type { UserRole } from './supabase';

const LEGACY_ROLE_MAP: Record<string, UserRole> = {
  'member': 'member_free_legacy',
  'founder': 'founder_paid',
  'admin': 'super_admin',
  'user_free': 'member_free_legacy',
};

const VALID_ROLES: UserRole[] = [
  'visitor',
  'member_free_legacy',
  'member_paid',
  'founder_paid',
  'moderator',
  'super_admin',
];

export function normalizeRole(raw: string | null | undefined): UserRole {
  if (!raw) return 'visitor';
  const cleaned = raw.trim().toLowerCase();
  if (VALID_ROLES.includes(cleaned as UserRole)) return cleaned as UserRole;
  const mapped = LEGACY_ROLE_MAP[cleaned];
  if (mapped) {
    console.info(`[RoleEngine] Role legado "${raw}" -> mapeado para "${mapped}"`);
    return mapped;
  }
  console.warn(`[RoleEngine] Role desconhecido: "${raw}" -> fallback para 'visitor'`);
  return 'visitor';
}

export function hasAppAccess(role: UserRole | undefined | null): boolean {
  const r = normalizeRole(role);
  return r !== 'visitor';
}

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

export function hasModAccess(role: UserRole | undefined | null): boolean {
  const r = normalizeRole(role);
  return r === 'founder_paid' || r === 'moderator' || r === 'super_admin';
}

export function isSuperAdmin(role: UserRole | undefined | null): boolean {
  return normalizeRole(role) === 'super_admin';
}

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

export function getDefaultPage(role: UserRole | null | undefined): string {
  const r = normalizeRole(role);
  if (r === 'super_admin') return 'social-hub';
  if (r === 'member_free_legacy' || r === 'member_paid') return 'social-hub';
  if (r === 'founder_paid' || r === 'moderator') return 'social-hub';
  return 'home';
}
