import { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabase';

export interface Testimonial { id: string; author_id: string; target_user_id: string; content: string; is_approved: boolean; is_visible: boolean; created_at: string; author_data?: { id: string; name: string; profile_photo: string | null; role: string }; }

export function useTestimonials(targetUserId: string | null) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    if (!targetUserId) { setIsLoading(false); return; }
    try {
      const { data, error } = await supabase.from('testimonials').select('*').eq('target_user_id', targetUserId).eq('is_visible', true).eq('is_approved', true).order('created_at', { ascending: false });
      if (error) throw error;
      const authorIds = [...new Set((data || []).map((t: any) => t.author_id))];
      let authorsMap: Record<string, any> = {};
      if (authorIds.length > 0) { const { data: authors } = await supabase.from('users').select('id,name,profile_photo,role').in('id', authorIds); (authors || []).forEach((a: any) => { authorsMap[a.id] = a; }); }
      setTestimonials((data || []).map((t: any) => ({ ...t, author_data: authorsMap[t.author_id] || { id: t.author_id, name: 'Membro', profile_photo: null, role: 'member' } })));
    } catch (err) { console.error('[useTestimonials] Erro:', err); } finally { setIsLoading(false); }
  }, [targetUserId]);

  useEffect(() => { load(); }, [load]);

  const writeTestimonial = useCallback(async (targetId: string, content: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false, error: 'Nao autenticado' };
      if (user.id === targetId) return { success: false, error: 'Nao pode escrever reconhecimento para si mesmo' };
      const { error } = await supabase.from('testimonials').upsert({ author_id: user.id, target_user_id: targetId, content: content.trim() }, { onConflict: 'author_id,target_user_id' });
      if (error) throw error;
      await load();
      return { success: true };
    } catch (err: any) { return { success: false, error: err.message }; }
  }, [load]);

  return { testimonials, isLoading, writeTestimonial, refresh: load };
}
