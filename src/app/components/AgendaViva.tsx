/**
 * AgendaViva — Agenda compacta de eventos com contagem regressiva
 * 
 * Mostra os próximos eventos/lives de TODAS as comunidades em formato
 * de timeline vertical. Pode ser usado na landing (sem login) ou
 * dentro da área interna.
 */

import { useState, useEffect, forwardRef } from "react";
import { motion } from "motion/react";
import { Calendar, Clock, Radio, Users, MapPin, Flame, Sparkles } from "lucide-react";
import { supabase } from "../../lib/supabase";

interface AgendaEvent {
  id: string;
  title: string;
  description: string;
  event_type: "live" | "workshop" | "ritual" | "meetup" | "study_group" | "support_circle";
  starts_at: string;
  ends_at: string | null;
  community_name: string | null;
  community_color: string;
  participant_count: number;
  location_type: "online" | "in_person" | "hybrid";
  host_name: string | null;
}

function getCountdown(startsAt: string): string {
  const now = new Date();
  const start = new Date(startsAt);
  const diff = start.getTime() - now.getTime();

  if (diff <= 0) return "Agora!";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}min`;
  return `${minutes}min`;
}

function getEventIcon(type: string) {
  switch (type) {
    case "live": return Radio;
    case "ritual": return Flame;
    case "workshop": return Sparkles;
    default: return Calendar;
  }
}

function getEventTypeLabel(type: string) {
  switch (type) {
    case "live": return "Live";
    case "ritual": return "Ritual";
    case "workshop": return "Workshop";
    case "meetup": return "Encontro";
    case "study_group": return "Grupo de Estudo";
    case "support_circle": return "Circulo de Apoio";
    default: return "Evento";
  }
}

// Cores por tipo de evento
function getEventColor(type: string): string {
  switch (type) {
    case "live": return "#C8102E";
    case "ritual": return "#FF6B35";
    case "workshop": return "#81D8D0";
    default: return "#999";
  }
}

export const AgendaViva = forwardRef<HTMLElement>(
  function AgendaViva(_props, ref) {
    const [events, setEvents] = useState<AgendaEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [countdown, setCountdown] = useState<Record<string, string>>({});

    // Carregar próximos eventos
    useEffect(() => {
      async function loadEvents() {
        try {
          const now = new Date().toISOString();
          const { data, error } = await supabase
            .from("events")
            .select(`
              id, title, description, event_type, starts_at, ends_at,
              location_type, host_id,
              communities!events_community_id_fkey(name)
            `)
            .gte("starts_at", now)
            .eq("status", "scheduled")
            .order("starts_at", { ascending: true })
            .limit(8);

          if (error) {
            console.error("[AgendaViva] Erro ao carregar eventos:", error);
            return;
          }

          if (data && data.length > 0) {
            // Carregar contagem de participantes
            const eventIds = data.map((e: any) => e.id);
            const { data: participants } = await supabase
              .from("event_participants")
              .select("event_id")
              .in("event_id", eventIds);

            const countMap: Record<string, number> = {};
            (participants || []).forEach((p: any) => {
              countMap[p.event_id] = (countMap[p.event_id] || 0) + 1;
            });

            // Carregar nomes dos hosts
            const hostIds = [...new Set(data.map((e: any) => e.host_id).filter(Boolean))];
            const hostMap: Record<string, string> = {};
            if (hostIds.length > 0) {
              const { data: hosts } = await supabase
                .from("users")
                .select("id, name")
                .in("id", hostIds);
              (hosts || []).forEach((h: any) => { hostMap[h.id] = h.name; });
            }

            const mapped: AgendaEvent[] = data.map((e: any) => ({
              id: e.id,
              title: e.title,
              description: e.description,
              event_type: e.event_type,
              starts_at: e.starts_at,
              ends_at: e.ends_at,
              community_name: e.communities?.name || null,
              community_color: getEventColor(e.event_type),
              participant_count: countMap[e.id] || 0,
              location_type: e.location_type || "online",
              host_name: e.host_id ? (hostMap[e.host_id] || null) : null,
            }));

            setEvents(mapped);
          }
        } catch (err) {
          console.error("[AgendaViva] Erro:", err);
        } finally {
          setIsLoading(false);
        }
      }

      loadEvents();
    }, []);

    // Atualizar contagem regressiva a cada minuto
    useEffect(() => {
      function updateCountdowns() {
        const newCountdowns: Record<string, string> = {};
        events.forEach(e => {
          newCountdowns[e.id] = getCountdown(e.starts_at);
        });
        setCountdown(newCountdowns);
      }

      updateCountdowns();
      const interval = setInterval(updateCountdowns, 60_000);
      return () => clearInterval(interval);
    }, [events]);

    if (isLoading) {
      return (
        <section ref={ref} className="w-full py-10" style={{ background: "#D4D4D4" }}>
          <div className="mx-auto max-w-[1200px] px-6">
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-3 border-[#C8102E] border-t-transparent rounded-full animate-spin" />
            </div>
          </div>
        </section>
      );
    }

    if (events.length === 0) {
      return null; // Nao mostra se nao tem eventos
    }

    return (
      <section ref={ref} className="w-full py-10 md:py-14" style={{ background: "#D4D4D4" }}>
        <div className="mx-auto max-w-[1200px] px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <h2 className="text-2xl md:text-3xl text-[#1A1A1A] mb-2" style={{ fontWeight: 700 }}>
              Agenda Viva
            </h2>
            <p className="text-[#555] text-sm md:text-base">
              Proximos encontros do territorio. Tudo acontecendo de verdade.
            </p>
          </motion.div>

          {/* Timeline de eventos */}
          <div className="space-y-3 max-w-[700px] mx-auto">
            {events.map((event, idx) => {
              const IconComp = getEventIcon(event.event_type);
              const color = event.community_color;
              const startDate = new Date(event.starts_at);
              const isToday = new Date().toDateString() === startDate.toDateString();
              const isTomorrow = new Date(Date.now() + 86400000).toDateString() === startDate.toDateString();
              const dayLabel = isToday ? "Hoje" : isTomorrow ? "Amanha" : startDate.toLocaleDateString("pt-BR", { weekday: "short", day: "numeric", month: "short" });

              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.08 }}
                  className="flex items-stretch gap-4"
                >
                  {/* Timeline dot + line */}
                  <div className="flex flex-col items-center w-8 flex-shrink-0">
                    <div
                      className="w-4 h-4 rounded-full border-3 mt-4 flex-shrink-0"
                      style={{ borderColor: color, backgroundColor: isToday ? color : "transparent" }}
                    />
                    {idx < events.length - 1 && (
                      <div className="w-0.5 flex-1 bg-[#1A1A1A]/10 mt-1" />
                    )}
                  </div>

                  {/* Card */}
                  <div className="flex-1 bg-white rounded-xl p-4 border border-[#1A1A1A]/8 shadow-sm hover:shadow-md transition-shadow mb-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        {/* Type + Community */}
                        <div className="flex items-center gap-2 mb-1.5">
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider text-white"
                            style={{ background: color, fontWeight: 700 }}
                          >
                            <IconComp className="h-2.5 w-2.5" />
                            {getEventTypeLabel(event.event_type)}
                          </span>
                          {event.community_name && (
                            <span className="text-[10px] text-[#555] font-medium truncate">
                              {event.community_name}
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className="text-sm text-[#1A1A1A] leading-snug" style={{ fontWeight: 600 }}>
                          {event.title}
                        </h3>

                        {/* Meta */}
                        <div className="flex items-center gap-3 mt-2 text-[11px] text-[#777]">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {dayLabel}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {startDate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                          {event.participant_count > 0 && (
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {event.participant_count}
                            </span>
                          )}
                          {event.location_type === "in_person" && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              Presencial
                            </span>
                          )}
                        </div>

                        {event.host_name && (
                          <p className="text-[10px] text-[#999] mt-1.5">
                            com {event.host_name}
                          </p>
                        )}
                      </div>

                      {/* Countdown */}
                      <div className="flex-shrink-0 text-right">
                        <div
                          className="text-xs px-2.5 py-1.5 rounded-lg font-bold"
                          style={{
                            background: `${color}15`,
                            color: color,
                          }}
                        >
                          {countdown[event.id] || "..."}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    );
  }
);
