/**
 * MenteEmDestaque — Destaque semanal de um membro
 * 
 * Seleciona automaticamente o membro com maior participation_score
 * que ainda nao foi destacado recentemente, OU usa selecao manual
 * via tabela `weekly_spotlights` (se existir).
 * 
 * Fallback: se nao ha dados, seleciona por score.
 * Exibido no SocialHub (sidebar direita).
 */

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Sparkles, Star, Trophy, MessageCircle } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { UserAvatar } from "./UserAvatar";

interface SpotlightMember {
  id: string;
  name: string;
  display_name: string;
  profile_photo: string | null;
  bio: string | null;
  participation_score: number;
  interests: string[];
  deep_statement: string | null;
  deep_statement_public: boolean;
}

interface MenteEmDestaqueProps {
  onNavigateToProfile?: (userId: string) => void;
}

export function MenteEmDestaque({ onNavigateToProfile }: MenteEmDestaqueProps) {
  const [member, setMember] = useState<SpotlightMember | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadSpotlight() {
      try {
        // Estrategia 1: tentar tabela weekly_spotlights (manual)
        const { data: spotlight } = await supabase
          .from("weekly_spotlights")
          .select("user_id, reason")
          .gte("week_start", getWeekStart())
          .lte("week_start", getWeekEnd())
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        let userId: string | null = spotlight?.user_id || null;

        // Estrategia 2: fallback — membro com maior score
        if (!userId) {
          const { data: topMembers } = await supabase
            .from("users")
            .select("id")
            .in("role", ["member_free_legacy", "member_paid", "founder_paid", "moderator"])
            .eq("is_public_profile", true)
            .order("participation_score", { ascending: false })
            .limit(5);

          if (topMembers && topMembers.length > 0) {
            // Selecionar baseado no dia da semana (rotacao deterministica)
            const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
            const weekIndex = Math.floor(dayOfYear / 7) % topMembers.length;
            userId = topMembers[weekIndex].id;
          }
        }

        if (!userId) {
          setIsLoading(false);
          return;
        }

        // Carregar dados completos
        const { data: userData } = await supabase
          .from("users")
          .select("id, name, display_name, profile_photo, bio, participation_score, interests, deep_statement, deep_statement_public")
          .eq("id", userId)
          .single();

        if (userData) {
          setMember(userData as SpotlightMember);
        }
      } catch (err) {
        // Tabela weekly_spotlights pode nao existir — nao e erro
        // Fallback silencioso: tentar so pelo score
        try {
          const { data: topMembers } = await supabase
            .from("users")
            .select("id, name, display_name, profile_photo, bio, participation_score, interests, deep_statement, deep_statement_public")
            .in("role", ["member_free_legacy", "member_paid", "founder_paid", "moderator"])
            .eq("is_public_profile", true)
            .order("participation_score", { ascending: false })
            .limit(1);

          if (topMembers && topMembers.length > 0) {
            setMember(topMembers[0] as SpotlightMember);
          }
        } catch {
          // silencioso
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadSpotlight();
  }, []);

  if (isLoading || !member) return null;

  const displayName = member.display_name || member.name;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-[#FF6B35]/10 via-transparent to-[#81D8D0]/10 border border-[#FF6B35]/20 rounded-2xl p-5"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-[#FF6B35]/15 flex items-center justify-center">
          <Sparkles className="h-4 w-4 text-[#FF6B35]" />
        </div>
        <div>
          <h3 className="text-xs text-white uppercase tracking-wider font-bold">Mente em Destaque</h3>
          <span className="text-[9px] text-white/30">Destaque da semana</span>
        </div>
      </div>

      {/* Member card */}
      <div
        className="flex items-center gap-3 cursor-pointer group"
        onClick={() => onNavigateToProfile?.(member.id)}
      >
        <UserAvatar
          name={displayName}
          photoUrl={member.profile_photo}
          size="lg"
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-white font-bold truncate group-hover:text-[#81D8D0] transition-colors">
            {displayName}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Trophy className="h-3 w-3 text-[#FF6B35]" />
            <span className="text-[10px] text-[#FF6B35] font-semibold">
              {member.participation_score} pts
            </span>
          </div>
        </div>
      </div>

      {/* Deep statement */}
      {member.deep_statement && member.deep_statement_public && (
        <div className="mt-3 bg-white/5 rounded-xl p-3 border border-white/8">
          <p className="text-xs text-white/60 italic leading-relaxed">
            &ldquo;{member.deep_statement}&rdquo;
          </p>
        </div>
      )}

      {/* Bio snippet */}
      {!member.deep_statement && member.bio && (
        <p className="mt-3 text-xs text-white/40 leading-relaxed line-clamp-2">
          {member.bio}
        </p>
      )}

      {/* Interests */}
      {member.interests && member.interests.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {member.interests.slice(0, 3).map((interest) => (
            <span
              key={interest}
              className="text-[9px] px-2 py-0.5 bg-white/5 border border-white/10 rounded-full text-white/40"
            >
              {interest}
            </span>
          ))}
        </div>
      )}

      {/* CTA */}
      <button
        onClick={() => onNavigateToProfile?.(member.id)}
        className="mt-4 w-full flex items-center justify-center gap-2 px-3 py-2 bg-[#FF6B35]/10 hover:bg-[#FF6B35]/20 border border-[#FF6B35]/25 rounded-xl text-[#FF6B35] text-xs font-bold transition-all"
      >
        <Star className="h-3 w-3" />
        Ver perfil completo
      </button>
    </motion.div>
  );
}

// Helpers para semana
function getWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString();
}

function getWeekEnd(): string {
  const start = new Date(getWeekStart());
  start.setDate(start.getDate() + 6);
  start.setHours(23, 59, 59, 999);
  return start.toISOString();
}
