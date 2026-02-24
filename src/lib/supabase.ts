import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  'https://ieieohtnaymykxiqnmlc.supabase.co';

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImllaWVvaHRuYXlteWt4aXFubWxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0OTQ1NzMsImV4cCI6MjA4NjA3MDU3M30.32LjQe1dQLGAfbyfK8KkjNlXOGkZGaWEgI20y3gl3Hc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    storage: window.localStorage,
  },
  global: {
    headers: {
      'x-client-info': 'neuroconexao-atipica/1.0',
    },
    fetch: (url, options = {}) => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 45000);

      if (options.signal) {
        options.signal.addEventListener('abort', () =>
          controller.abort()
        );
      }

      return fetch(url, {
        ...options,
        signal: controller.signal,
      }).finally(() => {
        clearTimeout(timeout);
      });
    },
  },
  db: {
    schema: 'public',
  },
});

export const TIMEOUTS = {
  QUERY: 30_000,
  MUTATION: 45_000,
  PROFILE: 12_000,
  UPLOAD: 30_000,
  SAFETY_NET: 10_000,
} as const;

export const SUPABASE_STORAGE_KEY =
  'sb-ieieohtnaymykxiqnmlc-auth-token';


// ═══════════════════════════════════════════════════════
// ROLE MODEL — VERSÃO ESTRATÉGICA COMPLETA
// ═══════════════════════════════════════════════════════

export type UserRole =
  | 'visitor'
  | 'registered_unfinished'
  | 'member_free_legacy'
  | 'member_paid'
  | 'founder_paid'
  | 'moderator'
  | 'super_admin';


// ═══════════════════════════════════════════════════════
// USERS
// ═══════════════════════════════════════════════════════

export interface User {
  id: string;
  name: string;
  bio: string | null;
  profile_photo: string | null;
  role: UserRole;
  onboarding_done: boolean;
  whatsapp: string[] | null;
  beta_lifetime: boolean;
  allow_whatsapp: boolean;
  allow_email: boolean;
  terms_version: string;
  terms_accepted_at: string;
  updated_at: string;
  created_at: string;
}


// ═══════════════════════════════════════════════════════
// COMMUNITIES
// ═══════════════════════════════════════════════════════

export interface Community {
  id: string;
  name: string;
  description: string;
  is_public: boolean;
  creator: string | null;
  ritual_enabled: boolean;
  created_at: string;
}


// ═══════════════════════════════════════════════════════
// POSTS
// ═══════════════════════════════════════════════════════

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


// ═══════════════════════════════════════════════════════
// COMMENTS
// ═══════════════════════════════════════════════════════

export interface Comment {
  id: string;
  post_id: string;
  author: string;
  content: string;
  created_at: string;
}


// ═══════════════════════════════════════════════════════
// LIVE INTEREST
// ═══════════════════════════════════════════════════════

export interface LiveInterest {
  id: string;
  user: string;
  community: string;
  message: string | null;
  created_at: string;
}


// ═══════════════════════════════════════════════════════
// EVENTOS & RITUAIS
// ═══════════════════════════════════════════════════════

export type EventType =
  | 'live'
  | 'workshop'
  | 'ritual'
  | 'encontro'
  | 'debate'
  | 'oficina'
  | 'outro';

export type RitualType =
  | 'roda_de_escuta'
  | 'checkin_coletivo'
  | 'sessao_de_foco'
  | 'desabafo_estruturado'
  | 'ritual_de_acolhimento'
  | 'debate_guiado'
  | 'reflexao_silenciosa';

export type EventStatus =
  | 'draft'
  | 'published'
  | 'live'
  | 'completed'
  | 'cancelled';

export type LocationType =
  | 'online'
  | 'presencial'
  | 'hibrido';

export interface Event {
  id: string;
  community_id: string | null;
  host_id: string;
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
  cover_image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface EventParticipant {
  id: string;
  event_id: string;
  user_id: string;
  status: 'confirmed' | 'interested' | 'cancelled';
  registered_at: string;
}