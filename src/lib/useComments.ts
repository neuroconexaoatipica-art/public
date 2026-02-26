import { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabase';
import type { Comment, User } from './supabase';

export interface CommentWithAuthor extends Comment {
  author_data: Pick<User, 'id' | 'name' | 'profile_photo' | 'role'>;
}

export function useComments(postId: string) {
  const [comments, setComments] = useState<CommentWithAuthor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [count, setCount] = useState(0);

  const loadComments = useCallback(async () => {
    if (!postId) return;
    try {
      setIsLoading(true);
      const { data, error } = await supabase.from('comments').select(`*, author_data:users!author(id,name,profile_photo,role)`).eq('post_id', postId).order('created_at', { ascending: true });
      if (error) {
        const { data: fallbackData } = await supabase.from('comments').select('*').eq('post_id', postId).order('created_at', { ascending: true });
        if (fallbackData) {
          const authorIds = [...new Set(fallbackData.map(c => c.author))];
          let authorsMap: Record<string, any> = {};
          if (authorIds.length > 0) {
            const { data: authors } = await supabase.from('users').select('id,name,profile_photo,role').in('id', authorIds);
            if (authors) authors.forEach((a: any) => { authorsMap[a.id] = a; });
          }
          const commentsWithAuthors = fallbackData.map(comment => ({ ...comment, author_data: authorsMap[comment.author] || { id: comment.author, name: 'Membro', profile_photo: null, role: 'member' as const } }));
          setComments(commentsWithAuthors);
          setCount(commentsWithAuthors.length);
        }
        return;
      }
      setComments((data as CommentWithAuthor[]) || []);
      setCount(data?.length || 0);
    } catch (err) {
      console.error('Erro ao carregar comentarios:', err);
    } finally { setIsLoading(false); }
  }, [postId]);

  useEffect(() => { loadComments(); }, [loadComments]);

  const addComment = async (content: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return { success: false, error: 'Voce precisa estar logado' };
      const { error } = await supabase.from('comments').insert({ post_id: postId, author: session.user.id, content: content.trim() });
      if (error) return { success: false, error: error.message };
      await loadComments();
      return { success: true };
    } catch (err: any) { return { success: false, error: err.message }; }
  };

  const deleteComment = async (commentId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.from('comments').delete().eq('id', commentId);
      if (error) return { success: false, error: error.message };
      setComments(prev => prev.filter(c => c.id !== commentId));
      setCount(prev => prev - 1);
      return { success: true };
    } catch (err: any) { return { success: false, error: err.message }; }
  };

  return { comments, count, isLoading, addComment, deleteComment, refreshComments: loadComments };
}
