/**
 * ModeratorApplicationModal — Formulario para candidatura a moderador
 * 
 * O membro pode se candidatar para moderar uma comunidade.
 * A candidatura e salva em `contact_requests` com reason = "moderator_application".
 * A super_admin (Mila) ve no AdminDashboard e decide.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X, Shield, Send, Loader2, CheckCircle, Crown, Heart, AlertCircle
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useProfileContext } from "../../lib/ProfileContext";
import { useCommunitiesContext } from "../../lib/CommunitiesContext";

interface ModeratorApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ModeratorApplicationModal({ isOpen, onClose }: ModeratorApplicationModalProps) {
  const { user } = useProfileContext();
  const { communities } = useCommunitiesContext();

  const [selectedCommunity, setSelectedCommunity] = useState("");
  const [motivation, setMotivation] = useState("");
  const [experience, setExperience] = useState("");
  const [availability, setAvailability] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Comunidades que precisam de moderador
  const availableCommunities = communities.filter(
    c => c.needs_moderator && !c.owner_id
  );
  // Todas as comunidades (para quem quer se voluntariar em qualquer uma)
  const allCommunities = communities.filter(
    c => !c.id.startsWith("pending-") && !c.id.startsWith("local-")
  );

  const handleSubmit = async () => {
    if (!user || !motivation.trim()) return;
    setSending(true);
    setError(null);

    try {
      const communityName = selectedCommunity
        ? allCommunities.find(c => c.id === selectedCommunity)?.name || "Nao especificada"
        : "Qualquer comunidade";

      const fullMessage = [
        `[CANDIDATURA A MODERADOR]`,
        `Membro: ${user.name} (${user.id})`,
        `Comunidade: ${communityName}`,
        `\n--- MOTIVACAO ---`,
        motivation.trim(),
        experience.trim() ? `\n--- EXPERIENCIA ---\n${experience.trim()}` : "",
        availability.trim() ? `\n--- DISPONIBILIDADE ---\n${availability.trim()}` : "",
      ].filter(Boolean).join("\n");

      const { error: insertError } = await supabase.from("contact_requests").insert({
        user_id: user.id,
        reason: "other",
        message: fullMessage,
        status: "pending",
      });

      if (insertError) throw insertError;

      setSent(true);
      setTimeout(() => {
        onClose();
        // Reset apos fechar
        setTimeout(() => {
          setSent(false);
          setSelectedCommunity("");
          setMotivation("");
          setExperience("");
          setAvailability("");
        }, 300);
      }, 2500);
    } catch (err: any) {
      console.error("[ModeratorApplication] Erro:", err);
      setError("Erro ao enviar candidatura. Tente novamente.");
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-[#1A1A1A] border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-[#1A1A1A] border-b border-white/10 px-6 py-4 flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#C8102E]/15 flex items-center justify-center">
                <Shield className="h-5 w-5 text-[#C8102E]" />
              </div>
              <div>
                <h2 className="text-white font-bold">Candidatura a Moderador</h2>
                <span className="text-[10px] text-white/40">Mostre porque voce seria ideal</span>
              </div>
            </div>
            <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          {sent ? (
            <div className="p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <CheckCircle className="h-16 w-16 text-[#81D8D0] mx-auto mb-4" />
              </motion.div>
              <h3 className="text-xl text-white font-bold mb-2">Candidatura enviada!</h3>
              <p className="text-sm text-white/50">
                A Mila vai analisar sua candidatura com carinho. Voce recebera uma resposta em breve.
              </p>
            </div>
          ) : (
            <div className="p-6 space-y-5">
              {/* Info box */}
              <div className="bg-[#81D8D0]/10 border border-[#81D8D0]/20 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Heart className="h-5 w-5 text-[#81D8D0] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-[#81D8D0] font-semibold mb-1">O que faz um moderador?</p>
                    <ul className="text-[11px] text-white/50 space-y-1 leading-relaxed">
                      <li>Acolhe novos membros e aprova pedidos de entrada</li>
                      <li>Cuida do manifesto e dos rituais da comunidade</li>
                      <li>Modera conteudo e trata denuncias com empatia</li>
                      <li>Participa do nucleo estrategico com outros founders</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Comunidade */}
              <div>
                <label className="text-xs text-white/60 font-semibold mb-2 block">
                  Para qual comunidade? <span className="text-white/30">(opcional)</span>
                </label>
                <select
                  value={selectedCommunity}
                  onChange={(e) => setSelectedCommunity(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:border-[#81D8D0]/50 focus:outline-none appearance-none"
                >
                  <option value="">Qualquer comunidade que precisar</option>
                  {availableCommunities.length > 0 && (
                    <optgroup label="Precisando de moderador">
                      {availableCommunities.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name} (aguardando fundador)
                        </option>
                      ))}
                    </optgroup>
                  )}
                  <optgroup label="Todas as comunidades">
                    {allCommunities.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* Motivacao */}
              <div>
                <label className="text-xs text-white/60 font-semibold mb-2 block">
                  Por que voce quer moderar? <span className="text-[#C8102E]">*</span>
                </label>
                <textarea
                  value={motivation}
                  onChange={(e) => setMotivation(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-white/25 focus:border-[#81D8D0]/50 focus:outline-none resize-y"
                  placeholder="Conte o que te motiva a cuidar de um territorio..."
                />
              </div>

              {/* Experiencia */}
              <div>
                <label className="text-xs text-white/60 font-semibold mb-2 block">
                  Tem experiencia com moderacao? <span className="text-white/30">(opcional)</span>
                </label>
                <textarea
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-white/25 focus:border-[#81D8D0]/50 focus:outline-none resize-y"
                  placeholder="Grupos, comunidades, voluntariado..."
                />
              </div>

              {/* Disponibilidade */}
              <div>
                <label className="text-xs text-white/60 font-semibold mb-2 block">
                  Disponibilidade semanal <span className="text-white/30">(opcional)</span>
                </label>
                <input
                  type="text"
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-white/25 focus:border-[#81D8D0]/50 focus:outline-none"
                  placeholder="Ex: 3-5h por semana, noites e fins de semana"
                />
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 px-3 py-2 bg-[#C8102E]/10 border border-[#C8102E]/25 rounded-xl">
                  <AlertCircle className="h-4 w-4 text-[#C8102E]" />
                  <span className="text-xs text-[#C8102E]">{error}</span>
                </div>
              )}

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={!motivation.trim() || sending}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-[#C8102E] hover:bg-[#A50D24] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold transition-all"
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {sending ? "Enviando..." : "Enviar candidatura"}
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
