/**
 * FounderPanel — Painel de gestão para founders dentro da CommunityPage
 * 
 * Permite: aprovar/rejeitar membros, editar manifesto, ver stats.
 * Aparece na sidebar quando o user é owner da comunidade ou super_admin.
 */

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Crown, UserCheck, UserX, Edit3, Save, X, Loader2,
  Users, CheckCircle, Clock, Shield, BookOpen
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { UserAvatar } from "./UserAvatar";

interface PendingMember {
  id: string;
  user_id: string;
  status: string;
  message: string | null;
  created_at: string;
  user_name: string;
  user_photo: string | null;
}

interface FounderPanelProps {
  communityId: string;
  communityName: string;
  communityColor: string;
  currentManifesto: string;
  onManifestoUpdated?: (newText: string) => void;
  onNavigateToProfile?: (userId: string) => void;
}

export function FounderPanel({
  communityId,
  communityName,
  communityColor,
  currentManifesto,
  onManifestoUpdated,
  onNavigateToProfile,
}: FounderPanelProps) {
  // ── Membros pendentes ──
  const [pendingMembers, setPendingMembers] = useState<PendingMember[]>([]);
  const [approvedCount, setApprovedCount] = useState(0);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // ── Manifesto editor ──
  const [isEditingManifesto, setIsEditingManifesto] = useState(false);
  const [manifestoText, setManifestoText] = useState(currentManifesto);
  const [savingManifesto, setSavingManifesto] = useState(false);
  const [manifestoSaved, setManifestoSaved] = useState(false);

  // ── Carregar membros pendentes ──
  const loadPendingMembers = useCallback(async () => {
    setLoadingMembers(true);
    try {
      // Pendentes
      const { data: pending } = await supabase
        .from("community_members")
        .select("id, user_id, status, message, created_at")
        .eq("community_id", communityId)
        .eq("status", "pending")
        .order("created_at", { ascending: true });

      if (pending && pending.length > 0) {
        // Carregar nomes dos users
        const userIds = pending.map((p: any) => p.user_id);
        const { data: users } = await supabase
          .from("users")
          .select("id, name, profile_photo")
          .in("id", userIds);

        const userMap: Record<string, { name: string; photo: string | null }> = {};
        (users || []).forEach((u: any) => {
          userMap[u.id] = { name: u.name, photo: u.profile_photo };
        });

        setPendingMembers(
          pending.map((p: any) => ({
            ...p,
            user_name: userMap[p.user_id]?.name || "Membro",
            user_photo: userMap[p.user_id]?.photo || null,
          }))
        );
      } else {
        setPendingMembers([]);
      }

      // Contar aprovados
      const { count } = await supabase
        .from("community_members")
        .select("id", { count: "exact", head: true })
        .eq("community_id", communityId)
        .eq("status", "approved");

      setApprovedCount(count || 0);
    } catch (err) {
      console.error("[FounderPanel] Erro ao carregar membros:", err);
    } finally {
      setLoadingMembers(false);
    }
  }, [communityId]);

  useEffect(() => {
    loadPendingMembers();
  }, [loadPendingMembers]);

  // ── Aprovar membro ──
  const approveMember = async (memberId: string) => {
    setActionLoading(memberId);
    try {
      const { error } = await supabase
        .from("community_members")
        .update({ status: "approved" })
        .eq("id", memberId);

      if (error) throw error;
      await loadPendingMembers();
    } catch (err) {
      console.error("[FounderPanel] Erro ao aprovar:", err);
    } finally {
      setActionLoading(null);
    }
  };

  // ── Rejeitar membro ──
  const rejectMember = async (memberId: string) => {
    setActionLoading(memberId);
    try {
      const { error } = await supabase
        .from("community_members")
        .update({ status: "rejected" })
        .eq("id", memberId);

      if (error) throw error;
      await loadPendingMembers();
    } catch (err) {
      console.error("[FounderPanel] Erro ao rejeitar:", err);
    } finally {
      setActionLoading(null);
    }
  };

  // ── Salvar manifesto ──
  const handleSaveManifesto = async () => {
    if (!manifestoText.trim()) return;
    setSavingManifesto(true);
    try {
      const { error } = await supabase
        .from("communities")
        .update({ manifesto_text: manifestoText.trim() })
        .eq("id", communityId);

      if (error) throw error;
      setManifestoSaved(true);
      setIsEditingManifesto(false);
      onManifestoUpdated?.(manifestoText.trim());
      setTimeout(() => setManifestoSaved(false), 3000);
    } catch (err) {
      console.error("[FounderPanel] Erro ao salvar manifesto:", err);
    } finally {
      setSavingManifesto(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* ═══ HEADER DO PAINEL ═══ */}
      <div className="bg-gradient-to-br from-[#C8102E]/10 to-transparent border border-[#C8102E]/25 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Crown className="h-4 w-4 text-[#C8102E]" />
          <h3 className="text-xs text-white uppercase tracking-wider font-bold">Painel Founder</h3>
        </div>
        <p className="text-[10px] text-white/40 leading-relaxed">
          Voce gerencia esta comunidade. Aprove membros, edite o manifesto e mantenha o territorio vivo.
        </p>

        {/* Stats rapidos */}
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-1.5">
            <Users className="h-3 w-3 text-[#81D8D0]" />
            <span className="text-[11px] text-white/60 font-medium">{approvedCount} membros</span>
          </div>
          {pendingMembers.length > 0 && (
            <div className="flex items-center gap-1.5">
              <Clock className="h-3 w-3 text-[#FF6B35]" />
              <span className="text-[11px] text-[#FF6B35] font-bold">{pendingMembers.length} pendente{pendingMembers.length > 1 ? "s" : ""}</span>
            </div>
          )}
        </div>
      </div>

      {/* ═══ MEMBROS PENDENTES ═══ */}
      {pendingMembers.length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="h-4 w-4 text-[#FF6B35]" />
            <h4 className="text-xs text-white font-bold uppercase tracking-wider">Pedidos de Entrada</h4>
          </div>

          <div className="space-y-3">
            <AnimatePresence>
              {pendingMembers.map((member) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white/3 border border-white/8 rounded-xl p-3"
                >
                  <div className="flex items-center gap-3">
                    <UserAvatar
                      name={member.user_name}
                      photoUrl={member.user_photo}
                      size="sm"
                      onClick={() => onNavigateToProfile?.(member.user_id)}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-semibold truncate">{member.user_name}</p>
                      <p className="text-[10px] text-white/30">
                        {new Date(member.created_at).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>

                  {member.message && (
                    <p className="text-xs text-white/50 italic mt-2 px-1 leading-relaxed">
                      &ldquo;{member.message}&rdquo;
                    </p>
                  )}

                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => approveMember(member.id)}
                      disabled={actionLoading === member.id}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-[#81D8D0]/15 hover:bg-[#81D8D0]/25 text-[#81D8D0] rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                    >
                      {actionLoading === member.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <UserCheck className="h-3 w-3" />
                      )}
                      Aprovar
                    </button>
                    <button
                      onClick={() => rejectMember(member.id)}
                      disabled={actionLoading === member.id}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-[#C8102E]/15 text-white/40 hover:text-[#C8102E] rounded-lg text-xs font-medium transition-all disabled:opacity-50"
                    >
                      <UserX className="h-3 w-3" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* ═══ EDITAR MANIFESTO ═══ */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" style={{ color: communityColor }} />
            <h4 className="text-xs text-white font-bold uppercase tracking-wider">Manifesto</h4>
          </div>
          {!isEditingManifesto ? (
            <button
              onClick={() => { setManifestoText(currentManifesto); setIsEditingManifesto(true); }}
              className="flex items-center gap-1 px-2 py-1 bg-white/5 hover:bg-white/10 rounded text-[10px] text-white/50 hover:text-white transition-all"
            >
              <Edit3 className="h-3 w-3" />
              Editar
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleSaveManifesto}
                disabled={savingManifesto}
                className="flex items-center gap-1 px-2.5 py-1 bg-[#81D8D0]/15 hover:bg-[#81D8D0]/25 text-[#81D8D0] rounded text-[10px] font-bold transition-all disabled:opacity-50"
              >
                {savingManifesto ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                Salvar
              </button>
              <button
                onClick={() => setIsEditingManifesto(false)}
                className="flex items-center gap-1 px-2 py-1 bg-white/5 hover:bg-white/10 text-white/40 rounded text-[10px] transition-all"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>

        {isEditingManifesto ? (
          <textarea
            value={manifestoText}
            onChange={(e) => setManifestoText(e.target.value)}
            rows={6}
            className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm leading-relaxed placeholder:text-white/30 focus:border-[#81D8D0]/50 focus:outline-none resize-y"
            placeholder="Escreva o manifesto desta comunidade..."
          />
        ) : (
          <p className="text-xs text-white/50 leading-relaxed italic line-clamp-4">
            &ldquo;{currentManifesto}&rdquo;
          </p>
        )}

        {manifestoSaved && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-1.5 mt-2"
          >
            <CheckCircle className="h-3 w-3 text-[#81D8D0]" />
            <span className="text-[10px] text-[#81D8D0] font-semibold">Manifesto salvo!</span>
          </motion.div>
        )}
      </div>
    </div>
  );
}
