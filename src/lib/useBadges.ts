/**
 * useBadges — Hook para badges visuais de status
 * v1.2: Badges de pertencimento, reconhecimento + motor de concessao automatica
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase, TIMEOUTS } from './supabase';

export type BadgeType =
  | 'nucleo_inicial'
  | 'trinta_primeiros'
  | 'vitalicio'
  | 'founder'
  | 'coordenador_territorial'
  | 'constancia_ritual'
  | 'presenca_territorial'
  | 'lideranca'
  | 'presenca';

export interface UserBadge {
  id: string;
  user_id: string;
  badge_type: BadgeType;
  earned_at: string;
  is_active: boolean;
}

/** Configuracao visual de cada badge */
export const BADGE_CONFIG: Record<BadgeType, {
  label: string;
  emoji: string;
  color: string;
  bgColor: string;
  description: string;
}> = {
  nucleo_inicial: {
    label: 'Nucleo Inicial',
    emoji: '\u2B50', // estrela
    color: '#FFD700',
    bgColor: 'rgba(255, 215, 0, 0.15)',
    description: 'Membro desde o inicio da plataforma',
  },
  trinta_primeiros: {
    label: '30 Primeiros',
    emoji: '\uD83C\uDFC6', // trofeu
    color: '#FF6B35',
    bgColor: 'rgba(255, 107, 53, 0.15)',
    description: 'Entre os 30 primeiros membros',
  },
  vitalicio: {
    label: 'Vitalicio',
    emoji: '\u267E\uFE0F', // infinito
    color: '#81D8D0',
    bgColor: 'rgba(129, 216, 208, 0.15)',
    description: 'Acesso vitalicio gratuito',
  },
  founder: {
    label: 'Founder',
    emoji: '\uD83D\uDC51', // coroa
    color: '#C8102E',
    bgColor: 'rgba(200, 16, 46, 0.15)',
    description: 'Fundador(a) de comunidade',
  },
  coordenador_territorial: {
    label: 'Coordenador',
    emoji: '\uD83C\uDF0D', // globo
    color: '#FF6B35',
    bgColor: 'rgba(255, 107, 53, 0.15)',
    description: 'Coordenador(a) de nucleo territorial',
  },
  constancia_ritual: {
    label: 'Constancia',
    emoji: '\uD83D\uDD25', // fogo
    color: '#FF4500',
    bgColor: 'rgba(255, 69, 0, 0.15)',
    description: '4+ semanas consecutivas de rituais',
  },
  presenca_territorial: {
    label: 'Territorio',
    emoji: '\uD83D\uDCCD', // pin
    color: '#FF6B35',
    bgColor: 'rgba(255, 107, 53, 0.15)',
    description: '3+ encontros presenciais',
  },
  lideranca: {
    label: 'Lideranca',
    emoji: '\uD83C\uDF1F', // estrela brilhante
    color: '#A855F7',
    bgColor: 'rgba(168, 85, 247, 0.15)',
    description: 'Organizou 1+ live ou evento',
  },
  presenca: {
    label: 'Presenca',
    emoji: '\uD83D\uDCAC', // balao
    color: '#81D8D0',
    bgColor: 'rgba(129, 216, 208, 0.15)',
    description: '10+ comentarios relevantes',
  },
};

export function useBadges(userId?: string) {
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadBadges = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from('user_badges')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('earned_at', { ascending: true })
        .abortSignal(AbortSignal.timeout(TIMEOUTS.QUERY));

      if (error) throw error;
      setBadges((data || []) as UserBadge[]);
    } catch (err) {
      console.error('[useBadges] Erro ao carregar:', err);
      // Silencioso — badges nao sao criticas
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadBadges();
  }, [loadBadges]);

  /** Verificar se usuario tem um badge especifico */
  const hasBadge = useCallback((type: BadgeType): boolean => {
    return badges.some(b => b.badge_type === type);
  }, [badges]);

  /** Obter config visual de um badge */
  const getBadgeConfig = (type: BadgeType) => BADGE_CONFIG[type];

  return {
    badges,
    isLoading,
    hasBadge,
    getBadgeConfig,
    refreshBadges: loadBadges,
    badgeCount: badges.length,
  };
}

/** Hook para carregar badges de multiplos usuarios (para listas) */
export function useBadgesForUsers(userIds: string[]) {
  const [badgeMap, setBadgeMap] = useState<Record<string, UserBadge[]>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (userIds.length === 0) return;

    const load = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('user_badges')
          .select('*')
          .in('user_id', userIds)
          .eq('is_active', true)
          .abortSignal(AbortSignal.timeout(TIMEOUTS.QUERY));

        if (error) throw error;

        const map: Record<string, UserBadge[]> = {};
        (data || []).forEach((badge: any) => {
          if (!map[badge.user_id]) map[badge.user_id] = [];
          map[badge.user_id].push(badge as UserBadge);
        });
        setBadgeMap(map);
      } catch (err) {
        console.error('[useBadgesForUsers] Erro:', err);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [userIds.join(',')]);

  return { badgeMap, isLoading };
}

// ═══════════════════════════════════════════════════════════
// MOTOR DE CONCESSÃO AUTOMÁTICA — Gamificação Invisível
// Verifica condições e concede selos silenciosamente.
// ═══════════════════════════════════════════════════════════

interface BadgeEligibility {
  type: BadgeType;
  eligible: boolean;
  reason: string;
}

/** Conceder badge se ainda nao possui (idempotente) */
async function grantBadgeIfNew(userId: string, badgeType: BadgeType): Promise<boolean> {
  try {
    // Verificar se ja tem
    const { data: existing } = await supabase
      .from('user_badges')
      .select('id')
      .eq('user_id', userId)
      .eq('badge_type', badgeType)
      .limit(1);

    if (existing && existing.length > 0) return false; // Ja possui

    const { error } = await supabase
      .from('user_badges')
      .insert({
        user_id: userId,
        badge_type: badgeType,
        earned_at: new Date().toISOString(),
        is_active: true,
      });

    if (error) {
      // Conflito de unique = ja existe, tudo bem
      if (error.code === '23505') return false;
      throw error;
    }

    console.log(`[useBadges] Selo concedido: ${badgeType} para ${userId}`);
    return true;
  } catch (err) {
    console.error(`[useBadges] Erro ao conceder ${badgeType}:`, err);
    return false;
  }
}

/** Verificar elegibilidade para TODOS os selos de gamificacao */
async function checkAllEligibility(userId: string): Promise<BadgeEligibility[]> {
  const results: BadgeEligibility[] = [];

  try {
    // ── 1. SELO CONSTÂNCIA: 4+ semanas consecutivas de rituais ──
    const { data: ritualLogs } = await supabase
      .from('ritual_logs')
      .select('completed_at')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false });

    if (ritualLogs && ritualLogs.length > 0) {
      // Agrupar por semana ISO
      const weekSet = new Set<string>();
      ritualLogs.forEach((log: any) => {
        const d = new Date(log.completed_at);
        const yearWeek = `${d.getFullYear()}-W${String(getISOWeek(d)).padStart(2, '0')}`;
        weekSet.add(yearWeek);
      });

      // Contar semanas consecutivas a partir da mais recente
      const sortedWeeks = Array.from(weekSet).sort().reverse();
      let consecutive = 1;
      for (let i = 1; i < sortedWeeks.length; i++) {
        if (areConsecutiveWeeks(sortedWeeks[i - 1], sortedWeeks[i])) {
          consecutive++;
        } else break;
      }

      results.push({
        type: 'constancia_ritual',
        eligible: consecutive >= 4,
        reason: `${consecutive} semanas consecutivas de rituais`,
      });
    } else {
      results.push({ type: 'constancia_ritual', eligible: false, reason: '0 rituais registrados' });
    }

    // ── 2. SELO TERRITÓRIO: 3+ encontros presenciais ──
    const { data: eventAttendance } = await supabase
      .from('event_attendees')
      .select('id, event:event_id (event_type)')
      .eq('user_id', userId)
      .eq('status', 'confirmed');

    const presencialCount = (eventAttendance || []).filter(
      (a: any) => a.event?.event_type === 'presencial' || a.event?.event_type === 'hibrido'
    ).length;

    results.push({
      type: 'presenca_territorial',
      eligible: presencialCount >= 3,
      reason: `${presencialCount} encontros presenciais`,
    });

    // ── 3. SELO LIDERANÇA: 1+ live ou evento organizado ──
    const { data: organizedEvents } = await supabase
      .from('events')
      .select('id')
      .eq('host_id', userId)
      .limit(1);

    const { data: organizedLives } = await supabase
      .from('lives')
      .select('id')
      .eq('host_id', userId)
      .limit(1);

    const hasOrganized = ((organizedEvents?.length || 0) + (organizedLives?.length || 0)) >= 1;

    results.push({
      type: 'lideranca',
      eligible: hasOrganized,
      reason: hasOrganized ? 'Organizou evento ou live' : 'Nenhum evento ou live organizado',
    });

    // ── 4. SELO PRESENÇA: 10+ comentários ──
    const { count: commentCount } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('author', userId);

    results.push({
      type: 'presenca',
      eligible: (commentCount || 0) >= 10,
      reason: `${commentCount || 0} comentarios`,
    });

  } catch (err) {
    console.error('[useBadges] Erro ao verificar elegibilidade:', err);
  }

  return results;
}

/** Executar verificacao completa e conceder selos automaticamente */
export async function runBadgeEngine(userId: string): Promise<{ granted: BadgeType[] }> {
  const granted: BadgeType[] = [];

  try {
    const eligibility = await checkAllEligibility(userId);

    for (const check of eligibility) {
      if (check.eligible) {
        const wasNew = await grantBadgeIfNew(userId, check.type);
        if (wasNew) granted.push(check.type);
      }
    }

    if (granted.length > 0) {
      console.log(`[useBadges] Selos concedidos para ${userId}:`, granted);
    }
  } catch (err) {
    console.error('[useBadges] Erro no motor de badges:', err);
  }

  return { granted };
}

// ── Utilitarios de semana ISO ──

function getISOWeek(date: Date): number {
  const d = new Date(date.getTime());
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  return 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
}

function areConsecutiveWeeks(newer: string, older: string): boolean {
  // formato: "2026-W09", "2026-W08"
  const [yN, wN] = newer.split('-W').map(Number);
  const [yO, wO] = older.split('-W').map(Number);
  if (yN === yO) return wN - wO === 1;
  if (yN - yO === 1 && wO >= 52 && wN === 1) return true;
  return false;
}