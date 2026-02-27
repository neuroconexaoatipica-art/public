import { useState, useEffect } from 'react';
import { supabase } from './supabase';
import type { Community } from './supabase';
import { COMMUNITIES_CONFIG, COMMUNITY_BY_NAME } from './communitiesConfig';
import { FALLBACK_ICON } from './communitiesConfig';
import type { CommunityConfig } from './communitiesConfig';

// Mapeamento de nomes antigos do banco → nomes atuais do config
// Evita duplicatas quando o SQL de rename ainda não foi executado
const NAME_ALIASES: Record<string, string> = {
  'Zona de Intensidade': 'Mentes em Tensão',
};

export interface CommunityWithMeta extends Community {
  config: CommunityConfig;
  postCount: number;
}

export function useCommunities() {
  const [communities, setCommunities] = useState<CommunityWithMeta[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadCommunities = async () => {
    try {
      setIsLoading(true);

      // Buscar comunidades do banco
      const { data: dbCommunities, error } = await supabase
        .from('communities')
        .select('*')
        .order('name');

      if (error) {
        console.error('Erro ao buscar comunidades:', error);
        // Fallback: usar config local
        const fallback = COMMUNITIES_CONFIG.map((config, i) => ({
          id: `local-${i}`,
          name: config.name,
          description: config.description,
          is_public: true,
          creator: null,
          created_at: new Date().toISOString(),
          config,
          postCount: 0
        }));
        setCommunities(fallback);
        return;
      }

      // Buscar contagem de posts por comunidade (separado, falha não bloqueia)
      let countMap: Record<string, number> = {};
      try {
        const { data: postCounts } = await supabase
          .from('posts')
          .select('community')
          .not('community', 'is', null);

        if (postCounts) {
          postCounts.forEach((p: { community: string | null }) => {
            if (p.community) {
              countMap[p.community] = (countMap[p.community] || 0) + 1;
            }
          });
        }
      } catch (countErr) {
        // Contagem falhou — seguir com count = 0
        console.warn('Erro ao contar posts por comunidade:', countErr);
      }

      // Merge: DB communities + config
      const merged: CommunityWithMeta[] = [];

      if (dbCommunities && dbCommunities.length > 0) {
        dbCommunities.forEach((dbComm: Community) => {
          // Resolver alias: se o banco tem nome antigo, usar config do nome novo
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
            // Se tem alias, mostrar o nome novo na UI
            name: resolvedName,
            config,
            postCount: countMap[dbComm.id] || 0
          });
        });

        // Adicionar comunidades do config que NÃO existem no banco
        // Considerar aliases: se DB tem "Zona de Intensidade", config "Mentes em Tensão" já foi coberto
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
              config,
              postCount: 0
            });
          }
        });
      } else {
        // Nenhuma comunidade no banco, usar todas do config
        COMMUNITIES_CONFIG.forEach((config, i) => {
          merged.push({
            id: `pending-${i}`,
            name: config.name,
            description: config.description,
            is_public: true,
            creator: null,
            created_at: new Date().toISOString(),
            config,
            postCount: 0
          });
        });
      }

      setCommunities(merged);
    } catch (err) {
      console.error('Erro ao carregar comunidades:', err);
      // Fallback final: usar config local para nunca travar
      const fallback = COMMUNITIES_CONFIG.map((config, i) => ({
        id: `local-${i}`,
        name: config.name,
        description: config.description,
        is_public: true,
        creator: null,
        created_at: new Date().toISOString(),
        config,
        postCount: 0
      }));
      setCommunities(fallback);
    } finally {
      // SEMPRE liberar loading, sem exceção
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCommunities();
  }, []);

  const getCommunityById = (id: string): CommunityWithMeta | undefined => {
    return communities.find(c => c.id === id);
  };

  const getCommunityByName = (name: string): CommunityWithMeta | undefined => {
    return communities.find(c => c.name === name);
  };

  return {
    communities,
    isLoading,
    refreshCommunities: loadCommunities,
    getCommunityById,
    getCommunityByName
  };
}