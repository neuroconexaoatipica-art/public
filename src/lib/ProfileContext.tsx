import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "./supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface Profile {
  id: string;
  name: string;
  bio: string | null;
  profile_photo: string | null;
  role: string;
  access_released: boolean;
  onboarding_done: boolean;
  whatsapp: string[] | null;
  allow_whatsapp: boolean;
  allow_email: boolean;
  beta_lifetime: string[] | null;
}

interface ProfileContextType {
  user: SupabaseUser | null;
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Erro ao carregar perfil:", error);
      setProfile(null);
      return;
    }

    setProfile(data);
  };

  const refreshProfile = async () => {
    if (!user) return;
    await loadProfile(user.id);
  };

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!mounted) return;

        if (session?.user) {
          setUser(session.user);
          await loadProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch (err) {
        console.error("Erro inicializando sessão:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initialize();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;

      if (session?.user) {
        setUser(session.user);
        await loadProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <ProfileContext.Provider value={{ user, profile, loading, refreshProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfile must be used within ProfileProvider");
  }
  return context;
}

