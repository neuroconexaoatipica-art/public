import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Calendar, Edit, Users, Trash2 } from "lucide-react";
import { useProfileContext, usePosts, supabase, useCommunitiesContext } from "../../lib";
import type { User } from "../../lib";
import { EditProfileModal } from "./EditProfileModal";
import { DeleteAccountModal } from "./DeleteAccountModal";
import { PostCard } from "./PostCard";
import { UserAvatar } from "./UserAvatar";

interface ProfileMilaProps {
  onBack: () => void;
  viewUserId?: string | null; // Se fornecido, mostra perfil de OUTRO usuário
  onNavigateToProfile?: (userId: string) => void;
}

export function ProfileMila({ onBack, viewUserId, onNavigateToProfile }: ProfileMilaProps) {
  const { user: currentUser, isLoading: currentLoading, refreshProfile } = useProfileContext();
  const [viewedUser, setViewedUser] = useState<User | null>(null);
  const [isLoadingViewed, setIsLoadingViewed] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { communities } = useCommunitiesContext();

  // Mapa de ID → nome da comunidade (para exibir nos posts)
  const communityNameMap: Record<string, string> = {};
  communities.forEach(c => { communityNameMap[c.id] = c.name; });

  // Determinar se estamos vendo NOSSO perfil ou de OUTRO usuário
  const isOwnProfile = !viewUserId || viewUserId === currentUser?.id;
  const displayUser = isOwnProfile ? currentUser : viewedUser;
  const isLoading = isOwnProfile ? currentLoading : isLoadingViewed;

  // ID seguro para buscar posts — só busca quando temos um ID válido
  const safeAuthorId = displayUser?.id || null;

  // Carregar posts do usuário exibido (só quando temos ID válido)
  const { posts, isLoading: postsLoading, isLoadingMore, hasMore, loadMore, refreshPosts } = usePosts(
    safeAuthorId ? { authorId: safeAuthorId } : { authorId: '__skip__' }
  );

  // Filtrar posts quando authorId é __skip__ (hook não carrega nada útil)
  const displayPosts = safeAuthorId ? posts : [];
  const isPostsLoading = safeAuthorId ? postsLoading : false;

  // Carregar perfil de outro usuário
  useEffect(() => {
    if (viewUserId && viewUserId !== currentUser?.id) {
      loadViewedUser(viewUserId);
    }
  }, [viewUserId, currentUser?.id]);

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
      const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
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

      {/* Conteúdo do Perfil */}
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

              {/* Informações do Perfil */}
              <div className="px-8 pb-8">
                {/* Foto de Perfil */}
                <div className="relative -mt-16 mb-6 flex items-end gap-4">
                  <div className="w-32 h-32 rounded-full border-4 border-black overflow-hidden flex-shrink-0">
                    <UserAvatar
                      name={displayUser.name}
                      photoUrl={displayUser.profile_photo}
                      size="xl"
                      className="!w-full !h-full !rounded-none"
                    />
                  </div>
                  
                  {isOwnProfile && (
                    <button 
                      className="mb-2 px-4 py-2 bg-[#81D8D0] rounded-xl hover:bg-[#81D8D0]/90 transition-colors shadow-lg flex items-center gap-2 text-black font-semibold text-sm" 
                      onClick={() => setIsEditModalOpen(true)}
                    >
                      <Edit className="h-4 w-4" />
                      Editar perfil
                    </button>
                  )}
                </div>

                {/* Nome e Bio */}
                <div className="mb-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h1 className="text-3xl font-semibold text-white mb-1">
                        {displayUser.name}
                      </h1>
                      <p className="text-lg text-[#81D8D0] font-medium">
                        @{displayUser.name.toLowerCase().replace(/\s+/g, '')} · {getRoleLabel(displayUser.role)}
                      </p>
                    </div>
                    {(displayUser.role === 'founder' || displayUser.role === 'admin') && (
                      <span className="px-4 py-2 bg-[#81D8D0]/20 border border-[#81D8D0]/40 rounded-full text-sm font-semibold text-[#81D8D0]">
                        {displayUser.role === 'founder' ? 'Fundadora' : 'Admin'}
                      </span>
                    )}
                  </div>

                  {/* Bio do usuário */}
                  <div className="space-y-4 text-base text-white/90 font-normal leading-relaxed mb-4">
                    {displayUser.bio ? (
                      <p className="whitespace-pre-wrap">{displayUser.bio}</p>
                    ) : isOwnProfile ? (
                      <p className="text-white/50 italic">
                        Você ainda não adicionou uma bio. Clique em "Editar perfil" para contar um pouco sobre você.
                      </p>
                    ) : (
                      <p className="text-white/50 italic">
                        Este membro ainda não adicionou uma bio.
                      </p>
                    )}
                  </div>

                  {/* Badges/Tags */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    <span className="px-3 py-1.5 bg-[#81D8D0]/20 border border-[#81D8D0]/40 rounded-lg text-sm font-medium text-white">
                      {getRoleLabel(displayUser.role)}
                    </span>
                    {displayUser.role === 'founder' && (
                      <>
                        <span className="px-3 py-1.5 bg-[#FF6B35]/20 border border-[#FF6B35]/40 rounded-lg text-sm font-medium text-white">
                          Moderadora
                        </span>
                        <span className="px-3 py-1.5 bg-[#C8102E]/20 border border-[#C8102E]/40 rounded-lg text-sm font-medium text-white">
                          Curadoria Ética
                        </span>
                      </>
                    )}
                  </div>

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
                  </div>
                </div>
              </div>
            </div>

            {/* Posts do Usuário */}
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
                      {isOwnProfile ? 'Você ainda não publicou nada' : `${displayUser.name} ainda não publicou nada`}
                    </p>
                    <p className="text-sm text-white/40">
                      {isOwnProfile ? 'Vá ao Social Hub para criar seu primeiro post!' : 'Os posts aparecerão aqui quando publicados.'}
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

              {/* Botão para carregar mais posts */}
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

            {/* Zona de Perigo — Excluir Conta (apenas para o próprio perfil) */}
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

      {/* Modal de Edição de Perfil */}
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

      {/* Modal de Exclusão de Conta */}
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