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
    // Timeout global de 45s — cobre cold start do plano gratuito Supabase
    // Free tier pode levar 15-30s pra acordar após inatividade
    fetch: (url, options = {}) => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 45000);

      // Se já tem signal externo, combinar
      if (options.signal) {
        options.signal.addEventListener('abort', () => controller.abort());
      }

      return fetch(url, { ...options, signal: controller.signal }).finally(() => {
        clearTimeout(timeout);
      });
    },
  },
  db: {
    schema: 'public',
  },
});

// Constantes globais de timeout — fonte única de verdade
export const TIMEOUTS = {
  /** Queries de leitura (SELECT) */
  QUERY: 30_000,
  /** Operações de escrita (INSERT, UPDATE, DELETE) */
  MUTATION: 45_000,
  /** Carregamento de perfil na inicialização */
  PROFILE: 12_000,
  /** Upload de arquivos */
  UPLOAD: 30_000,
  /** Safety net — libera UI mesmo se tudo travar */
  SAFETY_NET: 10_000,
} as const;

// Chave do localStorage onde o Supabase armazena a sessão
// Formato: sb-<project-ref>-auth-token
export const SUPABASE_STORAGE_KEY = 'sb-ieieohtnaymykxiqnmlc-auth-token';

// Tipos TypeScript para o banco de dados
export type UserRole = 'visitor' | 'member' | 'founder' | 'admin';

export interface User {
  id: string;
  name: string;
  bio: string | null;
  profile_photo: string | null;
  role: UserRole;
  access_released: boolean;
  onboarding_done: boolean;
  whatsapp: string[] | null;
  beta_lifetime: string[] | null;
  allow_whatsapp: boolean;
  allow_email: boolean;
  terms_version: string;
  terms_accepted_at: string;
  updated_at: string;
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