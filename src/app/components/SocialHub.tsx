import { useState } from "react";
import { motion } from "motion/react";
import { Home, Users, Calendar, User, Settings, Bell, Search, PlusCircle, LogOut } from "lucide-react";
import { LogoIcon } from "./LogoIcon";
import { CreatePostModal } from "./CreatePostModal";
import { PostCard } from "./PostCard";
import { UserAvatar } from "./UserAvatar";
import { usePosts, hasAppAccess, hasModAccess, useProfileContext, useCommunitiesContext, supabase } from "../../lib";

interface SocialHubProps {
  onNavigateToProfile: () => void;
  onNavigateToCommunities: () => void;
  onNavigateToFeed: () => void;
  onNavigateToUserProfile?: (userId: string) => void;
}

export function SocialHub({ onNavigateToProfile, onNavigateToCommunities, onNavigateToFeed, onNavigateToUserProfile }: SocialHubProps) {
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const { posts, isLoading, refreshPosts } = usePosts(false);
  const { user } = useProfileContext();
  const { communities } = useCommunitiesContext();
  const canPost = hasAppAccess(user?.role);
  const canModerate = hasModAccess(user?.role);
  const communityNameMap: Record<string, string> = {};
  communities.forEach(c => { communityNameMap[c.id] = c.name; });

  const handleLogout = async () => { await supabase.auth.signOut(); };
  const handleAuthorClick = (userId: string) => { if (userId === user?.id) onNavigateToProfile(); else if (onNavigateToUserProfile) onNavigateToUserProfile(userId); };

  return (
    <div className="min-h-screen bg-black">
      <header className="w-full bg-[#35363A] border-b border-white/10 sticky top-0 z-40">
        <div className="mx-auto max-w-[1200px] px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3"><LogoIcon size={40} className="h-10 w-10" /><h1 className="text-xl font-semibold text-white hidden sm:block">NeuroConexão Atípica</h1></div>
            <div className="flex-1 max-w-md mx-8 hidden md:block"><div className="relative opacity-50"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" /><input type="text" placeholder="Busca em breve..." disabled className="w-full pl-10 pr-4 py-2.5 bg-black/30 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none cursor-not-allowed" /></div></div>
            <div className="flex items-center gap-3">
              <button className="relative p-2 hover:bg-white/5 rounded-lg transition-colors"><Bell className="h-6 w-6 text-white/80" /></button>
              <button onClick={onNavigateToProfile}><UserAvatar name={user?.name || ''} photoUrl={user?.profile_photo} size="md" /></button>
              <button onClick={handleLogout} className="p-2 hover:bg-white/5 rounded-lg transition-colors" title="Sair"><LogOut className="h-6 w-6 text-white/80" /></button>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1200px] px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <aside className="md:col-span-1">
            <div className="bg-white/3 border border-white/10 rounded-2xl p-6 sticky top-24">
              {user && (<div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/10"><UserAvatar name={user.name} photoUrl={user.profile_photo} size="lg" onClick={onNavigateToProfile} /><div className="flex-1 min-w-0"><p className="font-semibold text-white truncate">{user.name}</p><p className="text-sm text-[#81D8D0]">@{user.name.toLowerCase().replace(/\s+/g, '')}</p></div></div>)}
              <nav className="space-y-2">
                <button onClick={onNavigateToFeed} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#81D8D0]/20 rounded-xl transition-colors text-white group"><Home className="h-5 w-5 text-[#81D8D0]" /><span className="font-medium">Início / Feed</span></button>
                <button onClick={onNavigateToCommunities} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#81D8D0]/20 rounded-xl transition-colors text-white group"><Users className="h-5 w-5 text-[#81D8D0]" /><span className="font-medium">Comunidades</span></button>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/40 cursor-not-allowed"><Calendar className="h-5 w-5 text-white/30" /><span className="font-medium">Eventos & Lives</span><span className="ml-auto text-xs text-white/30 font-normal">Em breve</span></button>
                <button onClick={onNavigateToProfile} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#81D8D0]/20 rounded-xl transition-colors text-white group"><User className="h-5 w-5 text-[#81D8D0]" /><span className="font-medium">Meu Perfil</span></button>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/40 cursor-not-allowed"><Settings className="h-5 w-5 text-white/30" /><span className="font-medium">Configurações</span><span className="ml-auto text-xs text-white/30 font-normal">Em breve</span></button>
              </nav>
              <div className="mt-6 pt-6 border-t border-white/10">
                {canPost ? (<div className="bg-gradient-to-br from-[#81D8D0]/20 to-[#C8102E]/20 border border-[#81D8D0]/30 rounded-xl p-4"><p className="text-xs font-semibold text-[#81D8D0] uppercase tracking-wide mb-2">Status</p><p className="text-sm font-bold text-white mb-1">Membro Ativo</p><p className="text-xs text-white/60">Acesso completo a todas as comunidades</p></div>) : (<div className="bg-gradient-to-br from-[#FF6B35]/20 to-[#C8102E]/20 border border-[#FF6B35]/30 rounded-xl p-4"><p className="text-xs font-semibold text-[#FF6B35] uppercase tracking-wide mb-2">Status</p><p className="text-sm font-bold text-white mb-1">Acesso Beta</p><p className="text-xs text-white/60 mb-3">Você pode explorar o espaço. Para participar das conversas, solicite acesso.</p><button onClick={() => window.open('mailto:contato@neuroconexaoatipica.com.br?subject=Quero ser membro da NeuroConexão Atípica', '_blank')} className="w-full py-2.5 bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white rounded-lg transition-colors font-bold text-sm">Quero ser membro</button></div>)}
              </div>
            </div>
          </aside>

          <main className="md:col-span-2">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="bg-gradient-to-br from-[#35363A] to-black border border-white/10 rounded-2xl p-8 mb-6">
                <h2 className="text-3xl font-semibold text-white mb-3">Bem-vindo(a) {user?.name}</h2>
                <p className="text-lg text-white/70 font-normal leading-relaxed mb-6">Este é o Social Hub da NeuroConexão Atípica. Compartilhe, conecte-se e participe.</p>
                {canPost && (<button onClick={() => setIsCreatePostOpen(true)} className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-[#81D8D0] hover:bg-[#81D8D0]/90 text-black rounded-xl transition-colors font-bold"><PlusCircle className="h-5 w-5" />Criar novo post</button>)}
              </div>
              <div className="space-y-6">
                {isLoading ? (<div className="text-center py-12"><div className="w-12 h-12 border-4 border-[#81D8D0] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div><p className="text-white/60">Carregando posts...</p></div>) : posts.length === 0 ? (<div className="bg-white/3 border border-white/10 rounded-2xl p-12 text-center"><p className="text-xl text-white/60 mb-4">Ainda não há posts por aqui</p><p className="text-sm text-white/40 mb-6">Seja o primeiro a compartilhar algo!</p>{canPost && (<button onClick={() => setIsCreatePostOpen(true)} className="inline-flex items-center gap-2 px-6 py-3 bg-[#81D8D0] hover:bg-[#81D8D0]/90 text-black rounded-xl transition-colors font-bold"><PlusCircle className="h-5 w-5" />Criar primeiro post</button>)}</div>) : (posts.map((post) => (<PostCard key={post.id} post={post} currentUserId={user?.id} canModerate={canModerate} onDelete={refreshPosts} onAuthorClick={handleAuthorClick} communityName={post.community ? communityNameMap[post.community] : undefined} />)))}
              </div>
            </motion.div>
          </main>
        </div>
      </div>
      <CreatePostModal isOpen={isCreatePostOpen} onClose={() => setIsCreatePostOpen(false)} onPostCreated={refreshPosts} />
    </div>
  );
}
