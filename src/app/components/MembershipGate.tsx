import { useState } from "react";
import { motion } from "motion/react";
import { Lock, Send, Check, Clock, XCircle, Loader2, ArrowLeft } from "lucide-react";
import { useCommunityMembership } from "../../lib/useCommunityMembership";
import type { MembershipStatus } from "../../lib/useCommunityMembership";

/**
 * MembershipGate — Portão de entrada por comunidade
 * 
 * Se a comunidade tem requires_approval = true e o user não é membro,
 * exibe este portão em vez do conteúdo. O user pode pedir entrada.
 * 
 * Uso dentro de CommunityPage:
 * ```
 * <MembershipGate communityId={community.id} communityName={community.name}>
 *   {/* conteúdo normal da comunidade *\/}
 * </MembershipGate>
 * ```
 */

interface MembershipGateProps {
  communityId: string | undefined;
  communityName: string;
  communityColor?: string;
  onBack?: () => void;
  children: React.ReactNode;
}

export function MembershipGate({
  communityId,
  communityName,
  communityColor = "#C8102E",
  onBack,
  children,
}: MembershipGateProps) {
  const { status, canView, isLoading, requestEntry, requiresApproval } = useCommunityMembership(communityId);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  // Carregando membership
  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white/30" />
      </div>
    );
  }

  // Se pode ver, renderizar children normalmente
  if (canView) {
    return <>{children}</>;
  }

  // Gate ativo — user não é membro e comunidade requer aprovação
  const handleRequest = async () => {
    setSending(true);
    const result = await requestEntry(message);
    setSending(false);
    if (result.success) {
      setSent(true);
    }
  };

  const statusConfig: Record<NonNullable<MembershipStatus>, { icon: React.ReactNode; title: string; desc: string; showForm: boolean }> = {
    pending: {
      icon: <Clock className="h-10 w-10 text-[#FF6B35]" />,
      title: "Pedido em analise",
      desc: `Seu pedido para entrar em ${communityName} foi recebido. O moderador vai analisar em breve.`,
      showForm: false,
    },
    rejected: {
      icon: <XCircle className="h-10 w-10 text-[#C8102E]" />,
      title: "Pedido nao aprovado",
      desc: `Seu pedido para ${communityName} nao foi aprovado desta vez. Se quiser, pode tentar novamente com uma nova mensagem.`,
      showForm: true,
    },
    approved: {
      icon: <Check className="h-10 w-10 text-[#0A8F85]" />,
      title: "Acesso liberado",
      desc: "Voce ja e membro!",
      showForm: false,
    },
  };

  const currentStatus = status ? statusConfig[status] : null;

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "#0A0A0A" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        {/* Voltar */}
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white/40 hover:text-white/70 text-sm mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar
          </button>
        )}

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
          {/* Se já tem status (pending/rejected) */}
          {currentStatus && !sent ? (
            <>
              <div className="mb-4">{currentStatus.icon}</div>
              <h2 className="text-xl text-white mb-2" style={{ fontWeight: 700 }}>
                {currentStatus.title}
              </h2>
              <p className="text-sm text-white/50 mb-6">{currentStatus.desc}</p>

              {currentStatus.showForm && (
                <div className="space-y-3 text-left">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Por que voce quer entrar nesta comunidade? (opcional)"
                    rows={3}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-white/30 focus:border-white/25 focus:outline-none resize-none"
                  />
                  <button
                    onClick={handleRequest}
                    disabled={sending}
                    className="w-full py-3 rounded-xl text-white text-sm transition-all hover:opacity-90 disabled:opacity-50"
                    style={{ fontWeight: 600, backgroundColor: communityColor }}
                  >
                    {sending ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" /> Enviando...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <Send className="h-4 w-4" /> Tentar novamente
                      </span>
                    )}
                  </button>
                </div>
              )}
            </>
          ) : sent ? (
            /* Pedido enviado com sucesso */
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 15 }}
              >
                <Check className="h-12 w-12 text-[#0A8F85] mx-auto mb-4" />
              </motion.div>
              <h2 className="text-xl text-white mb-2" style={{ fontWeight: 700 }}>
                Pedido enviado!
              </h2>
              <p className="text-sm text-white/50">
                O moderador de {communityName} vai analisar seu pedido. Voce recebera uma notificacao quando for aprovado.
              </p>
            </>
          ) : (
            /* Primeiro acesso — nunca pediu entrada */
            <>
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: `${communityColor}15`, border: `2px solid ${communityColor}30` }}
              >
                <Lock className="h-8 w-8" style={{ color: communityColor }} />
              </div>

              <h2 className="text-xl text-white mb-2" style={{ fontWeight: 700 }}>
                {communityName}
              </h2>
              <p className="text-sm text-white/50 mb-6">
                Esta comunidade tem entrada por aprovacao. Envie um pedido e o moderador vai analisar.
              </p>

              <div className="space-y-3 text-left">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Por que voce quer entrar nesta comunidade? (opcional, mas ajuda na aprovacao)"
                  rows={3}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-white/30 focus:border-white/25 focus:outline-none resize-none"
                />
                <button
                  onClick={handleRequest}
                  disabled={sending}
                  className="w-full py-3 rounded-xl text-white text-sm transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ fontWeight: 600, backgroundColor: communityColor }}
                >
                  {sending ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Enviando...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Send className="h-4 w-4" /> Pedir entrada
                    </span>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
