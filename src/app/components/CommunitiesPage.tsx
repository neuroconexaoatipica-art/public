import { useState } from 'react';
import { useCommunitiesContext } from '../../lib';
import type { CommunityWithMeta } from '../../lib';

interface Props {
  onBack: () => void;
  onSelectCommunity: (community: CommunityWithMeta) => void;
}

export function CommunitiesPage({ onBack, onSelectCommunity }: Props) {
  const { communities, isLoading } = useCommunitiesContext();
  const [filter, setFilter] = useState<'all' | 'core' | 'social' | 'neuro' | 'build'>('all');
  const [search, setSearch] = useState('');

  const filtered = communities.filter(c => {
    if (filter !== 'all' && c.config.category !== filter) return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const categories = [
    { key: 'all', label: 'Todas' },
    { key: 'core', label: 'Essenciais' },
    { key: 'social', label: 'Social' },
    { key: 'neuro', label: 'Neuro' },
    { key: 'build', label: 'Construcao' },
  ];

  return (
    <div className="min-h-screen bg-black">
      <header className="sticky top-0 z-40 bg-black/95 backdrop-blur border-b border-white/10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={onBack} className="text-[#81D8D0] hover:underline text-sm">← Voltar</button>
          <h1 className="text-white font-semibold">Comunidades</h1>
          <span className="text-white/40 text-sm">({communities.length})</span>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Search */}
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar comunidade..."
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#81D8D0]/50 mb-4" />

        {/* Category pills */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {categories.map(cat => (
            <button key={cat.key} onClick={() => setFilter(cat.key as any)}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap border transition-colors ${filter === cat.key ? 'bg-[#81D8D0] text-black border-[#81D8D0]' : 'bg-white/5 text-white/60 border-white/10 hover:text-white'}`}>
              {cat.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="text-center py-12"><div className="w-8 h-8 border-2 border-[#81D8D0] border-t-transparent rounded-full animate-spin mx-auto"></div></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map(c => {
              const Icon = c.config.icon;
              return (
                <div key={c.id} onClick={() => onSelectCommunity(c)}
                  className="bg-white/5 border border-white/10 rounded-2xl p-5 cursor-pointer hover:bg-white/8 hover:border-white/20 transition-colors group">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: c.config.color + '20' }}>
                      <Icon className="w-5 h-5" style={{ color: c.config.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold group-hover:text-[#81D8D0] transition-colors">{c.name}</h3>
                      <p className="text-white/50 text-sm line-clamp-2 mt-1">{c.description}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-white/30">
                        <span>{c.postCount} posts</span>
                        <span className="capitalize">{c.config.category}</span>
                        {c.id.startsWith('pending-') && <span className="text-amber-400">Em breve</span>}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
