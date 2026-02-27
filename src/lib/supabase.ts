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
// V8: 6 roles — registered_unfinished eliminado
export type UserRole = 'visitor' | 'registered_unfinished' | 'member_free_legacy' | 'member_paid' | 'founder_paid' | 'moderator' | 'super_admin' | 'banned';

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
  // V8: novos campos
  about_text: string;
  what_crosses_me: string;
  interests: string[];
  participation_score: number;
  is_public_profile: boolean;
  leadership_onboarding_done: boolean;
  is_beta_lifetime_flag: boolean;
  age_verified: boolean;
  subscription_status: 'none' | 'active' | 'cancelled' | 'past_due';
  subscription_expires_at: string | null;
  // V1.1: Identidade controlada + profundidade
  display_name: string;
  legal_name: string | null;
  use_real_name: boolean;
  is_anonymous_mode: boolean;
  deep_statement: string | null;
  deep_statement_public: boolean;
  last_active_at: string | null;
  // V1.2: Galeria de fotos
  gallery_photos: string[];
  // V1.3: Identidade & Acolhimento + Comunicação
  pronouns: string | null;
  neurodivergences: string[];
  neurodivergences_public: boolean;
  calming_statement: string | null;
  calming_statement_public: boolean;
  communication_style: string[];
  social_instagram: string | null;
  social_link: string | null;
}

export interface Community {
  id: string;
  name: string;
  description: string;
  is_public: boolean;
  creator: string | null;
  created_at: string;
  // V8: novos campos
  owner_id: string | null;
  manifesto_text: string;
  needs_moderator: boolean;
  ritual_enabled: boolean;
  is_featured: boolean;
  max_members: number;
  requires_approval: boolean;
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
  user_id: string;
  community_id: string;
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

// V8 Fase 2: Eventos + Rituais
export type EventType = 'live' | 'workshop' | 'ritual' | 'encontro' | 'debate' | 'oficina' | 'outro';
export type RitualType = 'roda_de_escuta' | 'checkin_coletivo' | 'sessao_de_foco' | 'desabafo_estruturado' | 'ritual_de_acolhimento' | 'debate_guiado' | 'reflexao_silenciosa';
export type EventStatus = 'draft' | 'published' | 'live' | 'completed' | 'cancelled';
export type LocationType = 'online' | 'presencial' | 'hibrido';
export type ParticipantStatus = 'confirmed' | 'interested' | 'cancelled';

export interface Event {
  id: string;
  community_id: string | null;
  host_id: string | null;
  title: string;
  description: string;
  event_type: EventType;
  ritual_type: RitualType | null;
  starts_at: string;
  ends_at: string | null;
  max_participants: number | null;
  status: EventStatus;
  location_type: LocationType;
  location_url: string;
  location_address: string;
  is_recurring: boolean;
  recurrence_rule: string | null;
  cover_image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface EventParticipant {
  id: string;
  event_id: string;
  user_id: string;
  status: ParticipantStatus;
  joined_at: string;
}