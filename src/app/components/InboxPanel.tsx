/**
 * InboxPanel — Caixa de Entrada do Admin
 * Le contact_requests com filtro por tipo, marcar como resolvido, busca
 */

import { useState, useEffect, useCallback } from "react";
import {
  Inbox, RefreshCw, CheckCircle, XCircle, Search, Filter,
  Lightbulb, MessageSquare, AlertTriangle, Mic, CalendarPlus,
  Mail, BookOpen, Clock, Eye
} from "lucide-react";
import { supabase } from "../../lib";

interface ContactRequest {
  id: string;
  user_id: string | null;
  reason: string;
  message: string;
  status: string;
  created_at: string;
  user_name?: string;
  user_photo?: string | null;
}

const TYPE_FILTERS = [
  { key: 'all', label: 'Todos', icon: Inbox },
  { key: 'tema_live', label: 'Temas Live', icon: Lightbulb },
  { key: 'contato', label: 'Contato', icon: Mail },
  { key: 'historia', label: 'Historias', icon: BookOpen },
  { key: 'evento', label: 'Eventos', icon: CalendarPlus },
  { key: 'live_application', label: 'Quero fazer Live', icon: Mic },
  { key: 'denuncia', label: 'Denuncias', icon: AlertTriangle },
  { key: 'feedback', label: 'Feedback', icon: MessageSquare },
];

function detectType(message: string): string {
  const upper = message.toUpperCase();
  if (upper.startsWith('[TEMA_LIVE]')) return 'tema_live';
  if (upper.startsWith('[CONTATO]')) return 'contato';
  if (upper.startsWith('[HISTORIA]')) return 'historia';
  if (upper.startsWith('[EVENTO_SUGESTAO]') || upper.startsWith('[EVENTO]')) return 'evento';
  if (upper.startsWith('[LIVE_APPLICATION]')) return 'live_application';
  if (upper.startsWith('[DENUNCIA]')) return 'denuncia';
  return 'feedback';
}

function getTypeConfig(type: string) {
  const configs: Record<string, { label: string; icon: typeof Inbox; color: string }> = {
    tema_live: { label: 'Tema Live', icon: Lightbulb, color: '#C8102E' },
    contato: { label: 'Contato', icon: Mail, color: '#81D8D0' },
    historia: { label: 'Historia', icon: BookOpen, color: '#FF6B35' },
    evento: { label: 'Evento', icon: CalendarPlus, color: '#FF6B35' },
    live_application: { label: 'Quer fazer Live', icon: Mic, color: '#C8102E' },
    denuncia: { label: 'Denuncia', icon: AlertTriangle, color: '#C8102E' },
    feedback: { label: 'Feedback', icon: MessageSquare, color: '#81D8D0' },
  };
  return configs[type] || configs.feedback;
}

export function InboxPanel() {
  const [requests, setRequests] = useState<ContactRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'resolved'>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadRequests = useCallback(async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('contact_requests')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;

      const items = (data || []) as ContactRequest[];

      // Enrich with user names
      const userIds = [...new Set(items.filter(r => r.user_id).map(r => r.user_id!))];
      let usersMap: Record<string, { name: string; display_name?: string; photo: string | null }> = {};
      if (userIds.length > 0) {
        const { data: usersData } = await supabase
          .from('users')
          .select('id, name, display_name, profile_photo')
          .in('id', userIds);
        (usersData || []).forEach((u: any) => {
          usersMap[u.id] = { name: u.name, display_name: u.display_name, photo: u.profile_photo };
        });
      }

      setRequests(items.map(r => ({
        ...r,
        user_name: r.user_id ? (usersMap[r.user_id]?.display_name || usersMap[r.user_id]?.name || 'Desconhecido') : 'Anonimo',
        user_photo: r.user_id ? usersMap[r.user_id]?.photo || null : null,
      })));
    } catch (err) {
      console.error('[InboxPanel] Erro ao carregar:', err);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { loadRequests(); }, [loadRequests]);

  const markAsResolved = async (id: string) => {
    try {
      await supabase
        .from('contact_requests')
        .update({ status: 'resolved' })
        .eq('id', id);
      await loadRequests();
    } catch (err) {
      console.error('[InboxPanel] Erro ao resolver:', err);
    }
  };

  const markAsPending = async (id: string) => {
    try {
      await supabase
        .from('contact_requests')
        .update({ status: 'pending' })
        .eq('id', id);
      await loadRequests();
    } catch (err) {
      console.error('[InboxPanel] Erro ao reabrir:', err);
    }
  };

  // Filter by type and search
  const filtered = requests.filter(r => {
    const type = detectType(r.message);
    if (typeFilter !== 'all' && type !== typeFilter) return false;
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      return r.message.toLowerCase().includes(s) ||
             (r.user_name || '').toLowerCase().includes(s);
    }
    return true;
  });

  // Count by type
  const typeCounts: Record<string, number> = {};
  requests.forEach(r => {
    const type = detectType(r.message);
    typeCounts[type] = (typeCounts[type] || 0) + 1;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-white font-bold flex items-center gap-2">
          <Inbox className="w-5 h-5 text-[#81D8D0]" /> Caixa de Entrada ({requests.length})
        </h2>
        <button onClick={loadRequests} className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors">
          <RefreshCw className="w-4 h-4 text-white/60" />
        </button>
      </div>

      {/* Status filter */}
      <div className="flex gap-2">
        {(['pending', 'resolved', 'all'] as const).map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              statusFilter === s
                ? 'bg-[#81D8D0]/15 text-[#81D8D0] border-[#81D8D0]/30'
                : 'bg-white/5 text-white/40 border-white/10 hover:border-white/20'
            }`}
          >
            {{ pending: 'Pendentes', resolved: 'Resolvidos', all: 'Todos' }[s]}
            {s === 'pending' && requests.filter(r => r.status === 'pending').length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 bg-[#C8102E] text-white rounded-full text-[9px] font-bold">
                {requests.filter(r => r.status === 'pending').length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Type filters */}
      <div className="flex flex-wrap gap-2">
        {TYPE_FILTERS.map(f => {
          const count = f.key === 'all' ? requests.length : (typeCounts[f.key] || 0);
          if (f.key !== 'all' && count === 0) return null;
          return (
            <button
              key={f.key}
              onClick={() => setTypeFilter(f.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                typeFilter === f.key
                  ? 'bg-white/10 text-white border-white/20'
                  : 'bg-white/5 text-white/40 border-white/10 hover:border-white/15'
              }`}
            >
              <f.icon className="w-3 h-3" />
              {f.label}
              {count > 0 && <span className="text-white/30">({count})</span>}
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por mensagem ou nome..."
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:border-[#81D8D0]/50 text-sm"
        />
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-[#81D8D0] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10">
          <Inbox className="w-10 h-10 mx-auto mb-3 text-white opacity-30" />
          <p className="text-white/60 text-sm">
            {requests.length === 0 ? 'Nenhuma solicitacao recebida ainda.' : 'Nenhuma solicitacao neste filtro.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((r) => {
            const type = detectType(r.message);
            const config = getTypeConfig(type);
            const TypeIcon = config.icon;
            const isExpanded = expandedId === r.id;
            const isPending = r.status === 'pending';

            // Clean message: remove prefix tag
            const cleanMsg = r.message.replace(/^\[.*?\]\s*\|?\s*/, '').trim();

            return (
              <div
                key={r.id}
                className={`bg-white/5 border rounded-xl transition-all ${
                  isPending ? 'border-white/15' : 'border-white/5 opacity-60'
                }`}
              >
                <div
                  className="flex items-start gap-3 p-4 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : r.id)}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${config.color}20`, border: `1px solid ${config.color}30` }}
                  >
                    <TypeIcon className="w-4 h-4" style={{ color: config.color }} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                        style={{ backgroundColor: `${config.color}20`, color: config.color }}
                      >
                        {config.label}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        isPending ? 'bg-amber-500/20 text-amber-400' : 'bg-green-500/20 text-green-400'
                      }`}>
                        {isPending ? 'PENDENTE' : 'RESOLVIDO'}
                      </span>
                      <span className="text-white/60 text-xs font-medium">{r.user_name}</span>
                    </div>
                    <p className="text-white/70 text-sm line-clamp-2">{cleanMsg}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-white/30">
                      <Clock className="w-3 h-3" />
                      {new Date(r.created_at).toLocaleDateString('pt-BR', {
                        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </div>
                  </div>

                  <Eye className={`w-4 h-4 flex-shrink-0 transition-transform ${isExpanded ? 'text-[#81D8D0] rotate-0' : 'text-white/20 -rotate-90'}`} />
                </div>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-white/5 pt-3">
                    <div className="bg-white/5 rounded-lg p-3 mb-3">
                      <p className="text-white/80 text-sm whitespace-pre-wrap leading-relaxed">{cleanMsg}</p>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-white/30 mb-3">
                      <span>ID: {r.id.slice(0, 8)}...</span>
                      <span>Reason: {r.reason}</span>
                      {r.user_id && <span>User: {r.user_id.slice(0, 8)}...</span>}
                    </div>
                    <div className="flex gap-2">
                      {isPending ? (
                        <button
                          onClick={(e) => { e.stopPropagation(); markAsResolved(r.id); }}
                          className="flex items-center gap-1.5 px-4 py-2 bg-[#81D8D0] text-black rounded-lg text-xs font-bold hover:bg-[#81D8D0]/90 transition-colors"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Marcar como resolvido
                        </button>
                      ) : (
                        <button
                          onClick={(e) => { e.stopPropagation(); markAsPending(r.id); }}
                          className="flex items-center gap-1.5 px-4 py-2 bg-amber-500/20 text-amber-400 rounded-lg text-xs font-bold hover:bg-amber-500/30 transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Reabrir
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}