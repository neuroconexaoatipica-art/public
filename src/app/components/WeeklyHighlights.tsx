import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { TrendingUp, MessageCircle, Flame, Users, Calendar, Loader2 } from "lucide-react";
import { supabase } from "../../lib/supabase";

interface HighlightPost {
  id: string;
  content: string;
  author_name: string;
  comment_count: number;
  community_name: string | null;
  created_at: string;
}

interface WeeklyStats {
  totalPosts: number;
  totalComments: number;
  activeMembers: number;
  topPosts: HighlightPost[];
  lastLive: { title: string; starts_at: string } | null;
  nextLive: { title: string; starts_at: string } | null;
}

export function WeeklyHighlights() {
  const [stats, setStats] = useState<WeeklyStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadWeeklyData() {
      try {
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const now = new Date().toISOString();

        // Buscar posts da semana com contagem de comentarios
        const { data: recentPosts } = await supabase
          .from("posts")
          .select("id, content, author, community, created_at")
          .gte("created_at", sevenDaysAgo)
          .order("created_at", { ascending: false })
          .limit(20);

        // Buscar comentarios da semana
        const { data: recentComments } = await supabase
          .from("comments")
          .select("id, post_id")
          .gte("created_at", sevenDaysAgo);

        // Contar comentarios por post
        const commentCounts: Record<string, number> = {};
        (recentComments || []).forEach(c => {
          commentCounts[c.post_id] = (commentCounts[c.post_id] || 0) + 1;
        });

        // Enriquecer posts com dados de autor e comunidade
        const authorIds = [...new Set((recentPosts || []).map(p => p.author))];
        const communityIds = [...new Set((recentPosts || []).map(p => p.community).filter(Boolean))];

        const [authorsRes, communitiesRes] = await Promise.all([
          authorIds.length > 0
            ? supabase.from("users").select("id, name").in("id", authorIds)
            : { data: [] },
          communityIds.length > 0
            ? supabase.from("communities").select("id, name").in("id", communityIds as string[])
            : { data: [] },
        ]);

        const authorMap: Record<string, string> = {};
        (authorsRes.data || []).forEach((a: any) => { authorMap[a.id] = a.name; });

        const communityMap: Record<string, string> = {};
        (communitiesRes.data || []).forEach((c: any) => { communityMap[c.id] = c.name; });

        // Top 5 posts mais comentados
        const topPosts: HighlightPost[] = (recentPosts || [])
          .map(p => ({
            id: p.id,
            content: p.content,
            author_name: authorMap[p.author] || "Membro",
            comment_count: commentCounts[p.id] || 0,
            community_name: p.community ? communityMap[p.community] || null : null,
            created_at: p.created_at,
          }))
          .sort((a, b) => b.comment_count - a.comment_count)
          .slice(0, 5);

        // Membros ativos (autores unicos)
        const activeMembers = authorIds.length;

        // Ultima live realizada
        const { data: pastLives } = await supabase
          .from("events")
          .select("title, starts_at")
          .lt("starts_at", now)
          .in("status", ["completed", "published", "live"])
          .order("starts_at", { ascending: false })
          .limit(1);

        // Proxima live
        const { data: nextLives } = await supabase
          .from("events")
          .select("title, starts_at")
          .gte("starts_at", now)
          .in("status", ["published"])
          .order("starts_at", { ascending: true })
          .limit(1);

        if (cancelled) return;

        setStats({
          totalPosts: (recentPosts || []).length,
          totalComments: (recentComments || []).length,
          activeMembers,
          topPosts,
          lastLive: pastLives?.[0] || null,
          nextLive: nextLives?.[0] || null,
        });
      } catch (err) {
        console.error("[WeeklyHighlights] Erro:", err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadWeeklyData();
    return () => { cancelled = true; };
  }, []);

  function formatDate(iso: string) {
    const d = new Date(iso);
    const dia = d.getDate().toString().padStart(2, "0");
    const mes = d.toLocaleDateString("pt-BR", { month: "short" });
    const hora = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    return `${dia} ${mes} as ${hora}`;
  }

  // Se nao tem dados nenhum, nao mostra (comunidade ainda nao tem movimento)
  if (!isLoading && (!stats || (stats.totalPosts === 0 && !stats.lastLive && !stats.nextLive))) {
    return null;
  }

  return (
    <section className="w-full py-12 md:py-16" style={{ background: "#D4D4D4" }}>
      <div className="mx-auto max-w-[1200px] px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 bg-[#1A1A1A] rounded-full px-4 py-2 mb-4">
            <TrendingUp className="h-4 w-4 text-[#81D8D0]" />
            <span className="text-sm text-white" style={{ fontWeight: 700 }}>O QUE ACONTECEU ESTA SEMANA</span>
          </div>
        </motion.div>

        {isLoading ? (
          <div className="text-center py-8">
            <Loader2 className="h-6 w-6 text-[#C8102E] animate-spin mx-auto" />
          </div>
        ) : stats && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* Coluna 1: Numeros da semana + Lives */}
            <div className="space-y-4">
              {/* Numeros */}
              <div className="bg-white border-2 border-[#1A1A1A]/10 rounded-2xl p-5">
                <h3 className="text-xs text-[#1A1A1A] uppercase tracking-[0.15em] mb-4" style={{ fontWeight: 700 }}>
                  Numeros da Semana
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <p className="text-2xl text-[#1A1A1A]" style={{ fontWeight: 800 }}>{stats.totalPosts}</p>
                    <p className="text-[10px] text-[#999] uppercase" style={{ fontWeight: 600 }}>Posts</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl text-[#1A1A1A]" style={{ fontWeight: 800 }}>{stats.totalComments}</p>
                    <p className="text-[10px] text-[#999] uppercase" style={{ fontWeight: 600 }}>Comentarios</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl text-[#1A1A1A]" style={{ fontWeight: 800 }}>{stats.activeMembers}</p>
                    <p className="text-[10px] text-[#999] uppercase" style={{ fontWeight: 600 }}>Membros Ativos</p>
                  </div>
                </div>
              </div>

              {/* Lives */}
              <div className="bg-white border-2 border-[#1A1A1A]/10 rounded-2xl p-5">
                <h3 className="text-xs text-[#1A1A1A] uppercase tracking-[0.15em] mb-3" style={{ fontWeight: 700 }}>
                  Lives
                </h3>
                {stats.lastLive && (
                  <div className="flex items-start gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-[#999] mt-1.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-[#999] uppercase" style={{ fontWeight: 600 }}>Ultima realizada</p>
                      <p className="text-sm text-[#1A1A1A]" style={{ fontWeight: 600 }}>{stats.lastLive.title}</p>
                      <p className="text-xs text-[#999]">{formatDate(stats.lastLive.starts_at)}</p>
                    </div>
                  </div>
                )}
                {stats.nextLive && (
                  <div className="flex items-start gap-2">
                    <motion.div
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="w-2 h-2 rounded-full bg-[#C8102E] mt-1.5 flex-shrink-0"
                    />
                    <div>
                      <p className="text-xs text-[#C8102E] uppercase" style={{ fontWeight: 600 }}>Proxima</p>
                      <p className="text-sm text-[#1A1A1A]" style={{ fontWeight: 600 }}>{stats.nextLive.title}</p>
                      <p className="text-xs text-[#999]">{formatDate(stats.nextLive.starts_at)}</p>
                    </div>
                  </div>
                )}
                {!stats.lastLive && !stats.nextLive && (
                  <p className="text-xs text-[#999]">Nenhuma live registrada ainda</p>
                )}
              </div>
            </div>

            {/* Coluna 2-3: Threads mais movimentadas */}
            <div className="lg:col-span-2">
              <div className="bg-white border-2 border-[#1A1A1A]/10 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Flame className="h-4 w-4 text-[#C8102E]" />
                  <h3 className="text-xs text-[#1A1A1A] uppercase tracking-[0.15em]" style={{ fontWeight: 700 }}>
                    Conversas mais movimentadas
                  </h3>
                </div>

                {stats.topPosts.length === 0 ? (
                  <p className="text-sm text-[#999] py-4 text-center">
                    Nenhum post esta semana ainda. Cadastre-se e comece a conversa!
                  </p>
                ) : (
                  <div className="space-y-3">
                    {stats.topPosts.map((post, idx) => (
                      <motion.div
                        key={post.id}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.06 }}
                        className="flex items-start gap-3 p-3 rounded-xl hover:bg-[#F5F5F5] transition-colors"
                      >
                        <span className="text-lg text-[#1A1A1A]/20 w-6 text-center flex-shrink-0" style={{ fontWeight: 800 }}>
                          {idx + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-[#1A1A1A] line-clamp-2 leading-snug" style={{ fontWeight: 500 }}>
                            {post.content.length > 120 ? post.content.slice(0, 120) + "..." : post.content}
                          </p>
                          <div className="flex items-center gap-3 mt-1.5 text-[10px] text-[#999]">
                            <span style={{ fontWeight: 600 }}>{post.author_name}</span>
                            {post.community_name && (
                              <span className="text-[#0A8F85]">{post.community_name}</span>
                            )}
                            {post.comment_count > 0 && (
                              <span className="flex items-center gap-1">
                                <MessageCircle className="h-3 w-3" />
                                {post.comment_count}
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
