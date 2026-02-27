/**
 * LiveQuestionsPanel — Painel de perguntas antecipadas para lives
 * 
 * Integrado no EventDetailPage.
 * Membros enviam perguntas (anonimas ou identificadas).
 * Founder/mod pode selecionar, destacar e marcar como respondida.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  MessageCircle, Send, Loader2, Eye, EyeOff, Star, CheckCircle,
  ChevronDown, ChevronUp, Shield, Sparkles
} from "lucide-react";
import { useLiveQuestions } from "../../lib/useLiveQuestions";
import { UserAvatar } from "./UserAvatar";

interface LiveQuestionsPanelProps {
  eventId: string;
  currentUserId?: string;
  isHost: boolean; // founder ou mod que organiza a live
  onNavigateToProfile?: (userId: string) => void;
}

export function LiveQuestionsPanel({
  eventId,
  currentUserId,
  isHost,
  onNavigateToProfile,
}: LiveQuestionsPanelProps) {
  const {
    questions,
    isLoading,
    submitQuestion,
    selectQuestion,
    markAnswered,
  } = useLiveQuestions(eventId);

  const [newQuestion, setNewQuestion] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSensitive, setIsSensitive] = useState(false);
  const [sending, setSending] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const selectedQuestions = questions.filter(q => q.is_selected);
  const unselectedQuestions = questions.filter(q => !q.is_selected);
  const myQuestions = questions.filter(q => q.user_id === currentUserId);

  const handleSubmit = async () => {
    if (!newQuestion.trim() || sending) return;
    setSending(true);

    const result = await submitQuestion(newQuestion.trim(), isAnonymous, isSensitive);
    if (result.success) {
      setNewQuestion("");
      setIsAnonymous(false);
      setIsSensitive(false);
      setSuccessMsg("Pergunta enviada!");
      setTimeout(() => setSuccessMsg(null), 2500);
    }
    setSending(false);
  };

  const displayQuestions = showAll ? questions : selectedQuestions;

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-[#81D8D0]" />
          <h3 className="text-sm text-white font-bold">Perguntas para a Live</h3>
          <span className="text-[10px] text-white/30 bg-white/5 px-2 py-0.5 rounded-full">
            {questions.length}
          </span>
        </div>
        {isHost && questions.length > 0 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="flex items-center gap-1 text-[11px] text-[#81D8D0] hover:text-white transition-colors"
          >
            {showAll ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            {showAll ? "So selecionadas" : `Ver todas (${questions.length})`}
          </button>
        )}
      </div>

      {/* Formulário de envio */}
      {currentUserId && (
        <div className="px-5 py-4 border-b border-white/10 space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSubmit()}
              placeholder="Envie sua pergunta antes da live..."
              className="flex-1 px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-white/25 focus:border-[#81D8D0]/50 focus:outline-none"
              maxLength={500}
            />
            <button
              onClick={handleSubmit}
              disabled={!newQuestion.trim() || sending}
              className="px-3 py-2.5 bg-[#81D8D0] hover:bg-[#81D8D0]/90 disabled:opacity-40 disabled:cursor-not-allowed text-black rounded-xl transition-all"
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </div>

          {/* Toggles */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsAnonymous(!isAnonymous)}
              className={`flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-lg transition-all ${
                isAnonymous
                  ? "bg-[#FF6B35]/15 text-[#FF6B35] border border-[#FF6B35]/25"
                  : "bg-white/5 text-white/40 border border-white/10 hover:bg-white/8"
              }`}
            >
              {isAnonymous ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              {isAnonymous ? "Anonima" : "Identificada"}
            </button>
            <button
              onClick={() => setIsSensitive(!isSensitive)}
              className={`flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-lg transition-all ${
                isSensitive
                  ? "bg-[#C8102E]/15 text-[#C8102E] border border-[#C8102E]/25"
                  : "bg-white/5 text-white/40 border border-white/10 hover:bg-white/8"
              }`}
            >
              <Shield className="h-3 w-3" />
              {isSensitive ? "Sensivel" : "Normal"}
            </button>
          </div>

          {/* Success */}
          <AnimatePresence>
            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 text-xs text-[#81D8D0]"
              >
                <CheckCircle className="h-3.5 w-3.5" />
                {successMsg}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Lista de perguntas */}
      <div className="divide-y divide-white/5">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-[#81D8D0] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : displayQuestions.length === 0 ? (
          <div className="py-8 text-center">
            <MessageCircle className="h-8 w-8 text-white/10 mx-auto mb-2" />
            <p className="text-xs text-white/30">
              {questions.length === 0
                ? "Nenhuma pergunta ainda. Seja o primeiro!"
                : "Nenhuma pergunta selecionada ainda."}
            </p>
          </div>
        ) : (
          displayQuestions.map((q) => (
            <motion.div
              key={q.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`px-5 py-3.5 flex items-start gap-3 transition-colors ${
                q.is_highlighted ? "bg-[#FF6B35]/5" : q.is_selected ? "bg-[#81D8D0]/5" : "hover:bg-white/3"
              }`}
            >
              {/* Avatar ou anonimo */}
              {q.anonymous ? (
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                  <EyeOff className="h-3.5 w-3.5 text-white/30" />
                </div>
              ) : (
                <UserAvatar
                  name={q.author_name || "Membro"}
                  photoUrl={q.author_photo}
                  size="sm"
                  onClick={() => q.user_id && onNavigateToProfile?.(q.user_id)}
                />
              )}

              <div className="flex-1 min-w-0">
                {/* Author */}
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] text-white/60 font-semibold">
                    {q.anonymous ? "Anonimo" : q.author_name || "Membro"}
                  </span>
                  {q.is_sensitive && (
                    <Shield className="h-3 w-3 text-[#C8102E]/60" />
                  )}
                  {q.is_selected && (
                    <span className="text-[9px] px-1.5 py-0.5 bg-[#81D8D0]/15 text-[#81D8D0] rounded-full font-bold">
                      SELECIONADA
                    </span>
                  )}
                  {q.is_highlighted && (
                    <Sparkles className="h-3 w-3 text-[#FF6B35]" />
                  )}
                  {q.answered_live && (
                    <span className="text-[9px] px-1.5 py-0.5 bg-green-500/15 text-green-400 rounded-full font-bold">
                      RESPONDIDA
                    </span>
                  )}
                </div>

                {/* Question text */}
                <p className="text-sm text-white/75 leading-relaxed break-words">
                  {q.question_text}
                </p>

                {/* Answer summary */}
                {q.answer_summary && (
                  <div className="mt-2 pl-3 border-l-2 border-[#81D8D0]/30">
                    <p className="text-[11px] text-[#81D8D0]/60 italic">{q.answer_summary}</p>
                  </div>
                )}
              </div>

              {/* Host actions */}
              {isHost && (
                <div className="flex flex-col gap-1 flex-shrink-0">
                  {!q.is_selected && (
                    <button
                      onClick={() => selectQuestion(q.id, true)}
                      className="p-1.5 bg-[#81D8D0]/10 hover:bg-[#81D8D0]/25 rounded-lg transition-colors"
                      title="Selecionar"
                    >
                      <Star className="h-3.5 w-3.5 text-[#81D8D0]" />
                    </button>
                  )}
                  {q.is_selected && !q.answered_live && (
                    <button
                      onClick={() => markAnswered(q.id)}
                      className="p-1.5 bg-green-500/10 hover:bg-green-500/25 rounded-lg transition-colors"
                      title="Marcar como respondida"
                    >
                      <CheckCircle className="h-3.5 w-3.5 text-green-400" />
                    </button>
                  )}
                  {q.is_selected && (
                    <button
                      onClick={() => selectQuestion(q.id, false)}
                      className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                      title="Desselecionar"
                    >
                      <Star className="h-3.5 w-3.5 text-white/30" />
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>

      {/* Minhas perguntas (se nao sou host) */}
      {!isHost && myQuestions.length > 0 && (
        <div className="px-5 py-3 border-t border-white/10 bg-white/3">
          <p className="text-[10px] text-white/30 mb-2">Suas perguntas ({myQuestions.length})</p>
          {myQuestions.map(q => (
            <div key={q.id} className="flex items-center gap-2 mb-1">
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                q.answered_live ? "bg-green-400" : q.is_selected ? "bg-[#81D8D0]" : "bg-white/20"
              }`} />
              <span className="text-xs text-white/40 truncate">{q.question_text}</span>
              {q.is_selected && <Star className="h-2.5 w-2.5 text-[#81D8D0] flex-shrink-0" />}
              {q.answered_live && <CheckCircle className="h-2.5 w-2.5 text-green-400 flex-shrink-0" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}