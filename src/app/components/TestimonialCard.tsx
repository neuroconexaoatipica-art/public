import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Heart, Send, Loader2, PenLine, Check, X, Clock, ChevronDown, ChevronUp, Pencil, Trash2 } from "lucide-react";
import { useMemberTestimonials } from "../../lib";
import type { MemberTestimonial } from "../../lib";
import { UserAvatar } from "./UserAvatar";

interface TestimonialCardProps {
  targetUserId: string;
  currentUserId?: string;
  onNavigateToProfile?: (userId: string) => void;
}

export function TestimonialCard({ targetUserId, currentUserId, onNavigateToProfile }: TestimonialCardProps) {
  const {
    received,
    pending,
    isLoading,
    writeTestimonial,
    approveTestimonial,
    rejectTestimonial,
    editTestimonial,
    deleteMyTestimonial,
    receivedCount,
    pendingCount,
  } = useMemberTestimonials(targetUserId);

  const [showForm, setShowForm] = useState(false);
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [showPending, setShowPending] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const isOwnProfile = currentUserId === targetUserId;
  // Check if current user already sent a testimonial (received or pending)
  const hasWritten = received.some(t => t.from_user === currentUserId) ||
    pending.some(t => t.from_user === currentUserId);

  const handleSubmit = async () => {
    if (content.trim().length < 10) return;
    setIsSubmitting(true);
    setSubmitMsg(null);
    const result = await writeTestimonial(targetUserId, content.trim());
    if (result.success) {
      setSubmitMsg({ type: 'ok', text: 'Depoimento enviado! Aguardando aprovacao.' });
      setContent("");
      setTimeout(() => { setShowForm(false); setSubmitMsg(null); }, 3000);
    } else {
      setSubmitMsg({ type: 'err', text: result.error || 'Erro ao enviar.' });
    }
    setIsSubmitting(false);
  };

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    await approveTestimonial(id, true);
    setProcessingId(null);
  };

  const handleReject = async (id: string) => {
    setProcessingId(id);
    await rejectTestimonial(id);
    setProcessingId(null);
  };

  const handleEdit = async (id: string) => {
    setEditingId(id);
    const testimonial = received.find(t => t.id === id);
    if (testimonial) {
      setEditText(testimonial.text);
    }
  };

  const handleSaveEdit = async (id: string) => {
    if (editText.trim().length < 10) return;
    setProcessingId(id);
    const result = await editTestimonial(id, editText.trim());
    if (result.success) {
      setEditingId(null);
      setEditText("");
    } else {
      setSubmitMsg({ type: 'err', text: result.error || 'Erro ao editar.' });
    }
    setProcessingId(null);
  };

  const handleDelete = async (id: string) => {
    setProcessingId(id);
    const result = await deleteMyTestimonial(id);
    if (result.success) {
      setConfirmDeleteId(null);
    } else {
      setSubmitMsg({ type: 'err', text: result.error || 'Erro ao deletar.' });
    }
    setProcessingId(null);
  };

  function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days < 1) return "hoje";
    if (days === 1) return "ontem";
    if (days < 7) return `${days} dias`;
    if (days < 30) return `${Math.floor(days / 7)} sem`;
    return `${Math.floor(days / 30)} meses`;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart className="h-4 w-4 text-[#FF6B35]" />
          <h3 className="text-white text-sm" style={{ fontWeight: 700 }}>
            O que despertaram em mim
            {receivedCount > 0 && (
              <span className="ml-1.5 text-white/30">({receivedCount})</span>
            )}
          </h3>
          {/* Badge de pendentes — so o dono ve */}
          {isOwnProfile && pendingCount > 0 && (
            <span className="ml-1 px-2 py-0.5 bg-[#FF6B35]/20 text-[#FF6B35] rounded-full text-[10px] font-bold">
              {pendingCount} pendente{pendingCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
        {!isOwnProfile && !hasWritten && currentUserId && (
          <motion.button
            onClick={() => setShowForm(!showForm)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FF6B35]/15 border border-[#FF6B35]/25 text-[#FF6B35] rounded-lg text-xs transition-colors hover:bg-[#FF6B35]/20"
            style={{ fontWeight: 600 }}
          >
            <PenLine className="h-3 w-3" />
            Escrever
          </motion.button>
        )}
      </div>

      {/* ═══ PENDENTES (so o dono do perfil ve) ═══ */}
      {isOwnProfile && pendingCount > 0 && (
        <div className="border border-[#FF6B35]/20 rounded-xl overflow-hidden">
          <button
            onClick={() => setShowPending(!showPending)}
            className="w-full flex items-center justify-between px-4 py-3 bg-[#FF6B35]/5 hover:bg-[#FF6B35]/10 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-[#FF6B35]" />
              <span className="text-xs font-semibold text-[#FF6B35]">
                Aguardando sua aprovacao ({pendingCount})
              </span>
            </div>
            {showPending ? (
              <ChevronUp className="h-3.5 w-3.5 text-[#FF6B35]" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5 text-[#FF6B35]" />
            )}
          </button>

          <AnimatePresence>
            {showPending && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-3 space-y-3">
                  {pending.map((t) => (
                    <motion.div
                      key={t.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white/3 border border-white/8 rounded-xl p-4"
                    >
                      <div className="flex items-center gap-2.5 mb-2.5">
                        <button
                          onClick={() => onNavigateToProfile?.(t.from_user)}
                          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                        >
                          <UserAvatar name={t.author_display_name || t.author_name || "?"} photoUrl={t.author_photo} size={28} />
                          <span className="text-white text-xs" style={{ fontWeight: 600 }}>
                            {t.author_display_name || t.author_name || "Membro"}
                          </span>
                        </button>
                        <span className="text-white/20 text-[10px]">{timeAgo(t.created_at)}</span>
                      </div>
                      <p className="text-white/60 text-sm leading-relaxed mb-3" style={{ fontFamily: "Lora, serif", fontStyle: "italic" }}>
                        "{t.text}"
                      </p>
                      {/* Botoes aceitar / rejeitar */}
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleApprove(t.id)}
                          disabled={processingId === t.id}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-[#81D8D0]/15 border border-[#81D8D0]/30 text-[#81D8D0] rounded-lg text-xs font-semibold hover:bg-[#81D8D0]/25 transition-colors disabled:opacity-50"
                        >
                          {processingId === t.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Check className="h-3 w-3" />
                          )}
                          Aprovar
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleReject(t.id)}
                          disabled={processingId === t.id}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-[#C8102E]/10 border border-[#C8102E]/25 text-[#C8102E] rounded-lg text-xs font-semibold hover:bg-[#C8102E]/20 transition-colors disabled:opacity-50"
                        >
                          {processingId === t.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <X className="h-3 w-3" />
                          )}
                          Rejeitar
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Formulario de envio */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white/3 border border-white/8 rounded-xl p-4">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Reconheca a presenca desta pessoa neste espaco... (minimo 10 caracteres)"
                maxLength={1000}
                rows={3}
                className="w-full bg-transparent text-white text-sm placeholder:text-white/25 focus:outline-none resize-none"
              />
              {submitMsg && (
                <div className={`mt-2 text-xs font-semibold ${submitMsg.type === 'ok' ? 'text-[#81D8D0]' : 'text-[#C8102E]'}`}>
                  {submitMsg.text}
                </div>
              )}
              <div className="flex items-center justify-between mt-3">
                <span className="text-white/20 text-xs">{content.length}/1000</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setShowForm(false); setContent(""); setSubmitMsg(null); }}
                    className="px-3 py-1.5 text-white/40 text-xs hover:text-white/60 transition-colors"
                  >
                    Cancelar
                  </button>
                  <motion.button
                    onClick={handleSubmit}
                    disabled={content.trim().length < 10 || isSubmitting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-[#FF6B35] text-white rounded-lg text-xs disabled:opacity-40 transition-all"
                    style={{ fontWeight: 600 }}
                  >
                    {isSubmitting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                    Enviar
                  </motion.button>
                </div>
              </div>
              <p className="text-[10px] text-white/20 mt-2">
                O depoimento sera enviado para aprovacao antes de aparecer no perfil.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lista de reconhecimentos aprovados */}
      {isLoading ? (
        <div className="py-4 text-center">
          <Loader2 className="h-5 w-5 text-white/20 animate-spin mx-auto" />
        </div>
      ) : received.length === 0 ? (
        <p className="text-white/20 text-xs text-center py-4">
          {isOwnProfile ? "Voce ainda nao recebeu reconhecimentos." : "Nenhum reconhecimento ainda."}
        </p>
      ) : (
        <div className="space-y-3">
          {received.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/3 border border-white/6 rounded-xl p-4"
            >
              <div className="flex items-center gap-2.5 mb-2.5">
                <button
                  onClick={() => onNavigateToProfile?.(t.from_user)}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  <UserAvatar name={t.author_display_name || t.author_name || "?"} photoUrl={t.author_photo} size={28} />
                  <span className="text-white text-xs" style={{ fontWeight: 600 }}>
                    {t.author_display_name || t.author_name || "Membro"}
                  </span>
                </button>
                <span className="text-white/20 text-[10px]">{timeAgo(t.created_at)}</span>
                {t.from_user === currentUserId && (
                  <div className="ml-2">
                    <button
                      onClick={() => handleEdit(t.id)}
                      className="text-[#FF6B35] hover:text-[#FF6B35]/80 transition-colors"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(t.id)}
                      className="text-[#FF6B35] hover:text-[#FF6B35]/80 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
              {editingId === t.id ? (
                <div className="space-y-2">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    placeholder="Reconheca a presenca desta pessoa neste espaco... (minimo 10 caracteres)"
                    maxLength={1000}
                    rows={3}
                    className="w-full bg-transparent text-white text-sm placeholder:text-white/25 focus:outline-none resize-none"
                  />
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-white/20 text-xs">{editText.length}/1000</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setEditingId(null); setEditText(""); }}
                        className="px-3 py-1.5 text-white/40 text-xs hover:text-white/60 transition-colors"
                      >
                        Cancelar
                      </button>
                      <motion.button
                        onClick={() => handleSaveEdit(t.id)}
                        disabled={editText.trim().length < 10 || processingId === t.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-1.5 px-4 py-1.5 bg-[#FF6B35] text-white rounded-lg text-xs disabled:opacity-40 transition-all"
                        style={{ fontWeight: 600 }}
                      >
                        {processingId === t.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                        Salvar
                      </motion.button>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-white/60 text-sm leading-relaxed" style={{ fontFamily: "Lora, serif", fontStyle: "italic" }}>
                  "{t.text}"
                </p>
              )}
              {confirmDeleteId === t.id && (
                <div className="mt-2">
                  <p className="text-[#C8102E] text-xs font-semibold">
                    Tem certeza que deseja deletar este reconhecimento?
                  </p>
                  <div className="flex gap-2 mt-1">
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      className="px-3 py-1.5 text-white/40 text-xs hover:text-white/60 transition-colors"
                    >
                      Cancelar
                    </button>
                    <motion.button
                      onClick={() => handleDelete(t.id)}
                      disabled={processingId === t.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center gap-1.5 px-4 py-1.5 bg-[#C8102E] text-white rounded-lg text-xs disabled:opacity-40 transition-all"
                      style={{ fontWeight: 600 }}
                    >
                      {processingId === t.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                      Deletar
                    </motion.button>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}