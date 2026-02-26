import { useState, useRef, useEffect } from 'react';
import { PostCard } from './PostCard';
import { CreatePostModal } from './CreatePostModal';
import { UserAvatar } from './UserAvatar';
import { useProfileContext, usePosts, useChat } from '../../lib';
import type { CommunityWithMeta } from '../../lib';

interface Props {
  community: CommunityWithMeta;
  onBack: () => void;
  onNavigateToProfile?: (userId: string) => void;
}

export function CommunityPage({ community, onBack, onNavigateToProfile }: Props) {
  const { user } = useProfileContext();
  const { posts, isLoading: postsLoading, refreshPosts, deletePost, hasMore, loadMore, isLoadingMore } = usePosts({ communityId: community.id });
  const { messages, isLoading: chatLoading, sendMessage } = useChat(community.id.startsWith('pending-') ? null : community.id);
  const [activeTab, setActiveTab] = useState<'posts' | 'chat' | 'about'>('posts');
  const [showCreate, setShowCreate] = useState(false);
  const [chatText, setChatText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const Icon = community.config.icon;

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSendChat = async () => {
    if (!chatText.trim()) return;
    await sendMessage(chatText.trim());
    setChatText('');
  };

  const handleDelete = async (postId: string) => {
    if (confirm('Excluir este post?')) await deletePost(postId);
  };

  return (
    <div className="min-h-screen bg-black">
      <header className="sticky top-0 z-40 bg-black/95 backdrop-blur border-b border-white/10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={onBack} className="text-[#81D8D0] hover:underline text-sm">← Voltar</button>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: community.config.color + '20' }}>
            <Icon className="w-4 h-4" style={{ color: community.config.color }} />
          </div>
          <h1 className="text-white font-semibold truncate">{community.name}</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Community header */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
          <p className="text-white/70">{community.description}</p>
          {community.manifesto_text && <p className="text-white/50 text-sm mt-2 italic">{community.manifesto_text}</p>}
          <div className="flex items-center gap-4 mt-3 text-sm text-white/40">
            <span>{community.postCount} posts</span>
            <span className="capitalize">{community.config.category}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-white/10">
          {(['posts', 'chat', 'about'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === tab ? 'border-[#81D8D0] text-[#81D8D0]' : 'border-transparent text-white/40 hover:text-white/60'}`}>
              {tab === 'posts' ? 'Posts' : tab === 'chat' ? 'Chat' : 'Sobre'}
            </button>
          ))}
          {user && activeTab === 'posts' && (
            <button onClick={() => setShowCreate(true)} className="ml-auto px-4 py-2 text-[#81D8D0] text-sm font-semibold hover:underline">+ Novo Post</button>
          )}
        </div>

        {activeTab === 'posts' && (
          <>
            {postsLoading ? (
              <div className="text-center py-8"><div className="w-8 h-8 border-2 border-[#81D8D0] border-t-transparent rounded-full animate-spin mx-auto"></div></div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10">
                <p className="text-white/50 mb-2">Nenhum post nesta comunidade.</p>
                {user && <button onClick={() => setShowCreate(true)} className="text-[#81D8D0] text-sm hover:underline">Seja o primeiro!</button>}
              </div>
            ) : (
              <>
                {posts.map(p => <PostCard key={p.id} post={p} onNavigateToProfile={onNavigateToProfile} onDelete={handleDelete} />)}
                {hasMore && <button onClick={loadMore} disabled={isLoadingMore} className="w-full py-3 text-[#81D8D0] text-sm hover:underline">{isLoadingMore ? 'Carregando...' : 'Ver mais'}</button>}
              </>
            )}
          </>
        )}

        {activeTab === 'chat' && (
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <div className="h-96 overflow-y-auto p-4 space-y-3">
              {chatLoading ? (
                <div className="text-center py-8"><div className="w-6 h-6 border-2 border-[#81D8D0] border-t-transparent rounded-full animate-spin mx-auto"></div></div>
              ) : messages.length === 0 ? (
                <p className="text-white/40 text-sm text-center py-8">Nenhuma mensagem ainda. Comece a conversa!</p>
              ) : (
                messages.map(m => (
                  <div key={m.id} className={`flex gap-2 ${m.author_id === user?.id ? 'flex-row-reverse' : ''}`}>
                    <UserAvatar src={m.author_data?.profile_photo || null} name={m.author_data?.name || 'M'} size={28} onClick={() => onNavigateToProfile?.(m.author_id)} />
                    <div className={`max-w-[70%] ${m.author_id === user?.id ? 'text-right' : ''}`}>
                      <span className="text-white/40 text-xs">{m.author_data?.name}</span>
                      <div className={`rounded-2xl px-3 py-2 text-sm ${m.author_id === user?.id ? 'bg-[#81D8D0]/20 text-white' : 'bg-white/10 text-white/90'}`}>
                        {m.content}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>
            {user && (
              <div className="border-t border-white/10 p-3 flex gap-2">
                <input value={chatText} onChange={e => setChatText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendChat()}
                  placeholder="Mensagem..." className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm placeholder:text-white/30 focus:outline-none" />
                <button onClick={handleSendChat} disabled={!chatText.trim()} className="px-4 py-2 bg-[#81D8D0] text-black rounded-xl text-sm font-semibold disabled:opacity-40">Enviar</button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'about' && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-3">Sobre esta comunidade</h3>
            <p className="text-white/70 mb-4">{community.description}</p>
            {community.config.starters && community.config.starters.length > 0 && (
              <>
                <h4 className="text-white/40 text-xs uppercase tracking-wider mb-2">Perguntas para comecar</h4>
                <div className="space-y-2">
                  {community.config.starters.map((s, i) => <div key={i} className="text-white/60 text-sm bg-white/5 rounded-xl px-4 py-3">💬 {s}</div>)}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <CreatePostModal isOpen={showCreate} onClose={() => setShowCreate(false)} onSuccess={refreshPosts} defaultCommunityId={community.id} />
    </div>
  );
}
