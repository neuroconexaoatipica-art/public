import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import { supabase } from './supabase';
import { TIMEOUTS, SUPABASE_STORAGE_KEY } from './supabase';
import type { User } from './supabase';
import { normalizeRole } from './roleEngine';

interface ProfileContextValue {
  user: User | null;
  isLoading: boolean;
  updateProfile: (updates: Partial<User>) => Promise<{ success: boolean; data?: User; error?: string }>;
  uploadPhoto: (file: File) => Promise<{ success: boolean; url?: string; error?: string }>;
  refreshProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

// Timeout helper — cancela se demorar demais
function withTimeout<T>(promise: PromiseLike<T>, ms: number, label = ''): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout ${label} (${ms}ms)`)), ms)
    ),
  ]) as Promise<T>;
}

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isLoadingRef = useRef(true); // ref para evitar stale closure no timeout

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
        isLoadingRef.current = false;
        return;
      }

      let { data, error } = await withTimeout(
        supabase.from('users').select('*').eq('id', uid).single(),
        TIMEOUTS.PROFILE,
        'profile-select'
      );

      // SAFETY NET: registro não existe na tabela users → criar automaticamente
      if (error && (error as any).code === 'PGRST116') {
        console.warn('Safety net: usuário não encontrado em users, criando registro...');
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          const { data: newUser, error: insertError } = await withTimeout(
            supabase
              .from('users')
              .insert({
                id: uid,
                name: authUser.user_metadata?.name || 'Novo Membro',
                role: 'member_free_legacy',
                is_beta_lifetime_flag: true,
                access_released: true,
                onboarding_done: true,
                leadership_onboarding_done: false,
                age_verified: false,
                whatsapp: authUser.user_metadata?.whatsapp
                  ? [authUser.user_metadata.whatsapp]
                  : null,
                allow_whatsapp: authUser.user_metadata?.allow_whatsapp || false,
                allow_email: authUser.user_metadata?.allow_email ?? true,
              })
              .select()
              .single(),
            TIMEOUTS.PROFILE,
            'profile-insert'
          );

          if (!insertError && newUser) {
            data = newUser;
            error = null;
          } else {
            console.error('Safety net: erro ao criar usuário:', insertError);
            setIsLoading(false);
            isLoadingRef.current = false;
            return;
          }
        }
      }

      if (error) throw error;

      // SYNC: preencher whatsapp a partir de user_metadata se vazio
      // Feito em background — não bloqueia o loading
      if (data && (!data.whatsapp || (Array.isArray(data.whatsapp) && data.whatsapp.length === 0))) {
        // Fire-and-forget: não esperar por isso
        supabase.auth.getUser().then(({ data: { user: authUser } }) => {
          const metaWa = authUser?.user_metadata?.whatsapp;
          if (metaWa && uid) {
            supabase
              .from('users')
              .update({
                whatsapp: [metaWa],
                allow_whatsapp: authUser!.user_metadata?.allow_whatsapp || false,
                allow_email: authUser!.user_metadata?.allow_email ?? true,
              })
              .eq('id', uid)
              .select()
              .single()
              .then(({ data: patched, error: patchErr }) => {
                if (!patchErr && patched) {
                  console.log('Sync: whatsapp preenchido a partir de user_metadata');
                  setUser({ ...patched, role: normalizeRole(patched.role) });
                }
              });
          }
        }).catch(() => { /* ignorar erros de sync */ });
      }

      // Normalizar role
      if (data) {
        data = { ...data, role: normalizeRole(data.role) };
      }

      setUser(data);
    } catch (err) {
      console.error('Erro ao carregar perfil:', err);
    } finally {
      setIsLoading(false);
      isLoadingRef.current = false;
    }
  }, []);

  // ÚNICO listener de auth para toda a aplicação
  useEffect(() => {
    let isMounted = true;

    // ═══════════════════════════════════════════════════════════════
    // FAST PATH: Se não existe sessão no localStorage, o visitante
    // vê a landing page INSTANTANEAMENTE (0ms) em vez de esperar
    // 10-25s pelo cold start do Supabase free tier.
    // ═══════════════════════════════════════════════════════════════
    const hasStoredSession = !!localStorage.getItem(SUPABASE_STORAGE_KEY);

    if (!hasStoredSession) {
      // Visitante puro — sem sessão, sem espera
      setUser(null);
      setIsLoading(false);
      isLoadingRef.current = false;

      // Ainda escutar auth changes (caso faça login depois)
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!isMounted) return;
        if (event === 'SIGNED_IN' && session) {
          isLoadingRef.current = true;
          setIsLoading(true);
          await loadProfile(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      });

      return () => {
        isMounted = false;
        subscription.unsubscribe();
      };
    }

    // ═══════════════════════════════════════════════════════════════
    // SLOW PATH: Usuário com sessão armazenada — carrega perfil
    // com safety net de 10s (antes era 25s)
    // ═══════════════════════════════════════════════════════════════
    const timeout = setTimeout(() => {
      if (isMounted && isLoadingRef.current) {
        console.warn('Profile: timeout de segurança atingido, liberando UI');
        setIsLoading(false);
        isLoadingRef.current = false;
      }
    }, TIMEOUTS.SAFETY_NET);

    // Carga inicial
    loadProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      if (event === 'SIGNED_IN' && session) {
        isLoadingRef.current = true;
        setIsLoading(true);
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

      const { data, error } = await withTimeout(
        supabase.from('users').update(updates).eq('id', user.id).select().single(),
        TIMEOUTS.MUTATION,
        'profile-update'
      );

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

      const { error: uploadError } = await withTimeout(
        supabase.storage.from('avatars').upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        }),
        TIMEOUTS.UPLOAD,
        'photo-upload'
      );

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { data, error } = await withTimeout(
        supabase.from('users').update({ profile_photo: publicUrl }).eq('id', user.id).select().single(),
        TIMEOUTS.MUTATION,
        'photo-update'
      );

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