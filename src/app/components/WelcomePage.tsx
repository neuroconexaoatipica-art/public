/**
 * WelcomePage — Experiencia epica de entrada
 * 
 * Nome grande na tela + badge "Nucleo Inicial" + animacao emocional
 * Pergunta obrigatoria: "O que te atravessa que ninguem entende?"
 * Ritual de entrada simbólico.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PenTool, User, MessageCircle, Sparkles, Star, Shield, ArrowRight, Check } from "lucide-react";
import { LogoIcon } from "./LogoIcon";
import { BadgeDisplay } from "./BadgeDisplay";
import { useProfileContext } from "../../lib";
import { useRitualLogs } from "../../lib/useRitualLogs";
import { supabase } from "../../lib/supabase";

interface WelcomePageProps {
  onCreatePost: () => void;
  onCompleteProfile: () => void;
  onContactFounder: () => void;
}

export function WelcomePage({ onCreatePost, onCompleteProfile, onContactFounder }: WelcomePageProps) {
  const { user, refreshProfile } = useProfileContext();
  const { completeRitual } = useRitualLogs(user?.id);
  const [phase, setPhase] = useState<"welcome" | "ritual" | "ready">("welcome");
  const [ritualAnswer, setRitualAnswer] = useState("");
  const [saving, setSaving] = useState(false);
  const [skipAttempt, setSkipAttempt] = useState(0);

  const displayName = user?.display_name || user?.name || "Membro";
  const firstLetter = displayName.charAt(0).toUpperCase();

  // Simular badge "Nucleo Inicial" para novos membros
  const welcomeBadges = [
    {
      id: "welcome-badge",
      user_id: user?.id || "",
      badge_type: "nucleo_inicial" as const,
      earned_at: new Date().toISOString(),
      is_active: true,
    },
  ];

  const handleSaveRitual = async () => {
    if (!ritualAnswer.trim() || !user) return;
    setSaving(true);

    try {
      // Salvar a resposta do ritual no campo what_crosses_me
      await supabase
        .from("users")
        .update({ what_crosses_me: ritualAnswer.trim() })
        .eq("id", user.id);

      // Registrar no ritual_logs como ritual de entrada
      await completeRitual("entry", ritualAnswer.trim());

      await refreshProfile?.();
      setPhase("ready");
    } catch (err) {
      console.error("[WelcomePage] Erro ao salvar ritual:", err);
      setPhase("ready"); // Prosseguir mesmo com erro
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6 py-12 overflow-hidden">
      {/* Efeito de particulas sutis no fundo */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-[#81D8D0]/20"
            animate={{
              x: [Math.random() * 400, Math.random() * 400 - 200],
              y: [Math.random() * 400, Math.random() * 400 - 200],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              delay: i * 1.5,
            }}
            style={{
              left: `${20 + Math.random() * 60}%`,
              top: `${20 + Math.random() * 60}%`,
            }}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ═══ FASE 1: BEM-VINDO ═══ */}
        {phase === "welcome" && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-[700px] space-y-10 relative z-10"
          >
            {/* Logo */}
            <div className="text-center space-y-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, type: "spring", stiffness: 150 }}
              >
                <LogoIcon size={80} className="h-[80px] w-[80px] mx-auto mb-6" />
              </motion.div>

              {/* Nome GRANDE */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <p className="text-sm text-white/30 uppercase tracking-[0.3em] mb-3 font-semibold">
                  Bem-vindo(a) ao territorio
                </p>
                <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
                  {displayName}
                </h1>
              </motion.div>

              {/* Linha de separacao animada */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "120px" }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="h-0.5 bg-gradient-to-r from-transparent via-[#81D8D0] to-transparent mx-auto"
              />

              {/* Subtitulo */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 1.0 }}
                className="text-xl md:text-2xl text-[#81D8D0] font-medium"
              >
                Voce esta dentro.
              </motion.p>

              {/* Badge Nucleo Inicial */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 1.3, type: "spring" }}
                className="flex justify-center"
              >
                <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FFD700]/10 border border-[#FFD700]/30 rounded-full">
                  <Star className="h-4 w-4 text-[#FFD700]" />
                  <span className="text-sm text-[#FFD700] font-bold">Nucleo Inicial</span>
                  <Star className="h-4 w-4 text-[#FFD700]" />
                </div>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 1.6 }}
                className="text-white/40 text-sm max-w-md mx-auto leading-relaxed"
              >
                Voce faz parte do nucleo inicial. Isso significa que este territorio
                tambem e seu — construido por quem participa, moldado por quem se arrisca.
              </motion.p>
            </div>

            {/* Botao para iniciar ritual */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 2.0 }}
              className="text-center"
            >
              <motion.button
                onClick={() => setPhase("ritual")}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#C8102E] to-[#C8102E]/80 text-white rounded-2xl font-bold text-lg shadow-xl shadow-[#C8102E]/20 hover:shadow-2xl hover:shadow-[#C8102E]/30 transition-all"
              >
                <Sparkles className="h-5 w-5" />
                Iniciar Ritual de Entrada
                <ArrowRight className="h-5 w-5" />
              </motion.button>

              {/* Pergunta obrigatoria — encorajamento emocional antes de permitir pular */}
              {skipAttempt === 0 ? (
                <motion.button
                  onClick={() => setSkipAttempt(1)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 5.0 }}
                  className="block mx-auto mt-6 text-[10px] text-white/10 hover:text-white/20 transition-colors"
                >
                  Preciso de um momento...
                </motion.button>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 text-center space-y-2"
                >
                  <p className="text-[11px] text-white/25 leading-relaxed">
                    O ritual e parte do que torna este espaco diferente.<br />
                    Mas voce pode voltar depois — sem pressao.
                  </p>
                  <button
                    onClick={() => setPhase("ready")}
                    className="text-[10px] text-white/15 hover:text-white/30 transition-colors underline underline-offset-2"
                  >
                    Entrar sem ritual por enquanto
                  </button>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}

        {/* ═══ FASE 2: RITUAL DE ENTRADA ═══ */}
        {phase === "ritual" && (
          <motion.div
            key="ritual"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-[600px] space-y-8 relative z-10"
          >
            <div className="text-center space-y-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                className="w-16 h-16 rounded-2xl bg-[#C8102E]/15 border border-[#C8102E]/30 flex items-center justify-center mx-auto"
              >
                <Shield className="h-8 w-8 text-[#C8102E]" />
              </motion.div>

              <h2 className="text-2xl md:text-3xl text-white font-bold">
                Ritual de Entrada
              </h2>

              <p className="text-white/40 text-sm max-w-md mx-auto leading-relaxed">
                Uma unica pergunta. Sem resposta certa. Apenas honestidade.
                Isso fica no seu perfil como marca de presenca.
              </p>
            </div>

            {/* A pergunta */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-6"
            >
              <p className="text-lg md:text-xl text-white font-semibold mb-5 leading-relaxed text-center">
                &ldquo;O que te atravessa que ninguem entende?&rdquo;
              </p>

              <textarea
                value={ritualAnswer}
                onChange={(e) => setRitualAnswer(e.target.value)}
                rows={4}
                maxLength={500}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-white/20 focus:border-[#81D8D0]/50 focus:outline-none resize-none"
                placeholder="Escreva com honestidade. Nao precisa ser bonito."
              />

              <div className="flex items-center justify-between mt-3">
                <span className="text-[10px] text-white/20">
                  {ritualAnswer.length}/500
                </span>
                <div className="flex items-center gap-2">
                  {/* Pergunta obrigatoria — sem botao direto de pular */}
                  {!ritualAnswer.trim() && (
                    <span className="text-[10px] text-[#C8102E]/40 italic">
                      Resposta obrigatoria
                    </span>
                  )}
                  <motion.button
                    onClick={handleSaveRitual}
                    disabled={!ritualAnswer.trim() || saving}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#81D8D0] text-black rounded-xl text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    {saving ? (
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                    {saving ? "Salvando..." : "Marcar minha presenca"}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* ═══ FASE 3: PRONTO ═══ */}
        {phase === "ready" && (
          <motion.div
            key="ready"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-[700px] space-y-10 relative z-10"
          >
            <div className="text-center space-y-5">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#81D8D0]/20 to-[#C8102E]/20 border border-white/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl text-white font-bold">{firstLetter}</span>
                </div>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-3xl md:text-4xl text-white font-bold"
              >
                {displayName}, voce esta pronto(a).
              </motion.h2>

              {/* Badges conquistadas na entrada */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, type: "spring" }}
                className="flex justify-center"
              >
                <BadgeDisplay badges={welcomeBadges} />
              </motion.div>

              {/* Missao inicial */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#C8102E]/10 border border-[#C8102E]/30 rounded-full"
              >
                <Sparkles className="h-4 w-4 text-[#C8102E]" />
                <span className="text-sm text-[#C8102E] font-semibold">Missao inicial</span>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-xl text-white/70"
              >
                Escreva seu primeiro post. Silencio mata comunidade.
              </motion.p>
            </div>

            {/* Botoes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="space-y-4"
            >
              <motion.button
                onClick={onCreatePost}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-3 py-4 bg-[#81D8D0] text-black rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
              >
                <PenTool className="h-5 w-5" />
                Escrever meu primeiro post
              </motion.button>

              <motion.button
                onClick={onCompleteProfile}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-3 py-4 bg-white/5 border-2 border-white/20 text-white rounded-xl font-semibold text-lg hover:bg-white/10 hover:border-white/30 transition-all"
              >
                <User className="h-5 w-5" />
                Completar meu perfil
              </motion.button>

              <motion.button
                onClick={onContactFounder}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-3 py-4 bg-white/5 border-2 border-[#C8102E]/30 text-white/80 rounded-xl font-semibold text-lg hover:bg-[#C8102E]/10 hover:border-[#C8102E]/50 transition-all"
              >
                <MessageCircle className="h-5 w-5 text-[#C8102E]" />
                Falar com a fundadora
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}