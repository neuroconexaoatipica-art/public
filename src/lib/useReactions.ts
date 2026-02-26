import { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabase';

export type ReactionType = 'senti_isso' | 'me_provocou' | 'gratidao' | 'intenso' | 'coragem' | 'lucidez';

export const REACTION_LABELS: Record<ReactionType, { emoji: string; label: string }> = {
  senti_isso: { emoji: '\u{1F494}', label: 'Senti isso' },
  me_provocou: { emoji: '\u{26A1}', label: 'Me provocou' },
  gratidao: { emoji: '\u{1F64F}', label: 'Gratidao' },
  intenso: { emoji: '\u{1F525}', label: 'Intenso' },
  coragem: { emoji: '\u{1F6E1}\u{FE0F}', label: 'Coragem' },
  lucidez: { emoji: '\u{1F48E}', label: 'Lucidez' },
};

export interface ReactionCount { type: ReactionType; count: number; }

export function useReactions(postId: string) {
  const [counts, setCounts] = useState<ReactionCount[]>([]);
  const [myReaction, setMyReaction] = useState<ReactionType | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const load = useCallback(async () => {
    if (!postId) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase.from('reactions').select('reaction_type,user_id').eq('post_id', postId);
      if (error) throw error;
      const countMap: Record<string, number> = {};
      let myR: ReactionType | null = null;
      (data || []).forEach((r: any) => { countMap[r.reaction_type] = (countMap[r.reaction_type] || 0) + 1; if (user && r.user_id === user.id) myR = r.reaction_type as ReactionType; });
      setCounts(Object.entries(countMap).map(([type, count]) => ({ type: type as ReactionType, count })));
      setMyReaction(myR);
      setTotalCount((data || []).length);
    } catch (err) { console.error('[useReactions] Erro:', err); }
  }, [postId]);

  useEffect(() => { load(); }, [load]);

  const toggleReaction = useCallback(async (type: ReactionType) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      if (myReaction === type) { await supabase.from('reactions').delete().eq('user_id', user.id).eq('post_id', postId); setMyReaction(null); }
      else if (myReaction) { await supabase.from('reactions').update({ reaction_type: type }).eq('user_id', user.id).eq('post_id', postId); setMyReaction(type); }
      else { await supabase.from('reactions').insert({ user_id: user.id, post_id: postId, reaction_type: type }); setMyReaction(type); }
      await load();
    } catch (err) { console.error('[useReactions] Erro ao reagir:', err); }
  }, [myReaction, postId, load]);

  return { counts, myReaction, totalCount, toggleReaction };
}
