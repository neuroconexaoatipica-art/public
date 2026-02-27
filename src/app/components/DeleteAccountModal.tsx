import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, AlertTriangle, Trash2, Loader2 } from "lucide-react";
import { supabase } from "../../lib/supabase";

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
}

export function DeleteAccountModal({ isOpen, onClose, userName }: DeleteAccountModalProps) {
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [step, setStep] = useState<'confirm' | 'final'>('confirm');
  const [error, setError] = useState("");

  const expectedText = "EXCLUIR";
  const canProceed = confirmText.trim().toUpperCase() === expectedText;

  const handleDelete = async () => {
    setIsDeleting(true);
    setError("");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("Sessão expirada. Faça login novamente.");

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ieieohtnaymykxiqnmlc.supabase.co';
      const res = await fetch(
        `${supabaseUrl}/functions/v1/delete-user`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const result = await res.json();
      if (!res.ok && !result.success) throw new Error(result.error || 'Erro ao excluir conta');

      await supabase.auth.signOut();
      window.location.reload();
    } catch (err: any) {
      console.error('Erro ao excluir conta:', err);
      setError(err.message || "Erro ao excluir conta. Tente novamente.");
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (isDeleting) return;
    setConfirmText("");
    setStep('confirm');
    setError("");
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md mx-4 bg-[#1a1a1a] border-2 border-[#C8102E]/40 rounded-2xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto"
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              disabled={isDeleting}
              className="absolute top-4 right-4 p-2 hover:bg-white/5 rounded-lg transition-colors disabled:opacity-50"
            >
              <X className="h-5 w-5 text-white/60" />
            </button>

            {step === 'confirm' ? (
              <>
                {/* Warning Icon */}
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-[#C8102E]/20 rounded-full flex items-center justify-center">
                    <AlertTriangle className="h-8 w-8 text-[#C8102E]" />
                  </div>
                </div>

                <h2 className="text-2xl font-semibold text-white text-center mb-3">
                  Excluir minha conta
                </h2>

                <div className="bg-[#C8102E]/10 border border-[#C8102E]/30 rounded-xl p-4 mb-6">
                  <p className="text-sm text-white/80 leading-relaxed">
                    <strong className="text-[#C8102E]">Atencao:</strong> Esta acao e irreversivel. Ao excluir sua conta, serao removidos permanentemente:
                  </p>
                  <ul className="mt-3 space-y-1.5 text-sm text-white/70">
                    <li className="flex items-start gap-2">
                      <span className="text-[#C8102E]">&bull;</span>
                      <span>Seu perfil e dados pessoais</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#C8102E]">&bull;</span>
                      <span>Todos os seus posts e comentarios</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#C8102E]">&bull;</span>
                      <span>Sua foto de perfil</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#C8102E]">&bull;</span>
                      <span>Numero de WhatsApp e autorizacoes</span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={() => setStep('final')}
                  className="w-full py-3 bg-[#C8102E]/20 border-2 border-[#C8102E]/40 text-[#C8102E] rounded-xl font-semibold hover:bg-[#C8102E]/30 transition-all"
                >
                  Entendo e quero continuar
                </button>

                <button
                  onClick={handleClose}
                  className="w-full py-3 mt-3 bg-white/5 text-white/60 rounded-xl font-medium hover:bg-white/10 transition-all"
                >
                  Cancelar
                </button>
              </>
            ) : (
              <>
                {/* Final step */}
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-[#C8102E]/20 rounded-full flex items-center justify-center">
                    <Trash2 className="h-8 w-8 text-[#C8102E]" />
                  </div>
                </div>

                <h2 className="text-2xl font-semibold text-white text-center mb-3">
                  Confirmacao final
                </h2>

                <p className="text-sm text-white/70 text-center mb-6">
                  {userName}, para confirmar a exclusao, digite <strong className="text-[#C8102E]">EXCLUIR</strong> no campo abaixo:
                </p>

                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder='Digite "EXCLUIR"'
                  disabled={isDeleting}
                  className="w-full px-4 py-3 bg-black/50 border-2 border-[#C8102E]/30 rounded-xl text-white text-center font-mono text-lg placeholder:text-white/20 focus:outline-none focus:border-[#C8102E] transition-all disabled:opacity-50"
                  autoFocus
                />

                {error && (
                  <div className="mt-4 p-3 bg-[#C8102E]/10 border border-[#C8102E]/30 rounded-xl">
                    <p className="text-sm text-[#C8102E]">{error}</p>
                  </div>
                )}

                <button
                  onClick={handleDelete}
                  disabled={!canProceed || isDeleting}
                  className="w-full py-3 mt-6 bg-[#C8102E] text-white rounded-xl font-bold hover:bg-[#C8102E]/90 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Excluindo...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-5 w-5" />
                      Excluir minha conta permanentemente
                    </>
                  )}
                </button>

                <button
                  onClick={() => { setStep('confirm'); setConfirmText(""); setError(""); }}
                  disabled={isDeleting}
                  className="w-full py-3 mt-3 bg-white/5 text-white/60 rounded-xl font-medium hover:bg-white/10 transition-all disabled:opacity-50"
                >
                  Voltar
                </button>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}