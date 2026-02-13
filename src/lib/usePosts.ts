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

export function usePosts(isPublicFeedOrOptions: boolean | UsePostsOptions = false) {
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const options: UsePostsOptions = typeof isPublicFeedOrOptions === 'boolean' ? { isPublicFeed: isPublicFeedOrOptions } : isPublicFeedOrOptions;
  const optionsRef = useRef(options);
  optionsRef.current = options;
  const filterKey = `${options.isPublicFeed || false}-${options.communityId || 'none'}-${options.authorId || 'none'}`;

  const loadPosts = useCallback(async () => {
    try {
      setIsLoading(true); setError(null);
      const currentOptions = optionsRef.current;
      if ('authorId' in currentOptions && !currentOptions.authorId) { setPosts([]); setIsLoading(false); return; }
      let query = supabase.from('posts').select(`*, author_data:users!author (id, name, profile_photo, role, bio)`).order('created_at', { ascending: false });
      if (currentOptions.isPublicFeed) { query = query.eq('is_public', true); }
      if (currentOptions.communityId) { query = query.eq('community', currentOptions.communityId); }
      if (currentOptions.authorId) { query = query.eq('author', currentOptions.authorId); }
      const { data, error: fetchError } = await query;
      if (fetchError) {
        console.error('Erro ao buscar posts (JOIN):', fetchError);
        try {
          let fallbackQuery = supabase.from('posts').select('*').order('created_at', { ascending: false });
          if (currentOptions.isPublicFeed) { fallbackQuery = fallbackQuery.eq('is_public', true); }
          if (currentOptions.communityId) { fallbackQuery = fallbackQuery.eq('community', currentOptions.communityId); }
          if (currentOptions.authorId) { fallbackQuery = fallbackQuery.eq('author', currentOptions.authorId); }
          const { data: fallbackData, error: fallbackError } = await fallbackQuery;
          if (fallbackError) { setError(fallbackError.message); setPosts([]); return; }
          const authorIds = [...new Set((fallbackData || []).map((p: Post) => p.author))];
          let authorsMap: Record<string, any> = {};
          if (authorIds.length > 0) {
            const { data: authors } = await supabase.from('users').select('id, name, profile_photo, role, bio').in('id', authorIds);
            if (authors) { authors.forEach((a: any) => { authorsMap[a.id] = a; }); }
          }
          const postsWithAuthors = (fallbackData || []).map((post: Post) => ({ ...post, author_data: authorsMap[post.author] || { id: post.author, name: 'Membro', profile_photo: null, role: 'user_free', bio: null } }));
          setPosts(postsWithAuthors as PostWithAuthor[]);
        } catch { setError('Erro ao carregar posts'); setPosts([]); }
        return;
      }
      setPosts((data as PostWithAuthor[]) || []);
    } catch (err: any) { console.error('Erro ao carregar posts:', err); setError(err.message || 'Erro ao carregar posts'); setPosts([]); }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { loadPosts(); }, [filterKey]);

  const deletePost = async (postId: string) => {
    try {
      const { error: deleteError } = await supabase.from('posts').delete().eq('id', postId);
      if (deleteError) throw deleteError;
      setPosts(prev => prev.filter(p => p.id !== postId));
      return { success: true };
    } catch (err: any) { console.error('Erro ao deletar post:', err); return { success: false, error: err.message }; }
  };

  return { posts, isLoading, error, refreshPosts: loadPosts, deletePost };
}
