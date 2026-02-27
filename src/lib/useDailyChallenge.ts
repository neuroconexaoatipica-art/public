/**
 * useDailyChallenge — Hook para desafios diarios (Rituais do Dia)
 * v2.0: Alinhado com DailyRitualModal + fallback sem desafio
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabase';

export interface DailyChallenge {
  id: string;
  challenge_date: string;
  title: string;
  description: string;
  challenge_type: string;
  is_active: boolean;
  response_count: number;
}

export interface DailyCheckin {
  id: string;
  user_id: string;
  checkin_date: string;
  response: string | null;
  challenge_id: string | null;
  streak_count: number;
}

export function useDailyChallenge() {
  const [todayChallenge, setTodayChallenge] = useState<DailyChallenge | null>(null);
  const [todayCheckin, setTodayCheckin] = useState<DailyCheckin | null>(null);
  const [streak, setStreak] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const today = new Date().toISOString().split('T')[0];

      // Buscar desafio de hoje
      const { data: challenge } = await supabase
        .from('daily_challenges')
        .select('*')
        .eq('challenge_date', today)
        .eq('is_active', true)
        .maybeSingle();

      setTodayChallenge(challenge || null);

      // Verificar se usuario ja fez checkin hoje
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: checkin } = await supabase
          .from('daily_checkins')
          .select('*')
          .eq('user_id', user.id)
          .eq('checkin_date', today)
          .maybeSingle();

        setTodayCheckin(checkin || null);

        // Calcular streak — contar dias consecutivos com checkin
        try {
          const { data: streakData } = await supabase.rpc('get_user_streak', { target_user_id: user.id });
          setStreak(streakData || 0);
        } catch {
          // Se a funcao RPC nao existir, calcular localmente
          const { data: recentCheckins } = await supabase
            .from('daily_checkins')
            .select('checkin_date')
            .eq('user_id', user.id)
            .order('checkin_date', { ascending: false })
            .limit(60);

          if (recentCheckins && recentCheckins.length > 0) {
            let count = 0;
            const now = new Date();
            for (let i = 0; i < 60; i++) {
              const checkDate = new Date(now);
              checkDate.setDate(checkDate.getDate() - i);
              const dateStr = checkDate.toISOString().split('T')[0];
              if (recentCheckins.some(c => c.checkin_date === dateStr)) {
                count++;
              } else if (i > 0) {
                break; // Quebrou a sequencia
              }
            }
            setStreak(count);
          }
        }
      }
    } catch (err) {
      console.error('[useDailyChallenge] Erro:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const submitCheckin = useCallback(async (response?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false, error: 'Nao autenticado' };

      const today = new Date().toISOString().split('T')[0];
      const newStreak = streak + 1;

      const { error } = await supabase.from('daily_checkins').upsert({
        user_id: user.id,
        checkin_date: today,
        response: response?.trim() || null,
        challenge_id: todayChallenge?.id || null,
        streak_count: newStreak,
      }, { onConflict: 'user_id,checkin_date' });

      if (error) throw error;

      // Incrementar response_count no desafio
      if (todayChallenge?.id) {
        await supabase.rpc('increment_challenge_response', { challenge_id: todayChallenge.id }).catch(() => {
          // Fallback: update direto se RPC nao existir
          supabase
            .from('daily_challenges')
            .update({ response_count: (todayChallenge.response_count || 0) + 1 })
            .eq('id', todayChallenge.id)
            .then(() => {});
        });
      }

      setTodayCheckin({
        id: '',
        user_id: user.id,
        checkin_date: today,
        response: response?.trim() || null,
        challenge_id: todayChallenge?.id || null,
        streak_count: newStreak,
      });
      setStreak(newStreak);

      return { success: true, streak: newStreak };
    } catch (err: any) {
      console.error('[useDailyChallenge] Erro no checkin:', err);
      return { success: false, error: err.message };
    }
  }, [todayChallenge, streak]);

  return {
    todayChallenge,
    todayCheckin,
    streak,
    isLoading,
    submitCheckin,
    hasCheckedIn: !!todayCheckin,
    refresh: load,
  };
}
