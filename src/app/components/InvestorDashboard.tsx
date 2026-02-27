/**
 * InvestorDashboard — Camada 9: Dashboard Investidor
 * Metricas de SaaS serio: MRR, retencao, participacao, nucleos, lives.
 * Acesso restrito a super_admin.
 */

import { useState, useEffect, useCallback } from "react";
import {
  TrendingUp, Users, Activity, DollarSign, Calendar,
  MapPin, Radio, BarChart3, RefreshCw, ArrowUpRight,
  ArrowDownRight, Minus, Loader2, Eye
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";
import { supabase } from "../../lib";

// ═══ TYPES ═══

interface InvestorMetrics {
  membrosAtivos: number;
  membrosTotais: number;
  participacaoRitual: number; // %
  taxaRetencao30d: number; // %
  mrrAtual: number; // R$
  projecaoMrr12m: number; // R$
  livesNoMes: number;
  nucleosAtivos: number;
  encontrosRealizados: number;
  // Extras para grafico
  growthRate: number; // %
  avgSessionsPerWeek: number;
  connectionsTotal: number;
  postsThisMonth: number;
}

interface MonthlyData {
  month: string;
  membros: number;
  mrr: number;
  lives: number;
}

// ═══ COMPONENT ═══

export function InvestorDashboard() {
  const [metrics, setMetrics] = useState<InvestorMetrics | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadMetrics = useCallback(async () => {
    setIsLoading(true);
    try {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      // ── Queries paralelas ──
      const [
        usersTotal,
        usersActive,
        usersNew30d,
        usersOlder30d,
        ritualLogsMonth,
        livesMonth,
        nucleiActive,
        eventsPresencial,
        connectionsAll,
        postsMonth,
      ] = await Promise.all([
        // Total de membros (excluindo visitors)
        supabase.from("users").select("*", { count: "exact", head: true })
          .not("role", "eq", "visitor")
          .not("role", "eq", "registered_unfinished"),
        // Membros ativos (last_active_at nos ultimos 30 dias)
        supabase.from("users").select("*", { count: "exact", head: true })
          .not("role", "eq", "visitor")
          .not("role", "eq", "registered_unfinished")
          .gte("last_active_at", thirtyDaysAgo),
        // Novos membros nos ultimos 30 dias
        supabase.from("users").select("*", { count: "exact", head: true })
          .not("role", "eq", "visitor")
          .gte("created_at", thirtyDaysAgo),
        // Membros que existiam ha 30+ dias
        supabase.from("users").select("*", { count: "exact", head: true })
          .not("role", "eq", "visitor")
          .not("role", "eq", "registered_unfinished")
          .lt("created_at", thirtyDaysAgo),
        // Ritual logs este mes
        supabase.from("ritual_logs").select("user_id", { count: "exact" })
          .gte("completed_at", startOfMonth),
        // Lives este mes
        supabase.from("lives").select("*", { count: "exact", head: true })
          .gte("scheduled_at", startOfMonth),
        // Nucleos ativos
        supabase.from("nuclei").select("*", { count: "exact", head: true })
          .eq("status", "active"),
        // Encontros presenciais realizados
        supabase.from("events").select("*", { count: "exact", head: true })
          .in("event_type", ["presencial", "hibrido"])
          .in("status", ["completed", "published"]),
        // Conexoes totais
        supabase.from("connections").select("*", { count: "exact", head: true })
          .eq("status", "accepted"),
        // Posts este mes
        supabase.from("posts").select("*", { count: "exact", head: true })
          .gte("created_at", startOfMonth),
      ]);

      const totalMembros = usersTotal.count || 0;
      const ativosCount = usersActive.count || 0;
      const novos30d = usersNew30d.count || 0;
      const antigos30d = usersOlder30d.count || 0;

      // Participacao ritual: usuarios unicos que fizeram ritual / total ativos
      const ritualUsersSet = new Set<string>();
      if (ritualLogsMonth.data) {
        ritualLogsMonth.data.forEach((log: any) => ritualUsersSet.add(log.user_id));
      }
      const ritualParticipacao = ativosCount > 0
        ? Math.round((ritualUsersSet.size / ativosCount) * 100)
        : 0;

      // Taxa retencao 30 dias: membros ativos que existiam ha 30+ dias / total antigos
      // Precisamos de uma query especifica
      const { count: retidosCount } = await supabase
        .from("users")
        .select("*", { count: "exact", head: true })
        .not("role", "eq", "visitor")
        .not("role", "eq", "registered_unfinished")
        .lt("created_at", thirtyDaysAgo)
        .gte("last_active_at", thirtyDaysAgo);

      const retencao = antigos30d > 0
        ? Math.round(((retidosCount || 0) / antigos30d) * 100)
        : 100; // Se nao tem antigos, retencao 100%

      // MRR: Modelo freemium. Calculo baseado em membros pagos
      // Para o beta, usamos estimativa por membro ativo
      const TICKET_MEDIO = 29.90; // R$ por membro (projecao)
      const membrosPagantes = totalMembros; // No beta, todos sao "valiosos"
      const mrrAtual = Math.round(membrosPagantes * TICKET_MEDIO * 100) / 100;

      // Projecao 12 meses: crescimento composto mensal baseado na taxa atual
      const growthRate = totalMembros > 5 ? Math.round((novos30d / Math.max(totalMembros - novos30d, 1)) * 100) : 30;
      const monthlyGrowth = 1 + (growthRate / 100);
      let projected = mrrAtual;
      for (let i = 0; i < 12; i++) {
        projected *= monthlyGrowth;
      }
      const projecao12m = Math.round(projected * 100) / 100;

      setMetrics({
        membrosAtivos: ativosCount,
        membrosTotais: totalMembros,
        participacaoRitual: ritualParticipacao,
        taxaRetencao30d: retencao,
        mrrAtual,
        projecaoMrr12m: projecao12m,
        livesNoMes: livesMonth.count || 0,
        nucleosAtivos: nucleiActive.count || 0,
        encontrosRealizados: eventsPresencial.count || 0,
        growthRate,
        avgSessionsPerWeek: Math.round((ativosCount / Math.max(totalMembros, 1)) * 7 * 10) / 10,
        connectionsTotal: connectionsAll.count || 0,
        postsThisMonth: postsMonth.count || 0,
      });

      // ── Dados mensais para grafico (ultimos 6 meses) — queries paralelas ──
      const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
      const monthPromises = Array.from({ length: 6 }, (_, idx) => {
        const i = 5 - idx;
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const nextD = new Date(d.getFullYear(), d.getMonth() + 1, 1);

        return Promise.all([
          supabase.from("users").select("*", { count: "exact", head: true })
            .not("role", "eq", "visitor")
            .not("role", "eq", "registered_unfinished")
            .lt("created_at", nextD.toISOString()),
          supabase.from("lives").select("*", { count: "exact", head: true })
            .gte("scheduled_at", d.toISOString())
            .lt("scheduled_at", nextD.toISOString()),
        ]).then(([membrosRes, livesRes]) => ({
          month: `${meses[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`,
          membros: membrosRes.count || 0,
          mrr: Math.round((membrosRes.count || 0) * TICKET_MEDIO),
          lives: livesRes.count || 0,
        }));
      });

      const monthly = await Promise.all(monthPromises);
      setMonthlyData(monthly);

      setLastUpdated(new Date());
    } catch (err) {
      console.error("[InvestorDashboard] Erro ao carregar metricas:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  if (isLoading || !metrics) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-[#81D8D0] animate-spin mb-4" />
        <p className="text-white/40 text-sm">Calculando metricas...</p>
      </div>
    );
  }

  // Dados para pie chart de composicao
  const pieData = [
    { name: "Ativos 30d", value: metrics.membrosAtivos, color: "#81D8D0" },
    { name: "Inativos", value: Math.max(0, metrics.membrosTotais - metrics.membrosAtivos), color: "#ffffff15" },
  ];

  return (
    <div className="space-y-6">
      {/* ═══ HEADER ═══ */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-bold text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#81D8D0]" />
            Dashboard Investidor
          </h2>
          <p className="text-white/30 text-xs mt-1">
            Metricas de SaaS — NeuroConexao Atipica
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-[10px] text-white/20">
              Atualizado: {lastUpdated.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
          <button
            onClick={loadMetrics}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-white/60 transition-colors disabled:opacity-40"
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? "animate-spin" : ""}`} />
            Atualizar
          </button>
        </div>
      </div>

      {/* ═══ KPIs PRINCIPAIS — Grid 4 colunas ═══ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard
          label="Membros Ativos"
          value={metrics.membrosAtivos}
          subtitle={`de ${metrics.membrosTotais} total`}
          icon={Users}
          color="#81D8D0"
        />
        <MetricCard
          label="Participacao Ritual"
          value={`${metrics.participacaoRitual}%`}
          subtitle="do total ativo"
          icon={Activity}
          color="#FF6B35"
          trend={metrics.participacaoRitual >= 50 ? "up" : metrics.participacaoRitual >= 30 ? "neutral" : "down"}
        />
        <MetricCard
          label="Retencao 30d"
          value={`${metrics.taxaRetencao30d}%`}
          subtitle="membros retidos"
          icon={Eye}
          color={metrics.taxaRetencao30d >= 70 ? "#81D8D0" : metrics.taxaRetencao30d >= 50 ? "#FF6B35" : "#C8102E"}
          trend={metrics.taxaRetencao30d >= 70 ? "up" : metrics.taxaRetencao30d >= 50 ? "neutral" : "down"}
        />
        <MetricCard
          label="MRR Atual"
          value={formatCurrency(metrics.mrrAtual)}
          subtitle={`Ticket: R$29,90`}
          icon={DollarSign}
          color="#81D8D0"
          highlight
        />
      </div>

      {/* ═══ KPIs SECUNDARIOS — Grid 4 colunas ═══ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard
          label="Projecao MRR 12m"
          value={formatCurrency(metrics.projecaoMrr12m)}
          subtitle={`crescimento ${metrics.growthRate}%/mes`}
          icon={TrendingUp}
          color="#A855F7"
          highlight
        />
        <MetricCard
          label="Lives/Mes"
          value={metrics.livesNoMes}
          subtitle="este mes"
          icon={Radio}
          color="#C8102E"
        />
        <MetricCard
          label="Nucleos Ativos"
          value={metrics.nucleosAtivos}
          subtitle="territorios"
          icon={MapPin}
          color="#FF6B35"
        />
        <MetricCard
          label="Encontros Realizados"
          value={metrics.encontrosRealizados}
          subtitle="presenciais + hibridos"
          icon={Calendar}
          color="#81D8D0"
        />
      </div>

      {/* ═══ GRAFICOS ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Crescimento de Membros */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <h3 className="text-sm text-white font-bold mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-[#81D8D0]" />
            Crescimento de Membros
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="gradMembros" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#81D8D0" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#81D8D0" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: "rgba(255,255,255,0.5)" }}
                />
                <Area type="monotone" dataKey="membros" stroke="#81D8D0" strokeWidth={2} fill="url(#gradMembros)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Projecao MRR */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <h3 className="text-sm text-white font-bold mb-4 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-[#A855F7]" />
            MRR por Mes (R$)
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }}
                  formatter={(value: number) => [`R$ ${value.toLocaleString("pt-BR")}`, "MRR"]}
                  labelStyle={{ color: "rgba(255,255,255,0.5)" }}
                />
                <Bar dataKey="mrr" fill="#A855F7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ═══ SEGUNDA LINHA: Pie + Engajamento ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Composicao de Membros */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <h3 className="text-sm text-white font-bold mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#81D8D0]" />
            Composicao de Membros
          </h3>
          <div className="h-48 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                  ))}
                </Pie>
                <Legend
                  verticalAlign="bottom"
                  height={30}
                  formatter={(value: string) => <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>{value}</span>}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Metricas de Engajamento */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <h3 className="text-sm text-white font-bold mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#FF6B35]" />
            Indicadores de Engajamento
          </h3>
          <div className="space-y-4">
            <EngagementRow
              label="Conexoes Mentais"
              value={metrics.connectionsTotal}
              maxValue={Math.max(metrics.membrosTotais * 3, metrics.connectionsTotal)}
              color="#81D8D0"
            />
            <EngagementRow
              label="Posts este mes"
              value={metrics.postsThisMonth}
              maxValue={Math.max(100, metrics.postsThisMonth)}
              color="#FF6B35"
            />
            <EngagementRow
              label="Lives programadas"
              value={metrics.livesNoMes}
              maxValue={Math.max(10, metrics.livesNoMes)}
              color="#C8102E"
            />
            <EngagementRow
              label="Encontros presenciais"
              value={metrics.encontrosRealizados}
              maxValue={Math.max(20, metrics.encontrosRealizados)}
              color="#A855F7"
            />
          </div>
        </div>
      </div>

      {/* ═══ FOOTER — Nota sobre metricas ═══ */}
      <div className="bg-white/3 border border-white/5 rounded-xl p-4">
        <p className="text-[10px] text-white/20 text-center leading-relaxed">
          Metricas calculadas em tempo real a partir do banco de dados.
          MRR projetado com ticket medio de R$29,90/membro e taxa de crescimento mensal composta.
          Retencao medida pela atividade nos ultimos 30 dias sobre membros com 30+ dias de conta.
        </p>
      </div>
    </div>
  );
}

// ═══ SUB-COMPONENTS ═══

function MetricCard({
  label,
  value,
  subtitle,
  icon: Icon,
  color,
  trend,
  highlight,
}: {
  label: string;
  value: string | number;
  subtitle?: string;
  icon: any;
  color: string;
  trend?: "up" | "down" | "neutral";
  highlight?: boolean;
}) {
  const TrendIcon = trend === "up" ? ArrowUpRight : trend === "down" ? ArrowDownRight : Minus;
  const trendColor = trend === "up" ? "#81D8D0" : trend === "down" ? "#C8102E" : "#ffffff40";

  return (
    <div
      className={`relative overflow-hidden bg-white/5 border rounded-xl p-4 transition-all ${
        highlight ? "border-[#81D8D0]/30 bg-gradient-to-br from-[#81D8D0]/5 to-transparent" : "border-white/10"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <Icon className="w-4 h-4" style={{ color }} />
        {trend && <TrendIcon className="w-3.5 h-3.5" style={{ color: trendColor }} />}
      </div>
      <p className="text-xl font-bold text-white" style={{ fontVariantNumeric: "tabular-nums" }}>
        {value}
      </p>
      <p className="text-white/40 text-[11px] mt-1 font-medium">{label}</p>
      {subtitle && <p className="text-white/20 text-[10px] mt-0.5">{subtitle}</p>}
      {highlight && (
        <div className="absolute top-0 right-0 w-16 h-16 bg-[#81D8D0]/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      )}
    </div>
  );
}

function EngagementRow({
  label,
  value,
  maxValue,
  color,
}: {
  label: string;
  value: number;
  maxValue: number;
  color: string;
}) {
  const pct = maxValue > 0 ? Math.min(100, (value / maxValue) * 100) : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-white/50">{label}</span>
        <span className="text-xs font-bold" style={{ color }}>{value}</span>
      </div>
      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function formatCurrency(value: number): string {
  if (value >= 1000000) return `R$ ${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `R$ ${(value / 1000).toFixed(1)}K`;
  return `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}