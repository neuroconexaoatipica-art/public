import { useState } from 'react';
import { useEvents, useCommunitiesContext, EVENT_TYPE_LABELS, RITUAL_TYPE_LABELS, LOCATION_TYPE_LABELS } from '../../lib';
import type { EventType, RitualType, LocationType } from '../../lib';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  defaultCommunityId?: string | null;
}

export function CreateEventModal({ isOpen, onClose, onSuccess, defaultCommunityId }: Props) {
  const { createEvent } = useEvents();
  const { communities } = useCommunitiesContext();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventType, setEventType] = useState<EventType>('live');
  const [ritualType, setRitualType] = useState<RitualType>('roda_de_escuta');
  const [locationType, setLocationType] = useState<LocationType>('online');
  const [locationUrl, setLocationUrl] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [communityId, setCommunityId] = useState(defaultCommunityId || '');
  const [maxParticipants, setMaxParticipants] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!title.trim() || !startsAt) { setError('Titulo e data sao obrigatorios'); return; }
    setSaving(true); setError('');
    try {
      await createEvent({
        title: title.trim(), description: description.trim(), event_type: eventType,
        ritual_type: eventType === 'ritual' ? ritualType : null,
        location_type: locationType, location_url: locationUrl.trim(),
        starts_at: new Date(startsAt).toISOString(),
        community_id: communityId || null,
        max_participants: maxParticipants ? parseInt(maxParticipants) : null,
        status: 'published',
      });
      onSuccess?.(); onClose();
    } catch (err: any) { setError(err.message || 'Erro ao criar evento'); }
    finally { setSaving(false); }
  };

  const realCommunities = communities.filter(c => !c.id.startsWith('pending-') && !c.id.startsWith('local-'));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 overflow-y-auto py-8" onClick={onClose}>
      <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h2 className="text-white text-lg font-semibold">Novo Evento</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white text-xl">✕</button>
        </div>
        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
          <div>
            <label className="text-white/60 text-sm mb-1 block">Titulo</label>
            <input value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#81D8D0]/50" />
          </div>
          <div>
            <label className="text-white/60 text-sm mb-1 block">Descricao</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#81D8D0]/50 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-white/60 text-sm mb-1 block">Tipo</label>
              <select value={eventType} onChange={e => setEventType(e.target.value as EventType)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none text-sm">
                {Object.entries(EVENT_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="text-white/60 text-sm mb-1 block">Local</label>
              <select value={locationType} onChange={e => setLocationType(e.target.value as LocationType)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none text-sm">
                {Object.entries(LOCATION_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>
          {eventType === 'ritual' && (
            <div>
              <label className="text-white/60 text-sm mb-1 block">Tipo de Ritual</label>
              <select value={ritualType} onChange={e => setRitualType(e.target.value as RitualType)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none text-sm">
                {Object.entries(RITUAL_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="text-white/60 text-sm mb-1 block">Data e hora</label>
            <input type="datetime-local" value={startsAt} onChange={e => setStartsAt(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#81D8D0]/50" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-white/60 text-sm mb-1 block">Comunidade</label>
              <select value={communityId} onChange={e => setCommunityId(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none text-sm">
                <option value="">Geral</option>
                {realCommunities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-white/60 text-sm mb-1 block">Max participantes</label>
              <input type="number" value={maxParticipants} onChange={e => setMaxParticipants(e.target.value)} placeholder="Ilimitado" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-white/30 focus:outline-none text-sm" />
            </div>
          </div>
          {locationType !== 'presencial' && (
            <div>
              <label className="text-white/60 text-sm mb-1 block">Link (Meet, Zoom, etc)</label>
              <input value={locationUrl} onChange={e => setLocationUrl(e.target.value)} placeholder="https://..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-white/30 focus:outline-none" />
            </div>
          )}
          {error && <p className="text-[#C8102E] text-sm">{error}</p>}
        </div>
        <div className="flex justify-end gap-3 p-5 border-t border-white/10">
          <button onClick={onClose} className="px-5 py-2.5 text-white/60 hover:text-white rounded-xl text-sm">Cancelar</button>
          <button onClick={handleSubmit} disabled={saving} className="px-6 py-2.5 bg-[#81D8D0] text-black rounded-xl font-semibold text-sm disabled:opacity-40">
            {saving ? 'Criando...' : 'Criar Evento'}
          </button>
        </div>
      </div>
    </div>
  );
}
