import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useReactions, REACTION_LABELS } from "../../lib";
import type { ReactionType, ReactionCount } from "../../lib";

interface ReactionBarProps {
  postId: string;
  compact?: boolean;
}

const REACTION_EMOJIS: Record<ReactionType, string> = {
  senti_isso: "💔",
  me_provocou: "🔥",
  gratidao: "🙏",
  intenso: "⚡",
  coragem: "💪",
  lucidez: "🧠",
};

export function ReactionBar({ postId, compact = false }: ReactionBarProps) {
  const { reactions, userReaction, totalCount, toggleReaction, isLoading } = useReactions(postId);
  const [showPicker, setShowPicker] = useState(false);

  const handleReact = async (type: ReactionType) => {
    await toggleReaction(type);
    setShowPicker(false);
  };

  // Reações com contagem > 0
  const activeReactions = reactions.filter(r => r.count > 0);

  return (
    <div className="relative">
      <div className="flex items-center gap-2 flex-wrap">
        {/* Reações ativas */}
        {activeReactions.map((r) => (
          <motion.button
            key={r.type}
            onClick={() => handleReact(r.type)}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition-all ${
              userReaction === r.type
                ? "bg-[#81D8D0]/20 border border-[#81D8D0]/40 text-[#81D8D0]"
                : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/8"
            }`}
          >
            <span className="text-sm">{REACTION_EMOJIS[r.type]}</span>
            <span style={{ fontWeight: 600 }}>{r.count}</span>
          </motion.button>
        ))}

        {/* Botão para abrir picker */}
        <motion.button
          onClick={() => setShowPicker(!showPicker)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs transition-all ${
            showPicker
              ? "bg-white/10 border border-white/20 text-white/80"
              : "bg-white/3 border border-white/8 text-white/40 hover:text-white/60 hover:bg-white/5"
          }`}
        >
          <span className="text-sm">+</span>
          {!compact && totalCount === 0 && <span>Reagir</span>}
        </motion.button>
      </div>

      {/* Picker dropdown */}
      <AnimatePresence>
        {showPicker && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full mb-2 left-0 z-50 bg-[#2A2A2A] border border-white/15 rounded-xl p-2 shadow-xl"
          >
            <div className="flex gap-1">
              {(Object.keys(REACTION_EMOJIS) as ReactionType[]).map((type) => (
                <motion.button
                  key={type}
                  onClick={() => handleReact(type)}
                  whileHover={{ scale: 1.2, y: -4 }}
                  whileTap={{ scale: 0.9 }}
                  className={`flex flex-col items-center gap-0.5 p-2 rounded-lg transition-colors ${
                    userReaction === type ? "bg-[#81D8D0]/15" : "hover:bg-white/8"
                  }`}
                  title={REACTION_LABELS[type]}
                >
                  <span className="text-xl">{REACTION_EMOJIS[type]}</span>
                  <span className="text-[9px] text-white/40" style={{ fontWeight: 500 }}>
                    {REACTION_LABELS[type]}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
