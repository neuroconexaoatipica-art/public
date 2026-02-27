/**
 * RituaisPanel — Fase 2: CRUD completo de daily_challenges
 * Gerencia desafios diarios do AdminPanel sem precisar de SQL
 */

import { useState, useEffect, useCallback } from "react";
import {
  Flame, Plus, RefreshCw, Edit3, Trash2, CheckCircle, XCircle,
  Calendar, MessageSquare, Zap, Save
} from "lucide-react";
import { supabase, COMMUNITY_RITUAL_TYPES } from "../../lib";

const CHALLENGE_TYPES = [
  { value: 'reflexao', label: 'Reflexao', icon: '🧠' },
  { value: 'acao', label: 'Acao', icon: '⚡' },
  { value: 'escrita', label: 'Escrita', icon: '✍️' },
  { value: 'conexao', label: 'Conexao', icon: '🤝' },
  { value: 'presenca', label: 'Presenca', icon: '👁️' },
  { value: 'provocacao', label: 'Provocacao', icon: '🔥' },
  { value: 'confissao', label: 'Confissao', icon: '💭' },
];

interface AdminChallenge {
  id: string;
  challenge_date: string;
  title: string;
  description: string;
  challenge_type: string;
  is_active: boolean;
  response_count: number;
  created_at: string;
}

export function RituaisPanel() {
  const [challenges, setChallenges] = useState<AdminChallenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [formDate, setFormDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formType, setFormType] = useState('reflexao');
  const [formActive, setFormActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // Quick-fill state
  const [fillDays, setFillDays] = useState(7);
  const [isFilling, setIsFilling] = useState(false);

  // Filter
  const [dateFilter, setDateFilter] = useState<'all' | 'future' | 'past' | 'today'>('future');

  const loadChallenges = useCallback(async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('daily_challenges')
        .select('*')
        .order('challenge_date', { ascending: true })
        .limit(200);

      const today = new Date().toISOString().split('T')[0];
      if (dateFilter === 'future') query = query.gte('challenge_date', today);
      else if (dateFilter === 'past') query = query.lt('challenge_date', today).order('challenge_date', { ascending: false });
      else if (dateFilter === 'today') query = query.eq('challenge_date', today);

      const { data, error } = await query;
      if (error) throw error;
      setChallenges((data || []) as AdminChallenge[]);
    } catch (err) {
      console.error('[RituaisPanel] Erro ao carregar:', err);
    } finally {
      setIsLoading(false);
    }
  }, [dateFilter]);

  useEffect(() => { loadChallenges(); }, [loadChallenges]);

  const resetForm = () => {
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormTitle('');
    setFormDescription('');
    setFormType('reflexao');
    setFormActive(true);
    setFormError('');
    setEditingId(null);
  };

  const startEdit = (c: AdminChallenge) => {
    setEditingId(c.id);
    setFormDate(c.challenge_date);
    setFormTitle(c.title);
    setFormDescription(c.description);
    setFormType(c.challenge_type);
    setFormActive(c.is_active);
    setShowCreate(true);
    setFormError('');
  };

  const handleSave = async () => {
    if (!formTitle.trim()) { setFormError('Titulo obrigatorio.'); return; }
    if (!formDescription.trim()) { setFormError('Descricao obrigatoria.'); return; }
    if (!formDate) { setFormError('Data obrigatoria.'); return; }

    setIsSaving(true);
    setFormError('');

    try {
      if (editingId) {
        const { error } = await supabase
          .from('daily_challenges')
          .update({
            challenge_date: formDate,
            title: formTitle.trim(),
            description: formDescription.trim(),
            challenge_type: formType,
            is_active: formActive,
          })
          .eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('daily_challenges')
          .insert({
            challenge_date: formDate,
            title: formTitle.trim(),
            description: formDescription.trim(),
            challenge_type: formType,
            is_active: formActive,
          });
        if (error) throw error;
      }

      resetForm();
      setShowCreate(false);
      await loadChallenges();
    } catch (err: any) {
      console.error('[RituaisPanel] Erro ao salvar:', err);
      setFormError(err.message || 'Erro ao salvar desafio.');
    } finally {
      setIsSaving(false);
    }
  };

  const deleteChallenge = async (id: string) => {
    if (!confirm('Excluir este desafio permanentemente?')) return;
    try {
      const { error } = await supabase.from('daily_challenges').delete().eq('id', id);
      if (error) throw error;
      await loadChallenges();
    } catch (err) {
      console.error('[RituaisPanel] Erro ao excluir:', err);
    }
  };

  const toggleActive = async (id: string, currentActive: boolean) => {
    try {
      const { error } = await supabase
        .from('daily_challenges')
        .update({ is_active: !currentActive })
        .eq('id', id);
      if (error) throw error;
      await loadChallenges();
    } catch (err) {
      console.error('[RituaisPanel] Erro ao alternar:', err);
    }
  };

  // ═══ PREENCHIMENTO RAPIDO ═══
  const handleQuickFill = async () => {
    setIsFilling(true);
    try {
      // Buscar todos os desafios existentes como pool de templates
      const { data: pool } = await supabase
        .from('daily_challenges')
        .select('title, description, challenge_type')
        .eq('is_active', true)
        .limit(100);

      if (!pool || pool.length === 0) {
        alert('Nenhum desafio existente para usar como template. Crie pelo menos um primeiro.');
        setIsFilling(false);
        return;
      }

      // Verificar quais dias ja tem desafio
      const today = new Date();
      const futureDates: string[] = [];
      for (let i = 0; i < fillDays; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() + i);
        futureDates.push(d.toISOString().split('T')[0]);
      }

      const { data: existing } = await supabase
        .from('daily_challenges')
        .select('challenge_date')
        .in('challenge_date', futureDates);

      const existingDates = new Set((existing || []).map((e: any) => e.challenge_date));
      const emptyDates = futureDates.filter(d => !existingDates.has(d));

      if (emptyDates.length === 0) {
        alert(`Todos os proximos ${fillDays} dias ja tem desafio programado!`);
        setIsFilling(false);
        return;
      }

      // Preencher datas vazias com templates aleatorios do pool
      const inserts = emptyDates.map(date => {
        const template = pool[Math.floor(Math.random() * pool.length)];
        return {
          challenge_date: date,
          title: template.title,
          description: template.description,
          challenge_type: template.challenge_type,
          is_active: true,
        };
      });

      const { error } = await supabase.from('daily_challenges').insert(inserts);
      if (error) throw error;

      alert(`${inserts.length} desafio(s) criado(s) para os proximos dias!`);
      await loadChallenges();
    } catch (err: any) {
      console.error('[RituaisPanel] Erro no quick-fill:', err);
      alert('Erro ao preencher: ' + (err.message || 'Erro desconhecido'));
    } finally {
      setIsFilling(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const typeIcon = (type: string) => CHALLENGE_TYPES.find(t => t.value === type)?.icon || '🧠';

  return (
    <div className="space-y-6">
      {/* Header com acoes */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-white font-bold flex items-center gap-2">
          <Flame className="w-5 h-5 text-[#C8102E]" /> Rituais Diarios (daily_challenges)
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { resetForm(); setShowCreate(!showCreate); }}
            className="flex items-center gap-2 px-4 py-2 bg-[#C8102E] text-white rounded-xl text-xs font-bold hover:bg-[#C8102E]/90 transition-colors"
          >
            <Plus className="w-4 h-4" /> {showCreate ? 'Fechar' : 'Novo Desafio'}
          </button>
          <button onClick={loadChallenges} className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors">
            <RefreshCw className="w-4 h-4 text-white/60" />
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        {(['future', 'today', 'past', 'all'] as const).map(f => (
          <button
            key={f}
            onClick={() => setDateFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              dateFilter === f
                ? 'bg-[#C8102E]/15 text-[#C8102E] border-[#C8102E]/30'
                : 'bg-white/5 text-white/40 border-white/10 hover:border-white/20'
            }`}
          >
            {{ future: 'Futuros', today: 'Hoje', past: 'Passados', all: 'Todos' }[f]}
          </button>
        ))}
      </div>

      {/* Preenchimento Rapido */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <h3 className="text-white font-semibold text-sm mb-2 flex items-center gap-2">
          <Zap className="w-4 h-4 text-[#FF6B35]" /> Preenchimento Rapido
        </h3>
        <p className="text-white/40 text-xs mb-3">
          Preenche automaticamente os proximos dias vazios usando desafios existentes como pool de templates (rotacao aleatoria).
        </p>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-white/60 text-xs">Proximos</label>
            <select
              value={fillDays}
              onChange={(e) => setFillDays(Number(e.target.value))}
              className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none"
            >
              <option value={7}>7 dias</option>
              <option value={14}>14 dias</option>
              <option value={30}>30 dias</option>
            </select>
          </div>
          <button
            onClick={handleQuickFill}
            disabled={isFilling}
            className="flex items-center gap-2 px-4 py-2 bg-[#FF6B35] text-white rounded-lg text-xs font-bold hover:bg-[#FF6B35]/90 disabled:opacity-50 transition-colors"
          >
            {isFilling ? (
              <><div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> Preenchendo...</>
            ) : (
              <><Zap className="w-3 h-3" /> Preencher</>
            )}
          </button>
        </div>
      </div>

      {/* Formulario de Criacao/Edicao */}
      {showCreate && (
        <div className="bg-white/5 border border-[#C8102E]/20 rounded-xl p-5 space-y-4">
          <h3 className="text-white font-semibold text-sm">
            {editingId ? 'Editar Desafio' : 'Novo Desafio'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-white/60 text-xs mb-1 block">Data</label>
              <input
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#81D8D0]/50"
              />
            </div>
            <div>
              <label className="text-white/60 text-xs mb-1 block">Tipo</label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none"
              >
                {CHALLENGE_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-white/60 text-xs mb-1 block">Titulo</label>
            <input
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="Ex: O silencio que voce evita"
              maxLength={200}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-[#81D8D0]/50"
            />
          </div>

          <div>
            <label className="text-white/60 text-xs mb-1 block">Descricao / Provocacao</label>
            <textarea
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="A pergunta, provocacao ou instrucao do ritual..."
              maxLength={1000}
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-[#81D8D0]/50 resize-none"
            />
            <p className="text-white/20 text-xs text-right mt-1">{formDescription.length}/1000</p>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formActive}
                onChange={(e) => setFormActive(e.target.checked)}
                className="rounded border-white/20 bg-white/5 text-[#81D8D0] focus:ring-[#81D8D0]"
              />
              <span className="text-white/60 text-xs">Ativo</span>
            </label>
          </div>

          {formError && (
            <div className="p-2 bg-[#C8102E]/10 border border-[#C8102E]/30 rounded-lg">
              <p className="text-[#C8102E] text-xs font-semibold">{formError}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => { setShowCreate(false); resetForm(); }}
              className="px-4 py-2 bg-white/5 text-white/60 rounded-lg text-xs font-medium hover:bg-white/10 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2 bg-[#81D8D0] text-black rounded-lg text-xs font-bold hover:bg-[#81D8D0]/90 disabled:opacity-50 transition-colors"
            >
              {isSaving ? (
                <><div className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" /> Salvando...</>
              ) : (
                <><Save className="w-3 h-3" /> {editingId ? 'Atualizar' : 'Criar Desafio'}</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Lista de Desafios */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-[#C8102E] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : challenges.length === 0 ? (
        <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10">
          <Flame className="w-10 h-10 mx-auto mb-3 text-white opacity-30" />
          <p className="text-white/60 text-sm">
            {dateFilter === 'future' ? 'Nenhum desafio programado. Crie um ou use o preenchimento rapido!' : 'Nenhum desafio encontrado para este filtro.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {challenges.map((c) => {
            const isToday = c.challenge_date === today;
            const isPast = c.challenge_date < today;
            return (
              <div
                key={c.id}
                className={`bg-white/5 border rounded-xl p-4 transition-all ${
                  isToday ? 'border-[#C8102E]/40 bg-[#C8102E]/5' :
                  !c.is_active ? 'border-white/5 opacity-50' :
                  isPast ? 'border-white/10 opacity-70' :
                  'border-white/10'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <span className="text-2xl flex-shrink-0 mt-0.5">{typeIcon(c.challenge_type)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h4 className="text-white font-semibold text-sm">{c.title}</h4>
                        {isToday && (
                          <span className="text-[9px] px-2 py-0.5 bg-[#C8102E] text-white rounded-full font-bold animate-pulse">HOJE</span>
                        )}
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          c.is_active ? 'bg-[#81D8D0]/20 text-[#81D8D0]' : 'bg-white/10 text-white/40'
                        }`}>
                          {c.is_active ? 'ATIVO' : 'INATIVO'}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 bg-white/10 text-white/40 rounded-full">
                          {CHALLENGE_TYPES.find(t => t.value === c.challenge_type)?.label || c.challenge_type}
                        </span>
                      </div>
                      <p className="text-white/50 text-xs leading-relaxed line-clamp-2">{c.description}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-white/30">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(c.challenge_date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })}
                        </span>
                        {c.response_count > 0 && (
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            {c.response_count} resposta{c.response_count !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => startEdit(c)}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-white/40 hover:text-[#81D8D0]" />
                    </button>
                    <button
                      onClick={() => toggleActive(c.id, c.is_active)}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                      title={c.is_active ? 'Desativar' : 'Ativar'}
                    >
                      {c.is_active ? (
                        <XCircle className="w-3.5 h-3.5 text-white/40 hover:text-amber-400" />
                      ) : (
                        <CheckCircle className="w-3.5 h-3.5 text-white/40 hover:text-[#81D8D0]" />
                      )}
                    </button>
                    <button
                      onClick={() => deleteChallenge(c.id)}
                      className="p-2 hover:bg-[#C8102E]/20 rounded-lg transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-white/40 hover:text-[#C8102E]" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Info */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <p className="text-white/40 text-xs leading-relaxed">
          <strong className="text-white/60">Como funciona:</strong> Cada dia pode ter um desafio ativo. O desafio aparece no "Ritual do Dia" para todos os membros logados.
          Se nao houver desafio para o dia, um check-in livre e exibido.
          Use o <strong className="text-[#FF6B35]">Preenchimento Rapido</strong> para preencher automaticamente dias futuros usando desafios existentes como banco de inspiracao.
        </p>
      </div>

      {/* ═══ SECAO 2: Rituais de Comunidade (tipos disponiveis) ═══ */}
      <div className="mt-8 pt-6 border-t border-white/10">
        <h2 className="text-white font-bold flex items-center gap-2 mb-4">
          <span className="text-lg">🧘</span> Rituais de Comunidade
        </h2>
        <p className="text-white/40 text-xs mb-4 leading-relaxed">
          Estes sao os tipos de ritual disponiveis dentro de cada comunidade (aba "Rituais"). Estao definidos em <code className="text-[#81D8D0]">communitiesConfig.ts</code>.
          Para agendar um ritual, use a aba <strong className="text-white/60">Eventos & Lives</strong> com <code className="text-[#81D8D0]">event_type: "ritual"</code>.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {COMMUNITY_RITUAL_TYPES.map((ritual) => (
            <div key={ritual.key} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-[#81D8D0]/20 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{ritual.icone}</span>
                <h4 className="text-white font-semibold text-sm">{ritual.nome}</h4>
              </div>
              <p className="text-white/50 text-xs leading-relaxed">{ritual.desc}</p>
              <p className="text-white/20 text-[10px] mt-2 font-mono">{ritual.key}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
