import { motion } from "motion/react";
import { ArrowLeft, TrendingUp, Clock } from "lucide-react";
import { usePosts, useCommunitiesContext } from "../../lib";
import { PostCard } from "./PostCard";

interface FeedPublicoProps {
  onBack: () => void;
  onNavigateToProfile?: (userId: string) => void;
}

export function FeedPublico({ onBack, onNavigateToProfile }: FeedPublicoProps) {
  const { posts, isLoading } = usePosts({ isPublicFeed: true });
  const { communities } = useCommunitiesContext();
  const communityNameMap: Record<string, string> = {};
  communities.forEach(c => { communityNameMap[c.id] = c.name; });

  return (
    <div className="min-h-screen bg-black">
      <div className="w-full bg-[#35363A] border-b border-white/10 sticky top-0 z-40">
        <div className="mx-auto max-w-[900px] px-6 py-4">
          <div className="flex items-center justify-between">
            <button onClick={onBack} className="flex items-center gap-2 text-white/80 hover:text-[#81D8D0] transition-colors"><ArrowLeft className="h-5 w-5" /><span className="font-medium">Voltar</span></button>
            <h1 className="text-xl font-semibold text-white">Feed Público</h1>
            <div className="w-24"></div>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-[900px] px-6 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-8">
          <div className="bg-gradient-to-br from-[#35363A] to-black border border-white/10 rounded-2xl p-8">
            <h2 className="text-2xl font-semibold text-white mb-3">Feed Público</h2>
            <p className="text-lg text-white/80 font-normal leading-relaxed mb-4">Aqui você vê posts públicos da NeuroConexão Atípica. Membros têm acesso a muito mais: comunidades privadas, eventos exclusivos, e conexão direta com outras mentes intensas.</p>
          </div>
        </motion.div>
        <div className="space-y-6">
          {isLoading ? (<div className="text-center py-12"><div className="w-12 h-12 border-4 border-[#81D8D0] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div><p className="text-white/60">Carregando posts...</p></div>) : posts.length === 0 ? (<div className="bg-white/3 border border-white/10 rounded-2xl p-12 text-center"><p className="text-xl text-white/60 mb-2">Nenhum post público ainda</p><p className="text-sm text-white/40">Os membros começarão a compartilhar conteúdo em breve.</p></div>) : (posts.map((post) => (<PostCard key={post.id} post={post} onAuthorClick={onNavigateToProfile} communityName={post.community ? communityNameMap[post.community] : undefined} />)))}
        </div>
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mt-12 bg-gradient-to-br from-[#81D8D0]/20 to-[#C8102E]/20 border border-[#81D8D0]/30 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-semibold text-white mb-3">Quer participar da conversa?</h3>
          <p className="text-lg text-white/80 font-normal mb-6">Membros podem criar posts e participar de todas as comunidades. Entre inteiro(a) neste espaço.</p>
        </motion.div>
      </div>
    </div>
  );
}
