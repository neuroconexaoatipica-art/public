import { useState } from "react";
import { motion } from "motion/react";
import { X, Calendar, Clock, MapPin, Video, Users, Flame, AlertCircle } from "lucide-react";
import { useCommunitiesContext } from "../../lib";
import type { EventType, RitualType, LocationType } from "../../lib/supabase";
import { EVENT_TYPE_LABELS, RITUAL_TYPE_LABELS, RITUAL_TYPE_DESCRIPTIONS, LOCATION_TYPE_LABELS } from "../../lib/useEvents";
import type { CreateEventInput } from "../../lib/useEvents";

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: CreateEventInput) => Promise<void>;
  preselectedCommunityId?: string | null;
}

export function CreateEventModal({ isOpen, onClose, onSubmit, preselectedCommunityId }: CreateEventModalProps) {
  const { communities } = useCommunitiesContext();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventType, setEventType] = useState<EventType>('encontro');
  const [ritualType, setRitualType] = useState<RitualType>('roda_de_escuta');
  const [communityId, setCommunityId] = useState<string>(preselectedCommunityId || '');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('');
  const [locationType, setLocationType] = useState<LocationType>('online');
  const [locationUrl, setLocationUrl] = useState('');
  const [locationAddress, setLocationAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Filtrar comunidades reais (não pending/local)
  const realCommunities = communities.filter(c => !c.id.startsWith('pending-') && !c.id.startsWith('local-'));

  // Comunidades com ritual habilitado
  const ritualCommunities = realCommunities.filter(c => c.ritual_enabled);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) { setError('Titulo e obrigatorio'); return; }
    if (!startsAt) { setError('Data/hora de inicio e obrigatoria'); return; }

    // Validar que ritual só pode ser em comunidades com ritual_enabled
    if (eventType === 'ritual' && communityId) {
      const comm = communities.find(c => c.id === communityId);
      if (comm && !comm.ritual_enabled) {
        setError('Essa comunidade nao tem rituais habilitados');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        event_type: eventType,
        ritual_type: eventType === 'ritual' ? ritualType : null,
        community_id: communityId || null,
        starts_at: new Date(startsAt).toISOString(),
        ends_at: endsAt ? new Date(endsAt).toISOString() : null,
        max_participants: maxParticipants ? parseInt(maxParticipants) : null,
        location_type: locationType,
        location_url: locationUrl.trim(),
        location_address: locationAddress.trim(),
        status: 'published',
      });
      // Reset
      setTitle('');
      setDescription('');
      setEventType('encontro');
      setStartsAt('');
      setEndsAt('');
      setMaxParticipants('');
      setLocationUrl('');
      setLocationAddress('');
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao criar evento');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-[#1A1A1A] border border-white/10 rounded-2xl"
      >
        {/* Header */}
        <div className="sticky top-0 bg-[#1A1A1A] border-b border-white/10 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-[#81D8D0]" />
            <h2 className="text-lg text-white">Criar Evento</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <X className="h-5 w-5 text-white/60" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Erro */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-[#C8102E]/10 border border-[#C8102E]/30 rounded-xl">
              <AlertCircle className="h-4 w-4 text-[#C8102E] flex-shrink-0" />
              <p className="text-sm text-[#C8102E]">{error}</p>
            </div>
          )}

          {/* Titulo */}
          <div>
            <label className="block text-sm text-white/60 mb-1.5">Titulo *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Roda de Escuta — Intensidade que nao cabe"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#81D8D0]/50"
              maxLength={120}
            />
          </div>

          {/* Tipo do evento */}
          <div>
            <label className="block text-sm text-white/60 mb-1.5">Tipo do evento *</label>
            <div className="grid grid-cols-4 gap-2">
              {(Object.keys(EVENT_TYPE_LABELS) as EventType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setEventType(type)}
                  className={`px-3 py-2 rounded-xl text-xs transition-all border ${
                    eventType === type
                      ? 'bg-[#81D8D0]/20 border-[#81D8D0]/50 text-[#81D8D0]'
                      : 'bg-white/3 border-white/10 text-white/50 hover:bg-white/5'
                  }`}
                >
                  {type === 'ritual' && <Flame className="inline h-3 w-3 mr-1" />}
                  {EVENT_TYPE_LABELS[type]}
                </button>
              ))}
            </div>
          </div>

          {/* Tipo do ritual (condicional) */}
          {eventType === 'ritual' && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
              <label className="block text-sm text-white/60 mb-1.5">
                <Flame className="inline h-4 w-4 text-[#6B21A8] mr-1" />
                Tipo do ritual *
              </label>
              <div className="space-y-2">
                {(Object.keys(RITUAL_TYPE_LABELS) as RitualType[]).map((rt) => (
                  <button
                    key={rt}
                    type="button"
                    onClick={() => setRitualType(rt)}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                      ritualType === rt
                        ? 'bg-[#6B21A8]/20 border-[#6B21A8]/50'
                        : 'bg-white/3 border-white/10 hover:bg-white/5'
                    }`}
                  >
                    <p className={`text-sm ${ritualType === rt ? 'text-[#A855F7]' : 'text-white/70'}`}>
                      {RITUAL_TYPE_LABELS[rt]}
                    </p>
                    <p className="text-xs text-white/30 mt-0.5">{RITUAL_TYPE_DESCRIPTIONS[rt]}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Comunidade */}
          <div>
            <label className="block text-sm text-white/60 mb-1.5">Comunidade (opcional)</label>
            <select
              value={communityId}
              onChange={(e) => setCommunityId(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#81D8D0]/50 appearance-none"
            >
              <option value="" className="bg-[#1A1A1A]">Evento geral (sem comunidade)</option>
              {(eventType === 'ritual' ? ritualCommunities : realCommunities).map((c) => (
                <option key={c.id} value={c.id} className="bg-[#1A1A1A]">{c.name}</option>
              ))}
            </select>
            {eventType === 'ritual' && ritualCommunities.length === 0 && (
              <p className="text-xs text-[#FF6B35] mt-1">Nenhuma comunidade com rituais habilitados</p>
            )}
          </div>

          {/* Descricao */}
          <div>
            <label className="block text-sm text-white/60 mb-1.5">Descricao</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="O que vai acontecer? Qual o contexto?"
              rows={3}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#81D8D0]/50 resize-none"
              maxLength={2000}
            />
          </div>

          {/* Data/Hora */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-white/60 mb-1.5">
                <Clock className="inline h-3.5 w-3.5 mr-1" />
                Inicio *
              </label>
              <input
                type="datetime-local"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#81D8D0]/50 [color-scheme:dark]"
              />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-1.5">
                <Clock className="inline h-3.5 w-3.5 mr-1" />
                Fim (opcional)
              </label>
              <input
                type="datetime-local"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#81D8D0]/50 [color-scheme:dark]"
              />
            </div>
          </div>

          {/* Local */}
          <div>
            <label className="block text-sm text-white/60 mb-1.5">Local</label>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {(Object.keys(LOCATION_TYPE_LABELS) as LocationType[]).map((lt) => (
                <button
                  key={lt}
                  type="button"
                  onClick={() => setLocationType(lt)}
                  className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs transition-all border ${
                    locationType === lt
                      ? 'bg-[#81D8D0]/20 border-[#81D8D0]/50 text-[#81D8D0]'
                      : 'bg-white/3 border-white/10 text-white/50 hover:bg-white/5'
                  }`}
                >
                  {lt === 'online' ? <Video className="h-3.5 w-3.5" /> : <MapPin className="h-3.5 w-3.5" />}
                  {LOCATION_TYPE_LABELS[lt]}
                </button>
              ))}
            </div>

            {(locationType === 'online' || locationType === 'hibrido') && (
              <input
                type="url"
                value={locationUrl}
                onChange={(e) => setLocationUrl(e.target.value)}
                placeholder="Link da sala (Google Meet, Zoom, etc.)"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#81D8D0]/50 mb-2"
              />
            )}

            {(locationType === 'presencial' || locationType === 'hibrido') && (
              <input
                type="text"
                value={locationAddress}
                onChange={(e) => setLocationAddress(e.target.value)}
                placeholder="Endereco ou local"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#81D8D0]/50"
              />
            )}
          </div>

          {/* Max participantes */}
          <div>
            <label className="block text-sm text-white/60 mb-1.5">
              <Users className="inline h-3.5 w-3.5 mr-1" />
              Limite de participantes (opcional)
            </label>
            <input
              type="number"
              value={maxParticipants}
              onChange={(e) => setMaxParticipants(e.target.value)}
              placeholder="Sem limite"
              min={1}
              max={500}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#81D8D0]/50"
            />
          </div>

          {/* Botoes */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-white/5 text-white/60 rounded-xl hover:bg-white/10 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 bg-[#81D8D0] text-black rounded-xl hover:bg-[#81D8D0]/90 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Criando...' : 'Criar Evento'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
