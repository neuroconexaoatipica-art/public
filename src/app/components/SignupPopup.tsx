import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, AlertCircle, Loader2, CheckCircle, Mail, Phone } from "lucide-react";
import { supabase } from "../../lib/supabase";

interface SignupPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
  onSuccess?: () => void;
}

// Formatar WhatsApp enquanto digita: (11) 99999-9999
function formatWhatsApp(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length === 0) return '';
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

// Extrair apenas dígitos para salvar no banco
function extractDigits(value: string): string {
  return value.replace(/\D/g, '');
}

export function SignupPopup({ isOpen, onClose, onSwitchToLogin, onSuccess }: SignupPopupProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [allowWhatsapp, setAllowWhatsapp] = useState(false);
  const [allowEmail, setAllowEmail] = useState(true);
  const [showPasswordAlert, setShowPasswordAlert] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [pendingConfirmation, setPendingConfirmation] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [confirmedAge, setConfirmedAge] = useState(false);

  const whatsappDigits = extractDigits(whatsapp);
  const isWhatsappValid = whatsappDigits.length === 10 || whatsappDigits.length === 11;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Validação de senha
    if (password.length < 8) {
      setShowPasswordAlert(true);
      return;
    }

    // Validação WhatsApp
    if (!isWhatsappValid) {
      setError("WhatsApp inválido. Use o formato (DD) 9XXXX-XXXX.");
      return;
    }

    setIsLoading(true);

    try {
      // Criar conta no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
            whatsapp: whatsappDigits,
            allow_whatsapp: allowWhatsapp,
            allow_email: allowEmail,
          },
          emailRedirectTo: window.location.origin,
        }
      });

      if (authError) {
        throw authError;
      }

      if (!authData.user) {
        throw new Error("Erro ao criar conta");
      }

      // Verificar se o Supabase requer confirmação de email
      if (!authData.session && authData.user.identities && authData.user.identities.length > 0) {
        setPendingConfirmation(true);
        setIsLoading(false);
        return;
      }

      // Se user.identities está vazio, o email já existe
      if (authData.user.identities && authData.user.identities.length === 0) {
        setError("Este email já está cadastrado. Tente fazer login.");
        setIsLoading(false);
        return;
      }

      // Sucesso!
      setSuccess(true);
      
      setTimeout(() => {
        setIsLoading(false);
        onClose();
        if (onSuccess) {
          onSuccess();
        }
        resetForm();
      }, 1500);

    } catch (err: any) {
      setIsLoading(false);
      
      if (err.message.includes("already registered")) {
        setError("Este email já está cadastrado. Tente fazer login.");
      } else if (err.message.includes("Invalid email")) {
        setError("Email inválido. Verifique e tente novamente.");
      } else if (err.message.includes("rate limit") || err.message.includes("exceeded")) {
        setError("Muitas tentativas. Aguarde alguns minutos e tente novamente.");
      } else {
        setError(err.message || "Erro ao criar conta. Tente novamente.");
      }
    }
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setWhatsapp("");
    setAllowWhatsapp(false);
    setAllowEmail(true);
    setAcceptedTerms(false);
    setConfirmedAge(false);
    setSuccess(false);
    setError("");
    setPendingConfirmation(false);
    setShowPasswordAlert(false);
  };

  const handleClose = () => {
    resetForm();
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
            {/* Botão Fechar */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 hover:bg-[#35363A]/5 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-[#35363A]/60" />
            </button>

            {/* Título */}
            <h2 className="text-3xl md:text-4xl font-semibold mb-2 text-[#35363A]">Manifestar Interesse</h2>
            <p className="text-sm text-[#35363A]/70 mb-6 font-normal leading-relaxed">
              Este é um espaço em construção. Se você quer apenas observar, este não é o momento. 
              Se quer construir, manifeste interesse.
            </p>

            {/* Formulário */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nome */}
              <div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Como prefere ser chamado(a)?"
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-3.5 border-2 border-[#35363A]/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C8102E] focus:border-transparent transition-all text-base text-[#35363A] bg-white placeholder:text-[#35363A]/40 disabled:opacity-50"
                />
              </div>

              {/* Email */}
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Digite seu e-mail"
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-3.5 border-2 border-[#35363A]/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C8102E] focus:border-transparent transition-all text-base text-[#35363A] bg-white placeholder:text-[#35363A]/40 disabled:opacity-50"
                />
              </div>

              {/* WhatsApp */}
              <div>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#35363A]/40" />
                  <input
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(formatWhatsApp(e.target.value))}
                    placeholder="WhatsApp — (DD) 9XXXX-XXXX"
                    required
                    disabled={isLoading}
                    className="w-full pl-12 pr-4 py-3.5 border-2 border-[#35363A]/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C8102E] focus:border-transparent transition-all text-base text-[#35363A] bg-white placeholder:text-[#35363A]/40 disabled:opacity-50"
                  />
                </div>
                <p className="text-xs text-[#35363A]/50 mt-1 ml-1">
                  Usado exclusivamente para liberar seu acesso ao Beta
                </p>
              </div>

              {/* Senha */}
              <div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setShowPasswordAlert(false);
                  }}
                  placeholder="Crie uma senha segura (mínimo 8 caracteres)"
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-3.5 border-2 border-[#35363A]/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C8102E] focus:border-transparent transition-all text-base text-[#35363A] bg-white placeholder:text-[#35363A]/40 disabled:opacity-50"
                />
              </div>

              {/* Alerta de senha curta */}
              <AnimatePresence>
                {showPasswordAlert && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-start gap-2 p-3 bg-[#C8102E]/10 border-2 border-[#C8102E]/30 rounded-xl overflow-hidden"
                  >
                    <AlertCircle className="h-5 w-5 text-[#C8102E] flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-[#C8102E] font-semibold">
                      Senha precisa ter no mínimo 8 caracteres
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Separador visual */}
              <div className="border-t border-[#35363A]/10 pt-3">
                <p className="text-xs font-semibold text-[#35363A]/50 uppercase tracking-wide mb-3">
                  Autorizações
                </p>
              </div>

              {/* Checkbox WhatsApp — OBRIGATÓRIO */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="allow-whatsapp"
                  checked={allowWhatsapp}
                  onChange={(e) => setAllowWhatsapp(e.target.checked)}
                  disabled={isLoading || pendingConfirmation}
                  className="mt-1 h-4 w-4 rounded border-2 border-[#35363A]/30 text-[#81D8D0] focus:ring-[#81D8D0] accent-[#81D8D0] cursor-pointer"
                />
                <label htmlFor="allow-whatsapp" className="text-sm text-[#35363A]/70 cursor-pointer leading-relaxed">
                  Autorizo contato por <strong className="text-[#35363A]">WhatsApp</strong> para liberação do Beta
                  <span className="text-[#C8102E] ml-1">*</span>
                </label>
              </div>

              {/* Checkbox Email — OPCIONAL (default true) */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="allow-email"
                  checked={allowEmail}
                  onChange={(e) => setAllowEmail(e.target.checked)}
                  disabled={isLoading || pendingConfirmation}
                  className="mt-1 h-4 w-4 rounded border-2 border-[#35363A]/30 text-[#81D8D0] focus:ring-[#81D8D0] accent-[#81D8D0] cursor-pointer"
                />
                <label htmlFor="allow-email" className="text-sm text-[#35363A]/70 cursor-pointer leading-relaxed">
                  Autorizo contato por <strong className="text-[#35363A]">e-mail</strong>
                </label>
              </div>

              {/* Checkbox de Idade (18+) */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="confirm-age"
                  checked={confirmedAge}
                  onChange={(e) => setConfirmedAge(e.target.checked)}
                  disabled={isLoading || pendingConfirmation}
                  className="mt-1 h-4 w-4 rounded border-2 border-[#35363A]/30 text-[#81D8D0] focus:ring-[#81D8D0] accent-[#81D8D0] cursor-pointer"
                />
                <label htmlFor="confirm-age" className="text-sm text-[#35363A]/70 cursor-pointer leading-relaxed">
                  Confirmo que tenho <strong className="text-[#35363A]">18 anos ou mais</strong>
                  <span className="text-[#C8102E] ml-1">*</span>
                </label>
              </div>

              {/* Checkbox de Termos */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="accept-terms"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  disabled={isLoading || pendingConfirmation}
                  className="mt-1 h-4 w-4 rounded border-2 border-[#35363A]/30 text-[#81D8D0] focus:ring-[#81D8D0] accent-[#81D8D0] cursor-pointer"
                />
                <label htmlFor="accept-terms" className="text-sm text-[#35363A]/70 cursor-pointer leading-relaxed">
                  Li e concordo com os{" "}
                  <a href="#" onClick={(e) => { e.preventDefault(); window.open('/terms', '_blank'); }} className="text-[#C8102E] font-semibold hover:underline">
                    Termos de Uso
                  </a>{" "}
                  e a{" "}
                  <a href="#" onClick={(e) => { e.preventDefault(); window.open('/privacy', '_blank'); }} className="text-[#C8102E] font-semibold hover:underline">
                    Politica de Privacidade
                  </a>
                  <span className="text-[#C8102E] ml-1">*</span>
                </label>
              </div>

              {/* Erro */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-start gap-2 p-3 bg-[#C8102E]/10 border-2 border-[#C8102E]/30 rounded-xl overflow-hidden"
                  >
                    <AlertCircle className="h-5 w-5 text-[#C8102E] flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-[#C8102E] font-semibold">
                      {error}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Sucesso */}
              <AnimatePresence>
                {success && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-start gap-2 p-3 bg-[#81D8D0]/10 border-2 border-[#81D8D0]/30 rounded-xl overflow-hidden"
                  >
                    <CheckCircle className="h-5 w-5 text-[#81D8D0] flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-[#81D8D0] font-semibold">
                      <p>Recebemos sua manifestação.</p>
                      <p className="font-normal mt-1">Em breve entraremos em contato por WhatsApp ou e-mail.</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Confirmação Pendente */}
              <AnimatePresence>
                {pendingConfirmation && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-start gap-2 p-3 bg-[#81D8D0]/10 border-2 border-[#81D8D0]/30 rounded-xl overflow-hidden"
                  >
                    <Mail className="h-5 w-5 text-[#81D8D0] flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-[#81D8D0] font-semibold">
                      Um email de confirmação foi enviado para {email}. Por favor, verifique sua caixa de entrada.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Botão Submit */}
              <motion.button
                type="submit"
                whileHover={!isLoading && !pendingConfirmation ? { scale: 1.02 } : {}}
                whileTap={!isLoading && !pendingConfirmation ? { scale: 0.98 } : {}}
                disabled={isLoading || pendingConfirmation || !acceptedTerms || !confirmedAge || !allowWhatsapp || !isWhatsappValid}
                className="w-full py-3.5 bg-[#81D8D0] text-black rounded-xl hover:bg-[#81D8D0]/90 transition-all font-bold text-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  "Manifestar interesse"
                )}
              </motion.button>

              <p className="text-xs text-center text-[#35363A]/40 leading-relaxed">
                Campos marcados com <span className="text-[#C8102E]">*</span> são obrigatórios
              </p>
            </form>

            {/* Link para Login */}
            <div className="mt-6 text-center">
              <p className="text-sm text-[#35363A]/70">
                Já tem uma conta?{" "}
                <button
                  onClick={onSwitchToLogin}
                  className="text-[#C8102E] font-bold hover:underline"
                >
                  Entrar
                </button>
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
