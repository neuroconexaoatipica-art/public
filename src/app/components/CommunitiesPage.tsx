import { useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Users, MessageCircle, Unlock, Search } from "lucide-react";
import { useCommunitiesContext } from "../../lib";
import type { CommunityWithMeta } from "../../lib";

interface CommunitiesPageProps {
  onBack: () => void;
  onSelectCommunity?: (community: CommunityWithMeta) => void;
}

type FilterType = 'all' | 'core' | 'neuro' | 'social' | 'build';

export function CommunitiesPage({ onBack, onSelectCommunity }: CommunitiesPageProps) {
  const { communities, isLoading } = useCommunitiesContext();
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCommunities = communities.filter(c => {
    const matchesFilter = filter === 'all' || c.config.category === filter;
    const matchesSearch = searchQuery === '' ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalPosts = communities.reduce((sum, c) => sum + c.postCount, 0);

  return (
    <div className="min-h-screen bg-black">
      <div className="w-full bg-[#35363A] border-b border-white/10 sticky top-0 z-40">
        <div className="mx-auto max-w-[1100px] px-6 py-4">
          <div className="flex items-center justify-between">
            <button onClick={onBack} className="flex items-center gap-2 text-white/80 hover:text-[#81D8D0] transition-colors"><ArrowLeft className="h-5 w-5" /><span className="font-medium">Voltar</span></button>
            <h1 className="text-xl font-semibold text-white">Comunidades</h1>
            <div className="w-24"></div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1100px] px-6 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-10">
          <div className="bg-gradient-to-br from-[#35363A] to-black border border-white/10 rounded-2xl p-8 text-center">
            <Users className="h-12 w-12 text-[#81D8D0] mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4">14 Comunidades Curadas</h2>
            <p className="text-lg md:text-xl text-white/80 font-normal leading-relaxed max-w-3xl mx-auto mb-8">
              Cada comunidade tem um propósito claro e regras específicas. Não é "tudo para todos" — 
              é precisão intencional. Você não precisa estar em todas, apenas nas que fazem sentido para você.
            </p>
            <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div><p className="text-3xl font-semibold text-[#81D8D0] mb-1">14</p><p className="text-sm text-white/60">Comunidades</p></div>
              <div><p className="text-3xl font-semibold text-[#FF6B35] mb-1">{totalPosts}</p><p className="text-sm text-white/60">Posts Totais</p></div>
              <div><p className="text-3xl font-semibold text-[#C8102E] mb-1">4</p><p className="text-sm text-white/60">Categorias</p></div>
            </div>
          </div>
        </motion.div>

        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Buscar comunidade..." className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#81D8D0] focus:border-transparent" />
          </div>
        </div>

        <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-2">
          {[
            { key: 'all', label: 'Todas', count: communities.length },
            { key: 'core', label: 'Intelecto', count: communities.filter(c => c.config.category === 'core').length },
            { key: 'social', label: 'Corpo & Relações', count: communities.filter(c => c.config.category === 'social').length },
            { key: 'neuro', label: 'Neurodivergência', count: communities.filter(c => c.config.category === 'neuro').length },
            { key: 'build', label: 'Construção', count: communities.filter(c => c.config.category === 'build').length },
          ].map((f) => (
            <button key={f.key} onClick={() => setFilter(f.key as FilterType)} className={`px-5 py-2.5 rounded-xl font-semibold whitespace-nowrap transition-all ${filter === f.key ? 'bg-[#81D8D0] text-black shadow-lg' : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'}`}>
              {f.label} ({f.count})
            </button>
          ))}
        </div>

        {isLoading && (
          <div className="text-center py-16">
            <div className="w-12 h-12 border-4 border-[#81D8D0] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white/60">Carregando comunidades...</p>
          </div>
        )}

        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {filteredCommunities.map((community, index) => {
              const isActive = !community.id.startsWith('pending-') && !community.id.startsWith('local-');
              const IconComponent = community.config.icon;
              
              return (
                <motion.div
                  key={community.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  onClick={() => onSelectCommunity?.(community)}
                  className={`bg-white/3 border-2 rounded-2xl p-6 transition-all group ${onSelectCommunity ? 'cursor-pointer hover:scale-[1.02]' : ''}`}
                  style={{ borderColor: `${community.config.color}30` }}
                  whileHover={{ borderColor: `${community.config.color}60` }}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${community.config.color}20`, border: `2px solid ${community.config.color}40` }}>
                      <IconComponent className="h-6 w-6" style={{ color: community.config.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-white group-hover:text-[#81D8D0] transition-colors truncate">{community.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        {isActive ? (
                          <span className="px-2 py-0.5 rounded text-xs font-semibold" style={{ backgroundColor: `${community.config.color}20`, color: community.config.color }}>Ativa</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-white/10 text-white/50">Em breve</span>
                        )}
                        <span className="text-xs text-white/40 capitalize">{community.config.category === 'core' ? 'Intelecto' : community.config.category === 'neuro' ? 'Neuro' : community.config.category === 'build' ? 'Construção' : 'Corpo & Relações'}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-white/70 font-normal leading-relaxed mb-5 line-clamp-3">{community.description}</p>
                  <div className="flex items-center gap-4 text-sm text-white/50">
                    <div className="flex items-center gap-1.5"><MessageCircle className="h-4 w-4" /><span>{community.postCount} posts</span></div>
                    <div className="flex items-center gap-1.5"><Unlock className="h-4 w-4 text-[#81D8D0]" /><span>Aberta</span></div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="space-y-6">
          <div className="bg-[#C8102E]/10 border border-[#C8102E]/30 rounded-2xl p-6">
            <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">Regras Gerais</h3>
            <ul className="space-y-2 text-sm text-white/80 font-normal">
              <li className="flex items-start gap-2"><span className="text-[#C8102E] font-bold mt-0.5">•</span><span>Moderação ativa em todas as comunidades. Denúncias são levadas a sério.</span></li>
              <li className="flex items-start gap-2"><span className="text-[#C8102E] font-bold mt-0.5">•</span><span>Respeite limites. "Falar direto" não é desculpa para violência.</span></li>
              <li className="flex items-start gap-2"><span className="text-[#C8102E] font-bold mt-0.5">•</span><span>Não romantize caos, trauma ou autodestruição. Isso não é acolhimento.</span></li>
              <li className="flex items-start gap-2"><span className="text-[#C8102E] font-bold mt-0.5">•</span><span>Cada comunidade tem regras específicas. Leia antes de postar.</span></li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
