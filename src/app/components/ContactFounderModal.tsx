import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Loader2, CheckCircle, Phone } from "lucide-react";
import { supabase, useProfileContext } from "../../lib";
import { cleanTextInput, isValidWhatsApp, RATE_LIMITS } from "../../lib";

interface ContactFounderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ReasonType = "founder" | "feedback" | "tech" | "other";

const REASON_LABELS: Record<ReasonType, string> = {
  founder: "Contribuir como fundador",
  feedback: "Feedback",
  tech: "Dúvida técnica",
  other: "Outro",
};

function formatWhatsApp(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length === 0) return "";
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function extractDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export function ContactFounderModal({ isOpen, onClose }: ContactFounderModalProps) {
  const { user } = useProfileContext();
  const [whatsapp, setWhatsapp] = useState("");
  const [reason, setReason] = useState<ReasonType | "">("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const canSubmit = reason !== "" && !isSubmitting && !success;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !user) return;

    // v1.1: Rate limit anti-spam
    const rateCheck = RATE_LIMITS.CONTACT_FORM();
    if (!rateCheck.allowed) return;

    // v1.1: Validar WhatsApp se preenchido
    const whatsappDigits = extractDigits(whatsapp);
    if (whatsappDigits && !isValidWhatsApp(whatsappDigits)) return;

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("contact_requests").insert({
        user_id: user.id,
        whatsapp: whatsappDigits || null,
        reason,
        message: cleanTextInput(message, 500) || null,
        status: "pending",
      });

      if (error) throw error;

      setSuccess(true);
    } catch (err) {
      console.error("Erro ao enviar contato:", err);
      // Still show success — don't punish user for infra issues
      setSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Reset after close animation
    setTimeout(() => {
      setWhatsapp("");
      setReason("");
      setMessage("");
      setSuccess(false);
    }, 300);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#35363A]/90 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl p-8 md:p-10 border-2 border-[#81D8D0]/20 max-h-[90vh] overflow-y-auto"
          >
            {/* Fechar */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 hover:bg-[#35363A]/5 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-[#35363A]/60" />
            </button>

            {success ? (
              /* Tela de sucesso */
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-8"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#81D8D0]/15 mb-6">
                  <CheckCircle className="h-8 w-8 text-[#81D8D0]" />
                </div>
                <h3 className="text-2xl font-semibold text-[#35363A] mb-3">
                  Mensagem enviada
                </h3>
                <p className="text-[#35363A]/70 font-normal leading-relaxed mb-2">
                  Entrarei em contato pessoalmente.
                </p>
                <p className="text-[#35363A]/50 font-normal">
                  Pode levar até 48h.
                </p>
                <button
                  onClick={handleClose}
                  className="mt-8 px-8 py-3 bg-[#81D8D0] text-black rounded-xl font-bold hover:bg-[#81D8D0]/90 transition-all"
                >
                  Fechar
                </button>
              </motion.div>
            ) : (
              /* Formulário */
              <>
                <h2 className="text-2xl md:text-3xl font-semibold mb-2 text-[#35363A]">
                  Falar com a fundadora
                </h2>
                {user && (
                  <p className="text-sm text-[#35363A]/60 mb-6 font-normal">
                    Olá, {user.name}.
                  </p>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* WhatsApp (opcional) */}
                  <div>
                    <label className="block text-sm font-medium text-[#35363A] mb-2">
                      WhatsApp{" "}
                      <span className="text-[#35363A]/40 font-normal">(opcional)</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#35363A]/40" />
                      <input
                        type="tel"
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(formatWhatsApp(e.target.value))}
                        placeholder="(DD) 9XXXX-XXXX"
                        className="w-full pl-12 pr-4 py-3 border-2 border-[#35363A]/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#81D8D0] focus:border-transparent transition-all text-[#35363A] bg-white placeholder:text-[#35363A]/40"
                      />
                    </div>
                  </div>

                  {/* Motivo (radio obrigatório) */}
                  <div>
                    <label className="block text-sm font-medium text-[#35363A] mb-3">
                      Motivo <span className="text-[#C8102E]">*</span>
                    </label>
                    <div className="space-y-2">
                      {(Object.entries(REASON_LABELS) as [ReasonType, string][]).map(
                        ([value, label]) => (
                          <label
                            key={value}
                            className={`flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all ${
                              reason === value
                                ? "border-[#81D8D0] bg-[#81D8D0]/5"
                                : "border-[#35363A]/10 hover:border-[#35363A]/20"
                            }`}
                          >
                            <input
                              type="radio"
                              name="reason"
                              value={value}
                              checked={reason === value}
                              onChange={() => setReason(value)}
                              className="h-4 w-4 text-[#81D8D0] accent-[#81D8D0]"
                            />
                            <span className="text-[#35363A] font-medium">{label}</span>
                          </label>
                        )
                      )}
                    </div>
                  </div>

                  {/* Mensagem (opcional) */}
                  <div>
                    <label className="block text-sm font-medium text-[#35363A] mb-2">
                      Mensagem{" "}
                      <span className="text-[#35363A]/40 font-normal">(opcional)</span>
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Escreva aqui se quiser..."
                      rows={3}
                      maxLength={500}
                      className="w-full px-4 py-3 border-2 border-[#35363A]/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#81D8D0] focus:border-transparent resize-none transition-all text-[#35363A] bg-white placeholder:text-[#35363A]/40"
                    />
                  </div>

                  {/* Submit */}
                  <motion.button
                    type="submit"
                    whileHover={canSubmit ? { scale: 1.02 } : {}}
                    whileTap={canSubmit ? { scale: 0.98 } : {}}
                    disabled={!canSubmit}
                    className="w-full py-3.5 bg-[#81D8D0] text-black rounded-xl hover:bg-[#81D8D0]/90 transition-all font-bold text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      "Enviar mensagem"
                    )}
                  </motion.button>
                </form>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}