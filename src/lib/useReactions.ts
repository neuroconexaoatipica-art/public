import { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabase';

export type ReactionType = 'senti_isso' | 'me_provocou' | 'gratidao' | 'intenso' | 'coragem' | 'lucidez';

export const REACTION_LABELS: Record<ReactionType, { emoji: string; label: string }> = {
  senti_isso:   { emoji: '💔', label: 'Senti isso' },
  me_provocou:  { emoji: '⚡', label: 'Me provocou' },
  gratidao:     { emoji: '🙏', label: 'Gratidao' },
  intenso:      { emoji: '🔥', label: 'Intenso' },
  coragem:      { emoji: '🛡️', label: 'Coragem' },
  lucidez:      { emoji: '💎', label: 'Lucidez' },
};

export interface ReactionCount {
  type: ReactionType;
  count: number;
}

export function useReactions(postId: string) {
  const [counts, setCounts] = useState<ReactionCount[]>([]);
  const [myReaction, setMyReaction] = useState<ReactionType | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const load = useCallback(async () => {
    if (!postId) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Buscar todas as reacoes deste post
      const { data, error } = await supabase
        .from('reactions')
        .select('reaction_type, user_id')
        .eq('post_id', postId);

      if (error) throw error;

      // Contar por tipo
      const countMap: Record<string, number> = {};
      let myR: ReactionType | null = null;
      (data || []).forEach(r => {
        countMap[r.reaction_type] = (countMap[r.reaction_type] || 0) + 1;
        if (user && r.user_id === user.id) myR = r.reaction_type as ReactionType;
      });

      const countsArr: ReactionCount[] = Object.entries(countMap).map(([type, count]) => ({ type: type as ReactionType, count }));
      setCounts(countsArr);
      setMyReaction(myR);
      setTotalCount((data || []).length);
    } catch (err) {
      console.error('[useReactions] Erro:', err);
    }
  }, [postId]);

  useEffect(() => { load(); }, [load]);

  const toggleReaction = useCallback(async (type: ReactionType) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (myReaction === type) {
        // Remover reacao
        await supabase.from('reactions').delete().eq('user_id', user.id).eq('post_id', postId);
        setMyReaction(null);
      } else if (myReaction) {
        // Trocar tipo
        await supabase.from('reactions').update({ reaction_type: type }).eq('user_id', user.id).eq('post_id', postId);
        setMyReaction(type);
      } else {
        // Nova reacao
        await supabase.from('reactions').insert({ user_id: user.id, post_id: postId, reaction_type: type });
        setMyReaction(type);
      }
      await load();
    } catch (err) {
      console.error('[useReactions] Erro ao reagir:', err);
    }
  }, [myReaction, postId, load]);

  return { counts, myReaction, totalCount, toggleReaction };
}
