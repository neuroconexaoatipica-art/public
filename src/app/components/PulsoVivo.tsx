import { forwardRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Radio,
  Video,
  MapPin,
  Flame,
  Megaphone,
  MessageCircleQuestion,
  ArrowRight,
  Heart,
  Send,
  BookOpen,
  CalendarPlus,
  Check,
  Mail,
  X,
  ExternalLink,
  AlertTriangle,
  Loader2,
  Users,
  Lightbulb,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAnnouncements } from "../../lib/useCMS";
import type { Announcement } from "../../lib/useCMS";
import { InteractivePrompt } from "./InteractivePrompt";

// ════════════════════════════════════════════════════════════════
// PULSO VIVO — Corao da Landing Page
// Lives REAIS do Supabase, mural dinmico, formulrios que salvam
// ════════════════════════════════════════════════════════════════

// Tipo das lives vindas do banco (events)
interface LiveFromDB {
  id: string;
  title: string;
  description: string;
  event_type: string;
  starts_at: string;
  ends_at: string | null;
  status: string;
  location_url: string;
  location_type: string;
  community_id: string | null;
  host_id: string | null;
  max_participants: number | null;
  cover_image_url: string | null;
  community_name?: string;
  host_name?: string;
  participant_count?: number;
}

// Fallback — so aparece se Supabase estiver fora / sem dados
const FALLBACK_LIVES = [
  {
    id: "fb-1",
    title: "Live — Mentes em Tensao",
    starts_at: "2026-02-27T14:00:00-03:00",
    location_url: "",
    community_name: "Mentes em Tensao",
    status: "published",
    destaque: true,
    linkPublico: true,
  },
  {
    id: "fb-2",
    title: "Live — Sexo, Desejo & Vinculo",
    starts_at: "2026-03-02T14:00:00-03:00",
    location_url: "",
    community_name: "Sexo, Desejo & Vinculo",
    status: "published",
    destaque: false,
    linkPublico: true,
  },
  {
    id: "fb-3",
    title: "Live — Networking Atipico",
    starts_at: "2026-03-03T14:00:00-03:00",
    location_url: "",
    community_name: "Networking Atipico",
    status: "published",
    destaque: false,
    linkPublico: true,
  },
  {
    id: "fb-4",
    title: "Live — Lab de Criacao",
    starts_at: "2026-03-04T14:00:00-03:00",
    location_url: "",
    community_name: "Lab de Criacao",
    status: "published",
    destaque: false,
    linkPublico: true,
  },
];

const FALLBACK_AVISOS = [
  { id: "1", texto: "Cadastros abertos — primeiros 80 membros fundadores com acesso vitalicio", tipo: "destaque" },
  { id: "2", texto: "10 comunidades procuram Founder — candidate-se apos o cadastro", tipo: "info" },
  { id: "3", texto: "Encontro presencial Sao Paulo — Abril 2026 em organizacao", tipo: "evento" },
  { id: "4", texto: "Lives toda semana — confira a agenda ao lado", tipo: "info" },
];

const DESAFIO_DA_SEMANA = {
  titulo: "Desafio da Semana",
  texto: "Conte para alguem — pessoalmente — algo que voce costuma guardar so pra si. Nao precisa ser nada enorme. Precisa ser verdadeiro.",
  tag: "Semana 1 — Fundacao",
};

const PERGUNTA_DO_DIA = {
  titulo: "Pergunta do Dia",
  texto: "O que voce faria diferente na sua vida se soubesse que ninguem ia te julgar?",
  autor: "Mila",
};

function ActionModal({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!isOpen) return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="relative bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border-2 border-[#1A1A1A]/10"
        >
          <button onClick={onClose} className="absolute top-3 right-3 p-1 hover:bg-black/5 rounded-lg transition-colors">
            <X className="h-5 w-5 text-[#666]" />
          </button>
          <h3 className="text-lg text-[#1A1A1A] mb-4" style={{ fontWeight: 700 }}>{title}</h3>
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Formatar data do banco para exibicao
function formatEventDate(isoDate: string) {
  const d = new Date(isoDate);
  const dia = d.getDate().toString().padStart(2, "0");
  const mesNum = d.getMonth(); // 0-indexed
  const meses = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
  const diasSemana = ["Domingo", "Segunda-feira", "Terca-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sabado"];
  const hora = `${d.getHours()}h`;
  return {
    dia,
    mesLabel: meses[mesNum],
    diaSemana: diasSemana[d.getDay()],
    hora,
  };
}

export const PulsoVivo = forwardRef<HTMLElement>(function PulsoVivo(_props, ref) {
  // ═══ LIVES DO SUPABASE ═══
  const [lives, setLives] = useState<LiveFromDB[]>([]);
  const [livesLoading, setLivesLoading] = useState(true);

  // ═══ MURAL DO SUPABASE ═══
  const { announcements, isLoading: muralLoading } = useAnnouncements();

  // ═══ INTERACAO ═══
  const [interesseLives, setInteresseLives] = useState<Record<string, boolean>>({});
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [liveInterestTarget, setLiveInterestTarget] = useState<string>(""); // titulo da live sendo registrada
  const [formData, setFormData] = useState({ nome: "", email: "", mensagem: "" });
  const [formSent, setFormSent] = useState<Record<string, boolean>>({});
  const [formLoading, setFormLoading] = useState(false);
  const [spInteresse, setSpInteresse] = useState(false);

  // ═══ CARREGAR LIVES DO BANCO ═══
  useEffect(() => {
    let cancelled = false;

    async function loadLives() {
      try {
        // Query publica — nao precisa de auth para SELECT se RLS permitir
        const { data: eventsData, error } = await supabase
          .from("events")
          .select("*")
          .in("status", ["published", "live"])
          .gte("starts_at", new Date().toISOString())
          .order("starts_at", { ascending: true })
          .limit(10);

        if (error) throw error;
        if (cancelled) return;

        if (eventsData && eventsData.length > 0) {
          // Buscar nomes de comunidades e hosts
          const communityIds = [...new Set(eventsData.map((e: any) => e.community_id).filter(Boolean))];
          const hostIds = [...new Set(eventsData.map((e: any) => e.host_id).filter(Boolean))];

          const [commResult, hostResult, partResult] = await Promise.all([
            communityIds.length > 0
              ? supabase.from("communities").select("id, name").in("id", communityIds)
              : { data: [] },
            hostIds.length > 0
              ? supabase.from("users").select("id, name").in("id", hostIds)
              : { data: [] },
            supabase
              .from("event_participants")
              .select("event_id")
              .in("event_id", eventsData.map((e: any) => e.id))
              .neq("status", "cancelled"),
          ]);

          const commMap: Record<string, string> = {};
          (commResult.data || []).forEach((c: any) => { commMap[c.id] = c.name; });

          const hostMap: Record<string, string> = {};
          (hostResult.data || []).forEach((h: any) => { hostMap[h.id] = h.name; });

          // Contagem de participantes
          const countMap: Record<string, number> = {};
          (partResult.data || []).forEach((p: any) => {
            countMap[p.event_id] = (countMap[p.event_id] || 0) + 1;
          });

          const enriched: LiveFromDB[] = eventsData.map((e: any) => ({
            ...e,
            community_name: e.community_id ? commMap[e.community_id] || null : null,
            host_name: e.host_id ? hostMap[e.host_id] || "Mila" : "Mila",
            participant_count: countMap[e.id] || 0,
          }));

          setLives(enriched);
        }
      } catch (err) {
        console.error("[PulsoVivo] Erro ao carregar lives:", err);
        // Fallback silencioso — landing nao pode quebrar
      } finally {
        if (!cancelled) setLivesLoading(false);
      }
    }

    loadLives();
    return () => { cancelled = true; };
  }, []);

  // ═══ TOGGLE INTERESSE (salva no banco se possivel) ═══
  const toggleInteresse = async (eventId: string) => {
    const isInterested = interesseLives[eventId];

    // Toggle visual imediato
    setInteresseLives(prev => ({ ...prev, [eventId]: !prev[eventId] }));

    // Tentar salvar no banco (se usuario estiver logado)
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return; // visitante — salvar so local

      if (!isInterested) {
        // Salvar interesse
        await supabase.from("event_participants").upsert(
          { event_id: eventId, user_id: user.id, status: "interested" },
          { onConflict: "event_id,user_id" }
        );
      } else {
        // Remover interesse
        await supabase.from("event_participants")
          .delete()
          .eq("event_id", eventId)
          .eq("user_id", user.id);
      }
    } catch {
      // Falhou — manter visual, nao punir usuario
    }
  };

  // ═══ FORM SUBMIT — SALVA NO SUPABASE ═══
  const handleFormSubmit = async (tipo: string) => {
    setFormLoading(true);
    try {
      // Mapear tipo para reason do contact_requests
      const reasonMap: Record<string, string> = {
        contato: "feedback",
        historia: "other",
        evento: "other",
        denuncia: "other",
        tema_live: "other",
        live_interesse: "other",
      };

      // Montar mensagem completa com dados do visitante
      const fullMessage = [
        `[${tipo.toUpperCase()}]`,
        tipo === "live_interesse" ? `Live: ${liveInterestTarget}` : null,
        formData.nome ? `Nome: ${formData.nome}` : null,
        formData.email ? `Email: ${formData.email}` : null,
        formData.mensagem ? `\n${formData.mensagem}` : null,
      ].filter(Boolean).join(" | ");

      // Tentar pegar user_id se estiver logado
      let userId: string | null = null;
      try {
        const { data: { user } } = await supabase.auth.getUser();
        userId = user?.id || null;
      } catch { /* visitante */ }

      // Inserir no contact_requests
      await supabase.from("contact_requests").insert({
        user_id: userId,
        reason: reasonMap[tipo] || "other",
        message: fullMessage,
        status: "pending",
      });
    } catch (err) {
      console.error("[PulsoVivo] Erro ao enviar formulario:", err);
      // Mostrar sucesso mesmo se falhar — nao punir usuario
    } finally {
      setFormLoading(false);
      setFormSent(prev => ({ ...prev, [tipo]: true }));
      setFormData({ nome: "", email: "", mensagem: "" });
      setTimeout(() => setActiveModal(null), 1500);
    }
  };

  // ═══ MURAL: USAR SUPABASE OU FALLBACK ═══
  const muralItems = announcements.length > 0
    ? announcements.map((a: Announcement) => ({
        id: a.id,
        texto: a.content || a.title,
        tipo: a.announcement_type === "urgent" ? "destaque"
            : a.announcement_type === "celebration" ? "destaque"
            : a.announcement_type === "warning" ? "evento"
            : "info",
      }))
    : FALLBACK_AVISOS;

  // ═══ LIVES: USAR SUPABASE OU FALLBACK ═══
  const displayLives = lives.length > 0 ? lives : (livesLoading ? [] : FALLBACK_LIVES);

  const inputClass = "w-full px-4 py-2.5 bg-[#EBEBEB] border-2 border-[#1A1A1A]/10 rounded-xl text-[#1A1A1A] text-sm placeholder:text-[#999] focus:border-[#1A1A1A]/25 focus:outline-none transition-colors";

  return (
    <section ref={ref} className="w-full py-10 md:py-16 relative overflow-hidden" style={{ background: "#D4D4D4" }}>
      <div className="relative mx-auto max-w-[1200px] px-6 lg:px-8">

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-[#1A1A1A] rounded-full mb-5 shadow-lg">
            <motion.div animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
              <Radio className="h-5 w-5 text-[#C8102E]" />
            </motion.div>
            <span className="text-sm text-white tracking-wider uppercase" style={{ fontWeight: 700 }}>
              Acontecendo agora
            </span>
            <motion.div
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-2 h-2 bg-[#C8102E] rounded-full"
            />
          </div>

          <h2 className="text-3xl md:text-4xl text-[#1A1A1A] mb-2" style={{ fontWeight: 700 }}>
            Isso aqui e <span className="text-[#C8102E]">vivo</span>
          </h2>
          <p className="text-base text-[#555] max-w-xl mx-auto">
            Lives confirmadas, desafios, perguntas e avisos. Tudo real, tudo aberto.
          </p>
        </motion.div>

        {/* ═══ GRID PRINCIPAL ═══ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* ═══ COLUNA 1: LIVES AGENDADAS (2/3) ═══ */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-xs text-[#1A1A1A] uppercase tracking-[0.2em] flex items-center gap-2" style={{ fontWeight: 700 }}>
                <Video className="h-4 w-4 text-[#C8102E]" />
                Lives & Eventos
              </h3>
              {lives.length > 0 && (
                <span className="text-[10px] text-[#0A8F85] bg-[#81D8D0]/15 px-2 py-0.5 rounded-full border border-[#81D8D0]/20" style={{ fontWeight: 600 }}>
                  Dados ao vivo
                </span>
              )}
            </div>

            {livesLoading ? (
              <div className="bg-white border-2 border-[#1A1A1A]/10 rounded-2xl p-8 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#C8102E] mb-3" />
                <p className="text-sm text-[#999]">Carregando agenda...</p>
              </div>
            ) : displayLives.length === 0 ? (
              <div className="bg-white border-2 border-[#1A1A1A]/10 rounded-2xl p-8 text-center">
                <Video className="h-10 w-10 text-[#CCC] mx-auto mb-3" />
                <p className="text-sm text-[#999]">Nenhum evento agendado no momento. Volte em breve!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {displayLives.map((live: any, idx: number) => {
                  const temInteresse = interesseLives[live.id];
                  const dt = formatEventDate(live.starts_at);
                  const isDestaque = (live as any).destaque ?? idx === 0;
                  const linkLive = live.location_url || live.linkLive || "";
                  const communityName = live.community_name || null;
                  const hostName = live.host_name || "Mila";
                  const participantCount = live.participant_count || 0;

                  return (
                    <motion.div
                      key={live.id}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: idx * 0.08 }}
                      whileHover={{ scale: 1.005 }}
                      className={`group bg-white border-2 rounded-2xl p-4 md:p-5 transition-all duration-300 shadow-sm hover:shadow-md ${
                        isDestaque ? "border-[#1A1A1A]/25" : "border-[#1A1A1A]/10"
                      }`}
                    >
                      <div className="flex gap-4">
                        {/* DATE BLOCK */}
                        <div className={`flex-shrink-0 w-16 md:w-20 text-center rounded-xl p-2 md:p-3 ${
                          isDestaque ? "bg-[#1A1A1A]" : "bg-[#EBEBEB]"
                        }`}>
                          <span className={`block text-xl md:text-2xl ${isDestaque ? "text-white" : "text-[#1A1A1A]"}`} style={{ fontWeight: 700 }}>
                            {dt.dia}
                          </span>
                          <span className={`block text-[10px] uppercase tracking-wider ${isDestaque ? "text-[#C8102E]" : "text-[#999]"}`} style={{ fontWeight: 600 }}>
                            {dt.mesLabel}
                          </span>
                          <span className={`block text-xs mt-0.5 ${isDestaque ? "text-white/70" : "text-[#999]"}`} style={{ fontWeight: 600 }}>
                            {dt.hora}
                          </span>
                        </div>

                        {/* CONTENT */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 bg-[#C8102E] text-white rounded-full" style={{ fontWeight: 700 }}>
                              {live.event_type === "ritual" ? "RITUAL" : live.event_type === "workshop" ? "WORKSHOP" : "LIVE"}
                            </span>
                            <span className="text-[10px] text-[#999] uppercase">{dt.diaSemana}</span>
                            {live.status === "live" && (
                              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 bg-[#C8102E] text-white rounded-full animate-pulse" style={{ fontWeight: 700 }}>
                                AO VIVO
                              </span>
                            )}
                          </div>

                          <h4 className="text-[#1A1A1A] text-base md:text-lg mb-1" style={{ fontWeight: 600 }}>
                            {live.title}
                          </h4>

                          <div className="flex items-center gap-3 text-sm text-[#666] mb-2 flex-wrap">
                            {communityName && (
                              <span>Comunidade: <span className="text-[#1A1A1A]" style={{ fontWeight: 600 }}>{communityName}</span></span>
                            )}
                            <span className="text-[#999]">Host: {hostName}</span>
                            {participantCount > 0 && (
                              <span className="flex items-center gap-1 text-[#0A8F85]">
                                <Users className="h-3 w-3" /> {participantCount}
                              </span>
                            )}
                          </div>

                          {/* LINK DA LIVE + INTERESSE — coleta dados reais */}
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            {linkLive ? (
                              <a
                                href={linkLive}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs bg-[#C8102E] text-white hover:bg-[#A00D24] transition-colors"
                                style={{ fontWeight: 600 }}
                              >
                                <ExternalLink className="h-3 w-3" />
                                Acessar Live
                              </a>
                            ) : (
                              <button
                                onClick={() => {
                                  setLiveInterestTarget(live.title);
                                  setActiveModal("live_interesse");
                                }}
                                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs bg-[#1A1A1A] text-white hover:bg-[#333] transition-colors cursor-pointer"
                                style={{ fontWeight: 600 }}
                              >
                                <Mail className="h-3 w-3" />
                                Quero receber o link
                              </button>
                            )}

                            <motion.button
                              onClick={() => {
                                setLiveInterestTarget(live.title);
                                setActiveModal("live_interesse");
                              }}
                              whileTap={{ scale: 0.95 }}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all border ${
                                interesseLives[live.id]
                                  ? "bg-[#0A8F85] text-white border-[#0A8F85]"
                                  : "bg-white text-[#555] border-[#1A1A1A]/15 hover:border-[#1A1A1A]/30 hover:text-[#1A1A1A]"
                              }`}
                              style={{ fontWeight: 600 }}
                            >
                              {interesseLives[live.id] ? (
                                <><Check className="h-3 w-3" /> Interesse registrado!</>
                              ) : (
                                <><Heart className="h-3 w-3" /> Quero participar</>
                              )}
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* ═══ TOPICO OFICIAL: SP ═══ */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white border-2 border-[#1A1A1A]/20 rounded-2xl p-5 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-[#FF6B35]/15 flex items-center justify-center border border-[#FF6B35]/30">
                  <MapPin className="h-4 w-4 text-[#FF6B35]" />
                </div>
                <div>
                  <span className="text-[10px] text-[#FF6B35] uppercase tracking-wider" style={{ fontWeight: 700 }}>Topico Oficial</span>
                  <h4 className="text-[#1A1A1A]" style={{ fontWeight: 700 }}>Quem e de SP ou regiao? Se manifeste!</h4>
                </div>
              </div>
              <p className="text-sm text-[#555] mb-3">
                Encontro presencial em Sao Paulo — Abril 2026. Precisamos saber quem ta por perto. Se manifeste!
              </p>
              <motion.button
                onClick={() => setSpInteresse(!spInteresse)}
                whileTap={{ scale: 0.95 }}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm transition-all border-2 ${
                  spInteresse
                    ? "bg-[#1A1A1A] text-white border-[#1A1A1A]"
                    : "bg-white text-[#FF6B35] border-[#FF6B35]/30 hover:border-[#FF6B35]/60"
                }`}
                style={{ fontWeight: 600 }}
              >
                {spInteresse ? (
                  <><Check className="h-4 w-4" /> Manifestei interesse!</>
                ) : (
                  <><MapPin className="h-4 w-4" /> Sou de SP / regiao — quero participar</>
                )}
              </motion.button>
            </motion.div>
          </div>

          {/* ═══ COLUNA 2: MURAL + DESAFIO + PERGUNTA + ACOES ═══ */}
          <div className="space-y-4">

            {/* MURAL DE AVISOS — do Supabase */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-[#1A1A1A] border-2 border-[#1A1A1A] rounded-2xl p-5"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#C8102E] flex items-center justify-center">
                  <Megaphone className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-white text-sm" style={{ fontWeight: 700 }}>Mural de Avisos</h3>
                {announcements.length > 0 && (
                  <span className="text-[8px] text-[#81D8D0] uppercase tracking-wider ml-auto" style={{ fontWeight: 600 }}>AO VIVO</span>
                )}
              </div>
              {muralLoading ? (
                <div className="flex items-center gap-2 py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-white/40" />
                  <span className="text-xs text-white/40">Carregando...</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {muralItems.map((aviso: any) => (
                    <div key={aviso.id} className="flex items-start gap-2.5">
                      <ArrowRight
                        className="h-3 w-3 mt-1 flex-shrink-0"
                        style={{
                          color: aviso.tipo === "destaque" ? "#C8102E" : aviso.tipo === "evento" ? "#FF6B35" : "#81D8D0",
                        }}
                      />
                      <p className={`text-sm leading-relaxed ${aviso.tipo === "destaque" ? "text-white" : "text-white/70"}`}
                        style={aviso.tipo === "destaque" ? { fontWeight: 600 } : {}}
                      >
                        {aviso.texto}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* DESAFIO DA SEMANA — INTERATIVO: qualquer pessoa pode responder */}
            <InteractivePrompt
              promptType="desafio"
              title={DESAFIO_DA_SEMANA.titulo}
              subtitle={DESAFIO_DA_SEMANA.tag}
              text={DESAFIO_DA_SEMANA.texto}
              icon={
                <div className="w-8 h-8 rounded-lg bg-[#C8102E]/15 flex items-center justify-center border border-[#C8102E]/20">
                  <Flame className="h-4 w-4 text-[#C8102E]" />
                </div>
              }
              borderColor="#C8102E40"
              accentColor="#C8102E"
            />

            {/* PERGUNTA DO DIA — INTERATIVO: qualquer pessoa pode responder */}
            <InteractivePrompt
              promptType="pergunta"
              title={PERGUNTA_DO_DIA.titulo}
              text={PERGUNTA_DO_DIA.texto}
              author={PERGUNTA_DO_DIA.autor}
              icon={
                <div className="w-8 h-8 rounded-lg bg-[#81D8D0]/20 flex items-center justify-center border border-[#81D8D0]/30">
                  <MessageCircleQuestion className="h-4 w-4 text-[#0A8F85]" />
                </div>
              }
              borderColor="#81D8D040"
              accentColor="#0A8F85"
            />

            {/* ═══ SUGERIR TEMA PARA LIVE — DESTAQUE ═══ */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-[#C8102E] to-[#8B0A1E] rounded-2xl p-5 text-white shadow-md"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
                  <Lightbulb className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-sm text-white" style={{ fontWeight: 700 }}>Sugira um tema para live</h3>
              </div>
              <p className="text-xs text-white/70 mb-3 leading-relaxed">
                Que assunto voce gostaria de ver numa live? Sua sugestao vai direto pra equipe e influencia a agenda.
              </p>
              <button
                onClick={() => setActiveModal("tema_live")}
                className="w-full py-2.5 bg-white text-[#C8102E] rounded-xl text-sm transition-all hover:bg-white/90 cursor-pointer"
                style={{ fontWeight: 700 }}
              >
                Enviar minha sugestao
              </button>
            </motion.div>

            {/* ═══ ACOES INTERATIVAS ═══ */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white border-2 border-[#1A1A1A]/10 rounded-2xl p-5"
            >
              <h3 className="text-[#1A1A1A] text-sm mb-3" style={{ fontWeight: 700 }}>Participe</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: "contato", icon: Mail, color: "#81D8D0", label: "Falar com a equipe" },
                  { key: "historia", icon: BookOpen, color: "#C8102E", label: "Contar sua historia" },
                  { key: "evento", icon: CalendarPlus, color: "#FF6B35", label: "Sugerir evento" },
                  { key: "denuncia", icon: AlertTriangle, color: "#C8102E", label: "Fazer denuncia" },
                ].map(action => (
                  <button
                    key={action.key}
                    onClick={() => setActiveModal(action.key)}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-[#EBEBEB] hover:bg-[#DCDCDC] border border-[#1A1A1A]/8 transition-colors text-center"
                  >
                    <action.icon className="h-5 w-5" style={{ color: action.color }} />
                    <span className="text-[11px] text-[#444]" style={{ fontWeight: 600 }}>{action.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ═══ MODALS — SALVAM NO SUPABASE ═══ */}
      {["contato", "historia", "evento", "denuncia", "tema_live"].map(tipo => {
        const config: Record<string, { title: string; placeholder: string; btnText: string; btnColor: string; successMsg: string; description: string }> = {
          contato: { title: "Falar com a equipe", placeholder: "Sua mensagem", btnText: "Enviar", btnColor: "#1A1A1A", successMsg: "Mensagem enviada!", description: "" },
          historia: { title: "Conte sua historia", placeholder: "Sua historia...", btnText: "Enviar minha historia", btnColor: "#C8102E", successMsg: "Historia recebida!", description: "Compartilhe um pouco de quem voce e. Nao precisa ser longo — precisa ser real." },
          evento: { title: "Sugerir um evento", placeholder: "Descreva sua ideia...", btnText: "Enviar sugestao", btnColor: "#FF6B35", successMsg: "Sugestao enviada!", description: "Tem uma ideia de live, debate, ritual ou encontro? Conta pra gente." },
          denuncia: { title: "Fazer denuncia", placeholder: "Descreva a situacao...", btnText: "Enviar denuncia", btnColor: "#C8102E", successMsg: "Denuncia recebida. Vamos avaliar.", description: "Relatos sao tratados com seriedade e sigilo. Descreva o que aconteceu." },
          tema_live: { title: "Sugira um tema para live", placeholder: "Assunto da live...", btnText: "Enviar sugestao", btnColor: "#C8102E", successMsg: "Sugestao enviada!", description: "Que assunto voce gostaria de ver numa live? Sua sugestao vai direto pra equipe e influencia a agenda." },
        };
        const c = config[tipo];
        return (
          <ActionModal key={tipo} isOpen={activeModal === tipo} onClose={() => setActiveModal(null)} title={c.title}>
            {formSent[tipo] ? (
              <div className="text-center py-4">
                <Check className="h-10 w-10 mx-auto mb-3" style={{ color: c.btnColor }} />
                <p className="text-[#1A1A1A]" style={{ fontWeight: 600 }}>{c.successMsg}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {c.description && <p className="text-sm text-[#666]">{c.description}</p>}
                <input type="text" placeholder="Seu nome" value={formData.nome} onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))} className={inputClass} />
                <input type="email" placeholder="Seu email" value={formData.email} onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} className={inputClass} />
                <textarea placeholder={c.placeholder} value={formData.mensagem} onChange={(e) => setFormData(prev => ({ ...prev, mensagem: e.target.value }))} rows={tipo === "historia" ? 5 : 3} className={`${inputClass} resize-none`} />
                <button
                  onClick={() => handleFormSubmit(tipo)}
                  disabled={formLoading}
                  className="w-full py-2.5 text-white rounded-xl text-sm transition-colors hover:opacity-90 disabled:opacity-50"
                  style={{ fontWeight: 600, backgroundColor: c.btnColor }}
                >
                  <span className="flex items-center justify-center gap-2">
                    {formLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    {formLoading ? "Enviando..." : c.btnText}
                  </span>
                </button>
              </div>
            )}
          </ActionModal>
        );
      })}

      {/* ═══ MODAL INTERESSE EM LIVE — coleta dados reais de visitantes ═══ */}
      <ActionModal
        isOpen={activeModal === "live_interesse"}
        onClose={() => setActiveModal(null)}
        title="Quero participar desta live"
      >
        {formSent["live_interesse"] ? (
          <div className="text-center py-4">
            <Check className="h-10 w-10 mx-auto mb-3 text-[#0A8F85]" />
            <p className="text-[#1A1A1A]" style={{ fontWeight: 600 }}>Interesse registrado!</p>
            <p className="text-sm text-[#666] mt-1">Voce recebera o link por email quando a live for confirmada.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="bg-[#EBEBEB] rounded-xl p-3 mb-1">
              <p className="text-xs text-[#999] uppercase tracking-wider mb-1" style={{ fontWeight: 600 }}>Live selecionada</p>
              <p className="text-sm text-[#1A1A1A]" style={{ fontWeight: 600 }}>{liveInterestTarget}</p>
            </div>
            <p className="text-sm text-[#666]">
              Deixe seus dados para receber o link e atualizacoes sobre esta live.
            </p>
            <input type="text" placeholder="Seu nome" value={formData.nome} onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))} className={inputClass} />
            <input type="email" placeholder="Seu email (obrigatorio)" value={formData.email} onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} className={inputClass} />
            <button
              onClick={() => handleFormSubmit("live_interesse")}
              disabled={formLoading || !formData.email.includes("@")}
              className="w-full py-2.5 bg-[#1A1A1A] text-white rounded-xl text-sm transition-colors hover:bg-[#333] disabled:opacity-50"
              style={{ fontWeight: 600 }}
            >
              <span className="flex items-center justify-center gap-2">
                {formLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Heart className="h-4 w-4" />}
                {formLoading ? "Registrando..." : "Confirmar interesse"}
              </span>
            </button>
          </div>
        )}
      </ActionModal>
    </section>
  );
});