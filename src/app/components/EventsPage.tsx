import { useState } from 'react';
import { EventCard } from './EventCard';
import { CreateEventModal } from './CreateEventModal';
import { useEvents, useProfileContext, hasModAccess } from '../../lib';
import type { EventWithMeta } from '../../lib';

interface Props {
  onBack: () => void;
  onSelectEvent: (event: EventWithMeta) => void;
}

export function EventsPage({ onBack, onSelectEvent }: Props) {
  const { user } = useProfileContext();
  const [tab, setTab] = useState<'upcoming' | 'all'>('upcoming');
  const { events: upcomingEvents, isLoading: loadingUp, refreshEvents } = useEvents({ upcoming: true });
  const { events: allEvents, isLoading: loadingAll } = useEvents();
  const [showCreate, setShowCreate] = useState(false);

  const events = tab === 'upcoming' ? upcomingEvents : allEvents;
  const isLoading = tab === 'upcoming' ? loadingUp : loadingAll;
  const canCreate = hasModAccess(user?.role);

  return (
    <div className="min-h-screen bg-black">
      <header className="sticky top-0 z-40 bg-black/95 backdrop-blur border-b border-white/10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="text-[#81D8D0] hover:underline text-sm">← Voltar</button>
            <h1 className="text-white font-semibold">Eventos</h1>
          </div>
          {canCreate && <button onClick={() => setShowCreate(true)} className="px-4 py-2 bg-[#81D8D0] text-black rounded-xl text-sm font-semibold">+ Criar</button>}
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex gap-2 mb-6">
          <button onClick={() => setTab('upcoming')} className={`px-4 py-2 rounded-full text-sm border ${tab === 'upcoming' ? 'bg-[#81D8D0] text-black border-[#81D8D0]' : 'bg-white/5 text-white/60 border-white/10'}`}>Proximos</button>
          <button onClick={() => setTab('all')} className={`px-4 py-2 rounded-full text-sm border ${tab === 'all' ? 'bg-[#81D8D0] text-black border-[#81D8D0]' : 'bg-white/5 text-white/60 border-white/10'}`}>Todos</button>
        </div>

        {isLoading ? (
          <div className="text-center py-12"><div className="w-8 h-8 border-2 border-[#81D8D0] border-t-transparent rounded-full animate-spin mx-auto"></div></div>
        ) : events.length === 0 ? (
          <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10">
            <div className="text-4xl mb-3">📅</div>
            <p className="text-white/60 mb-2">{tab === 'upcoming' ? 'Nenhum evento agendado.' : 'Nenhum evento criado.'}</p>
            {canCreate && <button onClick={() => setShowCreate(true)} className="text-[#81D8D0] text-sm hover:underline">Criar o primeiro evento</button>}
          </div>
        ) : (
          <div className="space-y-3">
            {events.map(e => <EventCard key={e.id} event={e} onClick={() => onSelectEvent(e)} />)}
          </div>
        )}
      </div>

      <CreateEventModal isOpen={showCreate} onClose={() => setShowCreate(false)} onSuccess={refreshEvents} />
    </div>
  );
}
