import { useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Calendar, PlusCircle, Flame, Filter, ChevronDown } from "lucide-react";
import { useEvents, EVENT_TYPE_LABELS, RITUAL_TYPE_LABELS } from "../../lib/useEvents";
import type { EventWithMeta, CreateEventInput } from "../../lib/useEvents";
import type { EventType } from "../../lib/supabase";
import { EventCard } from "./EventCard";
import { CreateEventModal } from "./CreateEventModal";
import { useProfileContext, hasModAccess } from "../../lib";
import { LogoIcon } from "./LogoIcon";

interface EventsPageProps {
  onBack: () => void;
  onSelectEvent: (event: EventWithMeta) => void;
}

type TabFilter = 'upcoming' | 'past' | 'my-events' | 'rituals';

export function EventsPage({ onBack, onSelectEvent }: EventsPageProps) {
  const { user } = useProfileContext();
  const canCreate = hasModAccess(user?.role);

  const [activeTab, setActiveTab] = useState<TabFilter>('upcoming');
  const [typeFilter, setTypeFilter] = useState<EventType | ''>('');
  const [showFilters, setShowFilters] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Carregar todos os eventos e filtrar no frontend (mais simples para o volume atual)
  const { events, isLoading, createEvent, joinEvent, leaveEvent } = useEvents({
    upcoming: activeTab === 'upcoming',
    eventType: typeFilter || undefined,
    status: activeTab === 'past' ? 'completed' : undefined,
  });

  // Filtros por tab
  const filteredEvents = events.filter(e => {
    if (activeTab === 'my-events') return e.is_participating || e.host_id === user?.id;
    if (activeTab === 'rituals') return e.event_type === 'ritual';
    return true;
  });

  const handleCreate = async (input: CreateEventInput) => {
    await createEvent(input);
  };

  const tabs: { key: TabFilter; label: string; icon?: typeof Calendar }[] = [
    { key: 'upcoming', label: 'Proximos' },
    { key: 'rituals', label: 'Rituais' },
    { key: 'my-events', label: 'Meus' },
    { key: 'past', label: 'Encerrados' },
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="w-full bg-[#35363A] border-b border-white/10 sticky top-0 z-40">
        <div className="mx-auto max-w-[1000px] px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-white/80 hover:text-[#81D8D0] transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Voltar</span>
            </button>

            <div className="flex items-center gap-3">
              <LogoIcon size={32} className="h-8 w-8" />
              <h1 className="text-lg text-white">Eventos & Rituais</h1>
            </div>

            {canCreate && (
              <button
                onClick={() => setIsCreateOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#81D8D0] text-black rounded-xl hover:bg-[#81D8D0]/90 transition-colors text-sm"
              >
                <PlusCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Criar Evento</span>
              </button>
            )}

            {!canCreate && <div />}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1000px] px-6 py-6">
        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-xl text-sm whitespace-nowrap transition-all ${
                activeTab === tab.key
                  ? 'bg-[#81D8D0] text-black'
                  : 'bg-white/5 text-white/50 hover:bg-white/10'
              }`}
            >
              {tab.key === 'rituals' && <Flame className="inline h-3.5 w-3.5 mr-1.5" />}
              {tab.label}
            </button>
          ))}

          {/* Filtro por tipo */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`ml-auto flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-all ${
              showFilters || typeFilter ? 'bg-[#FF6B35]/20 text-[#FF6B35]' : 'bg-white/5 text-white/40 hover:bg-white/10'
            }`}
          >
            <Filter className="h-3.5 w-3.5" />
            Filtro
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Painel de filtros */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-6 p-4 bg-white/3 border border-white/10 rounded-xl"
          >
            <p className="text-xs text-white/40 mb-2">Tipo de evento:</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setTypeFilter('')}
                className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                  !typeFilter ? 'bg-[#81D8D0]/20 text-[#81D8D0]' : 'bg-white/5 text-white/40'
                }`}
              >
                Todos
              </button>
              {(Object.keys(EVENT_TYPE_LABELS) as EventType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(typeFilter === type ? '' : type)}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                    typeFilter === type ? 'bg-[#81D8D0]/20 text-[#81D8D0]' : 'bg-white/5 text-white/40'
                  }`}
                >
                  {EVENT_TYPE_LABELS[type]}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Lista de eventos */}
        {isLoading ? (
          <div className="text-center py-16">
            <div className="w-12 h-12 border-4 border-[#81D8D0] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white/40">Carregando eventos...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-16">
            <Calendar className="h-16 w-16 text-white/10 mx-auto mb-4" />
            <p className="text-xl text-white/40 mb-2">
              {activeTab === 'rituals' ? 'Nenhum ritual agendado' :
               activeTab === 'my-events' ? 'Voce ainda nao participa de nenhum evento' :
               activeTab === 'past' ? 'Nenhum evento encerrado' :
               'Nenhum evento proximo'}
            </p>
            <p className="text-sm text-white/25 mb-6">
              {canCreate
                ? 'Crie o primeiro evento da comunidade.'
                : 'Eventos serao publicados em breve.'}
            </p>
            {canCreate && (
              <button
                onClick={() => setIsCreateOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#81D8D0] text-black rounded-xl hover:bg-[#81D8D0]/90 transition-colors"
              >
                <PlusCircle className="h-5 w-5" />
                Criar primeiro evento
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onClick={onSelectEvent}
                onJoin={(id) => joinEvent(id)}
                onLeave={(id) => leaveEvent(id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal criar evento */}
      <CreateEventModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreate}
      />
    </div>
  );
}