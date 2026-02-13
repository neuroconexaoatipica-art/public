import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, AlertCircle, Loader2, CheckCircle, Mail, FileText } from "lucide-react";
import { supabase } from "../../lib/supabase";

interface SignupPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
  onSuccess?: () => void;
}

export function SignupPopup({ isOpen, onClose, onSwitchToLogin, onSuccess }: SignupPopupProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPasswordAlert, setShowPasswordAlert] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [pendingConfirmation, setPendingConfirmation] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [confirmedAge, setConfirmedAge] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) { setShowPasswordAlert(true); return; }
    setIsLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email, password,
        options: { data: { name }, emailRedirectTo: window.location.origin }
      });
      if (authError) throw authError;
      if (!authData.user) throw new Error("Erro ao criar conta");
      if (!authData.session && authData.user.identities && authData.user.identities.length > 0) {
        setPendingConfirmation(true); setIsLoading(false); return;
      }
      if (authData.user.identities && authData.user.identities.length === 0) {
        setError("Este email já está cadastrado. Tente fazer login."); setIsLoading(false); return;
      }
      setSuccess(true);
      setTimeout(() => { setIsLoading(false); onClose(); if (onSuccess) onSuccess(); setName(""); setEmail(""); setPassword(""); setSuccess(false); }, 1500);
    } catch (err: any) {
      setIsLoading(false);
      if (err.message.includes("already registered")) setError("Este email já está cadastrado. Tente fazer login.");
      else if (err.message.includes("Invalid email")) setError("Email inválido. Verifique e tente novamente.");
      else if (err.message.includes("rate limit") || err.message.includes("exceeded")) setError("Muitas tentativas. Aguarde alguns minutos e tente novamente.");
      else setError(err.message || "Erro ao criar conta. Tente novamente.");
    }
  };

  const handleClose = () => { setPendingConfirmation(false); setSuccess(false); setError(""); setName(""); setEmail(""); setPassword(""); setAcceptedTerms(false); setConfirmedAge(false); onClose(); };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="fixed inset-0 z-50 flex items-center justify-center bg-[#35363A]/90 backdrop-blur-sm" onClick={handleClose}>
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ duration: 0.3, ease: "easeOut" }} onClick={(e) => e.stopPropagation()} className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl p-8 md:p-10 border-2 border-[#81D8D0]/20">
            <button onClick={handleClose} className="absolute top-4 right-4 p-2 hover:bg-[#35363A]/5 rounded-lg transition-colors"><X className="h-5 w-5 text-[#35363A]/60" /></button>
            <h2 className="text-3xl md:text-4xl font-semibold mb-2 text-[#35363A]">Cadastrar</h2>
            <p className="text-sm text-[#35363A]/70 mb-8 font-normal">Entre inteiro(a). Você pertence a este lugar.</p>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div><input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Como prefere ser chamado(a)?" required disabled={isLoading} className="w-full px-4 py-3.5 border-2 border-[#35363A]/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C8102E] focus:border-transparent transition-all text-base text-[#35363A] bg-white placeholder:text-[#35363A]/40 disabled:opacity-50" /></div>
              <div><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Digite seu e-mail" required disabled={isLoading} className="w-full px-4 py-3.5 border-2 border-[#35363A]/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C8102E] focus:border-transparent transition-all text-base text-[#35363A] bg-white placeholder:text-[#35363A]/40 disabled:opacity-50" /></div>
              <div><input type="password" value={password} onChange={(e) => { setPassword(e.target.value); setShowPasswordAlert(false); }} placeholder="Crie uma senha segura (mínimo 8 caracteres)" required disabled={isLoading} className="w-full px-4 py-3.5 border-2 border-[#35363A]/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C8102E] focus:border-transparent transition-all text-base text-[#35363A] bg-white placeholder:text-[#35363A]/40 disabled:opacity-50" /></div>
              <AnimatePresence>{showPasswordAlert && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="flex items-start gap-2 p-3 bg-[#C8102E]/10 border-2 border-[#C8102E]/30 rounded-xl overflow-hidden"><AlertCircle className="h-5 w-5 text-[#C8102E] flex-shrink-0 mt-0.5" /><p className="text-sm text-[#C8102E] font-semibold">Senha precisa ter no mínimo 8 caracteres</p></motion.div>)}</AnimatePresence>
              <div className="flex items-start gap-3">
                <input type="checkbox" id="confirm-age" checked={confirmedAge} onChange={(e) => setConfirmedAge(e.target.checked)} disabled={isLoading || pendingConfirmation} className="mt-1 h-4 w-4 rounded border-2 border-[#35363A]/30 text-[#81D8D0] focus:ring-[#81D8D0] accent-[#81D8D0] cursor-pointer" />
                <label htmlFor="confirm-age" className="text-sm text-[#35363A]/70 cursor-pointer leading-relaxed">Confirmo que tenho <strong className="text-[#35363A]">18 anos ou mais</strong></label>
              </div>
              <div className="flex items-start gap-3">
                <input type="checkbox" id="accept-terms" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} disabled={isLoading || pendingConfirmation} className="mt-1 h-4 w-4 rounded border-2 border-[#35363A]/30 text-[#81D8D0] focus:ring-[#81D8D0] accent-[#81D8D0] cursor-pointer" />
                <label htmlFor="accept-terms" className="text-sm text-[#35363A]/70 cursor-pointer leading-relaxed">Li e concordo com os{" "}<a href="#" onClick={(e) => { e.preventDefault(); window.open('/terms', '_blank'); }} className="text-[#C8102E] font-semibold hover:underline">Termos de Uso</a>{" "}e a{" "}<a href="#" onClick={(e) => { e.preventDefault(); window.open('/privacy', '_blank'); }} className="text-[#C8102E] font-semibold hover:underline">Politica de Privacidade</a></label>
              </div>
              <AnimatePresence>{error && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="flex items-start gap-2 p-3 bg-[#C8102E]/10 border-2 border-[#C8102E]/30 rounded-xl overflow-hidden"><AlertCircle className="h-5 w-5 text-[#C8102E] flex-shrink-0 mt-0.5" /><p className="text-sm text-[#C8102E] font-semibold">{error}</p></motion.div>)}</AnimatePresence>
              <AnimatePresence>{success && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="flex items-start gap-2 p-3 bg-[#81D8D0]/10 border-2 border-[#81D8D0]/30 rounded-xl overflow-hidden"><CheckCircle className="h-5 w-5 text-[#81D8D0] flex-shrink-0 mt-0.5" /><p className="text-sm text-[#81D8D0] font-semibold">Conta criada com sucesso! Redirecionando...</p></motion.div>)}</AnimatePresence>
              <AnimatePresence>{pendingConfirmation && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="flex items-start gap-2 p-3 bg-[#81D8D0]/10 border-2 border-[#81D8D0]/30 rounded-xl overflow-hidden"><Mail className="h-5 w-5 text-[#81D8D0] flex-shrink-0 mt-0.5" /><p className="text-sm text-[#81D8D0] font-semibold">Um email de confirmação foi enviado para {email}. Por favor, verifique sua caixa de entrada.</p></motion.div>)}</AnimatePresence>
              <motion.button type="submit" whileHover={!isLoading && !pendingConfirmation ? { scale: 1.02 } : {}} whileTap={!isLoading && !pendingConfirmation ? { scale: 0.98 } : {}} disabled={isLoading || pendingConfirmation || !acceptedTerms || !confirmedAge} className="w-full py-3.5 bg-[#81D8D0] text-black rounded-xl hover:bg-[#81D8D0]/90 transition-all font-bold text-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {isLoading ? (<><Loader2 className="h-5 w-5 animate-spin" />Criando conta...</>) : ("Criar conta")}
              </motion.button>
            </form>
            <div className="mt-6 text-center"><p className="text-sm text-[#35363A]/70">Já tem uma conta?{" "}<button onClick={onSwitchToLogin} className="text-[#C8102E] font-bold hover:underline">Entrar</button></p></div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
