import { useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Calendar, Clock, MapPin, Video, Users, Flame, Star, CheckCircle, ExternalLink, Trash2, Edit3, XCircle } from "lucide-react";
import { UserAvatar } from "./UserAvatar";
import { LiveQuestionsPanel } from "./LiveQuestionsPanel";
import { useEventDetail } from "../../lib/useEvents";
import { useEvents } from "../../lib/useEvents";
import { EVENT_TYPE_LABELS, RITUAL_TYPE_LABELS, RITUAL_TYPE_DESCRIPTIONS, LOCATION_TYPE_LABELS, EVENT_STATUS_LABELS } from "../../lib/useEvents";
import { useProfileContext, isSuperAdmin, hasModAccess } from "../../lib";

// ─── Formatação de data nativa (sem date-fns) ──────────────
const fmtFull = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "numeric", month: "long" });
const fmtTime = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" });

interface EventDetailPageProps {
  eventId: string;
  onBack: () => void;
  onNavigateToProfile: (userId: string) => void;
}

const EVENT_TYPE_COLORS: Record<string, string> = {
  live: '#C8102E',
  workshop: '#FF6B35',
  ritual: '#6B21A8',
  encontro: '#81D8D0',
  debate: '#1E3A8A',
  oficina: '#065F46',
  outro: '#374151',
};

export function EventDetailPage({ eventId, onBack, onNavigateToProfile }: EventDetailPageProps) {
  const { event, participants, isLoading, refresh } = useEventDetail(eventId);
  const { joinEvent, leaveEvent, deleteEvent } = useEvents();
  const { user } = useProfileContext();
  const [actionLoading, setActionLoading] = useState(false);

  const canManage = event && (
    event.host_id === user?.id || 
    isSuperAdmin(user?.role) || 
    hasModAccess(user?.role)
  );

  const handleJoin = async () => {
    setActionLoading(true);
    try { await joinEvent(eventId); await refresh(); } 
    finally { setActionLoading(false); }
  };

  const handleLeave = async () => {
    setActionLoading(true);
    try { await leaveEvent(eventId); await refresh(); } 
    finally { setActionLoading(false); }
  };

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja cancelar este evento?')) return;
    setActionLoading(true);
    try { 
      await deleteEvent(eventId); 
      onBack();
    } finally { 
      setActionLoading(false); 
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#81D8D0] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/60 mb-4">Evento nao encontrado</p>
          <button onClick={onBack} className="text-[#81D8D0] hover:underline">Voltar</button>
        </div>
      </div>
    );
  }

  const typeColor = EVENT_TYPE_COLORS[event.event_type] || '#374151';
  const startDate = new Date(event.starts_at);
  const isPast = new Date() > startDate && event.status !== 'live';
  const isFull = event.max_participants !== null && event.participant_count >= event.max_participants;
  const isRitual = event.event_type === 'ritual';

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="w-full bg-[#35363A] border-b border-white/10 sticky top-0 z-40">
        <div className="mx-auto max-w-[800px] px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-white/80 hover:text-[#81D8D0] transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Eventos</span>
            </button>
            {canManage && (
              <button
                onClick={handleDelete}
                disabled={actionLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[#C8102E] hover:bg-[#C8102E]/10 rounded-lg text-sm transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                Cancelar Evento
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[800px] px-6 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Cover */}
          {event.cover_image_url && (
            <div className="h-48 rounded-2xl bg-cover bg-center mb-6 relative overflow-hidden"
              style={{ backgroundImage: `url(${event.cover_image_url})` }}>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
          )}

          {/* Status badge bar */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs" style={{ backgroundColor: `${typeColor}30`, color: typeColor }}>
              {isRitual && <Flame className="inline h-3 w-3 mr-1 -mt-0.5" />}
              {isRitual && event.ritual_type
                ? RITUAL_TYPE_LABELS[event.ritual_type]
                : EVENT_TYPE_LABELS[event.event_type]}
            </span>
            
            <span className={`px-3 py-1 rounded-full text-xs ${
              event.status === 'live' ? 'bg-[#C8102E] text-white animate-pulse' :
              event.status === 'published' ? 'bg-[#81D8D0]/20 text-[#81D8D0]' :
              event.status === 'completed' ? 'bg-white/10 text-white/40' :
              event.status === 'cancelled' ? 'bg-[#C8102E]/20 text-[#C8102E]' :
              'bg-white/10 text-white/40'
            }`}>
              {EVENT_STATUS_LABELS[event.status]}
            </span>

            {event.community_name && (
              <span className="px-3 py-1 bg-white/5 text-white/50 rounded-full text-xs">
                {event.community_name}
              </span>
            )}
          </div>

          {/* Titulo */}
          <h1 className="text-3xl text-white mb-4 leading-tight">{event.title}</h1>

          {/* Host */}
          <div className="flex items-center gap-3 mb-6">
            <UserAvatar 
              name={event.host_name} 
              photoUrl={event.host_photo} 
              size="md" 
              onClick={() => event.host_id && onNavigateToProfile(event.host_id)}
            />
            <div>
              <p className="text-sm text-white">{event.host_name}</p>
              <p className="text-xs text-white/40">Organizador(a)</p>
            </div>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-3 p-4 bg-white/3 border border-white/10 rounded-xl">
              <Calendar className="h-5 w-5 text-[#81D8D0]" />
              <div>
                <p className="text-sm text-white">
                  {fmtFull.format(startDate)}
                </p>
                <p className="text-xs text-white/40">
                  {fmtTime.format(startDate)}
                  {event.ends_at && ` — ${fmtTime.format(new Date(event.ends_at))}`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-white/3 border border-white/10 rounded-xl">
              {event.location_type === 'online' ? (
                <Video className="h-5 w-5 text-[#81D8D0]" />
              ) : (
                <MapPin className="h-5 w-5 text-[#81D8D0]" />
              )}
              <div>
                <p className="text-sm text-white">{LOCATION_TYPE_LABELS[event.location_type]}</p>
                {event.location_url && (
                  <a href={event.location_url} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-[#81D8D0] hover:underline flex items-center gap-1">
                    Acessar sala <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                {event.location_address && (
                  <p className="text-xs text-white/40">{event.location_address}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-white/3 border border-white/10 rounded-xl">
              <Users className="h-5 w-5 text-[#81D8D0]" />
              <div>
                <p className="text-sm text-white">
                  {event.participant_count} participante{event.participant_count !== 1 ? 's' : ''}
                </p>
                {event.max_participants && (
                  <p className="text-xs text-white/40">{event.max_participants} vagas no total</p>
                )}
              </div>
            </div>
          </div>

          {/* Botao de acao */}
          {!isPast && event.status !== 'cancelled' && (
            <div className="mb-8">
              {event.is_participating ? (
                <button
                  onClick={handleLeave}
                  disabled={actionLoading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[#81D8D0]/20 border border-[#81D8D0]/30 text-[#81D8D0] rounded-xl hover:bg-[#81D8D0]/10 transition-colors disabled:opacity-50"
                >
                  <CheckCircle className="h-5 w-5" />
                  Voce esta {event.my_status === 'interested' ? 'interessado(a)' : 'confirmado(a)'} — Clique para sair
                </button>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={handleJoin}
                    disabled={actionLoading || isFull}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-[#81D8D0] text-black rounded-xl hover:bg-[#81D8D0]/90 transition-colors disabled:opacity-50"
                  >
                    <Star className="h-5 w-5" />
                    {isFull ? 'Lotado' : 'Confirmar Presenca'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Descricao */}
          {event.description && (
            <div className="mb-8">
              <h3 className="text-sm text-white/40 uppercase tracking-wide mb-3">Sobre o evento</h3>
              <div className="p-5 bg-white/3 border border-white/10 rounded-xl">
                <p className="text-white/80 whitespace-pre-wrap leading-relaxed">{event.description}</p>
              </div>
            </div>
          )}

          {/* Ritual context */}
          {isRitual && event.ritual_type && (
            <div className="mb-8">
              <h3 className="text-sm text-white/40 uppercase tracking-wide mb-3 flex items-center gap-2">
                <Flame className="h-4 w-4 text-[#6B21A8]" />
                Sobre este ritual
              </h3>
              <div className="p-5 bg-[#6B21A8]/10 border border-[#6B21A8]/30 rounded-xl">
                <p className="text-white/70 leading-relaxed font-manifesto">
                  {RITUAL_TYPE_DESCRIPTIONS[event.ritual_type]}
                </p>
              </div>
            </div>
          )}

          {/* ═══ PERGUNTAS PARA A LIVE ═══ */}
          {(event.event_type === 'live' || event.event_type === 'workshop') && (
            <div className="mb-8">
              <LiveQuestionsPanel
                eventId={eventId}
                currentUserId={user?.id}
                isHost={!!canManage}
                onNavigateToProfile={onNavigateToProfile}
              />
            </div>
          )}

          {/* Participantes */}
          <div>
            <h3 className="text-sm text-white/40 uppercase tracking-wide mb-3">
              Participantes ({participants.length})
            </h3>
            {participants.length === 0 ? (
              <p className="text-sm text-white/30 p-4 bg-white/3 border border-white/10 rounded-xl text-center">
                Nenhum participante ainda. Seja o primeiro!
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {participants.map((p) => (
                  <button
                    key={p.user_id}
                    onClick={() => onNavigateToProfile(p.user_id)}
                    className="flex items-center gap-3 p-3 bg-white/3 border border-white/10 rounded-xl hover:bg-white/5 transition-colors"
                  >
                    <UserAvatar name={p.name} photoUrl={p.photo} size="sm" />
                    <div className="min-w-0">
                      <p className="text-sm text-white truncate">{p.name}</p>
                      <p className="text-xs text-white/30">
                        {p.status === 'confirmed' ? 'Confirmado(a)' : 'Interessado(a)'}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}