import { EVENT_TYPE_LABELS, LOCATION_TYPE_LABELS } from '../../lib';
import type { EventWithMeta } from '../../lib';

interface Props {
  event: EventWithMeta;
  onClick?: () => void;
}

export function EventCard({ event, onClick }: Props) {
  const date = new Date(event.starts_at);
  const day = date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  const time = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const isLive = event.status === 'live';
  const isPast = event.status === 'completed';

  return (
    <div onClick={onClick} className={`bg-white/5 border rounded-2xl p-5 cursor-pointer hover:bg-white/8 transition-colors ${isLive ? 'border-[#C8102E] ring-1 ring-[#C8102E]/30' : 'border-white/10'}`}>
      <div className="flex items-start gap-4">
        <div className="text-center min-w-[50px]">
          <div className="text-[#81D8D0] text-xs uppercase">{day.split(' ')[1]}</div>
          <div className="text-white text-2xl font-bold">{day.split(' ')[0]}</div>
          <div className="text-white/40 text-xs">{time}</div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {isLive && <span className="text-xs bg-[#C8102E] text-white px-2 py-0.5 rounded-full animate-pulse">AO VIVO</span>}
            <span className="text-xs text-white/40">{EVENT_TYPE_LABELS[event.event_type]}</span>
            <span className="text-xs text-white/40">• {LOCATION_TYPE_LABELS[event.location_type]}</span>
          </div>
          <h3 className={`text-white font-semibold mb-1 ${isPast ? 'opacity-50' : ''}`}>{event.title}</h3>
          <p className="text-white/50 text-sm line-clamp-2 mb-2">{event.description}</p>
          <div className="flex items-center gap-3 text-xs text-white/40">
            {event.community_name && <span>📍 {event.community_name}</span>}
            <span>👤 {event.host_name}</span>
            <span>👥 {event.participant_count}{event.max_participants ? `/${event.max_participants}` : ''}</span>
            {event.is_participating && <span className="text-[#81D8D0]">✓ Inscrito</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
