import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from './supabase';
import type { Post, User } from './supabase';

export interface PostWithAuthor extends Post {
  author_data: User;
}

interface UsePostsOptions {
  isPublicFeed?: boolean;
  communityId?: string | null;
  authorId?: string | null;
}

const PAGE_SIZE = 20;

export function usePosts(isPublicFeedOrOptions: boolean | UsePostsOptions = false) {
  const [pinnedPosts, setPinnedPosts] = useState<PostWithAuthor[]>([]);
  const [regularPosts, setRegularPosts] = useState<PostWithAuthor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  // Normalizar opções
  const options: UsePostsOptions = typeof isPublicFeedOrOptions === 'boolean'
    ? { isPublicFeed: isPublicFeedOrOptions }
    : isPublicFeedOrOptions;

  const optionsRef = useRef(options);
  optionsRef.current = options;

  const filterKey = `${options.isPublicFeed || false}-${options.communityId || 'none'}-${options.authorId || 'none'}`;

  const buildQuery = useCallback((isPinned?: boolean) => {
    let q = supabase
      .from('posts')
      .select(`*, author_data:users!author(id,name,profile_photo,role,bio)`)
      .order('created_at', { ascending: false })
      .order('id', { ascending: false });

    const o = optionsRef.current;
    if (o.isPublicFeed) q = q.eq('is_public', true);
    if (o.communityId)  q = q.eq('community', o.communityId);
    if (o.authorId)     q = q.eq('author', o.authorId);
    if (isPinned === true)  q = q.eq('is_pinned', true);
    if (isPinned === false) q = q.eq('is_pinned', false);
    return q;
  }, []);

  const enrichWithAuthors = useCallback(async (raw: Post[]): Promise<PostWithAuthor[]> => {
    if (!raw.length) return [];
    const ids = [...new Set(raw.map(p => p.author))];
    const { data: authors } = await supabase
      .from('users')
      .select('id,name,profile_photo,role,bio')
      .in('id', ids);
    const m: Record<string, any> = {};
    authors?.forEach(a => { m[a.id] = a; });
    return raw.map(p => ({
      ...p,
      author_data: m[p.author] || { id: p.author, name: 'Membro', profile_photo: null, role: 'member', bio: null },
    }));
  }, []);

  const loadPosts = useCallback(async () => {
    const o = optionsRef.current;
    if ('authorId' in o && !o.authorId) {
      setPinnedPosts([]); setRegularPosts([]); setIsLoading(false); return;
    }
    try {
      setIsLoading(true); setError(null); setHasMore(true);

      // Pinned posts
      const { data: pinData, error: pinErr } = await buildQuery(true);
      if (pinErr) {
        const { data: raw } = await supabase.from('posts').select('*')
          .eq('is_pinned', true).order('created_at', { ascending: false })
          .order('id', { ascending: false });
        setPinnedPosts(raw ? await enrichWithAuthors(raw) : []);
      } else {
        setPinnedPosts((pinData as PostWithAuthor[]) || []);
      }

      // Regular posts (first page)
      const { data: regData, error: regErr } = await buildQuery(false).limit(PAGE_SIZE + 1);
      if (regErr) {
        let fq = supabase.from('posts').select('*').eq('is_pinned', false)
          .order('created_at', { ascending: false })
          .order('id', { ascending: false })
          .limit(PAGE_SIZE + 1);
        if (o.isPublicFeed) fq = fq.eq('is_public', true);
        if (o.communityId)  fq = fq.eq('community', o.communityId);
        if (o.authorId)     fq = fq.eq('author', o.authorId);
        const { data: raw } = await fq;
        const enriched = raw ? await enrichWithAuthors(raw) : [];
        setHasMore(enriched.length > PAGE_SIZE);
        setRegularPosts(enriched.slice(0, PAGE_SIZE));
      } else {
        const d = (regData as PostWithAuthor[]) || [];
        setHasMore(d.length > PAGE_SIZE);
        setRegularPosts(d.slice(0, PAGE_SIZE));
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar posts');
      setPinnedPosts([]); setRegularPosts([]);
    } finally { setIsLoading(false); }
  }, [buildQuery, enrichWithAuthors]);

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore) return;
    const last = regularPosts[regularPosts.length - 1];
    if (!last) return;

    // Cursor composto: (created_at, id) — evita duplicatas/perdas
    const cursorFilter = `created_at.lt.${last.created_at},and(created_at.eq.${last.created_at},id.lt.${last.id})`;

    try {
      setIsLoadingMore(true);
      const { data, error: err } = await buildQuery(false)
        .or(cursorFilter)
        .limit(PAGE_SIZE + 1);
      if (err) {
        const o = optionsRef.current;
        let fq = supabase.from('posts').select('*').eq('is_pinned', false)
          .or(cursorFilter)
          .order('created_at', { ascending: false })
          .order('id', { ascending: false })
          .limit(PAGE_SIZE + 1);
        if (o.isPublicFeed) fq = fq.eq('is_public', true);
        if (o.communityId)  fq = fq.eq('community', o.communityId);
        if (o.authorId)     fq = fq.eq('author', o.authorId);
        const { data: raw } = await fq;
        const enriched = raw ? await enrichWithAuthors(raw) : [];
        setHasMore(enriched.length > PAGE_SIZE);
        setRegularPosts(prev => [...prev, ...enriched.slice(0, PAGE_SIZE)]);
      } else {
        const d = (data as PostWithAuthor[]) || [];
        setHasMore(d.length > PAGE_SIZE);
        setRegularPosts(prev => [...prev, ...d.slice(0, PAGE_SIZE)]);
      }
    } finally { setIsLoadingMore(false); }
  }, [hasMore, isLoadingMore, regularPosts, buildQuery, enrichWithAuthors]);

  const deletePost = useCallback(async (postId: string) => {
    try {
      const { error } = await supabase.from('posts').delete().eq('id', postId);
      if (error) throw error;
      setPinnedPosts(prev => prev.filter(p => p.id !== postId));
      setRegularPosts(prev => prev.filter(p => p.id !== postId));
      return { success: true };
    } catch (err: any) { return { success: false, error: err.message }; }
  }, []);

  useEffect(() => { loadPosts(); }, [filterKey]);

  return {
    posts: [...pinnedPosts, ...regularPosts],
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    loadMore,
    refreshPosts: loadPosts,
    deletePost,
  };
}
