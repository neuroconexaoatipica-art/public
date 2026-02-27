import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, AlertTriangle, ShieldAlert, Send, Check } from "lucide-react";
import { useReports, REPORT_TYPE_LABELS } from "../../lib";
import type { ReportType } from "../../lib";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentId?: string;
  contentType?: "post" | "comment" | "message" | "community_message" | "profile" | "testimonial";
  reportedUserId?: string;
}

const REPORT_CATEGORIES: { type: ReportType; label: string; icon: string; severity: "low" | "medium" | "high" | "critical" }[] = [
  { type: "child_safety", label: "Exploração infantil ou presença de menor", icon: "🚨", severity: "critical" },
  { type: "sexual_content", label: "Conteúdo sexual não consensual", icon: "⚠️", severity: "high" },
  { type: "violence", label: "Violência ou ameaça", icon: "🔴", severity: "high" },
  { type: "self_harm", label: "Autolesão ou suicídio", icon: "💔", severity: "high" },
  { type: "harassment", label: "Assédio ou perseguição", icon: "🚫", severity: "medium" },
  { type: "hate_speech", label: "Discurso de ódio", icon: "❌", severity: "medium" },
  { type: "impersonation", label: "Falsa identidade", icon: "🎭", severity: "medium" },
  { type: "privacy_violation", label: "Violação de privacidade", icon: "🔒", severity: "medium" },
  { type: "inappropriate_content", label: "Conteúdo inadequado", icon: "📛", severity: "low" },
  { type: "spam", label: "Spam ou propaganda", icon: "📧", severity: "low" },
  { type: "other", label: "Outro motivo", icon: "📝", severity: "low" },
];

export function ReportModal({ isOpen, onClose, contentId, contentType, reportedUserId }: ReportModalProps) {
  const [selectedType, setSelectedType] = useState<ReportType | null>(null);
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { submitReport } = useReports();

  const handleSubmit = async () => {
    if (!selectedType) return;
    setIsSubmitting(true);
    try {
      const category = REPORT_CATEGORIES.find(c => c.type === selectedType);
      await submitReport({
        reportedUserId: reportedUserId || undefined,
        contentId: contentId || undefined,
        contentType: contentType || undefined,
        reportType: selectedType,
        severity: category?.severity || "medium",
        description: description.trim() || undefined,
      });
      setSubmitted(true);
    } catch (err) {
      console.error("Erro ao enviar denúncia:", err);
    }
    setIsSubmitting(false);
  };

  const handleClose = () => {
    setSelectedType(null);
    setDescription("");
    setSubmitted(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg bg-[#1A1A1A] border border-white/10 rounded-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <ShieldAlert className="h-5 w-5 text-[#C8102E]" />
              <h2 className="text-white text-lg" style={{ fontWeight: 700 }}>Denunciar</h2>
            </div>
            <button onClick={handleClose} className="text-white/40 hover:text-white/80 transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          {submitted ? (
            /* Confirmação */
            <div className="px-6 py-12 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 12 }}
                className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#0A8F85]/20 flex items-center justify-center"
              >
                <Check className="h-8 w-8 text-[#0A8F85]" />
              </motion.div>
              <h3 className="text-white text-xl mb-2" style={{ fontWeight: 700 }}>Denúncia enviada</h3>
              <p className="text-white/60 text-sm mb-6 max-w-sm mx-auto">
                {selectedType === "child_safety"
                  ? "Esta denúncia foi marcada como CRÍTICA e será analisada imediatamente pela administração."
                  : "Sua denúncia será analisada pela equipe de moderação. Obrigada por ajudar a manter este espaço seguro."}
              </p>
              <button
                onClick={handleClose}
                className="px-8 py-3 bg-white/10 text-white rounded-xl text-sm hover:bg-white/15 transition-colors"
                style={{ fontWeight: 600 }}
              >
                Fechar
              </button>
            </div>
          ) : (
            /* Formulário */
            <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">
              {/* Alerta child safety */}
              <div className="flex items-start gap-3 bg-[#C8102E]/10 border border-[#C8102E]/25 rounded-xl p-4 mb-5">
                <AlertTriangle className="h-5 w-5 text-[#C8102E] flex-shrink-0 mt-0.5" />
                <p className="text-sm text-white/80">
                  Denúncias de exploração infantil são tratadas com prioridade máxima e encaminhadas imediatamente.
                </p>
              </div>

              {/* Tipos */}
              <p className="text-white/50 text-xs uppercase tracking-wider mb-3" style={{ fontWeight: 600 }}>Motivo da denúncia</p>
              <div className="space-y-2 mb-5">
                {REPORT_CATEGORIES.map((cat) => (
                  <button
                    key={cat.type}
                    onClick={() => setSelectedType(cat.type)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all text-sm ${
                      selectedType === cat.type
                        ? cat.type === "child_safety"
                          ? "bg-[#C8102E]/20 border-2 border-[#C8102E]/50 text-white"
                          : "bg-white/10 border-2 border-[#81D8D0]/50 text-white"
                        : "bg-white/3 border border-white/8 text-white/70 hover:bg-white/5 hover:border-white/15"
                    }`}
                  >
                    <span className="text-base">{cat.icon}</span>
                    <span>{cat.label}</span>
                    {cat.severity === "critical" && (
                      <span className="ml-auto text-[10px] px-2 py-0.5 bg-[#C8102E] text-white rounded-full" style={{ fontWeight: 700 }}>
                        URGENTE
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Descrição */}
              {selectedType && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <p className="text-white/50 text-xs uppercase tracking-wider mb-2" style={{ fontWeight: 600 }}>
                    Detalhes (opcional)
                  </p>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Descreva o que aconteceu..."
                    maxLength={2000}
                    rows={4}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-white/30 focus:border-white/25 focus:outline-none resize-none"
                  />
                  <p className="text-white/30 text-xs text-right mt-1">{description.length}/2000</p>
                </motion.div>
              )}

              {/* Submit */}
              <div className="flex gap-3 mt-5 pt-4 border-t border-white/8">
                <button
                  onClick={handleClose}
                  className="flex-1 px-4 py-3 bg-white/5 text-white/60 rounded-xl text-sm hover:bg-white/10 transition-colors"
                  style={{ fontWeight: 600 }}
                >
                  Cancelar
                </button>
                <motion.button
                  onClick={handleSubmit}
                  disabled={!selectedType || isSubmitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm text-white disabled:opacity-40 transition-all ${
                    selectedType === "child_safety" ? "bg-[#C8102E]" : "bg-[#0A8F85]"
                  }`}
                  style={{ fontWeight: 700 }}
                >
                  <Send className="h-4 w-4" />
                  {isSubmitting ? "Enviando..." : "Enviar denúncia"}
                </motion.button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
