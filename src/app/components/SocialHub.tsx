import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Home, Users, Calendar, User, Settings, Bell, Search, PlusCircle, LogOut, Shield, ChevronDown, ChevronUp, UserCheck, UserX, Phone, Copy, CheckCircle } from "lucide-react";
import { LogoIcon } from "./LogoIcon";
import { CreatePostModal } from "./CreatePostModal";
import { PostCard } from "./PostCard";
import { UserAvatar } from "./UserAvatar";
import { usePosts, hasAppAccess, hasModAccess, useProfileContext, useCommunitiesContext, useSeats, supabase } from "../../lib";
import type { User as UserType } from "../../lib";

interface SocialHubProps {
  onNavigateToProfile: () => void;
  onNavigateToCommunities: () => void;
  onNavigateToFeed: () => void;
  onNavigateToUserProfile?: (userId: string) => void;
}

export function SocialHub({ onNavigateToProfile, onNavigateToCommunities, onNavigateToFeed, onNavigateToUserProfile }: SocialHubProps) {
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const { posts, isLoading, refreshPosts } = usePosts(false);
  const { user } = useProfileContext();
  const { communities } = useCommunitiesContext();
  const { seatsUsed, seatsTotal, seatsRemaining, isFull } = useSeats();
  const canPost = hasAppAccess(user?.role);
  const canModerate = hasModAccess(user?.role);
  const isAdmin = user?.role === 'admin';

  // Ordenar: fixados primeiro, depois por data
  const sortedPosts = [...posts].sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  // Mapa de ID → nome da comunidade
  const communityNameMap: Record<string, string> = {};
  communities.forEach(c => { communityNameMap[c.id] = c.name; });

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleAuthorClick = (userId: string) => {
    if (userId === user?.id) {
      onNavigateToProfile();
    } else if (onNavigateToUserProfile) {
      onNavigateToUserProfile(userId);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header da área logada */}
      <header className="w-full bg-[#35363A] border-b border-white/10 sticky top-0 z-40">
        <div className="mx-auto max-w-[1200px] px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <LogoIcon size={40} className="h-10 w-10" />
              <h1 className="text-xl font-semibold text-white hidden sm:block">
                NeuroConexão Atípica
              </h1>
            </div>

            {/* Busca */}
            <div className="flex-1 max-w-md mx-8 hidden md:block">
              <div className="relative opacity-50">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                <input
                  type="text"
                  placeholder="Busca em breve..."
                  disabled
                  className="w-full pl-10 pr-4 py-2.5 bg-black/30 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none cursor-not-allowed"
                />
              </div>
            </div>

            {/* Ícones de ação */}
            <div className="flex items-center gap-3">
              <button className="relative p-2 hover:bg-white/5 rounded-lg transition-colors">
                <Bell className="h-6 w-6 text-white/80" />
              </button>
              
              {/* Avatar do usuário atual */}
              <button onClick={onNavigateToProfile}>
                <UserAvatar
                  name={user?.name || ''}
                  photoUrl={user?.profile_photo}
                  size="md"
                />
              </button>
              
              <button 
                onClick={handleLogout}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                title="Sair"
              >
                <LogOut className="h-6 w-6 text-white/80" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <div className="mx-auto max-w-[1200px] px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Sidebar - Menu de Navegação */}
          <aside className="md:col-span-1">
            <div className="bg-white/3 border border-white/10 rounded-2xl p-6 sticky top-24">
              {/* Perfil rápido */}
              {user && (
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/10">
                  <UserAvatar
                    name={user.name}
                    photoUrl={user.profile_photo}
                    size="lg"
                    onClick={onNavigateToProfile}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate">{user.name}</p>
                    <p className="text-sm text-[#81D8D0]">@{user.name.toLowerCase().replace(/\s+/g, '')}</p>
                  </div>
                </div>
              )}

              <nav className="space-y-2">
                <button 
                  onClick={onNavigateToFeed}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#81D8D0]/20 rounded-xl transition-colors text-white group"
                >
                  <Home className="h-5 w-5 text-[#81D8D0]" />
                  <span className="font-medium">Início / Feed</span>
                </button>

                <button 
                  onClick={onNavigateToCommunities}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#81D8D0]/20 rounded-xl transition-colors text-white group"
                >
                  <Users className="h-5 w-5 text-[#81D8D0]" />
                  <span className="font-medium">Comunidades</span>
                </button>

                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/40 cursor-not-allowed">
                  <Calendar className="h-5 w-5 text-white/30" />
                  <span className="font-medium">Eventos & Lives</span>
                  <span className="ml-auto text-xs text-white/30 font-normal">Em breve</span>
                </button>

                <button 
                  onClick={onNavigateToProfile}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#81D8D0]/20 rounded-xl transition-colors text-white group"
                >
                  <User className="h-5 w-5 text-[#81D8D0]" />
                  <span className="font-medium">Meu Perfil</span>
                </button>

                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/40 cursor-not-allowed">
                  <Settings className="h-5 w-5 text-white/30" />
                  <span className="font-medium">Configurações</span>
                  <span className="ml-auto text-xs text-white/30 font-normal">Em breve</span>
                </button>

                {/* Botão Admin */}
                {isAdmin && (
                  <button
                    onClick={() => setShowAdminPanel(!showAdminPanel)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#C8102E]/20 rounded-xl transition-colors text-white group"
                  >
                    <Shield className="h-5 w-5 text-[#C8102E]" />
                    <span className="font-medium">Painel Admin</span>
                    {showAdminPanel ? (
                      <ChevronUp className="h-4 w-4 ml-auto text-white/40" />
                    ) : (
                      <ChevronDown className="h-4 w-4 ml-auto text-white/40" />
                    )}
                  </button>
                )}
              </nav>

              {/* Beta Status + Contador de Vagas */}
              <div className="mt-6 pt-6 border-t border-white/10">
                <div className="bg-gradient-to-br from-[#81D8D0]/20 to-[#C8102E]/20 border border-[#81D8D0]/30 rounded-xl p-4">
                  <p className="text-xs font-semibold text-[#81D8D0] uppercase tracking-wide mb-2">
                    Beta Fechado
                  </p>
                  <p className="text-sm font-bold text-white mb-1">
                    {seatsUsed}/{seatsTotal} vagas preenchidas
                  </p>
                  <div className="w-full h-2 bg-white/10 rounded-full mt-2 mb-2 overflow-hidden">
                    <div
                      className="h-full bg-[#81D8D0] rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (seatsUsed / seatsTotal) * 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-white/60">
                    {isFull
                      ? 'Vagas esgotadas'
                      : `${seatsRemaining} vaga${seatsRemaining !== 1 ? 's' : ''} restante${seatsRemaining !== 1 ? 's' : ''}`
                    }
                  </p>
                </div>
              </div>
            </div>
          </aside>

          {/* Área Central - Feed de Posts */}
          <main className="md:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Admin Panel */}
              {isAdmin && showAdminPanel && (
                <AdminPanel onClose={() => setShowAdminPanel(false)} />
              )}

              {/* Bem-vindo */}
              <div className="bg-gradient-to-br from-[#35363A] to-black border border-white/10 rounded-2xl p-8 mb-6">
                <h2 className="text-3xl font-semibold text-white mb-3">
                  Bem-vindo(a) {user?.name}
                </h2>
                <p className="text-lg text-white/70 font-normal leading-relaxed mb-6">
                  Este é o Social Hub da NeuroConexão Atípica. Compartilhe, conecte-se e participe.
                </p>
                
                {/* Botão Criar Post */}
                {canPost && (
                  <button
                    onClick={() => setIsCreatePostOpen(true)}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-[#81D8D0] hover:bg-[#81D8D0]/90 text-black rounded-xl transition-colors font-bold"
                  >
                    <PlusCircle className="h-5 w-5" />
                    Criar novo post
                  </button>
                )}
              </div>

              {/* Feed de Posts */}
              <div className="space-y-6">
                {isLoading ? (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 border-4 border-[#81D8D0] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white/60">Carregando posts...</p>
                  </div>
                ) : sortedPosts.length === 0 ? (
                  <div className="bg-white/3 border border-white/10 rounded-2xl p-12 text-center">
                    <p className="text-xl text-white/60 mb-4">Ainda não há posts por aqui</p>
                    <p className="text-sm text-white/40 mb-6">Seja o primeiro a compartilhar algo!</p>
                    {canPost && (
                      <button
                        onClick={() => setIsCreatePostOpen(true)}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-[#81D8D0] hover:bg-[#81D8D0]/90 text-black rounded-xl transition-colors font-bold"
                      >
                        <PlusCircle className="h-5 w-5" />
                        Criar primeiro post
                      </button>
                    )}
                  </div>
                ) : (
                  sortedPosts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      currentUserId={user?.id}
                      canModerate={canModerate}
                      onDelete={refreshPosts}
                      onPinToggle={refreshPosts}
                      onAuthorClick={handleAuthorClick}
                      communityName={post.community ? communityNameMap[post.community] : undefined}
                    />
                  ))
                )}
              </div>
            </motion.div>
          </main>
        </div>
      </div>

      {/* Modal de Criar Post */}
      <CreatePostModal
        isOpen={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
        onPostCreated={refreshPosts}
      />
    </div>
  );
}

// ─── ADMIN PANEL ────────────────────────────────────────────────────────────
// Painel simples para promover/rebaixar usuários sem usar o Supabase Dashboard

function AdminPanel({ onClose }: { onClose: () => void }) {
  const [pendingUsers, setPendingUsers] = useState<UserType[]>([]);
  const [allUsers, setAllUsers] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { seatsUsed, seatsTotal, isFull, refreshSeats } = useSeats();

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      // user_free aguardando aprovação
      const { data: pending } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'user_free')
        .order('created_at', { ascending: false });

      // Todos os membros ativos
      const { data: active } = await supabase
        .from('users')
        .select('*')
        .in('role', ['member', 'founder', 'admin'])
        .order('created_at', { ascending: false });

      setPendingUsers(pending || []);
      setAllUsers(active || []);
    } catch (err) {
      console.error('Erro ao carregar usuários:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const promoteUser = async (userId: string, newRole: 'member' | 'founder') => {
    if (isFull && newRole === 'member') {
      alert('Limite de 30 vagas atingido. Não é possível aprovar mais membros.');
      return;
    }

    setActionLoading(userId);
    try {
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) {
        console.error('Erro ao promover:', error);
        alert(`Erro ao promover: ${error.message}`);
      } else {
        await loadUsers();
        await refreshSeats();
      }
    } catch (err) {
      console.error('Erro:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const demoteUser = async (userId: string) => {
    if (!confirm('Rebaixar este usuário para lista de espera?')) return;

    setActionLoading(userId);
    try {
      const { error } = await supabase
        .from('users')
        .update({ role: 'user_free' })
        .eq('id', userId);

      if (error) {
        console.error('Erro ao rebaixar:', error);
        alert(`Erro: ${error.message}`);
      } else {
        await loadUsers();
        await refreshSeats();
      }
    } catch (err) {
      console.error('Erro:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-[#C8102E]/20 text-[#C8102E]';
      case 'founder': return 'bg-[#81D8D0]/20 text-[#81D8D0]';
      case 'member': return 'bg-[#FF6B35]/20 text-[#FF6B35]';
      default: return 'bg-white/10 text-white/60';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Admin';
      case 'founder': return 'Fundadora';
      case 'member': return 'Membro';
      default: return 'Aguardando';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="bg-[#C8102E]/5 border-2 border-[#C8102E]/30 rounded-2xl p-6 mb-6 overflow-hidden"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-[#C8102E]" />
          <h3 className="text-xl font-semibold text-white">Painel Admin</h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-white/60">
            {seatsUsed}/{seatsTotal} vagas
          </span>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white text-sm font-medium"
          >
            Fechar
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'pending'
              ? 'bg-[#FF6B35] text-white'
              : 'bg-white/5 text-white/60 hover:bg-white/10'
          }`}
        >
          Aguardando ({pendingUsers.length})
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'all'
              ? 'bg-[#81D8D0] text-black'
              : 'bg-white/5 text-white/60 hover:bg-white/10'
          }`}
        >
          Ativos ({allUsers.length})
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-6">
          <div className="w-8 h-8 border-3 border-[#C8102E] border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : activeTab === 'pending' ? (
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {pendingUsers.length === 0 ? (
            <p className="text-sm text-white/40 text-center py-4">
              Nenhum usuário aguardando aprovação
            </p>
          ) : (
            pendingUsers.map((u) => (
              <div
                key={u.id}
                className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3"
              >
                {/* Linha 1: Avatar + Info + Botões */}
                <div className="flex items-center gap-3">
                  <UserAvatar name={u.name} photoUrl={u.profile_photo} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate">{u.name}</p>
                    <p className="text-xs text-white/50 truncate">{u.email}</p>
                    <p className="text-xs text-white/30">
                      {new Date(u.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => promoteUser(u.id, 'member')}
                      disabled={actionLoading === u.id || isFull}
                      className="flex items-center gap-1.5 px-3 py-2 bg-[#81D8D0] text-black rounded-lg text-xs font-bold hover:bg-[#81D8D0]/90 disabled:opacity-50 transition-all"
                    >
                      <UserCheck className="h-3.5 w-3.5" />
                      Membro
                    </button>
                    <button
                      onClick={() => promoteUser(u.id, 'founder')}
                      disabled={actionLoading === u.id || isFull}
                      className="flex items-center gap-1.5 px-3 py-2 bg-[#FF6B35] text-white rounded-lg text-xs font-bold hover:bg-[#FF6B35]/90 disabled:opacity-50 transition-all"
                    >
                      <UserCheck className="h-3.5 w-3.5" />
                      Fundador
                    </button>
                  </div>
                </div>

                {/* Linha 2: WhatsApp + Autorização + Copiar */}
                <div className="flex items-center gap-3 pl-12 flex-wrap">
                  {u.whatsapp ? (
                    <>
                      <div className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-green-400" />
                        <span className="text-xs text-white/70 font-mono">
                          {u.whatsapp.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3')}
                        </span>
                      </div>
                      <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                        u.allow_whatsapp 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${u.allow_whatsapp ? 'bg-green-400' : 'bg-red-400'}`}></span>
                        {u.allow_whatsapp ? 'WhatsApp OK' : 'Sem autorização'}
                      </div>
                      {u.allow_whatsapp && (
                        <button
                          onClick={() => {
                            const msg = `Olá, ${u.name}.\nSeu acesso ao Beta Fechado da NeuroConexão Atípica foi aprovado.\nAqui está seu link para entrar:\nhttps://neuroconexaoatipica.com.br\n\nNos vemos lá.`;
                            navigator.clipboard.writeText(msg).then(() => {
                              setCopiedId(u.id);
                              setTimeout(() => setCopiedId(null), 2000);
                            });
                          }}
                          className="flex items-center gap-1 px-2 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-white/60 hover:text-white transition-all"
                        >
                          {copiedId === u.id ? (
                            <>
                              <CheckCircle className="h-3 w-3 text-green-400" />
                              <span className="text-green-400">Copiado!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              <span>Copiar msg</span>
                            </>
                          )}
                        </button>
                      )}
                    </>
                  ) : (
                    <span className="text-xs text-white/30 italic">WhatsApp não informado</span>
                  )}
                </div>
              </div>
            ))
          )}
          {isFull && pendingUsers.length > 0 && (
            <div className="bg-[#C8102E]/10 border border-[#C8102E]/30 rounded-lg p-3">
              <p className="text-xs text-[#C8102E] font-semibold text-center">
                Limite de {seatsTotal} vagas atingido. Não é possível aprovar mais membros.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {allUsers.map((u) => (
            <div
              key={u.id}
              className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-4"
            >
              <UserAvatar name={u.name} photoUrl={u.profile_photo} size="md" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-white truncate">{u.name}</p>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getRoleBadgeColor(u.role)}`}>
                    {getRoleLabel(u.role)}
                  </span>
                </div>
                <p className="text-xs text-white/50 truncate">{u.email}</p>
              </div>
              {u.role !== 'admin' && (
                <div className="flex gap-2 flex-shrink-0">
                  {u.role === 'member' && (
                    <button
                      onClick={() => promoteUser(u.id, 'founder')}
                      disabled={actionLoading === u.id}
                      className="px-3 py-2 bg-[#FF6B35]/20 text-[#FF6B35] rounded-lg text-xs font-bold hover:bg-[#FF6B35]/30 disabled:opacity-50 transition-all"
                    >
                      Promover
                    </button>
                  )}
                  <button
                    onClick={() => demoteUser(u.id)}
                    disabled={actionLoading === u.id}
                    className="flex items-center gap-1 px-3 py-2 bg-white/5 text-white/40 rounded-lg text-xs font-medium hover:bg-[#C8102E]/20 hover:text-[#C8102E] disabled:opacity-50 transition-all"
                  >
                    <UserX className="h-3.5 w-3.5" />
                    Rebaixar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

