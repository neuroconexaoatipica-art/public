import { useState, useEffect } from 'react';
import { UserAvatar } from './UserAvatar';
import { PostCard } from './PostCard';
import { EditProfileModal } from './EditProfileModal';
import { DeleteAccountModal } from './DeleteAccountModal';
import { useProfileContext, usePosts, useConnections, isSuperAdmin } from '../../lib';
import { supabase } from '../../lib/supabase';
import type { User } from '../../lib';

interface Props {
  onBack: () => void;
  viewUserId?: string | null;
  onNavigateToProfile?: (userId: string) => void;
}

export function ProfileMila({ onBack, viewUserId, onNavigateToProfile }: Props) {
  const { user: currentUser } = useProfileContext();
  const [viewUser, setViewUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'about' | 'connections'>('posts');

  const isOwnProfile = !viewUserId || viewUserId === currentUser?.id;
  const profileUser = isOwnProfile ? currentUser : viewUser;

  const { posts, isLoading: postsLoading, deletePost, hasMore, loadMore, isLoadingMore } = usePosts({ authorId: profileUser?.id || null });
  const { connections, sendRequest, getConnectionStatus } = useConnections();
  const [connectionStatus, setConnectionStatus] = useState<string>('none');

  useEffect(() => {
    if (!viewUserId || viewUserId === currentUser?.id) { setViewUser(null); return; }
    setLoadingUser(true);
    supabase.from('users').select('*').eq('id', viewUserId).single()
      .then(({ data }) => { setViewUser(data); setLoadingUser(false); })
      .catch(() => setLoadingUser(false));
  }, [viewUserId, currentUser?.id]);

  useEffect(() => {
    if (viewUserId && viewUserId !== currentUser?.id) {
      getConnectionStatus(viewUserId).then(setConnectionStatus);
    }
  }, [viewUserId, currentUser?.id, getConnectionStatus]);

  const handleConnect = async () => {
    if (!viewUserId) return;
    await sendRequest(viewUserId);
    setConnectionStatus('pending_sent');
  };

  const handleDelete = async (postId: string) => {
    if (confirm('Excluir este post?')) await deletePost(postId);
  };

  const acceptedConnections = connections.filter(c => c.status === 'accepted');

  if (loadingUser) {
    return <div className="min-h-screen bg-black flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#81D8D0] border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (!profileUser) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center"><p className="text-white/60">Perfil nao encontrado.</p></div>;
  }

  const roleBadge = (role: string) => {
    const colors: Record<string, string> = { super_admin: 'bg-[#C8102E]', founder_paid: 'bg-purple-600', moderator: 'bg-amber-600', member_paid: 'bg-blue-600', member_free_legacy: 'bg-white/20' };
    return <span className={`text-xs px-2 py-0.5 rounded-full text-white ${colors[role] || 'bg-white/20'}`}>{role.replace(/_/g, ' ')}</span>;
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-black/95 backdrop-blur border-b border-white/10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={onBack} className="text-[#81D8D0] hover:underline text-sm">← Voltar</button>
          <h1 className="text-white font-semibold">{isOwnProfile ? 'Meu Perfil' : profileUser.name}</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Profile header */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
          <div className="flex items-start gap-4">
            <UserAvatar src={profileUser.profile_photo} name={profileUser.name} size={80} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-white text-2xl font-semibold">{profileUser.display_name || profileUser.name}</h2>
                {roleBadge(profileUser.role)}
              </div>
              {profileUser.bio && <p className="text-white/60 mt-1">{profileUser.bio}</p>}
              {profileUser.deep_statement && profileUser.deep_statement_public && (
                <p className="text-[#81D8D0] text-sm mt-2 italic">"{profileUser.deep_statement}"</p>
              )}
              <div className="flex items-center gap-4 mt-3 text-sm text-white/40">
                <span>{posts.length} posts</span>
                <span>{acceptedConnections.length} conexoes</span>
                <span>Desde {new Date(profileUser.created_at).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 mt-4">
            {isOwnProfile ? (
              <>
                <button onClick={() => setShowEditProfile(true)} className="px-5 py-2 bg-[#81D8D0] text-black rounded-xl text-sm font-semibold">Editar perfil</button>
                <button onClick={() => setShowDeleteAccount(true)} className="px-5 py-2 bg-white/5 border border-white/10 text-white/60 rounded-xl text-sm hover:text-[#C8102E] hover:border-[#C8102E]/30">Excluir conta</button>
              </>
            ) : (
              <>
                {connectionStatus === 'none' && <button onClick={handleConnect} className="px-5 py-2 bg-[#81D8D0] text-black rounded-xl text-sm font-semibold">Conectar</button>}
                {connectionStatus === 'pending_sent' && <span className="px-5 py-2 bg-white/5 border border-white/10 text-white/40 rounded-xl text-sm">Solicitacao enviada</span>}
                {connectionStatus === 'accepted' && <span className="px-5 py-2 bg-[#81D8D0]/10 border border-[#81D8D0]/30 text-[#81D8D0] rounded-xl text-sm">Conectados</span>}
              </>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-white/10">
          {(['posts', 'about', 'connections'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === tab ? 'border-[#81D8D0] text-[#81D8D0]' : 'border-transparent text-white/40 hover:text-white/60'}`}>
              {tab === 'posts' ? 'Posts' : tab === 'about' ? 'Sobre' : 'Conexoes'}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'posts' && (
          <>
            {postsLoading ? (
              <div className="text-center py-8"><div className="w-8 h-8 border-2 border-[#81D8D0] border-t-transparent rounded-full animate-spin mx-auto"></div></div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10">
                <p className="text-white/50">Nenhum post ainda.</p>
              </div>
            ) : (
              <>
                {posts.map(p => <PostCard key={p.id} post={p} onNavigateToProfile={onNavigateToProfile} onDelete={handleDelete} />)}
                {hasMore && <button onClick={loadMore} disabled={isLoadingMore} className="w-full py-3 text-[#81D8D0] text-sm hover:underline">{isLoadingMore ? 'Carregando...' : 'Ver mais'}</button>}
              </>
            )}
          </>
        )}

        {activeTab === 'about' && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
            {profileUser.about_text && (
              <div><h3 className="text-white/40 text-xs uppercase tracking-wider mb-1">Sobre</h3><p className="text-white/80">{profileUser.about_text}</p></div>
            )}
            {profileUser.interests && profileUser.interests.length > 0 && (
              <div>
                <h3 className="text-white/40 text-xs uppercase tracking-wider mb-2">Interesses</h3>
                <div className="flex flex-wrap gap-2">{profileUser.interests.map((i: string) => <span key={i} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-white/70 text-sm">{i}</span>)}</div>
              </div>
            )}
            {profileUser.what_crosses_me && (
              <div><h3 className="text-white/40 text-xs uppercase tracking-wider mb-1">O que me atravessa</h3><p className="text-white/80">{profileUser.what_crosses_me}</p></div>
            )}
            {!profileUser.about_text && !profileUser.what_crosses_me && (!profileUser.interests || profileUser.interests.length === 0) && (
              <p className="text-white/40 text-center py-4">{isOwnProfile ? 'Complete seu perfil para mostrar informacoes aqui.' : 'Nenhuma informacao disponivel.'}</p>
            )}
          </div>
        )}

        {activeTab === 'connections' && (
          <div className="space-y-3">
            {acceptedConnections.length === 0 ? (
              <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10"><p className="text-white/50">Nenhuma conexao ainda.</p></div>
            ) : (
              acceptedConnections.map(c => (
                <div key={c.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-3 cursor-pointer hover:bg-white/8" onClick={() => c.other_user && onNavigateToProfile?.(c.other_user.id)}>
                  <UserAvatar src={c.other_user?.profile_photo || null} name={c.other_user?.name || 'Membro'} size={40} />
                  <div><p className="text-white font-medium">{c.other_user?.name || 'Membro'}</p><p className="text-white/40 text-xs capitalize">{c.other_user?.role?.replace(/_/g, ' ')}</p></div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <EditProfileModal isOpen={showEditProfile} onClose={() => setShowEditProfile(false)} />
      <DeleteAccountModal isOpen={showDeleteAccount} onClose={() => setShowDeleteAccount(false)} />
    </div>
  );
}
