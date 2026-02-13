import { useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, PlusCircle, Users, MessageCircle, MessageSquarePlus, Sparkles } from "lucide-react";
import { usePosts, useProfileContext, hasAppAccess, hasModAccess } from "../../lib";
import type { CommunityWithMeta } from "../../lib";
import { PostCard } from "./PostCard";
import { CreatePostModal } from "./CreatePostModal";

interface CommunityFeedProps {
  community: CommunityWithMeta;
  onBack: () => void;
  onNavigateToProfile: (userId: string) => void;
}

export function CommunityFeed({ community, onBack, onNavigateToProfile }: CommunityFeedProps) {
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const { user } = useProfileContext();
  const canPost = hasAppAccess(user?.role);
  const canModerate = hasModAccess(user?.role);

  const isRealCommunity = !community.id.startsWith('pending-') && !community.id.startsWith('local-');

  const { posts, isLoading, refreshPosts } = usePosts(
    isRealCommunity ? { communityId: community.id } : {}
  );

  const IconComponent = community.config.icon;

  return (
    <div className="min-h-screen bg-black">
      <div className="w-full bg-[#35363A] border-b border-white/10 sticky top-0 z-40">
        <div className="mx-auto max-w-[1000px] px-6 py-4">
          <div className="flex items-center justify-between">
            <button onClick={onBack} className="flex items-center gap-2 text-white/80 hover:text-[#81D8D0] transition-colors"><ArrowLeft className="h-5 w-5" /><span className="font-medium">Comunidades</span></button>
            <div className="flex items-center gap-2"><IconComponent className="h-6 w-6" style={{ color: community.config.color }} /><h1 className="text-xl font-semibold text-white">{community.name}</h1></div>
            <div className="w-24"></div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1000px] px-6 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-8">
          <div className="border-2 rounded-2xl p-8 relative overflow-hidden" style={{ borderColor: `${community.config.color}40`, background: `linear-gradient(135deg, ${community.config.color}15, transparent)` }}>
            <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: `${community.config.color}20`, border: `2px solid ${community.config.color}40` }}>
              <IconComponent className="h-8 w-8" style={{ color: community.config.color }} />
            </div>
            <h2 className="text-3xl font-semibold text-white mb-3">{community.name}</h2>
            <p className="text-lg text-white/80 font-normal leading-relaxed mb-6 max-w-2xl">{community.description}</p>
            <div className="flex items-center gap-6 mb-6">
              <div className="flex items-center gap-2 text-white/70"><MessageCircle className="h-5 w-5" style={{ color: community.config.color }} /><span className="font-medium">{community.postCount} posts</span></div>
            </div>
            {isRealCommunity && user && canPost && (
              <button onClick={() => setIsCreatePostOpen(true)} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all hover:scale-[1.02]" style={{ backgroundColor: community.config.color, color: '#000' }}>
                <PlusCircle className="h-5 w-5" />Criar post nesta comunidade
              </button>
            )}
            {!isRealCommunity && (
              <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl inline-block"><p className="text-sm text-white/60">Esta comunidade será ativada em breve. Fique atento(a)!</p></div>
            )}
          </div>
        </motion.div>

        <div>
          <h3 className="text-xl font-semibold text-white mb-6">Posts da Comunidade</h3>
          <div className="space-y-6">
            {isLoading ? (
              <div className="text-center py-12"><div className="w-12 h-12 border-4 border-[#81D8D0] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div><p className="text-white/60">Carregando posts...</p></div>
            ) : posts.length === 0 ? (
              <div className="space-y-6">
                <div className="border-2 rounded-2xl p-8 md:p-10 text-center" style={{ borderColor: `${community.config.color}30`, background: `linear-gradient(180deg, ${community.config.color}08, transparent)` }}>
                  <div className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-5" style={{ backgroundColor: `${community.config.color}20` }}>
                    <IconComponent className="h-8 w-8" style={{ color: community.config.color }} />
                  </div>
                  <h3 className="text-2xl font-semibold text-white mb-3">{isRealCommunity ? 'Esta conversa está esperando por você' : 'Comunidade em preparação'}</h3>
                  <p className="text-base text-white/60 mb-6 max-w-lg mx-auto">{isRealCommunity ? 'Nenhum post ainda. As melhores comunidades começam com uma pessoa que decide falar primeiro.' : 'Em breve esta comunidade estará ativa. Fique atento(a)!'}</p>
                  {isRealCommunity && user && canPost && (
                    <button onClick={() => setIsCreatePostOpen(true)} className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold transition-all hover:scale-[1.02] text-lg" style={{ backgroundColor: community.config.color, color: '#fff' }}>
                      <MessageSquarePlus className="h-5 w-5" />Iniciar a conversa
                    </button>
                  )}
                </div>
                {community.config.starters && community.config.starters.length > 0 && (
                  <div className="bg-white/3 border border-white/10 rounded-2xl p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-5"><Sparkles className="h-5 w-5" style={{ color: community.config.color }} /><h4 className="text-lg font-semibold text-white">Sugestões para começar</h4></div>
                    <div className="space-y-3">
                      {community.config.starters.map((starter, idx) => (
                        <button key={idx} onClick={() => { if (canPost) setIsCreatePostOpen(true); }} className={`w-full text-left p-4 rounded-xl border transition-all group ${canPost ? 'border-white/10 hover:border-white/20 hover:bg-white/5 cursor-pointer' : 'border-white/5 cursor-default'}`}>
                          <div className="flex items-start gap-3">
                            <span className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5" style={{ backgroundColor: `${community.config.color}20`, color: community.config.color }}>{idx + 1}</span>
                            <p className="text-white/80 text-base leading-relaxed group-hover:text-white transition-colors">"{starter}"</p>
                          </div>
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-white/30 mt-4 text-center">Clique em uma sugestão para criar seu post</p>
                  </div>
                )}
              </div>
            ) : (
              posts.map((post) => (
                <PostCard key={post.id} post={post} currentUserId={user?.id} canModerate={canModerate} onDelete={refreshPosts} onAuthorClick={onNavigateToProfile} communityName={community.name} />
              ))
            )}
          </div>
        </div>
      </div>

      <CreatePostModal isOpen={isCreatePostOpen} onClose={() => setIsCreatePostOpen(false)} onPostCreated={refreshPosts} defaultCommunityId={isRealCommunity ? community.id : null} />
    </div>
  );
}
