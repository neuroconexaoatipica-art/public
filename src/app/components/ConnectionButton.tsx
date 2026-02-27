import { useState } from "react";
import { motion } from "motion/react";
import { UserPlus, UserCheck, Clock, Loader2, Brain } from "lucide-react";
import { useConnections } from "../../lib";

interface ConnectionButtonProps {
  targetUserId: string;
  compact?: boolean;
}

export function ConnectionButton({ targetUserId, compact = false }: ConnectionButtonProps) {
  const { connections, sendRequest, acceptRequest, cancelRequest, isLoading } = useConnections();
  const [actionLoading, setActionLoading] = useState(false);

  // Encontrar conexao com este usuario
  const connection = connections.find(
    c => c.requester_id === targetUserId || c.target_id === targetUserId
  );

  const status = connection?.status;
  const isRequester = connection?.requester_id !== targetUserId; // Eu enviei
  const isReceiver = connection?.requester_id === targetUserId; // Ele enviou para mim

  const handleAction = async () => {
    setActionLoading(true);
    try {
      if (!connection) {
        // Enviar pedido
        await sendRequest(targetUserId);
      } else if (status === "pending" && isReceiver) {
        // Aceitar pedido recebido
        await acceptRequest(connection.id);
      } else if (status === "pending" && isRequester) {
        // Cancelar pedido enviado
        await cancelRequest(connection.id);
      }
    } catch (err) {
      console.error("Erro na conexao:", err);
    }
    setActionLoading(false);
  };

  if (isLoading) {
    return (
      <div className="px-4 py-2 bg-white/5 rounded-lg">
        <Loader2 className="h-4 w-4 text-white/30 animate-spin" />
      </div>
    );
  }

  // Definir visual baseado no status
  let icon = Brain;
  let label = "Conectar mentes";
  let bgClass = "bg-[#81D8D0] text-[#1A1A1A]";
  let hoverEffect = true;

  if (status === "accepted") {
    icon = UserCheck;
    label = "Mentes conectadas";
    bgClass = "bg-white/10 text-[#81D8D0] border border-[#81D8D0]/30";
    hoverEffect = false;
  } else if (status === "pending" && isRequester) {
    icon = Clock;
    label = "Conexao pendente";
    bgClass = "bg-white/5 text-white/50 border border-white/10";
    hoverEffect = true; // Click para cancelar
  } else if (status === "pending" && isReceiver) {
    icon = Brain;
    label = "Aceitar conexao";
    bgClass = "bg-[#C8102E] text-white";
    hoverEffect = true;
  } else if (status === "rejected" || status === "blocked") {
    return null; // Nao mostrar botao
  }

  const Icon = icon;

  return (
    <motion.button
      onClick={handleAction}
      disabled={actionLoading || status === "accepted"}
      whileHover={hoverEffect ? { scale: 1.03 } : {}}
      whileTap={hoverEffect ? { scale: 0.97 } : {}}
      className={`inline-flex items-center gap-2 rounded-xl transition-all disabled:opacity-60 ${bgClass} ${
        compact ? "px-3 py-1.5 text-xs" : "px-5 py-2.5 text-sm"
      }`}
      style={{ fontWeight: 600 }}
      title={status === "pending" && isRequester ? "Clique para cancelar" : undefined}
    >
      {actionLoading ? (
        <Loader2 className={`${compact ? "h-3 w-3" : "h-4 w-4"} animate-spin`} />
      ) : (
        <Icon className={compact ? "h-3 w-3" : "h-4 w-4"} />
      )}
      {!compact && <span>{actionLoading ? "..." : label}</span>}
    </motion.button>
  );
}