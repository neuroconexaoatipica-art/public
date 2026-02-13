import { useState } from "react";
import { Share2, Trash2, Globe, Lock } from "lucide-react";
import { motion } from "motion/react";
import type { PostWithAuthor } from "../../lib";
import { supabase } from "../../lib";
import { UserAvatar } from "./UserAvatar";

interface PostCardProps {
  post: PostWithAuthor;
  onDelete?: (postId: string) => void;
  currentUserId?: string;
  canModerate?: boolean;
  onAuthorClick?: (userId: string) => void;
  communityName?: string;
}

export function PostCard({ post, onDelete, currentUserId, canModerate, onAuthorClick, communityName }: PostCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const isOwnPost = currentUserId === post.author;

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja deletar este post?')) return;
    setIsDeleting(true); setDeleteError(null);
    const { error } = await supabase.from('posts').delete().eq('id', post.id);
    if (error) { console.error('Erro ao deletar post:', error); setDeleteError('Não foi possível deletar. Tente novamente ou contate a administração.'); setIsDeleting(false); setTimeout(() => setDeleteError(null), 5000); return; }
    if (onDelete) onDelete(post.id);
    setIsDeleting(false);
  };

  const getTimeAgo = () => {
    try {
      const now = new Date(); const postDate = new Date(post.created_at); const diffMs = now.getTime() - postDate.getTime();
      const diffMins = Math.floor(diffMs / 60000); const diffHours = Math.floor(diffMs / 3600000); const diffDays = Math.floor(diffMs / 86400000);
      if (diffMins < 1) return 'agora mesmo'; if (diffMins < 60) return `há ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
      if (diffHours < 24) return `há ${diffHours} hora${diffHours > 1 ? 's' : ''}`; if (diffDays < 7) return `há ${diffDays} dia${diffDays > 1 ? 's' : ''}`;
      return `há ${Math.floor(diffDays / 7)} semana${Math.floor(diffDays / 7) > 1 ? 's' : ''}`;
    } catch { return 'há alguns instantes'; }
  };

  const getRoleBadge = () => {
    const roleColors: Record<string, { bg: string; text: string; label: string }> = {
      admin: { bg: 'bg-[#C8102E]/20', text: 'text-[#C8102E]', label: 'Admin' },
      founder: { bg: 'bg-[#81D8D0]/20', text: 'text-[#81D8D0]', label: 'Fundadora' },
      member: { bg: 'bg-[#FF6B35]/20', text: 'text-[#FF6B35]', label: 'Membro' },
      user_free: { bg: 'bg-white/10', text: 'text-white/60', label: 'Membro' },
    };
    const role = post.author_data?.role; if (!role) return null;
    const config = roleColors[role]; if (!config) return null;
    return (<span className={`px-2 py-0.5 ${config.bg} ${config.text} rounded-full text-xs font-semibold`}>{config.label}</span>);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="bg-white/3 border border-white/10 rounded-2xl p-6 hover:bg-white/5 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3 flex-1">
          <UserAvatar name={post.author_data?.name || 'Anônimo'} photoUrl={post.author_data?.profile_photo} size="lg" onClick={onAuthorClick ? () => onAuthorClick(post.author) : undefined} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <button onClick={onAuthorClick ? () => onAuthorClick(post.author) : undefined} className={`font-semibold text-white truncate ${onAuthorClick ? 'hover:text-[#81D8D0] transition-colors cursor-pointer' : ''}`}>{post.author_data?.name || 'Anônimo'}</button>
              {getRoleBadge()}
            </div>
            <div className="flex items-center gap-2 text-sm text-white/60 flex-wrap">
              <span>{getTimeAgo()}</span><span>·</span>
              {post.is_public ? (<span className="flex items-center gap-1"><Globe className="h-3 w-3" />Público</span>) : (<span className="flex items-center gap-1"><Lock className="h-3 w-3" />Membros</span>)}
              {communityName && (<><span>·</span><span className="text-[#81D8D0]">{communityName}</span></>)}
            </div>
          </div>
        </div>
      </div>
      <div className="mb-4">
        <p className="text-white/90 text-base leading-relaxed whitespace-pre-wrap">{post.content}</p>
        {post.image_url && (<div className="mt-4"><img src={post.image_url} alt="Imagem do post" className="w-full max-h-[500px] object-cover rounded-xl" loading="lazy" /></div>)}
      </div>
      <div className="flex items-center gap-6 pt-4 border-t border-white/5">
        <button onClick={() => { if (navigator.share) { navigator.share({ title: 'NeuroConexão Atípica', text: post.content.substring(0, 100), url: window.location.href }).catch(() => {}); } }} className="flex items-center gap-2 text-white/60 hover:text-[#FF6B35] transition-colors"><Share2 className="h-5 w-5" /><span className="text-sm font-medium">Compartilhar</span></button>
        {(isOwnPost || canModerate) && onDelete && (<button onClick={handleDelete} disabled={isDeleting} className="flex items-center gap-2 text-white/60 hover:text-[#C8102E] transition-colors disabled:opacity-50"><Trash2 className="h-4 w-4" /><span className="text-sm font-medium">Deletar</span></button>)}
      </div>
      {deleteError && (<div className="mt-3 px-4 py-3 bg-[#C8102E]/10 border border-[#C8102E]/30 rounded-xl flex items-center gap-3"><span className="text-sm text-[#C8102E] font-medium flex-1">{deleteError}</span><button onClick={() => setDeleteError(null)} className="text-[#C8102E]/60 hover:text-[#C8102E] text-xs font-semibold">Fechar</button></div>)}
    </motion.div>
  );
}
