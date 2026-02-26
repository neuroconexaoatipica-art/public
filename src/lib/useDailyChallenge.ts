import { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabase';

export interface DailyChallenge { id: string; challenge_date: string; title: string; description: string; challenge_type: string; is_active: boolean; response_count: number; }
export interface DailyCheckin { id: string; user_id: string; checkin_date: string; response: string | null; challenge_id: string | null; streak_count: number; }

export function useDailyChallenge() {
  const [todayChallenge, setTodayChallenge] = useState<DailyChallenge | null>(null);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data: challenge } = await supabase.from('daily_challenges').select('*').eq('challenge_date', today).eq('is_active', true).single();
      setTodayChallenge(challenge || null);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: checkin } = await supabase.from('daily_checkins').select('*').eq('user_id', user.id).eq('checkin_date', today).single();
        setHasCheckedIn(!!checkin);
        const { data: streak } = await supabase.rpc('get_user_streak', { target_user_id: user.id });
        setCurrentStreak(streak || 0);
      }
    } catch (err) { console.error('[useDailyChallenge] Erro:', err); } finally { setIsLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const doCheckin = useCallback(async (response?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false, error: 'Nao autenticado' };
      const today = new Date().toISOString().split('T')[0];
      const { data: streak } = await supabase.rpc('get_user_streak', { target_user_id: user.id });
      const newStreak = (streak || 0) + 1;
      const { error } = await supabase.from('daily_checkins').upsert({ user_id: user.id, checkin_date: today, response: response?.trim() || null, challenge_id: todayChallenge?.id || null, streak_count: newStreak }, { onConflict: 'user_id,checkin_date' });
      if (error) throw error;
      await supabase.from('users').update({ streak_current: newStreak, streak_max: Math.max(newStreak, currentStreak), last_seen_at: new Date().toISOString() }).eq('id', user.id);
      setHasCheckedIn(true); setCurrentStreak(newStreak);
      return { success: true, streak: newStreak };
    } catch (err: any) { return { success: false, error: err.message }; }
  }, [todayChallenge, currentStreak]);

  return { todayChallenge, hasCheckedIn, currentStreak, isLoading, doCheckin, refresh: load };
}
