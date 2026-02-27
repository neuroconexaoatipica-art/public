import { UserAvatar } from "./UserAvatar";
import type { EventWithMeta } from "../../lib/useEvents";
import { EVENT_TYPE_LABELS, RITUAL_TYPE_LABELS, LOCATION_TYPE_LABELS } from "../../lib/useEvents";
import { motion } from "motion/react";
import { Calendar, Clock, MapPin, Users, Video, Flame, CheckCircle, Star, User } from "lucide-react";

// ─── Formatação de data nativa (sem date-fns) ──────────────
const fmtShort = new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
const fmtTime = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" });

function isPastDate(d: Date): boolean { return d.getTime() < Date.now(); }
function isTodayDate(d: Date): boolean {
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}
function isTomorrowDate(d: Date): boolean {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return d.getFullYear() === tomorrow.getFullYear() && d.getMonth() === tomorrow.getMonth() && d.getDate() === tomorrow.getDate();
}
function diffMinutes(a: Date, b: Date): number { return Math.round((a.getTime() - b.getTime()) / 60000); }

interface EventCardProps {
  event: EventWithMeta;
  onClick: (event: EventWithMeta) => void;
  onJoin?: (eventId: string) => void;
  onLeave?: (eventId: string) => void;
  compact?: boolean;
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

export function EventCard({ event, onClick, onJoin, onLeave, compact = false }: EventCardProps) {
  const startDate = new Date(event.starts_at);
  const isEventPast = isPastDate(startDate) && event.status !== 'live';
  const isLive = event.status === 'live';
  const isEventToday = isTodayDate(startDate);
  const isEventTomorrow = isTomorrowDate(startDate);

  const typeColor = EVENT_TYPE_COLORS[event.event_type] || '#374151';

  const getTimeLabel = () => {
    if (isLive) return 'Ao Vivo Agora';
    if (isEventToday) {
      const mins = diffMinutes(startDate, new Date());
      if (mins > 0 && mins < 60) return `Em ${mins} min`;
      if (mins >= 60 && mins < 120) return `Em 1h`;
      return `Hoje, ${fmtTime.format(startDate)}`;
    }
    if (isEventTomorrow) return `Amanha, ${fmtTime.format(startDate)}`;
    return fmtShort.format(startDate);
  };

  const isFull = event.max_participants !== null && event.participant_count >= event.max_participants;

  if (compact) {
    return (
      <button
        onClick={() => onClick(event)}
        className="w-full text-left flex items-center gap-3 p-3 bg-white/3 hover:bg-white/5 border border-white/10 rounded-xl transition-all group"
      >
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${typeColor}30` }}
        >
          <Calendar className="h-5 w-5" style={{ color: typeColor }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-white truncate">{event.title}</p>
          <p className="text-xs text-white/40">{getTimeLabel()}</p>
        </div>
        {isLive && (
          <span className="px-2 py-0.5 bg-[#C8102E] text-white text-xs rounded-full animate-pulse">
            LIVE
          </span>
        )}
      </button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white/3 border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all cursor-pointer ${isEventPast ? 'opacity-60' : ''}`}
      onClick={() => onClick(event)}
    >
      {/* Cover ou Header colorido */}
      {event.cover_image_url ? (
        <div className="h-32 bg-cover bg-center relative" style={{ backgroundImage: `url(${event.cover_image_url})` }}>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          <div className="absolute top-3 left-3 flex gap-2">
            <TypeBadge type={event.event_type} ritualType={event.ritual_type} color={typeColor} />
            {isLive && <LiveBadge />}
          </div>
        </div>
      ) : (
        <div className="h-3 w-full" style={{ backgroundColor: typeColor }} />
      )}

      <div className="p-5">
        {/* Badges */}
        {!event.cover_image_url && (
          <div className="flex items-center gap-2 mb-3">
            <TypeBadge type={event.event_type} ritualType={event.ritual_type} color={typeColor} />
            {isLive && <LiveBadge />}
            {event.community_name && (
              <span className="text-xs text-white/40 ml-auto truncate max-w-[140px]">
                {event.community_name}
              </span>
            )}
          </div>
        )}

        {/* Titulo */}
        <h3 className="text-lg text-white mb-2 leading-tight">{event.title}</h3>

        {/* Descricao truncada */}
        {event.description && (
          <p className="text-sm text-white/50 mb-4 line-clamp-2">{event.description}</p>
        )}

        {/* Meta info */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-white/60">
            <Clock className="h-4 w-4 text-[#81D8D0]" />
            <span>{getTimeLabel()}</span>
            {event.ends_at && (
              <span className="text-white/30">
                — {fmtTime.format(new Date(event.ends_at))}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-white/60">
            {event.location_type === 'online' ? (
              <Video className="h-4 w-4 text-[#81D8D0]" />
            ) : (
              <MapPin className="h-4 w-4 text-[#81D8D0]" />
            )}
            <span>{LOCATION_TYPE_LABELS[event.location_type]}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-white/60">
            <Users className="h-4 w-4 text-[#81D8D0]" />
            <span>
              {event.participant_count} participante{event.participant_count !== 1 ? 's' : ''}
              {event.max_participants && (
                <span className="text-white/30"> / {event.max_participants} vagas</span>
              )}
            </span>
            {isFull && <span className="text-xs text-[#C8102E]">Lotado</span>}
          </div>
        </div>

        {/* Footer: Host + Acoes */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          <div className="flex items-center gap-2">
            <UserAvatar name={event.host_name} photoUrl={event.host_photo} size="sm" />
            <span className="text-xs text-white/50">{event.host_name}</span>
          </div>

          {!isEventPast && (
            <div onClick={(e) => e.stopPropagation()}>
              {event.is_participating ? (
                <button
                  onClick={() => onLeave?.(event.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#81D8D0]/20 text-[#81D8D0] rounded-lg text-xs hover:bg-[#81D8D0]/10 transition-colors"
                >
                  <CheckCircle className="h-3.5 w-3.5" />
                  {event.my_status === 'interested' ? 'Interessado(a)' : 'Confirmado(a)'}
                </button>
              ) : (
                <button
                  onClick={() => onJoin?.(event.id)}
                  disabled={isFull}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#81D8D0] text-black rounded-lg text-xs hover:bg-[#81D8D0]/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Star className="h-3.5 w-3.5" />
                  Participar
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Sub-components ──────────────────────────────────────────

function TypeBadge({ type, ritualType, color }: { type: string; ritualType: string | null; color: string }) {
  const label = type === 'ritual' && ritualType
    ? RITUAL_TYPE_LABELS[ritualType as keyof typeof RITUAL_TYPE_LABELS] || 'Ritual'
    : EVENT_TYPE_LABELS[type as keyof typeof EVENT_TYPE_LABELS] || type;

  return (
    <span
      className="px-2.5 py-1 rounded-full text-xs"
      style={{ backgroundColor: `${color}30`, color }}
    >
      {type === 'ritual' && <Flame className="inline h-3 w-3 mr-1 -mt-0.5" />}
      {label}
    </span>
  );
}

function LiveBadge() {
  return (
    <span className="px-2.5 py-1 bg-[#C8102E] text-white rounded-full text-xs animate-pulse flex items-center gap-1">
      <span className="w-2 h-2 bg-white rounded-full" />
      AO VIVO
    </span>
  );
}