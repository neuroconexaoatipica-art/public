import { useState, useEffect } from 'react';
import { supabase } from './supabase';
import type { User } from './supabase';

export function useProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { setUser(null); setIsLoading(false); return; }
      const { data, error } = await supabase.from('users').select('*').eq('id', session.user.id).single();
      if (error) throw error;
      setUser(data);
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    } finally { setIsLoading(false); }
  };

  useEffect(() => {
    let isMounted = true;
    loadProfile();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;
      if (event === 'SIGNED_IN' && session) await loadProfile();
      else if (event === 'SIGNED_OUT') setUser(null);
    });
    return () => { isMounted = false; subscription.unsubscribe(); };
  }, []);

  const updateProfile = async (updates: Partial<User>) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('Nao autenticado');
      const { data, error } = await supabase.from('users').update(updates).eq('id', session.user.id).select().single();
      if (error) throw error;
      setUser(data);
      return { success: true, data };
    } catch (error: any) { return { success: false, error: error.message }; }
  };

  const uploadPhoto = async (file: File) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('Nao autenticado');
      const fileExt = file.name.split('.').pop();
      const fileName = `${session.user.id}-${Date.now()}.${fileExt}`;
      const filePath = `profile-photos/${fileName}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, { cacheControl: '3600', upsert: true });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
      await updateProfile({ profile_photo: publicUrl });
      return { success: true, url: publicUrl };
    } catch (error: any) { return { success: false, error: error.message }; }
  };

  return { user, isLoading, updateProfile, uploadPhoto, refreshProfile: loadProfile };
}
