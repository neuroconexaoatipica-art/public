import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, X, Users, FileText, User, Loader2 } from "lucide-react";
import { supabase } from "../../lib/supabase";

interface SearchResult {
  result_type: string;
  result_id: string;
  result_title: string;
  result_preview: string;
  result_score: number;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToProfile?: (userId: string) => void;
  onNavigateToCommunity?: (communityId: string) => void;
}

const TYPE_LABELS: Record<string, string> = {
  post: "Post",
  community: "Comunidade",
  user: "Membro",
};

const TYPE_ICONS: Record<string, typeof Search> = {
  post: FileText,
  community: Users,
  user: User,
};

const TYPE_COLORS: Record<string, string> = {
  post: "#81D8D0",
  community: "#FF6B35",
  user: "#C8102E",
};

export function SearchModal({ isOpen, onClose, onNavigateToProfile, onNavigateToCommunity }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
      setResults([]);
      setHasSearched(false);
    }
  }, [isOpen]);

  const doSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([]);
      setHasSearched(false);
      return;
    }
    setIsSearching(true);
    setHasSearched(true);
    try {
      const { data, error } = await supabase.rpc("search_platform", {
        query_text: searchQuery,
        result_limit: 20,
      });
      if (!error && data) {
        setResults(data as SearchResult[]);
      } else {
        // Fallback: busca simples se a RPC não existir
        const [postsRes, usersRes, commRes] = await Promise.all([
          supabase.from("posts").select("id, content").ilike("content", `%${searchQuery}%`).limit(5),
          supabase.from("users").select("id, name, display_name, bio").or(`name.ilike.%${searchQuery}%,display_name.ilike.%${searchQuery}%,bio.ilike.%${searchQuery}%`).limit(5),
          supabase.from("communities").select("id, name, description").or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`).limit(5),
        ]);
        const fallbackResults: SearchResult[] = [
          ...(postsRes.data || []).map(p => ({ result_type: "post", result_id: p.id, result_title: p.content.slice(0, 60), result_preview: p.content.slice(0, 150), result_score: 1 })),
          ...(usersRes.data || []).map(u => ({ result_type: "user", result_id: u.id, result_title: u.display_name || u.name, result_preview: u.bio || "", result_score: 1 })),
          ...(commRes.data || []).map(c => ({ result_type: "community", result_id: c.id, result_title: c.name, result_preview: c.description || "", result_score: 1 })),
        ];
        setResults(fallbackResults);
      }
    } catch {
      setResults([]);
    }
    setIsSearching(false);
  }, []);

  const handleInputChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(value), 400);
  };

  const handleResultClick = (result: SearchResult) => {
    if (result.result_type === "user" && onNavigateToProfile) {
      onNavigateToProfile(result.result_id);
      onClose();
    } else if (result.result_type === "community" && onNavigateToCommunity) {
      onNavigateToCommunity(result.result_id);
      onClose();
    }
    // Posts: TODO — navegar para o post
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[95] flex items-start justify-center pt-[10vh] bg-black/70 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: -20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: -20 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-xl bg-[#1E1E1E] border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
        >
          {/* Barra de busca */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-white/8">
            <Search className="h-5 w-5 text-white/30 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Buscar posts, comunidades, membros..."
              className="flex-1 bg-transparent text-white text-sm placeholder:text-white/30 focus:outline-none"
            />
            {query && (
              <button onClick={() => { setQuery(""); setResults([]); setHasSearched(false); }} className="text-white/30 hover:text-white/60">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Resultados */}
          <div className="max-h-[400px] overflow-y-auto">
            {isSearching ? (
              <div className="py-12 text-center">
                <Loader2 className="h-6 w-6 text-[#81D8D0] animate-spin mx-auto" />
                <p className="text-white/30 text-xs mt-2">Buscando...</p>
              </div>
            ) : results.length > 0 ? (
              <div className="py-2">
                {results.map((r, idx) => {
                  const Icon = TYPE_ICONS[r.result_type] || Search;
                  const color = TYPE_COLORS[r.result_type] || "#999";
                  return (
                    <motion.button
                      key={`${r.result_type}-${r.result_id}-${idx}`}
                      onClick={() => handleResultClick(r)}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="w-full flex items-start gap-3 px-5 py-3 text-left hover:bg-white/5 transition-colors"
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: `${color}12`, border: `1px solid ${color}20` }}
                      >
                        <Icon className="h-4 w-4" style={{ color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-white text-sm truncate" style={{ fontWeight: 600 }}>{r.result_title}</p>
                          <span className="text-[9px] uppercase text-white/25 bg-white/5 px-1.5 py-0.5 rounded" style={{ fontWeight: 600 }}>
                            {TYPE_LABELS[r.result_type]}
                          </span>
                        </div>
                        {r.result_preview && (
                          <p className="text-white/35 text-xs mt-0.5 truncate">{r.result_preview}</p>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            ) : hasSearched ? (
              <div className="py-12 text-center">
                <Search className="h-8 w-8 text-white/10 mx-auto mb-3" />
                <p className="text-white/40 text-sm">Nenhum resultado para "{query}"</p>
              </div>
            ) : query.length > 0 && query.length < 2 ? (
              <div className="py-8 text-center">
                <p className="text-white/30 text-xs">Digite pelo menos 2 caracteres</p>
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-white/20 text-xs">Busque por posts, comunidades ou membros</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}