import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Flame, Send, Zap } from "lucide-react";
import { useDailyChallenge } from "../../lib";

interface DailyRitualModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CHALLENGE_ICONS: Record<string, string> = {
  reflexao: "🧠",
  acao: "⚡",
  escrita: "✍️",
  conexao: "🤝",
  presenca: "👁️",
  provocacao: "🔥",
  confissao: "💭",
};

// Frases aleatorias para quando nao tem desafio programado
const FREE_PROMPTS = [
  "O que voce esta sentindo agora, sem filtro?",
  "Uma palavra que resume seu dia ate aqui.",
  "O que voce precisa ouvir hoje que ninguem te disse?",
  "Qual pensamento nao te larga?",
  "Se pudesse pausar uma coisa agora, o que seria?",
  "O que voce esta evitando?",
  "Uma coisa boa — por menor que seja — que aconteceu hoje.",
];

export function DailyRitualModal({ isOpen, onClose }: DailyRitualModalProps) {
  const { todayChallenge, todayCheckin, streak, submitCheckin, isLoading } = useDailyChallenge();
  const [response, setResponse] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Prompt livre para dias sem desafio
  const [freePrompt] = useState(() => FREE_PROMPTS[Math.floor(Math.random() * FREE_PROMPTS.length)]);

  // Se ja fez checkin hoje, marcar como submitted
  useEffect(() => {
    if (todayCheckin) {
      setSubmitted(true);
      setResponse(todayCheckin.response || "");
    }
  }, [todayCheckin]);

  const handleSubmit = async () => {
    if (!response.trim()) return;
    setIsSubmitting(true);
    try {
      await submitCheckin(response.trim());
      setSubmitted(true);
    } catch (err) {
      console.error("Erro no checkin:", err);
    }
    setIsSubmitting(false);
  };

  if (!isOpen) return null;

  const hasChallenge = !!todayChallenge;
  const challengeIcon = hasChallenge ? (CHALLENGE_ICONS[todayChallenge!.challenge_type] || "🧠") : "✨";
  const displayTitle = hasChallenge ? todayChallenge!.title : "Check-in livre";
  const displayDescription = hasChallenge ? todayChallenge!.description : freePrompt;
  const displayType = hasChallenge ? todayChallenge!.challenge_type : "presenca";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md bg-[#1A1A1A] border border-white/10 rounded-2xl overflow-hidden"
        >
          {/* Header com streak */}
          <div className="relative px-6 py-5 border-b border-white/8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#C8102E]/15 border border-[#C8102E]/25 flex items-center justify-center">
                  <Flame className="h-5 w-5 text-[#C8102E]" />
                </div>
                <div>
                  <h2 className="text-white text-base" style={{ fontWeight: 700 }}>Ritual do Dia</h2>
                  <p className="text-white/40 text-xs">{hasChallenge ? 'Desafio programado' : 'Presenca livre'}</p>
                </div>
              </div>
              <button onClick={onClose} className="text-white/30 hover:text-white/60 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Streak badge */}
            {streak > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="absolute top-4 right-14 flex items-center gap-1.5 bg-gradient-to-r from-[#FF6B35]/15 to-[#C8102E]/15 border border-[#FF6B35]/25 rounded-full px-3 py-1"
              >
                <Zap className="h-3.5 w-3.5 text-[#FF6B35]" />
                <span className="text-xs text-[#FF6B35]" style={{ fontWeight: 700 }}>
                  {streak} {streak === 1 ? "dia" : "dias"}
                </span>
              </motion.div>
            )}
          </div>

          {/* Conteudo */}
          <div className="px-6 py-6">
            {isLoading ? (
              <div className="py-8 text-center">
                <div className="w-6 h-6 border-2 border-[#81D8D0] border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : submitted ? (
              /* Ja respondeu */
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-4"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 12 }}
                  className="text-5xl mb-4"
                >
                  ✨
                </motion.div>
                <h3 className="text-white text-lg mb-2" style={{ fontWeight: 700 }}>Presenca registrada</h3>
                <p className="text-white/40 text-sm mb-4">Voce esteve aqui hoje. Isso importa.</p>
                {response && (
                  <div className="bg-white/5 border border-white/8 rounded-xl p-4 text-left">
                    <p className="text-white/60 text-sm italic">"{response}"</p>
                  </div>
                )}
                {streak > 1 && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-[#FF6B35] text-sm mt-4"
                    style={{ fontWeight: 600 }}
                  >
                    🔥 {streak} dias seguidos de presenca
                  </motion.p>
                )}
              </motion.div>
            ) : (
              /* Formulario */
              <>
                {/* Desafio ou prompt livre */}
                <div className="mb-6">
                  <div className="flex items-start gap-3 mb-4">
                    <span className="text-3xl">{challengeIcon}</span>
                    <div>
                      <h3 className="text-white text-base mb-1" style={{ fontWeight: 700 }}>
                        {displayTitle}
                      </h3>
                      <span className="text-[10px] uppercase tracking-wider text-white/30 bg-white/5 px-2 py-0.5 rounded-full" style={{ fontWeight: 600 }}>
                        {displayType}
                      </span>
                    </div>
                  </div>
                  <p className="text-white/70 text-sm leading-relaxed" style={{ fontFamily: "Lora, serif" }}>
                    {displayDescription}
                  </p>
                </div>

                {/* Campo de resposta */}
                <div className="mb-5">
                  <textarea
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    placeholder="Sua resposta... (seja honesto, isso e so seu)"
                    maxLength={500}
                    rows={4}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-white/25 focus:border-[#81D8D0]/30 focus:outline-none resize-none"
                  />
                  <p className="text-white/20 text-xs text-right mt-1">{response.length}/500</p>
                </div>

                {/* Botoes */}
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="flex-1 px-4 py-3 bg-white/5 text-white/40 rounded-xl text-sm hover:bg-white/8 transition-colors"
                    style={{ fontWeight: 600 }}
                  >
                    Pular hoje
                  </button>
                  <motion.button
                    onClick={handleSubmit}
                    disabled={!response.trim() || isSubmitting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#C8102E] text-white rounded-xl text-sm disabled:opacity-40 transition-all"
                    style={{ fontWeight: 700 }}
                  >
                    <Send className="h-4 w-4" />
                    {isSubmitting ? "Registrando..." : "Registrar presenca"}
                  </motion.button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
