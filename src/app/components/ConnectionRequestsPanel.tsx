import { useState } from "react";
import { Check, X, UserPlus, Heart } from "lucide-react";
import { useConnections } from "../../lib";
import type { Connection } from "../../lib";
import { UserAvatar } from "./UserAvatar";

interface ConnectionRequestsPanelProps {
  onNavigateToProfile?: (userId: string) => void;
}

export function ConnectionRequestsPanel({ onNavigateToProfile }: ConnectionRequestsPanelProps) {
  const { pendingReceived, acceptRequest, rejectRequest, isLoading } = useConnections();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [justAccepted, setJustAccepted] = useState<{ id: string; userId: string; name: string } | null>(null);

  if (isLoading || (pendingReceived.length === 0 && !justAccepted)) return null;

  const handleAccept = async (conn: Connection) => {
    setProcessingId(conn.id);
    await acceptRequest(conn.id);
    setProcessingId(null);
    // Mostrar prompt de depoimento opcional
    setJustAccepted({
      id: conn.id,
      userId: conn.other_user?.id || conn.requester_id,
      name: conn.other_user?.display_name || conn.other_user?.name || "Membro",
    });
  };

  const handleReject = async (connectionId: string) => {
    setProcessingId(connectionId);
    await rejectRequest(connectionId);
    setProcessingId(null);
  };

  return (
    <div className="bg-white/5 border border-[#81D8D0]/20 rounded-2xl p-4 mb-4">
      {/* Prompt de depoimento apos aceitar conexao */}
      {justAccepted && (
        <div className="mb-4 bg-[#FF6B35]/5 border border-[#FF6B35]/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="h-4 w-4 text-[#FF6B35]" />
            <span className="text-sm text-white font-semibold">Conexao Mental aceita!</span>
          </div>
          <p className="text-xs text-white/50 mb-3">
            Quer deixar um depoimento para <span className="text-[#81D8D0] font-semibold">{justAccepted.name}</span>?
            E opcional, mas cria profundidade real.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                onNavigateToProfile?.(justAccepted.userId);
                setJustAccepted(null);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FF6B35]/15 border border-[#FF6B35]/25 text-[#FF6B35] rounded-lg text-xs font-semibold hover:bg-[#FF6B35]/25 transition-colors"
            >
              <Heart className="h-3 w-3" />
              Deixar depoimento
            </button>
            <button
              onClick={() => setJustAccepted(null)}
              className="px-3 py-1.5 text-white/30 text-xs hover:text-white/50 transition-colors"
            >
              Depois
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 mb-3">
        <UserPlus className="w-4 h-4 text-[#81D8D0]" />
        <h3 className="text-white font-semibold text-sm">
          Solicitacoes de conexao ({pendingReceived.length})
        </h3>
      </div>
      <div className="space-y-3">
        {pendingReceived.map((conn: Connection) => (
          <div key={conn.id} className="flex items-center gap-3">
            <UserAvatar
              name={conn.other_user?.display_name || conn.other_user?.name || "Membro"}
              photoUrl={conn.other_user?.profile_photo}
              size="sm"
              onClick={() => conn.other_user && onNavigateToProfile?.(conn.other_user.id)}
            />
            <div className="flex-1 min-w-0">
              <p
                className="text-white text-sm font-medium truncate cursor-pointer hover:text-[#81D8D0]"
                onClick={() => conn.other_user && onNavigateToProfile?.(conn.other_user.id)}
              >
                {conn.other_user?.display_name || conn.other_user?.name || "Membro"}
              </p>
              <p className="text-white/30 text-xs capitalize">
                {conn.other_user?.role?.replace(/_/g, " ")}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleAccept(conn)}
                disabled={processingId === conn.id}
                className="p-1.5 bg-[#81D8D0] text-black rounded-lg hover:bg-[#81D8D0]/80 disabled:opacity-40 transition-opacity"
                title="Aceitar"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleReject(conn.id)}
                disabled={processingId === conn.id}
                className="p-1.5 bg-white/10 text-white/50 rounded-lg hover:bg-[#C8102E]/20 hover:text-[#C8102E] disabled:opacity-40 transition-all"
                title="Recusar"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}