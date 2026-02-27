import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { MapPin, User, Calendar, Search, Globe, Users } from "lucide-react";
import { supabase } from "../../lib/supabase";

interface NucleoInfo {
  id: string;
  nome: string;
  estado: string;
  coordenador_nome: string | null;
  procurando_coordenador: boolean;
  proximo_evento: string | null;
  status: string;
  membros_count: number;
  encontros_realizados: number;
}

// Nucleos planejados — usados como fallback se a tabela nuclei estiver vazia
// Esses SAO os nucleos reais que a Mila planeja. Nao e dado ficticio.
const PLANNED_NUCLEOS: NucleoInfo[] = [
  {
    id: "planned-sp",
    nome: "Nucleo Sao Paulo",
    estado: "SP",
    coordenador_nome: "Mila",
    procurando_coordenador: false,
    proximo_evento: "Encontro Presencial — em organizacao",
    status: "em_formacao",
    membros_count: 0,
    encontros_realizados: 0,
  },
  {
    id: "planned-rs",
    nome: "Nucleo Rio Grande do Sul",
    estado: "RS",
    coordenador_nome: null,
    procurando_coordenador: true,
    proximo_evento: null,
    status: "em_formacao",
    membros_count: 0,
    encontros_realizados: 0,
  },
  {
    id: "planned-sc",
    nome: "Nucleo Santa Catarina",
    estado: "SC",
    coordenador_nome: null,
    procurando_coordenador: true,
    proximo_evento: null,
    status: "em_formacao",
    membros_count: 0,
    encontros_realizados: 0,
  },
  {
    id: "planned-mt",
    nome: "Nucleo Mato Grosso",
    estado: "MT",
    coordenador_nome: null,
    procurando_coordenador: true,
    proximo_evento: null,
    status: "em_formacao",
    membros_count: 0,
    encontros_realizados: 0,
  },
  {
    id: "planned-go",
    nome: "Nucleo Goias",
    estado: "GO",
    coordenador_nome: null,
    procurando_coordenador: true,
    proximo_evento: null,
    status: "em_formacao",
    membros_count: 0,
    encontros_realizados: 0,
  },
  {
    id: "planned-ne",
    nome: "Nucleo Nordeste",
    estado: "NE",
    coordenador_nome: null,
    procurando_coordenador: true,
    proximo_evento: null,
    status: "em_formacao",
    membros_count: 0,
    encontros_realizados: 0,
  },
];

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  em_formacao: { label: "Em formação", color: "#FF6B35" },
  ativo: { label: "Ativo", color: "#81D8D0" },
  consolidado: { label: "Núcleo consolidado", color: "#FFD700" },
  pausado: { label: "Pausado", color: "#C0C0C0" },
};

// SVG simplified Brazil map with state positions
const STATE_POSITIONS: Record<string, { x: number; y: number }> = {
  SP: { x: 58, y: 68 },
  RS: { x: 52, y: 85 },
  SC: { x: 58, y: 78 },
  MT: { x: 45, y: 45 },
  GO: { x: 55, y: 52 },
  NE: { x: 78, y: 32 },
};

export function NucleosTerritoriais() {
  const [nucleos, setNucleos] = useState<NucleoInfo[]>(PLANNED_NUCLEOS);
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [isFromDB, setIsFromDB] = useState(false);

  // Dados do nucleo hover (para tooltip no mapa)
  const hoveredNucleo = nucleos.find(n => n.estado === hoveredState);

  useEffect(() => {
    async function loadNucleos() {
      try {
        // 1. Carregar nucleos do banco
        const { data, error } = await supabase
          .from("nuclei")
          .select("*")
          .order("nome", { ascending: true });

        if (error || !data || data.length === 0) {
          // Sem dados no banco — usar nucleos planejados
          return;
        }

        // 2. Carregar nomes dos coordenadores (se houver coordenador_id)
        const coordIds = data
          .map((n: any) => n.coordenador_id || n.coordinator_id)
          .filter(Boolean);

        let coordMap: Record<string, string> = {};
        if (coordIds.length > 0) {
          const { data: coords } = await supabase
            .from("users")
            .select("id, name, display_name")
            .in("id", coordIds);
          if (coords) {
            coords.forEach((c: any) => { coordMap[c.id] = c.display_name || c.name; });
          }
        }

        // 3. Carregar proximo evento por estado (events com location_type = presencial)
        const estados = data.map((n: any) => n.estado).filter(Boolean);
        let eventMap: Record<string, string> = {};
        if (estados.length > 0) {
          const { data: events } = await supabase
            .from("events")
            .select("title, starts_at, description")
            .in("status", ["published", "live"])
            .gte("starts_at", new Date().toISOString())
            .order("starts_at", { ascending: true })
            .limit(20);

          if (events) {
            // Tentar associar eventos a estados pelo titulo ou descricao
            for (const estado of estados) {
              const match = events.find((e: any) =>
                (e.title || "").toLowerCase().includes(estado.toLowerCase()) ||
                (e.description || "").toLowerCase().includes(estado.toLowerCase())
              );
              if (match) {
                const d = new Date(match.starts_at);
                eventMap[estado] = `${match.title} — ${d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}`;
              }
            }
          }
        }

        // 4. Mapear dados do banco
        const mapped: NucleoInfo[] = data.map((n: any) => {
          const coordId = n.coordenador_id || n.coordinator_id;
          return {
            id: n.id,
            nome: n.nome || n.name || "Nucleo",
            estado: n.estado || n.state || "",
            coordenador_nome: coordId ? (coordMap[coordId] || null) : (n.coordenador_nome || null),
            procurando_coordenador: n.procurando_coordenador ?? !coordId,
            proximo_evento: eventMap[n.estado || n.state || ""] || n.proximo_evento || null,
            status: n.status || "em_formacao",
            membros_count: n.membros_count || n.member_count || 0,
            encontros_realizados: n.encontros_realizados || 0,
          };
        });

        setNucleos(mapped);
        setIsFromDB(true);
      } catch (err) {
        console.log("NucleosTerritoriais: usando dados planejados (fallback)", err);
        // Manter nucleos planejados
      }
    }
    loadNucleos();
  }, []);

  return (
    <section className="w-full py-16 md:py-24 lg:py-28 relative overflow-hidden" style={{ background: "#D4D4D4" }}>
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
        <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-[#FF6B35] rounded-full blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-[1200px] px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF6B35]/10 border border-[#FF6B35]/30 rounded-full mb-6">
            <Globe className="h-4 w-4 text-[#FF6B35]" />
            <span className="text-sm text-[#FF6B35] tracking-wide uppercase" style={{ fontWeight: 600 }}>
              Presença Territorial
            </span>
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl mb-4 text-[#1A1A1A]" style={{ fontWeight: 600 }}>
            Núcleos por estado
          </h2>
          <p className="text-lg text-[#666] max-w-2xl mx-auto">
            Comunidades digitais com raízes presenciais. Cada núcleo organiza
            lives territoriais, encontros e rituais locais.
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
          {/* Map visualization */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="w-full lg:w-5/12 flex-shrink-0"
          >
            <div className="relative bg-white border border-black/10 rounded-2xl p-8 aspect-square flex items-center justify-center shadow-sm">
              {/* Tooltip do estado hover */}
              {hoveredNucleo && (
                <div className="absolute top-4 left-4 right-4 z-10 bg-white border border-black/10 rounded-xl p-3 shadow-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-[#1A1A1A]">{hoveredNucleo.nome}</span>
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full uppercase"
                      style={{
                        backgroundColor: `${(STATUS_LABELS[hoveredNucleo.status]?.color || '#C0C0C0')}15`,
                        color: STATUS_LABELS[hoveredNucleo.status]?.color || '#C0C0C0',
                        fontWeight: 600,
                      }}
                    >
                      {STATUS_LABELS[hoveredNucleo.status]?.label || hoveredNucleo.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-[#999]">
                    <span>{hoveredNucleo.membros_count} membros</span>
                    <span>·</span>
                    <span>{hoveredNucleo.encontros_realizados} encontros</span>
                    {hoveredNucleo.proximo_evento && (
                      <>
                        <span>·</span>
                        <span className="text-[#FF6B35] truncate">{hoveredNucleo.proximo_evento}</span>
                      </>
                    )}
                  </div>
                </div>
              )}
              {/* Simplified Brazil shape */}
              <svg viewBox="0 0 100 100" className="w-full h-full max-w-[280px]">
                {/* Brazil outline - simplified */}
                <path
                  d="M 40 8 Q 55 5 75 15 Q 85 22 88 35 Q 90 45 82 50 Q 78 55 72 58 Q 68 62 65 70 Q 60 78 55 82 Q 48 90 42 92 Q 35 90 32 82 Q 28 72 30 65 Q 28 55 32 48 Q 30 40 35 30 Q 38 20 40 8 Z"
                  fill="none"
                  stroke="rgba(0,0,0,0.1)"
                  strokeWidth="0.5"
                />

                {/* State dots */}
                {nucleos.map((nucleo) => {
                  const pos = STATE_POSITIONS[nucleo.estado];
                  if (!pos) return null;
                  const isHovered = hoveredState === nucleo.estado;
                  const statusColor =
                    STATUS_LABELS[nucleo.status]?.color || "#C0C0C0";

                  return (
                    <g key={nucleo.id}>
                      {/* Pulse ring */}
                      <motion.circle
                        cx={pos.x}
                        cy={pos.y}
                        r={isHovered ? 6 : 4}
                        fill="none"
                        stroke={statusColor}
                        strokeWidth={0.5}
                        animate={{
                          r: isHovered ? [6, 10, 6] : [4, 7, 4],
                          opacity: [0.5, 0, 0.5],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                      {/* Dot */}
                      <motion.circle
                        cx={pos.x}
                        cy={pos.y}
                        r={isHovered ? 3 : 2}
                        fill={statusColor}
                        animate={{
                          scale: isHovered ? 1.2 : 1,
                        }}
                        style={{ cursor: "pointer" }}
                        onMouseEnter={() => setHoveredState(nucleo.estado)}
                        onMouseLeave={() => setHoveredState(null)}
                      />
                      {/* Label */}
                      <text
                        x={pos.x}
                        y={pos.y - 5}
                        textAnchor="middle"
                        fill={isHovered ? "#81D8D0" : "rgba(0,0,0,0.4)"}
                        fontSize="3"
                        fontWeight={isHovered ? 600 : 400}
                      >
                        {nucleo.estado}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </motion.div>

          {/* Nucleos list */}
          <div className="w-full lg:w-7/12 space-y-3">
            {nucleos.map((nucleo, index) => {
              const status = STATUS_LABELS[nucleo.status] || STATUS_LABELS["em_formacao"];

              return (
                <motion.div
                  key={nucleo.id}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                  whileHover={{
                    borderColor: `${status.color}40`,
                    y: -2,
                  }}
                  onMouseEnter={() => setHoveredState(nucleo.estado)}
                  onMouseLeave={() => setHoveredState(null)}
                  className="group bg-white border border-black/10 rounded-xl p-5 transition-all duration-300 shadow-sm"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center"
                        style={{
                          backgroundColor: `${status.color}15`,
                          border: `1px solid ${status.color}30`,
                        }}
                      >
                        <MapPin
                          className="h-4 w-4"
                          style={{ color: status.color }}
                        />
                      </div>
                      <div>
                        <h3
                          className="text-[#1A1A1A] group-hover:text-[#81D8D0] transition-colors"
                          style={{ fontWeight: 600 }}
                        >
                          {nucleo.nome}
                        </h3>
                        <span
                          className="text-xs uppercase tracking-wider"
                          style={{
                            color: status.color,
                            fontWeight: 500,
                          }}
                        >
                          {status.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#999] mt-3">
                    {/* Membros por estado */}
                    {nucleo.membros_count > 0 && (
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-[#81D8D0]" />
                        <span className="text-[#81D8D0]" style={{ fontWeight: 500 }}>
                          {nucleo.membros_count} {nucleo.membros_count === 1 ? "membro" : "membros"}
                        </span>
                      </div>
                    )}

                    {/* Encontros realizados */}
                    {nucleo.encontros_realizados > 0 && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-[#A855F7]" />
                        <span className="text-[#A855F7]" style={{ fontWeight: 500 }}>
                          {nucleo.encontros_realizados} {nucleo.encontros_realizados === 1 ? "encontro" : "encontros"}
                        </span>
                      </div>
                    )}

                    {nucleo.coordenador_nome ? (
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{nucleo.coordenador_nome}</span>
                      </div>
                    ) : nucleo.procurando_coordenador ? (
                      <div className="flex items-center gap-1">
                        <Search className="h-3 w-3 text-[#FF6B35]" />
                        <span className="text-[#FF6B35]/80" style={{ fontWeight: 500 }}>
                          Procurando coordenador
                        </span>
                      </div>
                    ) : null}

                    {nucleo.proximo_evento && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#FF6B35]/10 border border-[#FF6B35]/20 rounded-full">
                        <Calendar className="h-3 w-3 text-[#FF6B35]" />
                        <span className="text-[#FF6B35]" style={{ fontWeight: 600 }}>{nucleo.proximo_evento}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Regra de expansão */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="max-w-2xl mx-auto mt-12 bg-white border border-black/10 rounded-xl p-6 text-center shadow-sm"
        >
          <p className="text-[#666] text-sm mb-2">
            Subnúcleos por cidade só nascem com:
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-xs text-[#999]">
            <span className="px-3 py-1 bg-[#C8C8C8] rounded-full">
              40+ membros ativos
            </span>
            <span className="px-3 py-1 bg-[#C8C8C8] rounded-full">
              2+ encontros realizados
            </span>
            <span className="px-3 py-1 bg-[#C8C8C8] rounded-full">
              15+ interessados na cidade
            </span>
            <span className="px-3 py-1 bg-[#C8C8C8] rounded-full">
              Coordenador definido
            </span>
          </div>
          <p className="text-[#BBB] text-xs mt-3">
            Nada nasce vazio. Tudo nasce com intenção.
          </p>
        </motion.div>
      </div>
    </section>
  );
}