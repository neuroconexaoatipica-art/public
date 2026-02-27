/**
 * useRitualLogs — Hook para registro formal de rituais
 * v1.1: Constancia, badges automaticas, metricas
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase, TIMEOUTS } from './supabase';
import { cleanTextInput, MAX_LENGTHS } from './security';

export type RitualType = 'daily' | 'weekly' | 'monthly' | 'territorial' | 'entry';

export interface RitualLog {
  id: string;
  user_id: string;
  ritual_type: RitualType;
  community_id: string | null;
  response_text: string | null;
  completed_at: string;
}

export interface RitualStats {
  totalCompleted: number;
  consecutiveWeeks: number;
  lastCompleted: string | null;
  byType: Record<RitualType, number>;
  hasEntryRitual: boolean;
}

export function useRitualLogs(userId?: string) {
  const [logs, setLogs] = useState<RitualLog[]>([]);
  const [stats, setStats] = useState<RitualStats>({
    totalCompleted: 0,
    consecutiveWeeks: 0,
    lastCompleted: null,
    byType: { daily: 0, weekly: 0, monthly: 0, territorial: 0, entry: 0 },
    hasEntryRitual: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  const loadLogs = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from('ritual_logs')
        .select('*')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false })
        .limit(100)
        .abortSignal(AbortSignal.timeout(TIMEOUTS.QUERY));

      if (error) throw error;

      const ritualLogs = (data || []) as RitualLog[];
      setLogs(ritualLogs);

      // Calcular stats
      const byType: Record<RitualType, number> = { daily: 0, weekly: 0, monthly: 0, territorial: 0, entry: 0 };
      ritualLogs.forEach(log => {
        if (byType[log.ritual_type] !== undefined) {
          byType[log.ritual_type]++;
        }
      });

      // Calcular semanas consecutivas (baseado em rituais diarios/semanais)
      const weeklyLogs = ritualLogs
        .filter(l => l.ritual_type === 'daily' || l.ritual_type === 'weekly')
        .map(l => new Date(l.completed_at));

      let consecutiveWeeks = 0;
      if (weeklyLogs.length > 0) {
        const now = new Date();
        const msPerWeek = 7 * 24 * 60 * 60 * 1000;
        let currentWeekStart = new Date(now);
        currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay());
        currentWeekStart.setHours(0, 0, 0, 0);

        for (let i = 0; i < 52; i++) { // max 1 ano
          const weekStart = new Date(currentWeekStart.getTime() - (i * msPerWeek));
          const weekEnd = new Date(weekStart.getTime() + msPerWeek);
          const hasActivity = weeklyLogs.some(d => d >= weekStart && d < weekEnd);
          if (hasActivity) {
            consecutiveWeeks++;
          } else {
            break;
          }
        }
      }

      setStats({
        totalCompleted: ritualLogs.length,
        consecutiveWeeks,
        lastCompleted: ritualLogs[0]?.completed_at || null,
        byType,
        hasEntryRitual: byType.entry > 0,
      });
    } catch (err) {
      console.error('[useRitualLogs] Erro ao carregar:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  /** Registrar ritual completado */
  const completeRitual = useCallback(async (
    ritualType: RitualType,
    responseText?: string,
    communityId?: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false, error: 'Voce precisa estar logado' };

      // Para ritual de entrada, verificar se ja fez
      if (ritualType === 'entry') {
        const { data: existing } = await supabase
          .from('ritual_logs')
          .select('id')
          .eq('user_id', user.id)
          .eq('ritual_type', 'entry')
          .limit(1);

        if (existing && existing.length > 0) {
          return { success: false, error: 'Ritual de entrada ja realizado' };
        }
      }

      // Para rituais diarios, verificar se ja fez hoje
      if (ritualType === 'daily') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const { data: todayLogs } = await supabase
          .from('ritual_logs')
          .select('id')
          .eq('user_id', user.id)
          .eq('ritual_type', 'daily')
          .gte('completed_at', today.toISOString())
          .limit(1);

        if (todayLogs && todayLogs.length > 0) {
          return { success: false, error: 'Voce ja completou o ritual diario de hoje' };
        }
      }

      const cleaned = responseText ? cleanTextInput(responseText, MAX_LENGTHS.DEEP_STATEMENT) : null;

      const { error: insertError } = await supabase
        .from('ritual_logs')
        .insert({
          user_id: user.id,
          ritual_type: ritualType,
          response_text: cleaned,
          community_id: communityId || null,
        });

      if (insertError) throw insertError;

      await loadLogs();
      return { success: true };
    } catch (err: any) {
      console.error('[useRitualLogs] Erro ao registrar:', err);
      return { success: false, error: err.message || 'Erro ao registrar ritual' };
    }
  }, [loadLogs]);

  /** Verificar se tem direito ao badge de constancia (4+ semanas) */
  const hasConsistencyBadge = stats.consecutiveWeeks >= 4;

  return {
    logs,
    stats,
    isLoading,
    completeRitual,
    refreshLogs: loadLogs,
    hasConsistencyBadge,
  };
}
