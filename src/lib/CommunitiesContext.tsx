import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { supabase } from './supabase';
import type { Community } from './supabase';
import { COMMUNITIES_CONFIG, COMMUNITY_BY_NAME, FALLBACK_ICON } from './communitiesConfig';
import type { CommunityConfig } from './communitiesConfig';

const NAME_ALIASES: Record<string, string> = { 'Zona de Intensidade': 'Mentes em Tensão' };

export interface CommunityWithMeta extends Community {
  config: CommunityConfig;
  postCount: number;
}

interface CommunitiesContextValue {
  communities: CommunityWithMeta[];
  isLoading: boolean;
  refreshCommunities: () => Promise<void>;
  getCommunityById: (id: string) => CommunityWithMeta | undefined;
  getCommunityByName: (name: string) => CommunityWithMeta | undefined;
}

const CommunitiesContext = createContext<CommunitiesContextValue | null>(null);

export function CommunitiesProvider({ children }: { children: ReactNode }) {
  const [communities, setCommunities] = useState<CommunityWithMeta[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadCommunities = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data: dbCommunities, error } = await supabase.from('communities').select('*').order('name');
      if (error) {
        console.error('Erro ao buscar comunidades:', error);
        const fallback = COMMUNITIES_CONFIG.map((config, i) => ({ id: `local-${i}`, name: config.name, description: config.description, is_public: true, creator: null, created_at: new Date().toISOString(), config, postCount: 0 }));
        setCommunities(fallback); return;
      }
      let countMap: Record<string, number> = {};
      try {
        const { data: postCounts } = await supabase.from('posts').select('community').not('community', 'is', null);
        if (postCounts) { postCounts.forEach((p: { community: string | null }) => { if (p.community) { countMap[p.community] = (countMap[p.community] || 0) + 1; } }); }
      } catch {}
      const merged: CommunityWithMeta[] = [];
      if (dbCommunities && dbCommunities.length > 0) {
        dbCommunities.forEach((dbComm: Community) => {
          const resolvedName = NAME_ALIASES[dbComm.name] || dbComm.name;
          const config = COMMUNITY_BY_NAME[resolvedName] || COMMUNITY_BY_NAME[dbComm.name] || { name: dbComm.name, description: dbComm.description, icon: FALLBACK_ICON, color: '#81D8D0', category: 'core' as const };
          merged.push({ ...dbComm, name: resolvedName, config, postCount: countMap[dbComm.id] || 0 });
        });
        const dbNames = new Set(dbCommunities.map((c: Community) => c.name));
        const dbResolvedNames = new Set(dbCommunities.map((c: Community) => NAME_ALIASES[c.name] || c.name));
        COMMUNITIES_CONFIG.forEach((config, i) => {
          if (!dbNames.has(config.name) && !dbResolvedNames.has(config.name)) {
            merged.push({ id: `pending-${i}`, name: config.name, description: config.description, is_public: true, creator: null, created_at: new Date().toISOString(), config, postCount: 0 });
          }
        });
      } else {
        COMMUNITIES_CONFIG.forEach((config, i) => { merged.push({ id: `pending-${i}`, name: config.name, description: config.description, is_public: true, creator: null, created_at: new Date().toISOString(), config, postCount: 0 }); });
      }
      setCommunities(merged);
    } catch (err) {
      console.error('Erro ao carregar comunidades:', err);
      const fallback = COMMUNITIES_CONFIG.map((config, i) => ({ id: `local-${i}`, name: config.name, description: config.description, is_public: true, creator: null, created_at: new Date().toISOString(), config, postCount: 0 }));
      setCommunities(fallback);
    } finally { setIsLoading(false); }
  }, []);

  useEffect(() => { loadCommunities(); }, [loadCommunities]);

  const getCommunityById = useCallback((id: string) => communities.find(c => c.id === id), [communities]);
  const getCommunityByName = useCallback((name: string) => communities.find(c => c.name === name), [communities]);

  return (
    <CommunitiesContext.Provider value={{ communities, isLoading, refreshCommunities: loadCommunities, getCommunityById, getCommunityByName }}>
      {children}
    </CommunitiesContext.Provider>
  );
}

export function useCommunitiesContext(): CommunitiesContextValue {
  const ctx = useContext(CommunitiesContext);
  if (!ctx) { throw new Error('useCommunitiesContext deve ser usado dentro de <CommunitiesProvider>'); }
  return ctx;
}
