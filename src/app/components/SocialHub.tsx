import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Home, Users, Calendar, User, Settings, Bell, Search, PlusCircle, LogOut, Shield, ChevronDown, ChevronUp, UserCheck, UserX, Phone, Copy, CheckCircle, MessageSquare, Radio, Eye, Flame, Sparkles, Zap, Crown, UserPlus } from "lucide-react";
import { LogoIcon } from "./LogoIcon";
import { CreatePostModal } from "./CreatePostModal";
import { PostCard } from "./PostCard";
import { UserAvatar } from "./UserAvatar";
import { NotificationsPanel } from "./NotificationsPanel";
import { DailyRitualModal } from "./DailyRitualModal";
import { SearchModal } from "./SearchModal";
import { ConnectionRequestsPanel } from "./ConnectionRequestsPanel";
import { LeadershipOnboardingModal } from "./LeadershipOnboardingModal";
import { usePosts, hasAppAccess, hasModAccess, isSuperAdmin, useProfileContext, useCommunitiesContext, useSeats, supabase, normalizeRole, useDailyChallenge, runBadgeEngine } from "../../lib";
import { needsLeadershipOnboarding } from "../../lib/roleEngine";
import { useInviteLinks } from "../../lib/useInviteLinks";
import { MenteEmDestaque } from "./MenteEmDestaque";
import { ModeratorApplicationModal } from "./ModeratorApplicationModal";
import { EnergiaSemanal } from "./EnergiaSemanal";
import type { User as UserType } from "../../lib";

interface SocialHubProps {
  onNavigateToProfile: () => void;
  onNavigateToCommunities: () => void;
  onNavigateToFeed: () => void;
  onNavigateToUserProfile?: (userId: string) => void;
  onNavigateToEvents?: () => void;
  onNavigateToMessages?: () => void;
  onNavigateToAdmin?: () => void;
  onNavigateToSettings?: () => void;
  onNavigateToFoundersRoom?: () => void;
}

export function SocialHub({ onNavigateToProfile, onNavigateToCommunities, onNavigateToFeed, onNavigateToUserProfile, onNavigateToEvents, onNavigateToMessages, onNavigateToAdmin, onNavigateToSettings, onNavigateToFoundersRoom }: SocialHubProps) {
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDailyRitualOpen, setIsDailyRitualOpen] = useState(false);
  const [ritualShownThisSession, setRitualShownThisSession] = useState(false);
  const [isLeadershipOnboardingOpen, setIsLeadershipOnboardingOpen] = useState(false);
  const [leadershipOnboardingDone, setLeadershipOnboardingDone] = useState(false);
  const [isModeratorAppOpen, setIsModeratorAppOpen] = useState(false);
  const { posts, isLoading, isLoadingMore, hasMore, loadMore, refreshPosts } = usePosts(false);
  const { user } = useProfileContext();
  const { communities } = useCommunitiesContext();
  const { seatsUsed, seatsTotal, isFull, refreshSeats } = useSeats();
  const canPost = hasAppAccess(user?.role);
  const canModerate = hasModAccess(user?.role);
  const isAdmin = isSuperAdmin(user?.role);

  // ═══ Fase 6: Leadership Onboarding — verificar se founder/moderator precisa completar ═══
  const showLeadershipBanner = !leadershipOnboardingDone && needsLeadershipOnboarding(user?.role, user?.leadership_onboarding_done);

  // ═══ Ritual do Dia: verificar se ja fez check-in antes de auto-abrir ═══
  const { hasCheckedIn: ritualAlreadyDone, streak: currentStreak, isLoading: ritualLoading } = useDailyChallenge();

  // ═══ Motor de gamificacao invisivel — roda ao entrar no hub ═══
  useEffect(() => {
    if (user?.id) {
      runBadgeEngine(user.id).catch(() => {});
    }
  }, [user?.id]);

  // ═══ COLUNA DIREITA: Dados ao vivo ═══
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [recentVisitors, setRecentVisitors] = useState<any[]>([]);
  const [visitCount, setVisitCount] = useState(0);

  useEffect(() => {
    // Carregar próximos eventos
    supabase
      .from("events")
      .select("id, title, event_type, starts_at, status, community_id")
      .in("status", ["published", "live"])
      .gte("starts_at", new Date().toISOString())
      .order("starts_at", { ascending: true })
      .limit(5)
      .then(({ data }) => {
        if (data) setUpcomingEvents(data);
      });

    // Carregar visitantes recentes do perfil
    if (user?.id) {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      supabase
        .from("profile_visits")
        .select("id, visitor_id, visited_at")
        .eq("visited_id", user.id)
        .gte("visited_at", thirtyDaysAgo)
        .order("visited_at", { ascending: false })
        .limit(10)
        .then(async ({ data }) => {
          if (data && data.length > 0) {
            const uniqueVisitorIds = [...new Set(data.map(v => v.visitor_id))];
            setVisitCount(uniqueVisitorIds.length);
            const { data: visitors } = await supabase
              .from("users")
              .select("id, name, display_name, profile_photo")
              .in("id", uniqueVisitorIds.slice(0, 5));
            if (visitors) setRecentVisitors(visitors);
          }
        });
    }
  }, [user?.id]);

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

  // Mostrar ritual diário na primeira vez que abre o SocialHub — SOMENTE se nao fez check-in hoje
  useEffect(() => {
    if (!ritualShownThisSession && user && !ritualLoading && !ritualAlreadyDone) {
      const timer = setTimeout(() => {
        setIsDailyRitualOpen(true);
        setRitualShownThisSession(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
    // Se ja fez, marca como mostrado pra nao incomodar
    if (ritualAlreadyDone && !ritualShownThisSession) {
      setRitualShownThisSession(true);
    }
  }, [user, ritualShownThisSession, ritualLoading, ritualAlreadyDone]);

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

            {/* Busca funcional */}
            <div className="flex-1 max-w-md mx-8 hidden md:block">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="w-full flex items-center gap-2 pl-10 pr-4 py-2.5 bg-black/30 border border-white/10 rounded-xl text-white/40 hover:border-white/20 hover:text-white/50 transition-all text-left relative"
              >
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5" />
                Buscar posts, comunidades, membros...
              </button>
            </div>

            {/* Ícones de ação */}
            <div className="flex items-center gap-3">
              {/* Notificações com Realtime */}
              <NotificationsPanel onNavigateToProfile={onNavigateToUserProfile} />
              
              {/* Avatar do usuário atual */}
              <button onClick={onNavigateToProfile}>
                <UserAvatar
                  name={user?.display_name || user?.name || ''}
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Menu de Navegação */}
          <aside className="lg:col-span-1">
            <div className="bg-white/3 border border-white/10 rounded-2xl p-6 sticky top-24">
              {/* Perfil rápido */}
              {user && (
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/10">
                  <UserAvatar
                    name={user.display_name || user.name}
                    photoUrl={user.profile_photo}
                    size="lg"
                    onClick={onNavigateToProfile}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate">{user.display_name || user.name}</p>
                    <p className="text-sm text-[#81D8D0]">@{(user.display_name || user.name).toLowerCase().replace(/\s+/g, '')}</p>
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

                <button 
                  onClick={onNavigateToEvents}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#81D8D0]/20 rounded-xl transition-colors text-white group"
                >
                  <Calendar className="h-5 w-5 text-[#81D8D0]" />
                  <span className="font-medium">Eventos & Lives</span>
                </button>

                <button 
                  onClick={onNavigateToProfile}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#81D8D0]/20 rounded-xl transition-colors text-white group"
                >
                  <User className="h-5 w-5 text-[#81D8D0]" />
                  <span className="font-medium">Meu Perfil</span>
                </button>

                <button 
                  onClick={onNavigateToMessages}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#81D8D0]/20 rounded-xl transition-colors text-white group"
                >
                  <MessageSquare className="h-5 w-5 text-[#81D8D0]" />
                  <span className="font-medium">Mensagens</span>
                </button>

                <button
                  onClick={onNavigateToSettings}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#81D8D0]/20 rounded-xl transition-colors text-white group"
                >
                  <Settings className="h-5 w-5 text-[#81D8D0]" />
                  <span className="font-medium">Configuracoes</span>
                </button>

                {/* Sala dos Fundadores — visível para founders, moderators e admin */}
                {canModerate && (
                  <button
                    onClick={onNavigateToFoundersRoom}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#FF6B35]/20 rounded-xl transition-colors text-white group"
                  >
                    <Crown className="h-5 w-5 text-[#FF6B35]" />
                    <span className="font-medium">Sala Fundadores</span>
                  </button>
                )}

                {/* Botão Admin */}
                {isAdmin && (
                  <button
                    onClick={onNavigateToAdmin || (() => setShowAdminPanel(!showAdminPanel))}
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
                      : `${seatsTotal - seatsUsed} vaga${seatsTotal - seatsUsed !== 1 ? 's' : ''} restante${seatsTotal - seatsUsed !== 1 ? 's' : ''}`
                    }
                  </p>
                </div>
              </div>
            </div>
          </aside>

          {/* Área Central - Feed de Posts */}
          <main className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Admin Panel */}
              {isAdmin && showAdminPanel && (
                <AdminPanel onClose={() => setShowAdminPanel(false)} />
              )}

              {/* ═══ Fase 6: Banner de Onboarding de Lideranca ═══ */}
              {showLeadershipBanner && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-[#C8102E]/15 to-[#81D8D0]/10 border border-[#C8102E]/30 rounded-2xl p-5 mb-6 cursor-pointer hover:border-[#C8102E]/50 transition-all"
                  onClick={() => setIsLeadershipOnboardingOpen(true)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#C8102E]/20 flex items-center justify-center flex-shrink-0">
                      <Crown className="h-6 w-6 text-[#C8102E]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-bold text-sm">
                        Complete seu onboarding de lideranca
                      </h3>
                      <p className="text-white/50 text-xs mt-0.5">
                        Escolha sua comunidade, aceite as responsabilidades e ative seu papel de founder.
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className="px-4 py-2 bg-[#C8102E] text-white rounded-xl text-xs font-bold hover:bg-[#C8102E]/80 transition-colors">
                        Iniciar
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Bem-vindo */}
              <div className="bg-gradient-to-br from-[#35363A] to-black border border-white/10 rounded-2xl p-8 mb-6">
                <h2 className="text-3xl font-semibold text-white mb-3">
                  Bem-vindo(a) {user?.display_name || user?.name}
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
                {isLoadingMore && (
                  <div className="text-center py-6">
                    <div className="w-8 h-8 border-3 border-[#81D8D0] border-t-transparent rounded-full animate-spin mx-auto"></div>
                  </div>
                )}
                {hasMore && (
                  <button
                    onClick={loadMore}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-[#81D8D0] hover:bg-[#81D8D0]/90 text-black rounded-xl transition-colors font-bold"
                  >
                    Carregar mais posts
                  </button>
                )}
              </div>
            </motion.div>
          </main>

          {/* ═══ COLUNA DIREITA — DNA Orkut ═══ */}
          <aside className="lg:col-span-1 hidden lg:block">
            <div className="space-y-4 sticky top-24">
              {/* ═══ PRÓXIMOS EVENTOS — Agenda é centro ═══ */}
              <div className="bg-white/3 border border-white/10 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs text-white uppercase tracking-wider font-bold flex items-center gap-2">
                    <Radio className="h-4 w-4 text-[#C8102E]" />
                    Agenda
                  </h3>
                  <button
                    onClick={onNavigateToEvents}
                    className="text-[10px] text-[#81D8D0] hover:underline font-semibold"
                  >
                    Ver tudo
                  </button>
                </div>
                {upcomingEvents.length === 0 ? (
                  <p className="text-xs text-white/30 text-center py-3">Nenhum evento agendado</p>
                ) : (
                  <div className="space-y-3">
                    {upcomingEvents.map((ev) => {
                      const d = new Date(ev.starts_at);
                      const dia = d.getDate().toString().padStart(2, "0");
                      const meses = ["JAN","FEV","MAR","ABR","MAI","JUN","JUL","AGO","SET","OUT","NOV","DEZ"];
                      const isLive = ev.status === "live";
                      return (
                        <div key={ev.id} className="flex items-start gap-3 group cursor-pointer" onClick={onNavigateToEvents}>
                          <div className={`flex-shrink-0 w-10 text-center rounded-lg p-1.5 ${isLive ? "bg-[#C8102E]" : "bg-white/5 border border-white/10"}`}>
                            <span className={`block text-sm font-bold ${isLive ? "text-white" : "text-white"}`}>{dia}</span>
                            <span className={`block text-[8px] uppercase ${isLive ? "text-white/80" : "text-white/40"}`}>{meses[d.getMonth()]}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white font-semibold truncate group-hover:text-[#81D8D0] transition-colors">{ev.title}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] text-white/30">{d.getHours()}h</span>
                              {isLive && (
                                <span className="text-[9px] px-1.5 py-0.5 bg-[#C8102E] text-white rounded-full font-bold animate-pulse">AO VIVO</span>
                              )}
                              {ev.event_type === "live" && !isLive && (
                                <span className="text-[9px] px-1.5 py-0.5 bg-[#C8102E]/20 text-[#C8102E] rounded-full font-bold">LIVE</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* ═══ QUEM VISITOU SEU PERFIL — DNA Orkut ═══ */}
              {visitCount > 0 && (
                <div className="bg-white/3 border border-white/10 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs text-white uppercase tracking-wider font-bold flex items-center gap-2">
                      <Eye className="h-4 w-4 text-[#81D8D0]" />
                      Visitaram seu perfil
                    </h3>
                    <span className="text-xs text-[#81D8D0] font-bold">{visitCount}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentVisitors.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => onNavigateToUserProfile?.(v.id)}
                        className="flex items-center gap-2 px-2 py-1.5 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                        title={v.display_name || v.name}
                      >
                        <UserAvatar name={v.display_name || v.name} photoUrl={v.profile_photo} size="sm" />
                        <span className="text-xs text-white/70 font-medium truncate max-w-[80px]">{(v.display_name || v.name).split(" ")[0]}</span>
                      </button>
                    ))}
                  </div>
                  {visitCount > 5 && (
                    <button onClick={onNavigateToProfile} className="w-full text-center text-[10px] text-[#81D8D0] mt-3 hover:underline font-semibold">
                      Ver todos os {visitCount} visitantes
                    </button>
                  )}
                </div>
              )}

              {/* ═══ RITUAL DO DIA — Ritual > Algoritmo ═══ */}
              <div className="bg-gradient-to-br from-[#C8102E]/10 to-transparent border border-[#C8102E]/20 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Flame className="h-4 w-4 text-[#C8102E]" />
                  <h3 className="text-xs text-white uppercase tracking-wider font-bold">Ritual do Dia</h3>
                  {currentStreak > 0 && (
                    <span className="ml-auto flex items-center gap-1 text-[10px] bg-[#FF6B35]/15 border border-[#FF6B35]/25 text-[#FF6B35] px-2 py-0.5 rounded-full font-bold">
                      <Zap className="h-2.5 w-2.5" />
                      {currentStreak}d
                    </span>
                  )}
                </div>
                {ritualAlreadyDone ? (
                  <div className="text-center py-2">
                    <p className="text-xs text-[#81D8D0] font-semibold mb-1">✨ Presenca registrada hoje</p>
                    {currentStreak > 1 && (
                      <p className="text-[10px] text-[#FF6B35]">🔥 {currentStreak} dias seguidos</p>
                    )}
                    <button
                      onClick={() => setIsDailyRitualOpen(true)}
                      className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white/60 rounded-xl text-xs font-medium transition-colors"
                    >
                      Ver resposta
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-white/70 leading-relaxed italic mb-3">
                      "O que te atravessou hoje que ninguem viu?"
                    </p>
                    <button
                      onClick={() => setIsDailyRitualOpen(true)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#C8102E] hover:bg-[#C8102E]/80 text-white rounded-xl text-xs font-bold transition-colors"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      Responder
                    </button>
                  </>
                )}
              </div>

              {/* ═══ COMUNIDADES ATIVAS ═══ */}
              <div className="bg-white/3 border border-white/10 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs text-white uppercase tracking-wider font-bold flex items-center gap-2">
                    <Users className="h-4 w-4 text-[#81D8D0]" />
                    Comunidades
                  </h3>
                  <button onClick={onNavigateToCommunities} className="text-[10px] text-[#81D8D0] hover:underline font-semibold">Ver todas</button>
                </div>
                <div className="space-y-1.5">
                  {communities.slice(0, 6).map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: c.config?.color || "#81D8D0" }} />
                      <span className="text-xs text-white/60 truncate font-medium">{c.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ═══ SEUS CONVITES — Crescimento viral controlado ═══ */}
              <InviteCard />

              {/* ═══ MENTE EM DESTAQUE — Membro da semana ═══ */}
              <MenteEmDestaque onNavigateToProfile={onNavigateToUserProfile} />

              {/* ═══ ENERGIA DA SEMANA — Reconhecimento simbólico ═══ */}
              <EnergiaSemanal onNavigateToProfile={onNavigateToUserProfile} />

              {/* ═══ CANDIDATURA A MODERADOR — Para membros que querem liderar ═══ */}
              {canPost && !canModerate && (
                <div className="bg-white/3 border border-white/10 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Crown className="h-4 w-4 text-[#FF6B35]" />
                    <h3 className="text-xs text-white uppercase tracking-wider font-bold">Quer liderar?</h3>
                  </div>
                  <p className="text-[11px] text-white/40 mb-3 leading-relaxed">
                    Se voce sente que pode cuidar de um territorio, candidate-se a moderador.
                  </p>
                  <button
                    onClick={() => setIsModeratorAppOpen(true)}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-[#FF6B35]/15 hover:bg-[#FF6B35]/25 border border-[#FF6B35]/20 text-[#FF6B35] rounded-xl text-xs font-bold transition-all"
                  >
                    <Shield className="h-3.5 w-3.5" />
                    Candidatar-se
                  </button>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* Modal de Criar Post */}
      <CreatePostModal
        isOpen={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
        onPostCreated={refreshPosts}
      />

      {/* Busca funcional */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigateToProfile={onNavigateToUserProfile}
      />

      {/* Ritual do dia */}
      <DailyRitualModal
        isOpen={isDailyRitualOpen}
        onClose={() => setIsDailyRitualOpen(false)}
      />

      {/* Leadership Onboarding */}
      <LeadershipOnboardingModal
        isOpen={isLeadershipOnboardingOpen}
        onClose={() => setIsLeadershipOnboardingOpen(false)}
        onComplete={() => {
          setIsLeadershipOnboardingOpen(false);
          setLeadershipOnboardingDone(true);
        }}
      />

      {/* Moderator Application */}
      <ModeratorApplicationModal
        isOpen={isModeratorAppOpen}
        onClose={() => setIsModeratorAppOpen(false)}
      />
    </div>
  );
}

// ─── INVITE CARD — Convites rastreavíveis na sidebar ──────────────────────────
function InviteCard() {
  const { activeLinks, createInviteLink, getInviteURL, isLoading } = useInviteLinks();
  const [creating, setCreating] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [newCode, setNewCode] = useState<string | null>(null);

  const handleCreate = async () => {
    setCreating(true);
    const result = await createInviteLink(3, 30); // 3 usos, 30 dias
    if (result.success && result.code) {
      setNewCode(result.code);
    }
    setCreating(false);
  };

  const handleCopy = (code: string) => {
    const url = getInviteURL(code);
    navigator.clipboard.writeText(url).then(() => {
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    });
  };

  const MAX_ACTIVE_LINKS = 3;
  const canCreate = activeLinks.length < MAX_ACTIVE_LINKS;

  return (
    <div className="bg-gradient-to-br from-[#81D8D0]/8 to-transparent border border-[#81D8D0]/15 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <UserPlus className="h-4 w-4 text-[#81D8D0]" />
        <h3 className="text-xs text-white uppercase tracking-wider font-bold">Seus Convites</h3>
      </div>

      <p className="text-[11px] text-white/40 mb-3 leading-relaxed">
        Convide com intencao. Cada link e rastreado e tem limite de uso.
      </p>

      {/* Links ativos */}
      {activeLinks.length > 0 && (
        <div className="space-y-2 mb-3">
          {activeLinks.map((link) => (
            <div key={link.id} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2">
              <div className="flex-1 min-w-0">
                <span className="text-xs text-[#81D8D0] font-mono font-bold">{link.code}</span>
                <span className="text-[10px] text-white/30 ml-2">{link.uses_count}/{link.max_uses} usos</span>
              </div>
              <button
                onClick={() => handleCopy(link.code)}
                className="flex items-center gap-1 px-2 py-1 bg-white/5 hover:bg-white/10 rounded text-[10px] text-white/50 hover:text-white transition-all"
              >
                {copiedCode === link.code ? (
                  <>
                    <CheckCircle className="h-3 w-3 text-[#81D8D0]" />
                    <span className="text-[#81D8D0]">Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>Copiar</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Criar novo */}
      {canCreate ? (
        <button
          onClick={handleCreate}
          disabled={creating || isLoading}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-[#81D8D0]/15 hover:bg-[#81D8D0]/25 border border-[#81D8D0]/20 text-[#81D8D0] rounded-xl text-xs font-bold transition-all disabled:opacity-50"
        >
          {creating ? (
            <div className="w-3 h-3 border-2 border-[#81D8D0] border-t-transparent rounded-full animate-spin" />
          ) : (
            <PlusCircle className="h-3.5 w-3.5" />
          )}
          {creating ? "Gerando..." : "Gerar link de convite"}
        </button>
      ) : (
        <p className="text-[10px] text-white/30 text-center">
          Limite de {MAX_ACTIVE_LINKS} convites ativos atingido
        </p>
      )}

      {/* Codigo recém-criado */}
      {newCode && (
        <div className="mt-2 p-2 bg-[#81D8D0]/10 border border-[#81D8D0]/25 rounded-lg text-center">
          <p className="text-[10px] text-[#81D8D0] font-semibold">Link criado! Copie e envie com sabedoria.</p>
        </div>
      )}
    </div>
  );
}

// ─── ADMIN PANEL ────────────────────────────────────────────────────────────
// Painel para gerenciar usuários: promover member→founder, remover acesso

function AdminPanel({ onClose }: { onClose: () => void }) {
  const [allUsers, setAllUsers] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { seatsUsed, seatsTotal, isFull, refreshSeats } = useSeats();

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const { data: active } = await supabase
        .from('users')
        .select('*')
        .not('role', 'eq', 'visitor')
        .order('created_at', { ascending: false });

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

  const promoteUser = async (userId: string, newRole: 'member_free_legacy' | 'founder_paid') => {
    if (isFull && newRole === 'member_free_legacy') {
      alert('Limite de 30 vagas atingido. Não é possível aprovar mais membros.');
      return;
    }

    setActionLoading(userId);
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ role: newRole, access_released: true })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Erro ao promover:', error);
        alert(`Erro ao promover: ${error.message}`);
      } else if (!data) {
        console.error('Promoção sem efeito — possível RLS bloqueando');
        alert('Erro: atualização não teve efeito. Verifique as policies RLS no Supabase.');
      } else {
        await loadUsers();
        await refreshSeats();
        // Log administrativo
        await supabase.from('admin_logs').insert({
          admin_id: (await supabase.auth.getUser()).data.user?.id,
          action: 'PROMOTE',
          target_user_id: userId,
          details: { new_role: newRole }
        }).catch(() => {});
      }
    } catch (err) {
      console.error('Erro:', err);
      alert('Erro inesperado ao promover usuário.');
    } finally {
      setActionLoading(null);
    }
  };

  const removeAccess = async (userId: string, currentRole: string) => {
    // founder_paid → member_free_legacy (perde moderação, mantém acesso)
    // member → visitor (perde acesso total)
    const isFounder = currentRole === 'founder_paid' || currentRole === 'founder';
    const newRole = isFounder ? 'member_free_legacy' : 'visitor';
    const actionLabel = isFounder
      ? 'Rebaixar para membro? Perderá acesso de moderação.'
      : 'Remover acesso deste usuário? Perderá acesso à plataforma.';

    if (!confirm(actionLabel)) return;

    setActionLoading(userId);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          role: newRole,
          access_released: newRole !== 'visitor',
        })
        .eq('id', userId);

      if (error) {
        console.error('Erro ao remover acesso:', error);
        alert(`Erro: ${error.message}`);
      } else {
        await loadUsers();
        await refreshSeats();
        // Log administrativo com rastreabilidade completa
        const adminUser = (await supabase.auth.getUser()).data.user;
        await supabase.from('admin_logs').insert({
          admin_id: adminUser?.id,
          action: currentRole === 'founder' ? 'DEMOTE' : 'REMOVE_ACCESS',
          target_user_id: userId,
          details: {
            previous_role: currentRole,
            new_role: newRole,
            timestamp: new Date().toISOString(),
            context: currentRole === 'founder'
              ? 'Founder rebaixado para member via AdminPanel'
              : 'Member removido — acesso revogado via AdminPanel',
          },
        }).catch(() => {});
      }
    } catch (err) {
      console.error('Erro:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    const normalized = normalizeRole(role);
    switch (normalized) {
      case 'super_admin': return 'bg-[#C8102E]/20 text-[#C8102E]';
      case 'founder_paid': return 'bg-[#81D8D0]/20 text-[#81D8D0]';
      case 'moderator': return 'bg-[#6B21A8]/20 text-[#A855F7]';
      case 'member_free_legacy': return 'bg-[#FF6B35]/20 text-[#FF6B35]';
      case 'member_paid': return 'bg-[#FF6B35]/20 text-[#FF6B35]';
      default: return 'bg-white/10 text-white/60';
    }
  };

  const getRoleLabel = (role: string) => {
    const normalized = normalizeRole(role);
    switch (normalized) {
      case 'super_admin': return 'Admin';
      case 'founder_paid': return 'Fundadora';
      case 'moderator': return 'Moderador(a)';
      case 'member_free_legacy': return 'Membro Beta';
      case 'member_paid': return 'Membro';
      default: return 'Visitante';
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

      {/* Header da lista */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-white/60">
          Membros ativos ({allUsers.length})
        </span>
      </div>

      {isLoading ? (
        <div className="text-center py-6">
          <div className="w-8 h-8 border-3 border-[#C8102E] border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : (
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {allUsers.length === 0 ? (
            <p className="text-sm text-white/40 text-center py-4">
              Nenhum membro ativo
            </p>
          ) : (
            allUsers.map((u) => (
              <div
                key={u.id}
                className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-4"
              >
                <UserAvatar name={u.display_name || u.name} photoUrl={u.profile_photo} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-white truncate">{u.display_name || u.name}</p>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getRoleBadgeColor(u.role)}`}>
                      {getRoleLabel(u.role)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-xs text-white/30">
                      {new Date(u.created_at).toLocaleDateString('pt-BR')}
                    </p>
                    {u.whatsapp && u.whatsapp.length > 0 && (() => {
                      const phone = Array.isArray(u.whatsapp) ? u.whatsapp[0] : u.whatsapp;
                      return (
                        <div className="flex items-center gap-1.5">
                          <Phone className="h-3 w-3 text-green-400" />
                          <span className="text-xs text-white/50 font-mono">
                            {phone.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3')}
                          </span>
                          {u.allow_whatsapp && (
                            <button
                              onClick={() => {
                                const msg = `Olá, ${u.display_name || u.name}.\nSeu acesso ao Beta Fechado da NeuroConexão Atípica foi aprovado.\nAqui está seu link para entrar:\nhttps://neuroconexaoatipica.com.br\n\nNos vemos lá.`;
                                navigator.clipboard.writeText(msg).then(() => {
                                  setCopiedId(u.id);
                                  setTimeout(() => setCopiedId(null), 2000);
                                });
                              }}
                              className="flex items-center gap-1 px-1.5 py-0.5 bg-white/5 hover:bg-white/10 rounded text-xs text-white/50 hover:text-white transition-all"
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
                        </div>
                      );
                    })()}
                  </div>
                </div>
                {!isSuperAdmin(u.role) && (
                  <div className="flex gap-2 flex-shrink-0">
                    {(normalizeRole(u.role) === 'member_free_legacy' || normalizeRole(u.role) === 'member_paid') && (
                      <button
                        onClick={() => promoteUser(u.id, 'founder_paid')}
                        disabled={actionLoading === u.id}
                        className="px-3 py-2 bg-[#FF6B35]/20 text-[#FF6B35] rounded-lg text-xs font-bold hover:bg-[#FF6B35]/30 disabled:opacity-50 transition-all"
                      >
                        Promover
                      </button>
                    )}
                    <button
                      onClick={() => removeAccess(u.id, u.role)}
                      disabled={actionLoading === u.id}
                      className="flex items-center gap-1 px-3 py-2 bg-white/5 text-white/40 rounded-lg text-xs font-medium hover:bg-[#C8102E]/20 hover:text-[#C8102E] disabled:opacity-50 transition-all"
                    >
                      <UserX className="h-3.5 w-3.5" />
                      Remover acesso
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </motion.div>
  );
}