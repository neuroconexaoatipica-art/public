/**
 * EnergiaSemanal — Painel de energia e reconhecimento semanal
 * 
 * Mostra: Top 3 membros ativos, comunidade mais viva,
 * ritual mais participado, founder mais engajado.
 * Sem ranking toxico. Reconhecimento simbolico.
 * 
 * Exibido na sidebar do SocialHub.
 */

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Flame, Crown, Users, Sparkles, Zap, Trophy } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { UserAvatar } from "./UserAvatar";
import { InlineBadges } from "./InlineBadges";

interface TopMember {
  id: string;
  name: string;
  display_name: string;
  profile_photo: string | null;
  participation_score: number;
}

interface TopCommunity {
  id: string;
  name: string;
  post_count: number;
}

interface TopRitual {
  ritual_type: string;
  count: number;
}

interface TopFounder {
  id: string;
  name: string;
  display_name: string;
  profile_photo: string | null;
  participation_score: number;
}

interface EnergiaSemanalProps {
  onNavigateToProfile?: (userId: string) => void;
}

export function EnergiaSemanal({ onNavigateToProfile }: EnergiaSemanalProps) {
  const [topMembers, setTopMembers] = useState<TopMember[]>([]);
  const [topCommunity, setTopCommunity] = useState<TopCommunity | null>(null);
  const [topRitual, setTopRitual] = useState<TopRitual | null>(null);
  const [topFounder, setTopFounder] = useState<TopFounder | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadEnergy() {
      try {
        // Top 3 membros por participation_score
        const { data: members } = await supabase
          .from("users")
          .select("id, name, display_name, profile_photo, participation_score")
          .in("role", ["member_free_legacy", "member_paid", "founder_paid", "moderator"])
          .eq("is_public_profile", true)
          .order("participation_score", { ascending: false })
          .limit(3);

        if (members) setTopMembers(members as TopMember[]);

        // Comunidade mais viva (mais posts na ultima semana)
        const oneWeekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
        const { data: recentPosts } = await supabase
          .from("posts")
          .select("community_id")
          .gte("created_at", oneWeekAgo);

        if (recentPosts && recentPosts.length > 0) {
          const countMap: Record<string, number> = {};
          recentPosts.forEach((p: any) => {
            if (p.community_id) {
              countMap[p.community_id] = (countMap[p.community_id] || 0) + 1;
            }
          });

          const topId = Object.entries(countMap).sort((a, b) => b[1] - a[1])[0];
          if (topId) {
            const { data: comm } = await supabase
              .from("communities")
              .select("id, name")
              .eq("id", topId[0])
              .single();
            if (comm) {
              setTopCommunity({ id: comm.id, name: comm.name, post_count: topId[1] });
            }
          }
        }

        // Ritual mais participado na ultima semana
        const { data: recentRituals } = await supabase
          .from("ritual_logs")
          .select("ritual_type")
          .gte("completed_at", oneWeekAgo);

        if (recentRituals && recentRituals.length > 0) {
          const ritualCount: Record<string, number> = {};
          recentRituals.forEach((r: any) => {
            if (r.ritual_type) {
              ritualCount[r.ritual_type] = (ritualCount[r.ritual_type] || 0) + 1;
            }
          });
          const topRit = Object.entries(ritualCount).sort((a, b) => b[1] - a[1])[0];
          if (topRit) {
            setTopRitual({ ritual_type: topRit[0], count: topRit[1] });
          }
        }

        // Founder mais engajado
        const { data: founders } = await supabase
          .from("users")
          .select("id, name, display_name, profile_photo, participation_score")
          .in("role", ["founder_paid"])
          .eq("is_public_profile", true)
          .order("participation_score", { ascending: false })
          .limit(1);

        if (founders && founders.length > 0) {
          setTopFounder(founders[0] as TopFounder);
        }
      } catch (err) {
        console.error("[EnergiaSemanal] Erro:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadEnergy();
  }, []);

  if (isLoading || topMembers.length === 0) return null;

  const POSITION_STYLES = [
    { icon: Zap, color: "#FFD700", label: "1o" },
    { icon: Flame, color: "#FF6B35", label: "2o" },
    { icon: Sparkles, color: "#81D8D0", label: "3o" },
  ];

  const RITUAL_LABELS: Record<string, string> = {
    daily: "Ritual Diario",
    weekly: "Ritual Semanal",
    monthly: "Ritual Mensal",
    territorial: "Encontro Territorial",
    entry: "Ritual de Entrada",
    roda_de_escuta: "Roda de Escuta",
    checkin_coletivo: "Check-in Coletivo",
    sessao_de_foco: "Sessao de Foco",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/3 border border-white/10 rounded-2xl p-5"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-[#FFD700]/15 flex items-center justify-center">
          <Trophy className="h-4 w-4 text-[#FFD700]" />
        </div>
        <div>
          <h3 className="text-xs text-white uppercase tracking-wider font-bold">Energia da Semana</h3>
          <span className="text-[9px] text-white/25">Reconhecimento simbolico</span>
        </div>
      </div>

      {/* Top 3 membros */}
      <div className="space-y-2 mb-4">
        {topMembers.map((member, idx) => {
          const style = POSITION_STYLES[idx];
          const IconComp = style.icon;
          const displayName = member.display_name || member.name;

          return (
            <div
              key={member.id}
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 cursor-pointer transition-colors group"
              onClick={() => onNavigateToProfile?.(member.id)}
            >
              <div className="relative">
                <UserAvatar name={displayName} photoUrl={member.profile_photo} size="sm" />
                <div
                  className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center border border-black"
                  style={{ background: style.color }}
                >
                  <IconComp className="h-2.5 w-2.5 text-black" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <p className="text-xs text-white font-semibold truncate group-hover:text-[#81D8D0] transition-colors">
                    {displayName}
                  </p>
                  <InlineBadges userId={member.id} maxVisible={2} />
                </div>
                <p className="text-[10px] text-white/30">{member.participation_score} pts</p>
              </div>
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ background: `${style.color}20`, color: style.color }}
              >
                {style.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Comunidade mais viva */}
      {topCommunity && (
        <div className="pt-3 border-t border-white/8">
          <div className="flex items-center gap-2">
            <Users className="h-3.5 w-3.5 text-[#81D8D0]" />
            <span className="text-[10px] text-white/30 font-semibold">Mais viva:</span>
            <span className="text-[10px] text-[#81D8D0] font-bold truncate">{topCommunity.name}</span>
            <span className="text-[9px] text-white/20 ml-auto">{topCommunity.post_count} posts</span>
          </div>
        </div>
      )}

      {/* Ritual mais participado */}
      {topRitual && (
        <div className="pt-3 border-t border-white/8">
          <div className="flex items-center gap-2">
            <Flame className="h-3.5 w-3.5 text-[#FF6B35]" />
            <span className="text-[10px] text-white/30 font-semibold">Ritual top:</span>
            <span className="text-[10px] text-[#FF6B35] font-bold truncate">{RITUAL_LABELS[topRitual.ritual_type] || topRitual.ritual_type}</span>
            <span className="text-[9px] text-white/20 ml-auto">{topRitual.count}x</span>
          </div>
        </div>
      )}

      {/* Founder mais engajado */}
      {topFounder && (
        <div className="pt-3 border-t border-white/8">
          <div
            className="flex items-center gap-2 cursor-pointer hover:bg-white/5 rounded-lg p-1 -m-1 transition-colors"
            onClick={() => onNavigateToProfile?.(topFounder.id)}
          >
            <Crown className="h-3.5 w-3.5 text-[#FFD700]" />
            <span className="text-[10px] text-white/30 font-semibold">Founder:</span>
            <UserAvatar name={topFounder.display_name || topFounder.name} photoUrl={topFounder.profile_photo} size="xs" />
            <span className="text-[10px] text-[#FFD700] font-bold truncate">{topFounder.display_name || topFounder.name}</span>
            <InlineBadges userId={topFounder.id} maxVisible={2} />
          </div>
        </div>
      )}
    </motion.div>
  );
}