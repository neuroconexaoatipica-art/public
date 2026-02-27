/**
 * useMemberTestimonials — Hook para depoimentos entre membros (estilo Orkut!)
 * v1.1: Aprovacao obrigatoria pelo receptor
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase, TIMEOUTS } from './supabase';
import { cleanTextInput, MAX_LENGTHS, RATE_LIMITS } from './security';

export interface MemberTestimonial {
  id: string;
  from_user: string;
  to_user: string;
  text: string;
  approved_by_receiver: boolean;
  is_public: boolean;
  created_at: string;
  // Joined
  author_name?: string;
  author_photo?: string;
  author_display_name?: string;
}

export function useMemberTestimonials(userId?: string) {
  const [received, setReceived] = useState<MemberTestimonial[]>([]);
  const [sent, setSent] = useState<MemberTestimonial[]>([]);
  const [pending, setPending] = useState<MemberTestimonial[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadTestimonials = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);

    try {
      // Depoimentos RECEBIDOS (aprovados e publicos)
      const { data: receivedData } = await supabase
        .from('member_testimonials')
        .select(`
          *,
          author:from_user (name, display_name, profile_photo)
        `)
        .eq('to_user', userId)
        .eq('approved_by_receiver', true)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .abortSignal(AbortSignal.timeout(TIMEOUTS.QUERY));

      const mappedReceived = (receivedData || []).map((t: any) => ({
        ...t,
        author_name: t.author?.name || 'Membro',
        author_display_name: t.author?.display_name || t.author?.name || 'Membro',
        author_photo: t.author?.profile_photo,
      }));
      setReceived(mappedReceived);

      // Verificar se e o proprio usuario (para ver pendentes e enviados)
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id === userId) {
        // Pendentes de aprovacao
        const { data: pendingData } = await supabase
          .from('member_testimonials')
          .select(`
            *,
            author:from_user (name, display_name, profile_photo)
          `)
          .eq('to_user', userId)
          .eq('approved_by_receiver', false)
          .order('created_at', { ascending: false });

        setPending((pendingData || []).map((t: any) => ({
          ...t,
          author_name: t.author?.name || 'Membro',
          author_display_name: t.author?.display_name || t.author?.name || 'Membro',
          author_photo: t.author?.profile_photo,
        })));

        // Enviados por mim
        const { data: sentData } = await supabase
          .from('member_testimonials')
          .select(`
            *,
            receiver:to_user (name, display_name, profile_photo)
          `)
          .eq('from_user', userId)
          .order('created_at', { ascending: false });

        setSent((sentData || []).map((t: any) => ({
          ...t,
          author_name: t.receiver?.name || 'Membro',
          author_display_name: t.receiver?.display_name || t.receiver?.name || 'Membro',
          author_photo: t.receiver?.profile_photo,
        })));
      }
    } catch (err) {
      console.error('[useMemberTestimonials] Erro:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadTestimonials();
  }, [loadTestimonials]);

  /** Escrever depoimento para outro membro */
  const writeTestimonial = useCallback(async (
    toUserId: string,
    text: string
  ): Promise<{ success: boolean; error?: string }> => {
    const rateCheck = RATE_LIMITS.CONNECTION('testimonial');
    if (!rateCheck.allowed) {
      return { success: false, error: 'Limite atingido. Tente novamente mais tarde.' };
    }

    const cleaned = cleanTextInput(text, MAX_LENGTHS.TESTIMONIAL);
    if (!cleaned || cleaned.length < 10) {
      return { success: false, error: 'Depoimento muito curto (minimo 10 caracteres)' };
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false, error: 'Voce precisa estar logado' };

      if (user.id === toUserId) {
        return { success: false, error: 'Voce nao pode escrever depoimento para si mesmo' };
      }

      // Verificar se ja escreveu para este usuario
      const { data: existing } = await supabase
        .from('member_testimonials')
        .select('id')
        .eq('from_user', user.id)
        .eq('to_user', toUserId)
        .limit(1);

      if (existing && existing.length > 0) {
        return { success: false, error: 'Voce ja escreveu um depoimento para esta pessoa' };
      }

      const { error: insertError } = await supabase
        .from('member_testimonials')
        .insert({
          from_user: user.id,
          to_user: toUserId,
          text: cleaned,
        });

      if (insertError) throw insertError;

      return { success: true };
    } catch (err: any) {
      console.error('[useMemberTestimonials] Erro ao escrever:', err);
      return { success: false, error: err.message || 'Erro ao enviar depoimento' };
    }
  }, []);

  /** Aprovar depoimento recebido */
  const approveTestimonial = useCallback(async (
    testimonialId: string,
    makePublic: boolean = true
  ): Promise<{ success: boolean }> => {
    try {
      const { error } = await supabase
        .from('member_testimonials')
        .update({
          approved_by_receiver: true,
          is_public: makePublic,
        })
        .eq('id', testimonialId);

      if (error) throw error;
      await loadTestimonials();
      return { success: true };
    } catch (err) {
      console.error('[useMemberTestimonials] Erro ao aprovar:', err);
      return { success: false };
    }
  }, [loadTestimonials]);

  /** Rejeitar/deletar depoimento */
  const rejectTestimonial = useCallback(async (
    testimonialId: string
  ): Promise<{ success: boolean }> => {
    try {
      const { error } = await supabase
        .from('member_testimonials')
        .delete()
        .eq('id', testimonialId);

      if (error) throw error;
      await loadTestimonials();
      return { success: true };
    } catch (err) {
      console.error('[useMemberTestimonials] Erro ao rejeitar:', err);
      return { success: false };
    }
  }, [loadTestimonials]);

  /** Editar depoimento que EU escrevi (autor) */
  const editTestimonial = useCallback(async (
    testimonialId: string,
    newText: string
  ): Promise<{ success: boolean; error?: string }> => {
    const cleaned = cleanTextInput(newText, MAX_LENGTHS.TESTIMONIAL);
    if (!cleaned || cleaned.length < 10) {
      return { success: false, error: 'Depoimento muito curto (minimo 10 caracteres)' };
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false, error: 'Voce precisa estar logado' };

      // Edicao reseta aprovacao — receptor precisa aprovar novamente
      const { error } = await supabase
        .from('member_testimonials')
        .update({ text: cleaned, approved_by_receiver: false })
        .eq('id', testimonialId)
        .eq('from_user', user.id);

      if (error) throw error;
      await loadTestimonials();
      return { success: true };
    } catch (err: any) {
      console.error('[useMemberTestimonials] Erro ao editar:', err);
      return { success: false, error: err.message || 'Erro ao editar depoimento' };
    }
  }, [loadTestimonials]);

  /** Remover depoimento que EU escrevi (autor) */
  const deleteMyTestimonial = useCallback(async (
    testimonialId: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false, error: 'Voce precisa estar logado' };

      const { error } = await supabase
        .from('member_testimonials')
        .delete()
        .eq('id', testimonialId)
        .eq('from_user', user.id);

      if (error) throw error;
      await loadTestimonials();
      return { success: true };
    } catch (err: any) {
      console.error('[useMemberTestimonials] Erro ao deletar:', err);
      return { success: false, error: err.message || 'Erro ao remover depoimento' };
    }
  }, [loadTestimonials]);

  return {
    received,
    sent,
    pending,
    isLoading,
    writeTestimonial,
    approveTestimonial,
    rejectTestimonial,
    editTestimonial,
    deleteMyTestimonial,
    refreshTestimonials: loadTestimonials,
    receivedCount: received.length,
    pendingCount: pending.length,
  };
}