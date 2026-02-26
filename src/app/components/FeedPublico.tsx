import { useState } from 'react';
import { PostCard } from './PostCard';
import { CreatePostModal } from './CreatePostModal';
import { useProfileContext, usePosts } from '../../lib';

interface Props {
  onBack: () => void;
  onNavigateToProfile?: (userId: string) => void;
}

export function FeedPublico({ onBack, onNavigateToProfile }: Props) {
  const { user } = useProfileContext();
  const { posts, isLoading, hasMore, loadMore, isLoadingMore, refreshPosts, deletePost } = usePosts(true);
  const [showCreate, setShowCreate] = useState(false);

  const handleDelete = async (postId: string) => {
    if (confirm('Excluir este post?')) await deletePost(postId);
  };

  return (
    <div className="min-h-screen bg-black">
      <header className="sticky top-0 z-40 bg-black/95 backdrop-blur border-b border-white/10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="text-[#81D8D0] hover:underline text-sm">← Voltar</button>
            <h1 className="text-white font-semibold">Feed Publico</h1>
          </div>
          {user && <button onClick={() => setShowCreate(true)} className="px-4 py-2 bg-[#81D8D0] text-black rounded-xl text-sm font-semibold">+ Novo Post</button>}
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="text-center py-12"><div className="w-8 h-8 border-2 border-[#81D8D0] border-t-transparent rounded-full animate-spin mx-auto"></div></div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10">
            <div className="text-4xl mb-3">📝</div>
            <p className="text-white/60">Nenhum post publico ainda.</p>
          </div>
        ) : (
          <>
            {posts.map(p => <PostCard key={p.id} post={p} onNavigateToProfile={onNavigateToProfile} onDelete={handleDelete} />)}
            {hasMore && <button onClick={loadMore} disabled={isLoadingMore} className="w-full py-3 text-[#81D8D0] text-sm hover:underline">{isLoadingMore ? 'Carregando...' : 'Ver mais'}</button>}
          </>
        )}
      </div>

      <CreatePostModal isOpen={showCreate} onClose={() => setShowCreate(false)} onSuccess={refreshPosts} />
    </div>
  );
}
