/**
 * useLiveQuestions — Hook para perguntas antecipadas de lives
 * v1.1: Suporta anonimato, sensibilidade, selecao por founder
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase, TIMEOUTS } from './supabase';
import { RATE_LIMITS, cleanTextInput, MAX_LENGTHS } from './security';

export interface LiveQuestion {
  id: string;
  event_id: string;
  user_id: string;
  question_text: string;
  anonymous: boolean;
  is_sensitive: boolean;
  is_selected: boolean;
  is_highlighted: boolean;
  priority_score: number;
  answered_live: boolean;
  answer_summary: string | null;
  created_at: string;
  // Joined
  author_name?: string;
  author_photo?: string;
}

export function useLiveQuestions(eventId: string | null) {
  const [questions, setQuestions] = useState<LiveQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadQuestions = useCallback(async () => {
    if (!eventId) return;
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('live_questions')
        .select(`
          *,
          users:user_id (name, display_name, profile_photo)
        `)
        .eq('event_id', eventId)
        .order('priority_score', { ascending: false })
        .order('created_at', { ascending: true })
        .abortSignal(AbortSignal.timeout(TIMEOUTS.QUERY));

      if (fetchError) throw fetchError;

      const mapped: LiveQuestion[] = (data || []).map((q: any) => ({
        ...q,
        author_name: q.anonymous ? 'Anonimo' : (q.users?.display_name || q.users?.name || 'Membro'),
        author_photo: q.anonymous ? null : q.users?.profile_photo,
      }));

      setQuestions(mapped);
    } catch (err: any) {
      console.error('[useLiveQuestions] Erro ao carregar:', err);
      setError(err.message || 'Erro ao carregar perguntas');
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  /** Enviar nova pergunta */
  const submitQuestion = useCallback(async (
    questionText: string,
    anonymous: boolean = false,
    isSensitive: boolean = false
  ): Promise<{ success: boolean; error?: string }> => {
    if (!eventId) return { success: false, error: 'Evento nao encontrado' };

    // Rate limit local
    const rateCheck = RATE_LIMITS.LIVE_QUESTION(eventId);
    if (!rateCheck.allowed) {
      return { success: false, error: `Limite de perguntas atingido. Tente novamente em ${Math.ceil(rateCheck.retryAfterMs / 1000)}s` };
    }

    const cleaned = cleanTextInput(questionText, MAX_LENGTHS.QUESTION_TEXT);
    if (!cleaned || cleaned.length < 5) {
      return { success: false, error: 'Pergunta muito curta (minimo 5 caracteres)' };
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false, error: 'Voce precisa estar logado' };

      const { error: insertError } = await supabase
        .from('live_questions')
        .insert({
          event_id: eventId,
          user_id: user.id,
          question_text: cleaned,
          anonymous,
          is_sensitive: isSensitive,
        });

      if (insertError) throw insertError;

      await loadQuestions();
      return { success: true };
    } catch (err: any) {
      console.error('[useLiveQuestions] Erro ao enviar:', err);
      return { success: false, error: err.message || 'Erro ao enviar pergunta' };
    }
  }, [eventId, loadQuestions]);

  /** Selecionar pergunta (founder/moderador) */
  const selectQuestion = useCallback(async (questionId: string, selected: boolean) => {
    try {
      const { error: updateError } = await supabase
        .from('live_questions')
        .update({ is_selected: selected })
        .eq('id', questionId);

      if (updateError) throw updateError;
      await loadQuestions();
    } catch (err: any) {
      console.error('[useLiveQuestions] Erro ao selecionar:', err);
    }
  }, [loadQuestions]);

  /** Marcar como respondida ao vivo */
  const markAnswered = useCallback(async (questionId: string, summary?: string) => {
    try {
      const { error: updateError } = await supabase
        .from('live_questions')
        .update({
          answered_live: true,
          answer_summary: summary || null,
        })
        .eq('id', questionId);

      if (updateError) throw updateError;
      await loadQuestions();
    } catch (err: any) {
      console.error('[useLiveQuestions] Erro ao marcar respondida:', err);
    }
  }, [loadQuestions]);

  /** Atualizar prioridade */
  const setPriority = useCallback(async (questionId: string, score: number) => {
    try {
      await supabase
        .from('live_questions')
        .update({ priority_score: score })
        .eq('id', questionId);
      await loadQuestions();
    } catch (err: any) {
      console.error('[useLiveQuestions] Erro ao definir prioridade:', err);
    }
  }, [loadQuestions]);

  /** Deletar pergunta propria */
  const deleteQuestion = useCallback(async (questionId: string) => {
    try {
      await supabase
        .from('live_questions')
        .delete()
        .eq('id', questionId);
      await loadQuestions();
    } catch (err: any) {
      console.error('[useLiveQuestions] Erro ao deletar:', err);
    }
  }, [loadQuestions]);

  return {
    questions,
    isLoading,
    error,
    submitQuestion,
    selectQuestion,
    markAnswered,
    setPriority,
    deleteQuestion,
    refreshQuestions: loadQuestions,
    // Computed
    selectedQuestions: questions.filter(q => q.is_selected),
    answeredQuestions: questions.filter(q => q.answered_live),
    pendingQuestions: questions.filter(q => !q.answered_live && !q.is_selected),
  };
}
