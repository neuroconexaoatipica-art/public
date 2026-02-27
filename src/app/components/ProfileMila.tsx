import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Calendar, Edit, Users, Trash2, VolumeX, Globe, Lock, ImageIcon, Brain, Heart, MessageCircle, Sparkles, Instagram, Link2, Flame, Zap } from "lucide-react";
import { useProfileContext, usePosts, supabase, useCommunitiesContext, useProfileVisits, useBadges, useRitualLogs, runBadgeEngine } from "../../lib";
import type { User } from "../../lib";
import { EditProfileModal } from "./EditProfileModal";
import { DeleteAccountModal } from "./DeleteAccountModal";
import { PostCard } from "./PostCard";
import { UserAvatar } from "./UserAvatar";
import { ConnectionButton } from "./ConnectionButton";
import { ProfileVisitsBadge } from "./ProfileVisitsBadge";
import { TestimonialCard } from "./TestimonialCard";
import { BadgeDisplay } from "./BadgeDisplay";

interface ProfileMilaProps {
  onBack: () => void;
  viewUserId?: string | null;
  onNavigateToProfile?: (userId: string) => void;
}

export function ProfileMila({ onBack, viewUserId, onNavigateToProfile }: ProfileMilaProps) {
  const { user: currentUser, isLoading: currentLoading, refreshProfile } = useProfileContext();
  const [viewedUser, setViewedUser] = useState<User | null>(null);
  const [isLoadingViewed, setIsLoadingViewed] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { communities } = useCommunitiesContext();
  const { registerVisit } = useProfileVisits();

  // Mapa de ID -> nome da comunidade (para exibir nos posts)
  const communityNameMap: Record<string, string> = {};
  communities.forEach(c => { communityNameMap[c.id] = c.name; });

  // Determinar se estamos vendo NOSSO perfil ou de OUTRO usuario
  const isOwnProfile = !viewUserId || viewUserId === currentUser?.id;
  const displayUser = isOwnProfile ? currentUser : viewedUser;
  const isLoading = isOwnProfile ? currentLoading : isLoadingViewed;

  // v1.1: Badges do usuario exibido
  const { badges, refreshBadges } = useBadges(displayUser?.id);

  // Ritual stats do usuario exibido
  const { stats: ritualStats } = useRitualLogs(displayUser?.id);

  // Motor de gamificacao invisivel — roda silenciosamente no proprio perfil
  useEffect(() => {
    if (isOwnProfile && currentUser?.id) {
      runBadgeEngine(currentUser.id).then(({ granted }) => {
        if (granted.length > 0) refreshBadges();
      });
    }
  }, [isOwnProfile, currentUser?.id]);

  // ID seguro para buscar posts
  const safeAuthorId = displayUser?.id || null;

  // Carregar posts do usuario exibido
  const { posts, isLoading: postsLoading, isLoadingMore, hasMore, loadMore, refreshPosts } = usePosts(
    safeAuthorId ? { authorId: safeAuthorId } : { authorId: '__skip__' }
  );

  const displayPosts = safeAuthorId ? posts : [];
  const isPostsLoading = safeAuthorId ? postsLoading : false;

  // Carregar perfil de outro usuario + registrar visita
  useEffect(() => {
    if (viewUserId && viewUserId !== currentUser?.id) {
      loadViewedUser(viewUserId);
      registerVisit(viewUserId);
    }
  }, [viewUserId, currentUser?.id, registerVisit]);

  const loadViewedUser = async (userId: string) => {
    setIsLoadingViewed(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setViewedUser(data);
    } catch (err) {
      console.error('Erro ao carregar perfil:', err);
    } finally {
      setIsLoadingViewed(false);
    }
  };

  const getRoleLabel = (role: string) => {
    const roles: Record<string, string> = {
      super_admin: 'Admin',
      founder_paid: 'Fundadora',
      moderator: 'Moderador(a)',
      member_free_legacy: 'Membro Beta',
      member_paid: 'Membro',
      founder: 'Fundadora',
      admin: 'Admin',
      member: 'Membro',
      visitor: 'Visitante'
    };
    return roles[role] || 'Membro';
  };

  const getMemberSince = (createdAt: string) => {
    try {
      const date = new Date(createdAt);
      const months = ['Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
      return `${months[date.getMonth()]} ${date.getFullYear()}`;
    } catch {
      return 'Fevereiro 2026';
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="w-full bg-[#35363A] border-b border-white/10 sticky top-0 z-40">
        <div className="mx-auto max-w-[1000px] px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-white/80 hover:text-[#81D8D0] transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Voltar</span>
            </button>

            <h1 className="text-xl font-semibold text-white">
              {isOwnProfile ? 'Meu Perfil' : 'Perfil'}
            </h1>
            <div className="w-24"></div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[#81D8D0] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white/60">Carregando perfil...</p>
          </div>
        </div>
      )}

      {/* Conteudo do Perfil */}
      {!isLoading && displayUser && (
        <div className="mx-auto max-w-[1000px] px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Card do Perfil */}
            <div className="bg-white/3 border border-white/10 rounded-2xl overflow-hidden mb-8">
              {/* Cover/Banner */}
              <div className="h-48 bg-gradient-to-br from-[#81D8D0] via-[#35363A] to-[#C8102E]"></div>

              {/* Informacoes do Perfil */}
              <div className="px-8 pb-8">
                {/* Foto de Perfil + Botao */}
                <div className="relative -mt-16 mb-6 flex items-end gap-4">
                  <div className="w-32 h-32 rounded-full border-4 border-black overflow-hidden flex-shrink-0">
                    <UserAvatar
                      name={displayUser.name}
                      photoUrl={displayUser.profile_photo}
                      size="xl"
                      className="!w-full !h-full !rounded-none"
                    />
                  </div>
                  
                  {isOwnProfile ? (
                    <button 
                      className="mb-2 px-4 py-2 bg-[#81D8D0] rounded-xl hover:bg-[#81D8D0]/90 transition-colors shadow-lg flex items-center gap-2 text-black font-semibold text-sm" 
                      onClick={() => setIsEditModalOpen(true)}
                    >
                      <Edit className="h-4 w-4" />
                      Editar perfil
                    </button>
                  ) : currentUser && (
                    <ConnectionButton targetUserId={displayUser.id} />
                  )}
                </div>

                {/* Nome e Bio */}
                <div className="mb-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h1 className="text-3xl font-semibold text-white mb-1">
                        {displayUser.display_name || displayUser.name}
                        {displayUser.pronouns && (
                          <span className="text-base font-normal text-white/40 ml-2">({displayUser.pronouns})</span>
                        )}
                      </h1>
                      <p className="text-lg text-[#81D8D0] font-medium">
                        @{(displayUser.display_name || displayUser.name).toLowerCase().replace(/\s+/g, '')} · {getRoleLabel(displayUser.role)}
                      </p>
                    </div>
                    {(displayUser.role === 'founder_paid' || displayUser.role === 'super_admin' || displayUser.role === 'founder' || displayUser.role === 'admin') && (
                      <span className="px-4 py-2 bg-[#81D8D0]/20 border border-[#81D8D0]/40 rounded-full text-sm font-semibold text-[#81D8D0]">
                        {getRoleLabel(displayUser.role)}
                      </span>
                    )}
                  </div>

                  {/* Bio do usuario */}
                  <div className="space-y-4 text-base text-white/90 font-normal leading-relaxed mb-4">
                    {displayUser.bio ? (
                      <p className="whitespace-pre-wrap">{displayUser.bio}</p>
                    ) : isOwnProfile ? (
                      <p className="text-white/50 italic">
                        Voce ainda nao adicionou uma bio. Clique em "Editar perfil" para contar um pouco sobre voce.
                      </p>
                    ) : (
                      <p className="text-white/50 italic">
                        Este membro ainda nao adicionou uma bio.
                      </p>
                    )}
                  </div>

                  {/* Badges/Tags */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {/* v1.1: Badges do sistema */}
                    {badges.length > 0 && (
                      <BadgeDisplay badges={badges} />
                    )}
                    {badges.length === 0 && (
                      <span className="px-3 py-1.5 bg-[#81D8D0]/20 border border-[#81D8D0]/40 rounded-lg text-sm font-medium text-white">
                        {getRoleLabel(displayUser.role)}
                      </span>
                    )}
                    {displayUser.role === 'founder_paid' && (
                      <>
                        <span className="px-3 py-1.5 bg-[#FF6B35]/20 border border-[#FF6B35]/40 rounded-lg text-sm font-medium text-white">
                          Moderadora
                        </span>
                        <span className="px-3 py-1.5 bg-[#C8102E]/20 border border-[#C8102E]/40 rounded-lg text-sm font-medium text-white">
                          Curadoria Etica
                        </span>
                      </>
                    )}
                  </div>

                  {/* Ritual streak & activity */}
                  {ritualStats.totalCompleted > 0 && (
                    <div className="mb-6 flex flex-wrap gap-3">
                      {ritualStats.consecutiveWeeks > 0 && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-[#FF6B35]/10 border border-[#FF6B35]/25 rounded-xl">
                          <Flame className="h-4 w-4 text-[#FF6B35]" />
                          <div>
                            <p className="text-xs text-[#FF6B35] font-bold">{ritualStats.consecutiveWeeks} {ritualStats.consecutiveWeeks === 1 ? 'semana' : 'semanas'} ativa{ritualStats.consecutiveWeeks > 1 ? 's' : ''}</p>
                            <p className="text-[10px] text-white/30">Constancia nos rituais</p>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-xl">
                        <Zap className="h-4 w-4 text-[#81D8D0]" />
                        <div>
                          <p className="text-xs text-white/70 font-bold">{ritualStats.totalCompleted} rituais completados</p>
                          <p className="text-[10px] text-white/30">Total de presencas</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* v1.1: Deep Statement — "O que te atravessa" */}
                  {displayUser.deep_statement && displayUser.deep_statement_public && (
                    <div className="mb-6 p-4 bg-[#C8102E]/5 border border-[#C8102E]/20 rounded-xl">
                      <p className="text-xs text-[#C8102E] font-semibold uppercase tracking-wide mb-2">
                        O que me atravessa
                      </p>
                      <p className="text-white/90 italic font-normal leading-relaxed" style={{ fontFamily: 'Lora, serif' }}>
                        "{displayUser.deep_statement}"
                      </p>
                    </div>
                  )}
                  {isOwnProfile && displayUser.deep_statement && !displayUser.deep_statement_public && (
                    <div className="mb-6 p-4 bg-white/3 border border-white/10 rounded-xl">
                      <p className="text-xs text-white/40 font-semibold uppercase tracking-wide mb-2">
                        O que me atravessa (privado — so voce ve)
                      </p>
                      <p className="text-white/60 italic font-normal leading-relaxed" style={{ fontFamily: 'Lora, serif' }}>
                        "{displayUser.deep_statement}"
                      </p>
                    </div>
                  )}

                  {/* v1.3: O que me acalma */}
                  {displayUser.calming_statement && displayUser.calming_statement_public && (
                    <div className="mb-6 p-4 bg-[#81D8D0]/5 border border-[#81D8D0]/20 rounded-xl">
                      <p className="text-xs text-[#81D8D0] font-semibold uppercase tracking-wide mb-2">
                        <Heart className="h-3 w-3 inline mr-1" />
                        O que me acalma
                      </p>
                      <p className="text-white/90 italic font-normal leading-relaxed" style={{ fontFamily: 'Lora, serif' }}>
                        "{displayUser.calming_statement}"
                      </p>
                    </div>
                  )}
                  {isOwnProfile && displayUser.calming_statement && !displayUser.calming_statement_public && (
                    <div className="mb-6 p-4 bg-white/3 border border-white/10 rounded-xl">
                      <p className="text-xs text-white/40 font-semibold uppercase tracking-wide mb-2">
                        O que me acalma (privado — so voce ve)
                      </p>
                      <p className="text-white/60 italic font-normal leading-relaxed" style={{ fontFamily: 'Lora, serif' }}>
                        "{displayUser.calming_statement}"
                      </p>
                    </div>
                  )}

                  {/* v1.3: Neurodivergencias */}
                  {displayUser.neurodivergences && displayUser.neurodivergences.length > 0 && displayUser.neurodivergences_public && (
                    <div className="mb-6">
                      <p className="text-xs text-[#81D8D0] font-semibold uppercase tracking-wide mb-2 flex items-center gap-1">
                        <Brain className="h-3 w-3" />
                        Neurodivergencias
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {displayUser.neurodivergences.map((nd) => (
                          <span key={nd} className="px-3 py-1.5 bg-[#81D8D0]/10 border border-[#81D8D0]/25 rounded-lg text-xs font-medium text-[#81D8D0]">
                            {nd}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {isOwnProfile && displayUser.neurodivergences && displayUser.neurodivergences.length > 0 && !displayUser.neurodivergences_public && (
                    <div className="mb-6">
                      <p className="text-xs text-white/40 font-semibold uppercase tracking-wide mb-2 flex items-center gap-1">
                        <Brain className="h-3 w-3" />
                        Neurodivergencias (privado — so voce ve)
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {displayUser.neurodivergences.map((nd) => (
                          <span key={nd} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs font-medium text-white/40">
                            {nd}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* v1.3: Estilo de comunicacao */}
                  {displayUser.communication_style && displayUser.communication_style.length > 0 && (
                    <div className="mb-6">
                      <p className="text-xs text-[#FF6B35] font-semibold uppercase tracking-wide mb-2 flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" />
                        Como me comunicar
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {displayUser.communication_style.map((style) => (
                          <span key={style} className="px-3 py-1.5 bg-[#FF6B35]/10 border border-[#FF6B35]/25 rounded-lg text-xs font-medium text-[#FF6B35]">
                            {style}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* v1.3: Interesses */}
                  {displayUser.interests && displayUser.interests.length > 0 && (
                    <div className="mb-6">
                      <p className="text-xs text-white/60 font-semibold uppercase tracking-wide mb-2 flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        Interesses
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {displayUser.interests.map((interest) => (
                          <span key={interest} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs font-medium text-white/60">
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* v1.3: Links sociais */}
                  {(displayUser.social_instagram || displayUser.social_link) && (
                    <div className="mb-6 flex flex-wrap gap-3">
                      {displayUser.social_instagram && (
                        <a
                          href={`https://instagram.com/${displayUser.social_instagram.replace('@', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white/60 hover:text-[#81D8D0] hover:border-[#81D8D0]/30 transition-colors"
                        >
                          <Instagram className="h-3.5 w-3.5" />
                          {displayUser.social_instagram}
                        </a>
                      )}
                      {displayUser.social_link && (
                        <a
                          href={displayUser.social_link.startsWith('http') ? displayUser.social_link : `https://${displayUser.social_link}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white/60 hover:text-[#81D8D0] hover:border-[#81D8D0]/30 transition-colors"
                        >
                          <Link2 className="h-3.5 w-3.5" />
                          Link
                        </a>
                      )}
                    </div>
                  )}

                  {/* Meta Info */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-white/70">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-[#81D8D0]" />
                      <span>Membro desde {getMemberSince(displayUser.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-[#81D8D0]" />
                      <span>{displayPosts.length} {displayPosts.length === 1 ? 'post' : 'posts'}</span>
                    </div>
                    {/* Indicadores de privacidade (so o proprio usuario ve) */}
                    {isOwnProfile && (
                      <>
                        <div className="flex items-center gap-1.5">
                          {displayUser.is_public_profile ? (
                            <><Globe className="h-3.5 w-3.5 text-[#81D8D0]" /><span className="text-xs text-[#81D8D0]">Perfil publico</span></>
                          ) : (
                            <><Lock className="h-3.5 w-3.5 text-white/40" /><span className="text-xs text-white/40">Perfil privado</span></>
                          )}
                        </div>
                        {displayUser.is_anonymous_mode && (
                          <div className="flex items-center gap-1.5">
                            <VolumeX className="h-3.5 w-3.5 text-[#C8102E]" />
                            <span className="text-xs text-[#C8102E]">Modo silencio ativo</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ═══ GALERIA DE FOTOS ═══ */}
            {displayUser.gallery_photos && displayUser.gallery_photos.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-[#81D8D0]" />
                  Fotos
                </h2>
                <div className="grid grid-cols-3 gap-3">
                  {displayUser.gallery_photos.map((url, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      className="aspect-square rounded-xl overflow-hidden border border-white/10 hover:border-[#81D8D0]/30 transition-colors"
                    >
                      <img src={url} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* === SECOES SOCIAIS: Visitas + Reconhecimentos === */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Quem visitou meu perfil — so dono ve */}
              {isOwnProfile && displayUser && (
                <ProfileVisitsBadge
                  userId={displayUser.id}
                  isOwnProfile={true}
                  onNavigateToProfile={onNavigateToProfile}
                />
              )}

              {/* Reconhecimentos (depoimentos) */}
              {displayUser && (
                <div className={isOwnProfile ? "" : "md:col-span-2"}>
                  <TestimonialCard
                    targetUserId={displayUser.id}
                    currentUserId={currentUser?.id}
                    onNavigateToProfile={onNavigateToProfile}
                  />
                </div>
              )}
            </div>

            {/* Posts do Usuario */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-6">
                {isOwnProfile ? 'Seus Posts' : `Posts de ${displayUser.name}`}
              </h2>

              <div className="space-y-6">
                {isPostsLoading ? (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 border-4 border-[#81D8D0] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white/60">Carregando posts...</p>
                  </div>
                ) : displayPosts.length === 0 ? (
                  <div className="bg-white/3 border border-white/10 rounded-2xl p-12 text-center">
                    <p className="text-xl text-white/60 mb-2">
                      {isOwnProfile ? 'Voce ainda nao publicou nada' : `${displayUser.name} ainda nao publicou nada`}
                    </p>
                    <p className="text-sm text-white/40">
                      {isOwnProfile ? 'Va ao Social Hub para criar seu primeiro post!' : 'Os posts aparecerao aqui quando publicados.'}
                    </p>
                  </div>
                ) : (
                  displayPosts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      currentUserId={currentUser?.id}
                      onDelete={isOwnProfile ? refreshPosts : undefined}
                      onAuthorClick={onNavigateToProfile}
                      communityName={post.community ? communityNameMap[post.community] : undefined}
                    />
                  ))
                )}
              </div>

              {/* Botao para carregar mais posts */}
              {hasMore && (
                <div className="text-center mt-4">
                  <button
                    onClick={loadMore}
                    className="px-4 py-2 bg-[#81D8D0] rounded-xl hover:bg-[#81D8D0]/90 transition-colors shadow-lg text-black font-semibold text-sm"
                    disabled={isLoadingMore}
                  >
                    {isLoadingMore ? 'Carregando...' : 'Carregar mais'}
                  </button>
                </div>
              )}
            </div>

            {/* Zona de Perigo — Excluir Conta (apenas para o proprio perfil) */}
            {isOwnProfile && (
              <div className="mt-12 pt-8 border-t border-white/10">
                <div className="bg-[#C8102E]/5 border border-[#C8102E]/20 rounded-2xl p-6">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">Excluir minha conta</h3>
                      <p className="text-sm text-white/50">
                        Remove permanentemente sua conta e todos os dados associados.
                      </p>
                    </div>
                    <button
                      onClick={() => setIsDeleteModalOpen(true)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-[#C8102E]/20 border border-[#C8102E]/40 text-[#C8102E] rounded-xl font-semibold text-sm hover:bg-[#C8102E]/30 transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                      Excluir conta
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* Modal de Edicao de Perfil */}
      {displayUser && isOwnProfile && (
        <EditProfileModal 
          isOpen={isEditModalOpen} 
          onClose={() => setIsEditModalOpen(false)}
          currentUser={displayUser}
          onProfileUpdated={() => {
            refreshProfile();
            refreshPosts();
          }}
        />
      )}

      {/* Modal de Exclusao de Conta */}
      {displayUser && isOwnProfile && (
        <DeleteAccountModal 
          isOpen={isDeleteModalOpen} 
          onClose={() => setIsDeleteModalOpen(false)}
          userName={displayUser.name}
        />
      )}
    </div>
  );
}