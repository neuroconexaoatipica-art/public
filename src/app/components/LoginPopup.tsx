import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "../../lib/supabase";

interface LoginPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignup: () => void;
  onLoginSuccess?: () => void;
}

export function LoginPopup({ isOpen, onClose, onSwitchToSignup, onLoginSuccess }: LoginPopupProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Login no Supabase Auth
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        throw authError;
      }

      if (!data.user) {
        throw new Error("Erro ao fazer login");
      }

      // Sucesso!
      setIsLoading(false);
      onClose();
      
      // Resetar formulário
      setEmail("");
      setPassword("");
      
      // Chamar callback de sucesso
      if (onLoginSuccess) {
        onLoginSuccess();
      }

    } catch (err: any) {
      setIsLoading(false);
      
      // Tratar erros comuns
      if (err.message.includes("Invalid login credentials")) {
        setError("Email ou senha incorretos. Tente novamente.");
      } else if (err.message.includes("Email not confirmed")) {
        setError("Confirme seu email antes de fazer login.");
      } else {
        setError(err.message || "Erro ao fazer login. Tente novamente.");
      }
    }
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
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl p-8 md:p-10 border-2 border-[#81D8D0]/20"
          >
            {/* Botão Fechar */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-[#35363A]/5 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-[#35363A]/60" />
            </button>

            {/* Título */}
            <h2 className="text-3xl md:text-4xl font-semibold mb-2 text-[#35363A]">Entrar</h2>
            <p className="text-sm text-[#35363A]/70 mb-8 font-normal">
              Bem-vindo(a) de volta.
            </p>

            {/* Formulário */}
            <form onSubmit={handleSubmit} className="space-y-5">
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

              {/* Senha */}
              <div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-3.5 border-2 border-[#35363A]/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C8102E] focus:border-transparent transition-all text-base text-[#35363A] bg-white placeholder:text-[#35363A]/40 disabled:opacity-50"
                />
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

              {/* Botão Submit */}
              <motion.button
                type="submit"
                whileHover={!isLoading ? { scale: 1.02 } : {}}
                whileTap={!isLoading ? { scale: 0.98 } : {}}
                disabled={isLoading}
                className="w-full py-3.5 bg-[#81D8D0] text-black rounded-xl hover:bg-[#81D8D0]/90 transition-all font-bold text-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  "Entrar"
                )}
              </motion.button>
            </form>

            {/* Link para Cadastro */}
            <div className="mt-6 text-center">
              <p className="text-sm text-[#35363A]/70">
                Ainda não tem conta?{" "}
                <button
                  onClick={onSwitchToSignup}
                  className="text-[#C8102E] font-bold hover:underline"
                >
                  Cadastrar
                </button>
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
