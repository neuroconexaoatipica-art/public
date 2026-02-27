import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Clock, Heart, Shield, LogOut, RefreshCw, Loader2 } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useProfileContext } from "../../lib/ProfileContext";
import { LogoIcon } from "./LogoIcon";

/**
 * WaitingRoom — Tela exibida para users com role 'registered_unfinished'
 * 
 * O user fez cadastro + onboarding mas ainda não foi aprovado pela Mila.
 * Esta tela é acolhedora, não punitiva. Reforça que a curadoria é intencional.
 */

interface WaitingRoomProps {
  onLogout: () => void;
}

export function WaitingRoom({ onLogout }: WaitingRoomProps) {
  const { user, refreshProfile } = useProfileContext();
  const [checking, setChecking] = useState(false);
  const [signupDate, setSignupDate] = useState<string>("");

  useEffect(() => {
    if (user?.created_at) {
      const d = new Date(user.created_at);
      setSignupDate(d.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }));
    }
  }, [user?.created_at]);

  const handleCheckStatus = async () => {
    setChecking(true);
    await refreshProfile();
    // Se o role mudou, o App.tsx vai redirecionar automaticamente
    setTimeout(() => setChecking(false), 2000);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onLogout();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "#0A0A0A" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-lg w-full text-center"
      >
        {/* Logo */}
        <LogoIcon size={56} className="h-14 w-14 mx-auto mb-6" />

        {/* Ícone principal */}
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="w-20 h-20 rounded-full bg-[#C8102E]/10 border-2 border-[#C8102E]/20 flex items-center justify-center mx-auto mb-6"
        >
          <Clock className="h-10 w-10 text-[#C8102E]" />
        </motion.div>

        {/* Título */}
        <h1 className="text-2xl md:text-3xl text-white mb-3" style={{ fontWeight: 700 }}>
          Seu pedido de entrada foi recebido
        </h1>

        {/* Subtítulo acolhedor */}
        <p className="text-base text-white/60 mb-8 max-w-md mx-auto leading-relaxed">
          A NeuroConexao Atipica e uma rede com curadoria humana. Cada pedido e analisado pessoalmente pela fundadora. Isso leva um tempinho — mas garante que o espaco seja seguro pra todo mundo.
        </p>

        {/* Card informativo */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6 text-left space-y-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-[#81D8D0] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-white" style={{ fontWeight: 600 }}>Por que tem fila?</p>
              <p className="text-xs text-white/50 mt-1">
                Nao usamos algoritmo pra decidir quem entra. A fundadora analisa cada cadastro pra garantir que o espaco continue sendo um territorio seguro e real.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Heart className="h-5 w-5 text-[#C8102E] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-white" style={{ fontWeight: 600 }}>O que acontece depois?</p>
              <p className="text-xs text-white/50 mt-1">
                Quando seu acesso for liberado, voce entra direto no Social Hub com acesso a todas as comunidades, lives, rituais e conexoes.
              </p>
            </div>
          </div>

          {user?.name && (
            <div className="pt-3 border-t border-white/10">
              <p className="text-xs text-white/30">
                Cadastro de <span className="text-white/60" style={{ fontWeight: 600 }}>{user.name}</span>
                {signupDate && <> em {signupDate}</>}
              </p>
            </div>
          )}
        </div>

        {/* Ações */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleCheckStatus}
            disabled={checking}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#C8102E] text-white rounded-xl text-sm transition-all hover:bg-[#A00D24] disabled:opacity-50"
            style={{ fontWeight: 600 }}
          >
            {checking ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Verificando...</>
            ) : (
              <><RefreshCw className="h-4 w-4" /> Verificar status</>
            )}
          </button>

          <button
            onClick={handleLogout}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/5 text-white/60 border border-white/10 rounded-xl text-sm transition-all hover:bg-white/10 hover:text-white"
            style={{ fontWeight: 600 }}
          >
            <LogOut className="h-4 w-4" /> Sair
          </button>
        </div>

        {/* Nota de rodapé */}
        <p className="text-xs text-white/20 mt-8">
          Se tiver duvidas, entre em contato pelo formulario da landing page.
        </p>
      </motion.div>
    </div>
  );
}
