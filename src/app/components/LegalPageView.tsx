import { motion } from "motion/react";
import { 
  Shield, Scale, AlertTriangle, Lock, Eye, Baby,
  ArrowLeft, FileText
} from "lucide-react";
import { useLegalPage, type LegalPageKey } from "../../lib/useCMS";
import { sanitizeHTML } from "../../lib/security";

// Ícone e cor por tipo de página jurídica
const PAGE_CONFIG: Record<LegalPageKey, { 
  icon: React.ComponentType<{ className?: string }>; 
  color: string; 
  bgGradient: string;
}> = {
  ethics: { 
    icon: Shield, 
    color: 'text-[#81D8D0]',
    bgGradient: 'from-[#35363A] to-black'
  },
  privacy_policy: { 
    icon: Lock, 
    color: 'text-[#81D8D0]',
    bgGradient: 'from-[#35363A] to-black'
  },
  terms_of_use: { 
    icon: FileText, 
    color: 'text-[#81D8D0]',
    bgGradient: 'from-[#35363A] to-black'
  },
  moderation_policy: { 
    icon: Scale, 
    color: 'text-[#FF6B35]',
    bgGradient: 'from-[#2A2520] to-black'
  },
  security_policy: { 
    icon: Eye, 
    color: 'text-[#81D8D0]',
    bgGradient: 'from-[#35363A] to-black'
  },
  child_protection_policy: { 
    icon: Baby, 
    color: 'text-[#C8102E]',
    bgGradient: 'from-[#2A1A1A] to-black'
  },
};

interface LegalPageViewProps {
  pageKey: LegalPageKey;
  /** Componente React fallback — exibido se a página não existir no banco */
  fallback?: React.ReactNode;
  onBack?: () => void;
}

export function LegalPageView({ pageKey, fallback, onBack }: LegalPageViewProps) {
  const { page, isLoading, error } = useLegalPage(pageKey);
  const config = PAGE_CONFIG[pageKey];
  const Icon = config.icon;

  // Loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-10 h-10 border-3 border-[#81D8D0] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/50 text-sm">Carregando...</p>
        </motion.div>
      </div>
    );
  }

  // Erro ou não encontrou — fallback
  if (error || !page) {
    if (fallback) return <>{fallback}</>;
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center px-6">
          <AlertTriangle className="h-12 w-12 text-[#C8102E] mx-auto mb-4" />
          <h2 className="text-xl text-white mb-2">Página não disponível</h2>
          <p className="text-white/60 mb-6">
            {error || 'Esta página jurídica ainda não foi publicada.'}
          </p>
          {onBack && (
            <button
              onClick={onBack}
              className="text-[#81D8D0] hover:underline flex items-center gap-2 mx-auto"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Hero */}
      <section className={`w-full py-20 md:py-28 bg-gradient-to-b ${config.bgGradient}`}>
        <div className="mx-auto max-w-[900px] px-6">
          {onBack && (
            <motion.button
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={onBack}
              className="flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm">Voltar</span>
            </motion.button>
          )}
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <Icon className={`h-16 w-16 ${config.color} mx-auto mb-6`} />
            <h1 className="text-4xl md:text-5xl lg:text-6xl text-white mb-4">
              {page.title}
            </h1>
            <p className="text-sm text-white/40 mt-4">
              Versão {page.version} — Atualizado em{' '}
              {new Date(page.updated_at).toLocaleDateString('pt-BR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Conteúdo HTML do banco */}
      <section className="w-full py-16 md:py-20 bg-black">
        <div className="mx-auto max-w-[900px] px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="legal-content bg-white/5 border border-white/10 rounded-2xl p-8 md:p-10"
            dangerouslySetInnerHTML={{ __html: sanitizeHTML(page.content_html) }}
          />
        </div>
      </section>

      {/* Rodapé da página */}
      <section className="w-full py-8 bg-black">
        <div className="mx-auto max-w-[900px] px-6">
          <div className="text-center pt-8 border-t border-white/10">
            <p className="text-white/60 text-base">
              &copy; 2026 NeuroConexão Atípica. Todos os direitos reservados.
            </p>
            {onBack && (
              <button
                onClick={onBack}
                className="text-[#81D8D0] hover:underline text-sm mt-4 flex items-center gap-2 mx-auto"
              >
                <ArrowLeft className="h-3 w-3" />
                Voltar à plataforma
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}