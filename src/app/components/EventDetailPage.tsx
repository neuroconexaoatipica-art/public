import { UserAvatar } from './UserAvatar';
import { useEventDetail, useEvents, useProfileContext, EVENT_TYPE_LABELS, RITUAL_TYPE_LABELS, LOCATION_TYPE_LABELS, isSuperAdmin, hasModAccess } from '../../lib';

interface Props {
  eventId: string;
  onBack: () => void;
  onNavigateToProfile?: (userId: string) => void;
}

export function EventDetailPage({ eventId, onBack, onNavigateToProfile }: Props) {
  const { user } = useProfileContext();
  const { event, participants, isLoading, refresh } = useEventDetail(eventId);
  const { joinEvent, leaveEvent, deleteEvent } = useEvents();

  if (isLoading) return <div className="min-h-screen bg-black flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#81D8D0] border-t-transparent rounded-full animate-spin"></div></div>;
  if (!event) return <div className="min-h-screen bg-black text-white flex items-center justify-center"><p className="text-white/60">Evento nao encontrado.</p></div>;

  const isHost = event.host_id === user?.id;
  const canManage = isHost || isSuperAdmin(user?.role) || hasModAccess(user?.role);
  const date = new Date(event.starts_at);
  const isFull = event.max_participants && event.participant_count >= event.max_participants;

  const handleJoin = async () => { await joinEvent(event.id, 'confirmed'); await refresh(); };
  const handleLeave = async () => { await leaveEvent(event.id); await refresh(); };
  const handleDelete = async () => { if (confirm('Excluir este evento?')) { await deleteEvent(event.id); onBack(); } };

  return (
    <div className="min-h-screen bg-black">
      <header className="sticky top-0 z-40 bg-black/95 backdrop-blur border-b border-white/10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={onBack} className="text-[#81D8D0] hover:underline text-sm">← Voltar</button>
          <h1 className="text-white font-semibold truncate">{event.title}</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {event.cover_image_url && <img src={event.cover_image_url} alt="" className="w-full h-48 object-cover rounded-2xl mb-6" />}

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-3">
            {event.status === 'live' && <span className="text-xs bg-[#C8102E] text-white px-2 py-0.5 rounded-full animate-pulse">AO VIVO</span>}
            <span className="text-xs text-white/40 bg-white/5 px-2 py-0.5 rounded-full">{EVENT_TYPE_LABELS[event.event_type]}</span>
            <span className="text-xs text-white/40 bg-white/5 px-2 py-0.5 rounded-full">{LOCATION_TYPE_LABELS[event.location_type]}</span>
            {event.ritual_type && <span className="text-xs text-white/40 bg-white/5 px-2 py-0.5 rounded-full">{RITUAL_TYPE_LABELS[event.ritual_type]}</span>}
          </div>

          <h2 className="text-white text-2xl font-semibold mb-3">{event.title}</h2>
          <p className="text-white/70 whitespace-pre-wrap mb-4">{event.description}</p>

          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
            <div>
              <span className="text-white/40 text-xs uppercase">Data</span>
              <p className="text-white">{date.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}</p>
            </div>
            <div>
              <span className="text-white/40 text-xs uppercase">Horario</span>
              <p className="text-white">{date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
            <div>
              <span className="text-white/40 text-xs uppercase">Organizador</span>
              <p className="text-white cursor-pointer hover:text-[#81D8D0]" onClick={() => event.host_id && onNavigateToProfile?.(event.host_id)}>{event.host_name}</p>
            </div>
            <div>
              <span className="text-white/40 text-xs uppercase">Participantes</span>
              <p className="text-white">{event.participant_count}{event.max_participants ? ` / ${event.max_participants}` : ''}</p>
            </div>
          </div>

          {event.location_url && (event.status === 'published' || event.status === 'live') && event.is_participating && (
            <a href={event.location_url} target="_blank" rel="noopener noreferrer" className="inline-block px-5 py-2.5 bg-[#81D8D0] text-black rounded-xl font-semibold text-sm mb-4 hover:bg-[#81D8D0]/90">
              Acessar link do evento →
            </a>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-white/10">
            {event.is_participating ? (
              <button onClick={handleLeave} className="px-5 py-2.5 bg-white/5 border border-white/10 text-white/60 rounded-xl text-sm hover:text-[#C8102E]">Cancelar inscricao</button>
            ) : (
              <button onClick={handleJoin} disabled={!!isFull} className="px-5 py-2.5 bg-[#81D8D0] text-black rounded-xl font-semibold text-sm disabled:opacity-40">
                {isFull ? 'Evento lotado' : 'Participar'}
              </button>
            )}
            {canManage && <button onClick={handleDelete} className="px-5 py-2.5 text-[#C8102E] hover:underline text-sm ml-auto">Excluir evento</button>}
          </div>
        </div>

        {/* Participants */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-4">Participantes ({participants.length})</h3>
          {participants.length === 0 ? (
            <p className="text-white/40 text-sm">Nenhum participante ainda.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {participants.map(p => (
                <div key={p.user_id} className="flex items-center gap-2 cursor-pointer hover:bg-white/5 rounded-xl p-2" onClick={() => onNavigateToProfile?.(p.user_id)}>
                  <UserAvatar src={p.photo} name={p.name} size={32} />
                  <div>
                    <span className="text-white text-sm">{p.name}</span>
                    <span className="text-white/30 text-xs block capitalize">{p.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
