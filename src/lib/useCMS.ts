import { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabase';

// ═══════════════════════════════════════════════════════════════
// HOOKS CMS — Fase 1 V8
// Consumir platform_copy, home_sections, legal_pages, announcements
// ═══════════════════════════════════════════════════════════════

// ─── platform_copy ────────────────────────────────────────────
export interface PlatformCopy {
  id: string;
  copy_key: string;
  copy_value: string;
  context: 'landing' | 'app' | 'both' | 'admin';
  updated_at: string;
}

/** Carrega todos os textos de um contexto (ou todos) */
export function usePlatformCopy(context?: 'landing' | 'app' | 'both' | 'admin') {
  const [copies, setCopies] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        let query = supabase.from('platform_copy').select('copy_key, copy_value, context');
        
        if (context) {
          // Buscar o contexto especificado + 'both' (universal)
          query = query.in('context', context === 'both' ? ['both'] : [context, 'both']);
        }

        const { data, error } = await query;
        if (error) throw error;
        if (cancelled) return;

        const map: Record<string, string> = {};
        data?.forEach((row: { copy_key: string; copy_value: string }) => {
          map[row.copy_key] = row.copy_value;
        });
        setCopies(map);
      } catch (err) {
        console.error('[usePlatformCopy] Erro:', err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [context]);

  /** Helper: pega um texto pelo key, com fallback */
  const getText = useCallback(
    (key: string, fallback = '') => copies[key] ?? fallback,
    [copies]
  );

  return { copies, getText, isLoading };
}

// ─── home_sections ────────────────────────────────────────────
export interface HomeSection {
  id: string;
  section_key: string;
  title: string;
  subtitle: string | null;
  display_order: number;
  section_type: string;
  is_active: boolean;
  metadata: Record<string, unknown>;
}

/** Carrega seções ativas da home, ordenadas */
export function useHomeSections() {
  const [sections, setSections] = useState<HomeSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const { data, error } = await supabase
          .from('home_sections')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true });

        if (error) throw error;
        if (!cancelled) setSections(data ?? []);
      } catch (err) {
        console.error('[useHomeSections] Erro:', err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  return { sections, isLoading };
}

// ─── legal_pages ──────────────────────────────────────────────
export type LegalPageKey = 
  | 'ethics'
  | 'privacy_policy'
  | 'terms_of_use'
  | 'moderation_policy'
  | 'security_policy'
  | 'child_protection_policy';

export interface LegalPage {
  id: string;
  page_key: LegalPageKey;
  title: string;
  content_html: string;
  version: string;
  is_active: boolean;
  updated_at: string;
}

/** Carrega uma página jurídica específica */
export function useLegalPage(pageKey: LegalPageKey) {
  const [page, setPage] = useState<LegalPage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const { data, error: err } = await supabase
          .from('legal_pages')
          .select('*')
          .eq('page_key', pageKey)
          .eq('is_active', true)
          .single();

        if (err) throw err;
        if (!cancelled) setPage(data);
      } catch (err: unknown) {
        console.error(`[useLegalPage] Erro ao carregar ${pageKey}:`, err);
        if (!cancelled) setError(err instanceof Error ? err.message : 'Erro ao carregar página');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [pageKey]);

  return { page, isLoading, error };
}

/** Carrega todas as páginas jurídicas (para índice) */
export function useLegalPages() {
  const [pages, setPages] = useState<LegalPage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const { data, error } = await supabase
          .from('legal_pages')
          .select('id, page_key, title, version, is_active, updated_at')
          .eq('is_active', true)
          .order('title');

        if (error) throw error;
        if (!cancelled) setPages((data ?? []) as LegalPage[]);
      } catch (err) {
        console.error('[useLegalPages] Erro:', err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  return { pages, isLoading };
}

// ─── home_announcements ──────────────────────────────────────
export interface Announcement {
  id: string;
  title: string;
  content: string;
  announcement_type: 'info' | 'warning' | 'celebration' | 'urgent';
  is_active: boolean;
  starts_at: string;
  ends_at: string | null;
  created_at: string;
}

/** Carrega comunicados ativos (dentro da janela de tempo) */
export function useAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const now = new Date().toISOString();
        const { data, error } = await supabase
          .from('home_announcements')
          .select('*')
          .eq('is_active', true)
          .lte('starts_at', now)
          .or(`ends_at.is.null,ends_at.gte.${now}`)
          .order('starts_at', { ascending: false });

        if (error) throw error;
        if (!cancelled) setAnnouncements(data ?? []);
      } catch (err) {
        console.error('[useAnnouncements] Erro:', err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  return { announcements, isLoading };
}
