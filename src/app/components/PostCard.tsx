import { useState } from 'react';
import { UserAvatar } from './UserAvatar';
import { CommentSection } from './CommentSection';
import { useReactions, REACTION_LABELS, useProfileContext, isSuperAdmin } from '../../lib';
import type { PostWithAuthor } from '../../lib';
import type { ReactionType } from '../../lib';

interface Props {
  post: PostWithAuthor;
  onNavigateToProfile?: (userId: string) => void;
  onDelete?: (postId: string) => void;
}

export function PostCard({ post, onNavigateToProfile, onDelete }: Props) {
  const { user: currentUser } = useProfileContext();
  const { counts, myReaction, toggleReaction } = useReactions(post.id);
  const [showComments, setShowComments] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const isOwner = currentUser?.id === post.author;
  const isAdmin = isSuperAdmin(currentUser?.role);
  const canDelete = isOwner || isAdmin;

  const timeAgo = (date: string) => {
    const now = new Date(); const d = new Date(date);
    const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (diff < 60) return 'agora';
    if (diff < 3600) return `${Math.floor(diff / 60)}min`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
    return d.toLocaleDateString('pt-BR');
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-4">
      <div className="flex items-start gap-3 mb-3">
        <UserAvatar
          src={post.author_data?.profile_photo}
          name={post.author_data?.name || 'Membro'}
          size={42}
          onClick={() => onNavigateToProfile?.(post.author)}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="text-white font-semibold cursor-pointer hover:text-[#81D8D0] truncate"
              onClick={() => onNavigateToProfile?.(post.author)}
            >
              {post.author_data?.name || 'Membro'}
            </span>
            {post.is_pinned && <span className="text-xs bg-[#C8102E] text-white px-2 py-0.5 rounded-full">Fixado</span>}
          </div>
          <span className="text-white/40 text-xs">{timeAgo(post.created_at)}</span>
        </div>
        {canDelete && (
          <div className="relative">
            <button onClick={() => setShowMenu(!showMenu)} className="text-white/40 hover:text-white p-1">•••</button>
            {showMenu && (
              <div className="absolute right-0 top-8 bg-[#1a1a1a] border border-white/20 rounded-xl py-1 z-10 min-w-[140px]">
                <button onClick={() => { onDelete?.(post.id); setShowMenu(false); }} className="w-full text-left px-4 py-2 text-[#C8102E] hover:bg-white/5 text-sm">Excluir post</button>
              </div>
            )}
          </div>
        )}
      </div>

      <p className="text-white/90 whitespace-pre-wrap mb-3 leading-relaxed">{post.content}</p>
      {post.image_url && <img src={post.image_url} alt="" className="rounded-xl max-h-96 w-full object-cover mb-3" />}

      {counts.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {counts.map(r => (
            <span key={r.type} className={`text-xs px-2 py-1 rounded-full ${myReaction === r.type ? 'bg-[#81D8D0]/20 text-[#81D8D0]' : 'bg-white/5 text-white/60'}`}>
              {REACTION_LABELS[r.type].emoji} {r.count}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-1 border-t border-white/10 pt-3">
        <div className="relative">
          <button onClick={() => setShowReactions(!showReactions)} className="text-white/50 hover:text-[#81D8D0] text-sm px-3 py-1.5 rounded-lg hover:bg-white/5">
            {myReaction ? REACTION_LABELS[myReaction].emoji : '💜'} Reagir
          </button>
          {showReactions && (
            <div className="absolute bottom-10 left-0 bg-[#1a1a1a] border border-white/20 rounded-xl p-2 flex gap-1 z-20">
              {(Object.keys(REACTION_LABELS) as ReactionType[]).map(type => (
                <button key={type} onClick={() => { toggleReaction(type); setShowReactions(false); }}
                  className={`text-xl p-1.5 rounded-lg hover:bg-white/10 ${myReaction === type ? 'bg-[#81D8D0]/20' : ''}`}
                  title={REACTION_LABELS[type].label}>
                  {REACTION_LABELS[type].emoji}
                </button>
              ))}
            </div>
          )}
        </div>
        <button onClick={() => setShowComments(!showComments)} className="text-white/50 hover:text-[#81D8D0] text-sm px-3 py-1.5 rounded-lg hover:bg-white/5">
          💬 Comentar
        </button>
      </div>

      {showComments && <CommentSection postId={post.id} onNavigateToProfile={onNavigateToProfile} />}
    </div>
  );
}
