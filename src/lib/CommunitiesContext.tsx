import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { supabase } from './supabase';
import { TIMEOUTS } from './supabase';
import type { Community } from './supabase';
import { COMMUNITIES_CONFIG, COMMUNITY_BY_NAME, FALLBACK_ICON } from './communitiesConfig';
import type { CommunityConfig } from './communitiesConfig';

// Mapeamento de nomes antigos do banco → nomes atuais do config
const NAME_ALIASES: Record<string, string> = {
  'Zona de Intensidade': 'Mentes em Tensão',
};

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

      // Timeout de 20s para cobrir cold start
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Timeout communities')), TIMEOUTS.SAFETY_NET)
      );

      const queryPromise = supabase
        .from('communities')
        .select('*')
        .order('name');

      const { data: dbCommunities, error } = await Promise.race([queryPromise, timeoutPromise]) as any;

      if (error) {
        console.error('Erro ao buscar comunidades:', error);
        const fallback = COMMUNITIES_CONFIG.map((config, i) => ({
          id: `local-${i}`,
          name: config.name,
          description: config.description,
          is_public: true,
          creator: null,
          created_at: new Date().toISOString(),
          owner_id: null,
          manifesto_text: '',
          needs_moderator: true,
          ritual_enabled: false,
          is_featured: false,
          max_members: 0,
          requires_approval: false,
          config,
          postCount: 0
        }));
        setCommunities(fallback);
        return;
      }

      // Contagem otimizada: apenas conta por community_id usando head:true + count
      // Não puxa todos os posts — só a contagem
      let countMap: Record<string, number> = {};
      if (dbCommunities && dbCommunities.length > 0) {
        try {
          // Uma query de count por comunidade — mais leve que puxar todos os posts
          const countPromises = dbCommunities.map(async (c: Community) => {
            const { count } = await supabase
              .from('posts')
              .select('*', { count: 'exact', head: true })
              .eq('community', c.id);
            return { id: c.id, count: count || 0 };
          });
          // Limite de 15s para contagem — se não conseguir, segue com 0
          const counts = await Promise.race([
            Promise.all(countPromises),
            new Promise<{ id: string; count: number }[]>((resolve) =>
              setTimeout(() => resolve([]), 15000)
            ),
          ]);
          counts.forEach((c) => { countMap[c.id] = c.count; });
        } catch {
          // Contagem falhou — seguir com count = 0
        }
      }

      const merged: CommunityWithMeta[] = [];

      if (dbCommunities && dbCommunities.length > 0) {
        dbCommunities.forEach((dbComm: Community) => {
          const resolvedName = NAME_ALIASES[dbComm.name] || dbComm.name;
          const config = COMMUNITY_BY_NAME[resolvedName] || COMMUNITY_BY_NAME[dbComm.name] || {
            name: dbComm.name,
            description: dbComm.description,
            icon: FALLBACK_ICON,
            color: '#81D8D0',
            category: 'core' as const,
            status: 'awaiting_founder' as const,
            moderatedByMila: false,
          };
          merged.push({
            ...dbComm,
            name: resolvedName,
            config,
            postCount: countMap[dbComm.id] || 0
          });
        });

        const dbNames = new Set(dbCommunities.map((c: Community) => c.name));
        const dbResolvedNames = new Set(dbCommunities.map((c: Community) => NAME_ALIASES[c.name] || c.name));
        COMMUNITIES_CONFIG.forEach((config, i) => {
          if (!dbNames.has(config.name) && !dbResolvedNames.has(config.name)) {
            merged.push({
              id: `pending-${i}`,
              name: config.name,
              description: config.description,
              is_public: true,
              creator: null,
              created_at: new Date().toISOString(),
              owner_id: null,
              manifesto_text: '',
              needs_moderator: true,
              ritual_enabled: false,
              is_featured: false,
              max_members: 0,
              requires_approval: false,
              config,
              postCount: 0
            });
          }
        });
      } else {
        COMMUNITIES_CONFIG.forEach((config, i) => {
          merged.push({
            id: `pending-${i}`,
            name: config.name,
            description: config.description,
            is_public: true,
            creator: null,
            created_at: new Date().toISOString(),
            owner_id: null,
            manifesto_text: '',
            needs_moderator: true,
            ritual_enabled: false,
            is_featured: false,
            max_members: 0,
            requires_approval: false,
            config,
            postCount: 0
          });
        });
      }

      setCommunities(merged);
    } catch (err) {
      console.error('Erro ao carregar comunidades:', err);
      const fallback = COMMUNITIES_CONFIG.map((config, i) => ({
        id: `local-${i}`,
        name: config.name,
        description: config.description,
        is_public: true,
        creator: null,
        created_at: new Date().toISOString(),
        owner_id: null,
        manifesto_text: '',
        needs_moderator: true,
        ritual_enabled: false,
        is_featured: false,
        max_members: 0,
        requires_approval: false,
        config,
        postCount: 0
      }));
      setCommunities(fallback);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCommunities();
  }, [loadCommunities]);

  const getCommunityById = useCallback((id: string) => {
    return communities.find(c => c.id === id);
  }, [communities]);

  const getCommunityByName = useCallback((name: string) => {
    return communities.find(c => c.name === name);
  }, [communities]);

  return (
    <CommunitiesContext.Provider value={{
      communities,
      isLoading,
      refreshCommunities: loadCommunities,
      getCommunityById,
      getCommunityByName
    }}>
      {children}
    </CommunitiesContext.Provider>
  );
}

// Fallback seguro para HMR / contexto não disponível
const FALLBACK_COMMUNITIES_CONTEXT: CommunitiesContextValue = {
  communities: [],
  isLoading: true,
  refreshCommunities: async () => {},
  getCommunityById: () => undefined,
  getCommunityByName: () => undefined,
};

export function useCommunitiesContext(): CommunitiesContextValue {
  const ctx = useContext(CommunitiesContext);
  if (!ctx) {
    console.warn('[CommunitiesContext] Contexto não encontrado — usando fallback (isLoading: true)');
    return FALLBACK_COMMUNITIES_CONTEXT;
  }
  return ctx;
}