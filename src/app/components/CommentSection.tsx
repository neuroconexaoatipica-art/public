import { useState } from 'react';
import { UserAvatar } from './UserAvatar';
import { useComments, useProfileContext, isSuperAdmin } from '../../lib';

interface Props {
  postId: string;
  onNavigateToProfile?: (userId: string) => void;
}

export function CommentSection({ postId, onNavigateToProfile }: Props) {
  const { user: currentUser } = useProfileContext();
  const { comments, isLoading, addComment, deleteComment } = useComments(postId);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    await addComment(text.trim());
    setText('');
    setSending(false);
  };

  const timeAgo = (date: string) => {
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (diff < 60) return 'agora';
    if (diff < 3600) return `${Math.floor(diff / 60)}min`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  };

  return (
    <div className="mt-3 pt-3 border-t border-white/10">
      {isLoading ? (
        <p className="text-white/40 text-sm">Carregando...</p>
      ) : (
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {comments.map(c => (
            <div key={c.id} className="flex gap-2">
              <UserAvatar src={c.author_data?.profile_photo} name={c.author_data?.name || 'Membro'} size={28} onClick={() => onNavigateToProfile?.(c.author)} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-white text-sm font-medium cursor-pointer hover:text-[#81D8D0]" onClick={() => onNavigateToProfile?.(c.author)}>{c.author_data?.name}</span>
                  <span className="text-white/30 text-xs">{timeAgo(c.created_at)}</span>
                  {(c.author === currentUser?.id || isSuperAdmin(currentUser?.role)) && (
                    <button onClick={() => deleteComment(c.id)} className="text-white/30 hover:text-[#C8102E] text-xs ml-auto">×</button>
                  )}
                </div>
                <p className="text-white/80 text-sm">{c.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      {currentUser && (
        <div className="flex gap-2 mt-3">
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            placeholder="Escreva um comentario..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#81D8D0]/50"
          />
          <button onClick={handleSubmit} disabled={!text.trim() || sending} className="px-4 py-2 bg-[#81D8D0] text-black rounded-xl text-sm font-semibold disabled:opacity-40">
            {sending ? '...' : 'Enviar'}
          </button>
        </div>
      )}
    </div>
  );
}
