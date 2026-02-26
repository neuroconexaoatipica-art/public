import { useState } from 'react';
import { UserAvatar } from './UserAvatar';
import { PostCard } from './PostCard';
import { CreatePostModal } from './CreatePostModal';
import { useProfileContext, useCommunitiesContext, usePosts, useNotifications, useAnnouncements, isSuperAdmin, hasModAccess } from '../../lib';
import { supabase } from '../../lib/supabase';

interface Props {
  onNavigateToProfile: () => void;
  onNavigateToCommunities: () => void;
  onNavigateToFeed: () => void;
  onNavigateToUserProfile: (userId: string) => void;
  onNavigateToEvents: () => void;
}

export function SocialHub({ onNavigateToProfile, onNavigateToCommunities, onNavigateToFeed, onNavigateToUserProfile, onNavigateToEvents }: Props) {
  const { user } = useProfileContext();
  const { communities } = useCommunitiesContext();
  const { posts, isLoading, hasMore, loadMore, isLoadingMore, refreshPosts, deletePost } = usePosts(true);
  const { unreadCount, notifications, markAllAsRead } = useNotifications();
  const { announcements } = useAnnouncements();
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  const handleDelete = async (postId: string) => {
    if (confirm('Excluir este post?')) await deletePost(postId);
  };

  const topCommunities = communities.filter(c => !c.id.startsWith('pending-')).slice(0, 6);

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-black/95 backdrop-blur border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-white font-semibold text-lg">Neuro<span className="text-[#81D8D0]">Conexao</span></h1>
          <div className="flex items-center gap-3">
            <button onClick={() => { setShowNotifs(!showNotifs); if (!showNotifs) markAllAsRead(); }} className="relative text-white/60 hover:text-white p-2">
              🔔
              {unreadCount > 0 && <span className="absolute -top-0.5 -right-0.5 bg-[#C8102E] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{unreadCount > 9 ? '9+' : unreadCount}</span>}
            </button>
            <div className="relative">
              <UserAvatar src={user?.profile_photo || null} name={user?.name || 'M'} size={34} onClick={() => setShowMenu(!showMenu)} />
              {showMenu && (
                <div className="absolute right-0 top-10 bg-[#1a1a1a] border border-white/20 rounded-xl py-1 z-50 min-w-[180px] shadow-xl">
                  <button onClick={() => { onNavigateToProfile(); setShowMenu(false); }} className="w-full text-left px-4 py-2.5 text-white hover:bg-white/5 text-sm">Meu Perfil</button>
                  <button onClick={() => { onNavigateToCommunities(); setShowMenu(false); }} className="w-full text-left px-4 py-2.5 text-white hover:bg-white/5 text-sm">Comunidades</button>
                  <button onClick={() => { onNavigateToEvents(); setShowMenu(false); }} className="w-full text-left px-4 py-2.5 text-white hover:bg-white/5 text-sm">Eventos</button>
                  <div className="border-t border-white/10 my-1"></div>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-[#C8102E] hover:bg-white/5 text-sm">Sair</button>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Notifications dropdown */}
        {showNotifs && (
          <div className="absolute right-4 top-14 bg-[#1a1a1a] border border-white/20 rounded-xl z-50 w-80 max-h-96 overflow-y-auto shadow-xl">
            <div className="p-3 border-b border-white/10 flex items-center justify-between">
              <span className="text-white font-semibold text-sm">Notificacoes</span>
              <button onClick={() => setShowNotifs(false)} className="text-white/40 hover:text-white text-sm">✕</button>
            </div>
            {notifications.length === 0 ? (
              <p className="text-white/40 text-sm p-4 text-center">Nenhuma notificacao.</p>
            ) : (
              notifications.slice(0, 15).map(n => (
                <div key={n.id} className={`px-4 py-3 border-b border-white/5 ${!n.is_read ? 'bg-white/5' : ''}`}>
                  <p className="text-white text-sm">{n.title}</p>
                  {n.content && <p className="text-white/50 text-xs mt-0.5">{n.content}</p>}
                </div>
              ))
            )}
          </div>
        )}
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Announcements */}
        {announcements.length > 0 && (
          <div className="mb-6 space-y-2">
            {announcements.map(a => (
              <div key={a.id} className={`rounded-xl px-4 py-3 text-sm ${a.announcement_type === 'urgent' ? 'bg-[#C8102E]/20 border border-[#C8102E]/30 text-white' : a.announcement_type === 'celebration' ? 'bg-[#81D8D0]/10 border border-[#81D8D0]/20 text-[#81D8D0]' : 'bg-white/5 border border-white/10 text-white/80'}`}>
                <strong>{a.title}</strong> — {a.content}
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
          {/* Main feed */}
          <div>
            {/* Create post bar */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6 flex items-center gap-3 cursor-pointer hover:bg-white/8" onClick={() => setShowCreatePost(true)}>
              <UserAvatar src={user?.profile_photo || null} name={user?.name || 'M'} size={40} />
              <span className="text-white/40 flex-1">O que esta na sua mente?</span>
              <span className="text-[#81D8D0] text-sm font-semibold">Publicar</span>
            </div>

            {/* Nav pills */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
              <button onClick={onNavigateToFeed} className="px-4 py-2 bg-white/5 text-white/60 hover:text-white rounded-full text-sm whitespace-nowrap border border-white/10">Feed Completo</button>
              <button onClick={onNavigateToCommunities} className="px-4 py-2 bg-white/5 text-white/60 hover:text-white rounded-full text-sm whitespace-nowrap border border-white/10">Comunidades</button>
              <button onClick={onNavigateToEvents} className="px-4 py-2 bg-white/5 text-white/60 hover:text-white rounded-full text-sm whitespace-nowrap border border-white/10">Eventos</button>
              {(isSuperAdmin(user?.role) || hasModAccess(user?.role)) && (
                <button className="px-4 py-2 bg-[#C8102E]/10 text-[#C8102E] rounded-full text-sm whitespace-nowrap border border-[#C8102E]/20">Admin</button>
              )}
            </div>

            {/* Posts */}
            {isLoading ? (
              <div className="text-center py-12"><div className="w-8 h-8 border-2 border-[#81D8D0] border-t-transparent rounded-full animate-spin mx-auto"></div><p className="text-white/40 text-sm mt-3">Carregando...</p></div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10">
                <div className="text-4xl mb-3">📝</div>
                <p className="text-white/60 mb-2">Nenhum post ainda.</p>
                <button onClick={() => setShowCreatePost(true)} className="text-[#81D8D0] text-sm font-semibold hover:underline">Seja o primeiro a publicar!</button>
              </div>
            ) : (
              <>
                {posts.map(p => <PostCard key={p.id} post={p} onNavigateToProfile={onNavigateToUserProfile} onDelete={handleDelete} />)}
                {hasMore && (
                  <button onClick={loadMore} disabled={isLoadingMore} className="w-full py-3 text-[#81D8D0] text-sm hover:underline disabled:opacity-40">
                    {isLoadingMore ? 'Carregando...' : 'Ver mais posts'}
                  </button>
                )}
              </>
            )}
          </div>

          {/* Sidebar */}
          <aside className="hidden lg:block space-y-4">
            {/* Profile card */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <UserAvatar src={user?.profile_photo || null} name={user?.name || 'M'} size={48} onClick={onNavigateToProfile} />
                <div>
                  <p className="text-white font-semibold cursor-pointer hover:text-[#81D8D0]" onClick={onNavigateToProfile}>{user?.display_name || user?.name}</p>
                  <p className="text-white/40 text-xs capitalize">{user?.role?.replace(/_/g, ' ')}</p>
                </div>
              </div>
              {user?.bio && <p className="text-white/60 text-sm">{user.bio}</p>}
            </div>

            {/* Communities */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-semibold text-sm">Comunidades</h3>
                <button onClick={onNavigateToCommunities} className="text-[#81D8D0] text-xs hover:underline">Ver todas</button>
              </div>
              <div className="space-y-2">
                {topCommunities.map(c => (
                  <div key={c.id} className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.config.color }}></div>
                    <span className="text-white/70 truncate">{c.name}</span>
                    <span className="text-white/30 text-xs ml-auto">{c.postCount}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick links */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
              <button onClick={onNavigateToEvents} className="w-full text-left text-white/60 hover:text-[#81D8D0] text-sm py-1">📅 Proximos eventos</button>
              <a href="#ethics" className="block text-white/60 hover:text-[#81D8D0] text-sm py-1">📜 Codigo de etica</a>
              <a href="#privacy" className="block text-white/60 hover:text-[#81D8D0] text-sm py-1">🔒 Privacidade</a>
            </div>
          </aside>
        </div>
      </div>

      <CreatePostModal isOpen={showCreatePost} onClose={() => setShowCreatePost(false)} onSuccess={refreshPosts} />
    </div>
  );
}
