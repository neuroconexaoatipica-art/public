import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { supabase } from './supabase';
import type { User } from './supabase';

interface ProfileContextValue {
  user: User | null;
  isLoading: boolean;
  updateProfile: (updates: Partial<User>) => Promise<{ success: boolean; data?: User; error?: string }>;
  uploadPhoto: (file: File) => Promise<{ success: boolean; url?: string; error?: string }>;
  refreshProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadProfile = useCallback(async (userId?: string) => {
    try {
      let uid = userId;
      if (!uid) {
        const { data: { session } } = await supabase.auth.getSession();
        uid = session?.user?.id;
      }

      if (!uid) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      let { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', uid)
        .single();

      // SAFETY NET: registro não existe na tabela users → criar automaticamente
      if (error && (error as any).code === 'PGRST116') {
        console.warn('Safety net: usuário não encontrado em users, criando registro...');
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          const { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert({
              id: uid,
              name: authUser.user_metadata?.name || 'Novo Membro',
              role: 'user_free',
              access_released: false,
              onboarding_done: false,
              whatsapp: authUser.user_metadata?.whatsapp || null,
              allow_whatsapp: authUser.user_metadata?.allow_whatsapp || false,
              allow_email: authUser.user_metadata?.allow_email ?? true,
            })
            .select()
            .single();

          if (!insertError && newUser) {
            data = newUser;
            error = null;
          } else {
            console.error('Safety net: erro ao criar usuário:', insertError);
            setIsLoading(false);
            return;
          }
        }
      }

      if (error) throw error;
      setUser(data);
    } catch (err) {
      console.error('Erro ao carregar perfil:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ÚNICO listener de auth para toda a aplicação
  useEffect(() => {
    let isMounted = true;

    // Timeout de segurança para não travar no loading
    const timeout = setTimeout(() => {
      if (isMounted && isLoading) {
        console.warn('Profile: timeout de 3s atingido');
        setIsLoading(false);
      }
    }, 3000);

    // Carga inicial
    loadProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      if (event === 'SIGNED_IN' && session) {
        await loadProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  const updateProfile = useCallback(async (updates: Partial<User>) => {
    try {
      if (!user?.id) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      setUser(data);
      return { success: true, data };
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error);
      return { success: false, error: error.message };
    }
  }, [user?.id]);

  const uploadPhoto = useCallback(async (file: File) => {
    try {
      if (!user?.id) throw new Error('Usuário não autenticado');

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `profile-photos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Atualizar perfil com nova foto
      const { data, error } = await supabase
        .from('users')
        .update({ profile_photo: publicUrl })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      setUser(data);
      return { success: true, url: publicUrl };
    } catch (error: any) {
      console.error('Erro ao fazer upload de foto:', error);
      return { success: false, error: error.message };
    }
  }, [user?.id]);

  return (
    <ProfileContext.Provider value={{
      user,
      isLoading,
      updateProfile,
      uploadPhoto,
      refreshProfile: () => loadProfile()
    }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfileContext(): ProfileContextValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) {
    throw new Error('useProfileContext deve ser usado dentro de <ProfileProvider>');
  }
  return ctx;
}

