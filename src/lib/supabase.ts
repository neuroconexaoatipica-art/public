import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ieieohtnaymykxiqnmlc.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImllaWVvaHRuYXlteWt4aXFubWxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0OTQ1NzMsImV4cCI6MjA4NjA3MDU3M30.32LjQe1dQLGAfbyfK8KkjNlXOGkZGaWEgI20y3gl3Hc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,    // SPA sem OAuth redirect — evita parse desnecessário
    storage: window.localStorage,  // Explícito: evita fallback para memória
  },
  global: {
    headers: {
      'x-client-info': 'neuroconexao-atipica/1.0',
    },
  },
  db: {
    schema: 'public',
  },
});

// Tipos TypeScript para o banco de dados
export type UserRole = 'visitor' | 'user_free' | 'member' | 'founder' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  bio: string | null;
  profile_photo: string | null;
  role: UserRole;
  access_released: boolean;
  onboarding_done: boolean;
  onboarding_data: Record<string, any> | null;
  whatsapp: string | null;
  allow_whatsapp: boolean;
  allow_email: boolean;
  created_at: string;
}

export interface Community {
  id: string;
  name: string;
  description: string;
  is_public: boolean;
  creator: string | null;
  created_at: string;
}

export interface Post {
  id: string;
  content: string;
  author: string;
  community: string | null;
  is_public: boolean;
  is_pinned: boolean;
  image_url: string | null;
  created_at: string;
}

export interface LiveInterest {
  id: string;
  user: string;
  community: string;
  message: string | null;
  created_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  author: string;
  content: string;
  created_at: string;
}
