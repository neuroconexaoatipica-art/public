import { useState, useEffect, useCallback } from "react";
import {
  ArrowLeft, Users, Shield, Flag, Award, BarChart3, MessageSquare,
  AlertTriangle, CheckCircle, XCircle, Eye, Globe, Calendar, FileText,
  Link2, Settings, Megaphone, BookOpen, Sparkles, TrendingUp,
  UserPlus, UserMinus, Ban, Edit3, Trash2, Plus, RefreshCw,
  Copy, Check, ExternalLink, Search, ChevronDown, Activity, Zap,
  Heart, Star, Crown, Bell, UserCheck, Clock, ShieldAlert, Flame
} from "lucide-react";
import {
  supabase, useProfileContext, useSeats, isSuperAdmin,
  useModerationActions, ACTION_TYPE_LABELS, REPORT_TYPE_LABELS,
  BADGE_CONFIG, useCommunitiesContext, useInviteLinks, EVENT_TYPE_LABELS
} from "../../lib";
import type { ModerationActionType, ReportType, BadgeType, EventWithMeta, CommunityWithMeta } from "../../lib";
import { UserAvatar } from "./UserAvatar";
import { RituaisPanel } from "./RituaisPanel";
import { InboxPanel } from "./InboxPanel";
import { InvestorDashboard } from "./InvestorDashboard";

interface AdminDashboardProps {
  onBack: () => void;
  onNavigateToProfile?: (userId: string) => void;
}

type AdminTab = "overview" | "users" | "communities" | "events" | "content" | "reports" | "moderation" | "badges" | "invites" | "approvals" | "rituals" | "inbox" | "investor";

interface PlatformStats {
  totalUsers: number;
  totalPosts: number;
  totalComments: number;
  totalEvents: number;
  totalReports: number;
  pendingReports: number;
  criticalReports: number;
  activeConnections: number;
  totalCommunities: number;
  totalLives: number;
  totalMessages: number;
}

interface AdminUser {
  id: string;
  name: string;
  display_name: string;
  legal_name: string | null;
  role: string;
  profile_photo: string | null;
  created_at: string;
  last_active_at: string | null;
  is_public_profile: boolean;
  participation_score: number;
  bio: string | null;
  onboarding_done: boolean;
  leadership_onboarding_done: boolean;
}

interface AdminReport {
  id: string;
  reporter_id: string;
  reported_user_id: string | null;
  reported_content_id: string | null;
  reported_content_type: string | null;
  report_type: string;
  severity: string;
  description: string | null;
  status: string;
  created_at: string;
  reporter_name?: string;
  reported_user_name?: string;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: string;
  is_active: boolean;
  priority: number;
  created_at: string;
}

export function AdminDashboard({ onBack, onNavigateToProfile }: AdminDashboardProps) {
  const { user } = useProfileContext();
  const { seatsUsed, seatsTotal, realMax, realRemaining, refreshSeats } = useSeats();
  const { actions, isLoading: actionsLoading, logAction } = useModerationActions();
  const { communities } = useCommunitiesContext();
  const { links: inviteLinks, isLoading: invitesLoading, createInviteLink, deactivateLink, getInviteURL } = useInviteLinks();
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [events, setEvents] = useState<EventWithMeta[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingReports, setLoadingReports] = useState(false);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Security check
  if (!isSuperAdmin(user?.role)) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 text-[#C8102E] mx-auto mb-3" />
          <p className="text-white/60">Acesso restrito a super_admin.</p>
          <button onClick={onBack} className="mt-4 text-[#81D8D0] hover:underline text-sm">Voltar</button>
        </div>
      </div>
    );
  }

  // ═══ DATA LOADING ═══

  useEffect(() => {
    async function loadStats() {
      setLoadingStats(true);
      try {
        const [usersCount, postsCount, commentsCount, eventsCount, reportsAll, reportsPending, reportsCritical, connectionsCount, communitiesCount, livesCount, messagesCount] = await Promise.all([
          supabase.from("users").select("*", { count: "exact", head: true }),
          supabase.from("posts").select("*", { count: "exact", head: true }),
          supabase.from("comments").select("*", { count: "exact", head: true }),
          supabase.from("events").select("*", { count: "exact", head: true }),
          supabase.from("reports").select("*", { count: "exact", head: true }),
          supabase.from("reports").select("*", { count: "exact", head: true }).eq("status", "pending"),
          supabase.from("reports").select("*", { count: "exact", head: true }).eq("status", "pending").eq("severity", "critical"),
          supabase.from("connections").select("*", { count: "exact", head: true }).eq("status", "accepted"),
          supabase.from("communities").select("*", { count: "exact", head: true }),
          supabase.from("events").select("*", { count: "exact", head: true }).eq("event_type", "live"),
          supabase.from("private_messages").select("*", { count: "exact", head: true }),
        ]);
        setStats({
          totalUsers: usersCount.count || 0,
          totalPosts: postsCount.count || 0,
          totalComments: commentsCount.count || 0,
          totalEvents: eventsCount.count || 0,
          totalReports: reportsAll.count || 0,
          pendingReports: reportsPending.count || 0,
          criticalReports: reportsCritical.count || 0,
          activeConnections: connectionsCount.count || 0,
          totalCommunities: communitiesCount.count || 0,
          totalLives: livesCount.count || 0,
          totalMessages: messagesCount.count || 0,
        });
      } catch (err) {
        console.error("[Admin] Erro stats:", err);
      } finally {
        setLoadingStats(false);
      }
    }
    loadStats();
  }, []);

  const loadUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      let query = supabase
        .from("users")
        .select("id, name, display_name, legal_name, role, profile_photo, created_at, last_active_at, is_public_profile, participation_score, bio, onboarding_done, leadership_onboarding_done")
        .order("created_at", { ascending: false })
        .limit(200);
      if (roleFilter !== "all") query = query.eq("role", roleFilter);
      const { data, error } = await query;
      if (error) throw error;
      setUsers((data || []) as AdminUser[]);
    } catch (err) {
      console.error("[Admin] Erro users:", err);
    } finally {
      setLoadingUsers(false);
    }
  }, [roleFilter]);

  useEffect(() => { if (activeTab === "users") loadUsers(); }, [activeTab, loadUsers]);

  const loadReports = useCallback(async () => {
    setLoadingReports(true);
    try {
      const { data, error } = await supabase.from("reports").select("*").order("created_at", { ascending: false }).limit(50);
      if (error) throw error;
      const userIds = [...new Set((data || []).flatMap((r: any) => [r.reporter_id, r.reported_user_id].filter(Boolean)))];
      let usersMap: Record<string, string> = {};
      if (userIds.length > 0) {
        const { data: usersData } = await supabase.from("users").select("id, name").in("id", userIds);
        (usersData || []).forEach((u: any) => { usersMap[u.id] = u.name; });
      }
      setReports((data || []).map((r: any) => ({
        ...r,
        reporter_name: usersMap[r.reporter_id] || "Desconhecido",
        reported_user_name: r.reported_user_id ? (usersMap[r.reported_user_id] || "Desconhecido") : null,
      })));
    } catch (err) {
      console.error("[Admin] Erro reports:", err);
    } finally {
      setLoadingReports(false);
    }
  }, []);

  useEffect(() => { if (activeTab === "reports") loadReports(); }, [activeTab, loadReports]);

  const loadAnnouncements = useCallback(async () => {
    setLoadingAnnouncements(true);
    try {
      const { data, error } = await supabase.from("home_announcements").select("*").order("priority", { ascending: false }).limit(30);
      if (error) throw error;
      setAnnouncements((data || []) as Announcement[]);
    } catch (err) {
      console.error("[Admin] Erro announcements:", err);
    } finally {
      setLoadingAnnouncements(false);
    }
  }, []);

  useEffect(() => { if (activeTab === "content") loadAnnouncements(); }, [activeTab, loadAnnouncements]);

  const loadEvents = useCallback(async () => {
    setLoadingEvents(true);
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*, host:users!events_host_id_fkey(name, profile_photo)")
        .order("starts_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      setEvents((data || []).map((e: any) => ({
        ...e,
        host_name: e.host?.name || "Desconhecido",
        host_photo: e.host?.profile_photo || null,
        community_name: null,
        participant_count: 0,
        is_participating: false,
        my_status: null,
      })));
    } catch (err) {
      console.error("[Admin] Erro events:", err);
    } finally {
      setLoadingEvents(false);
    }
  }, []);

  useEffect(() => { if (activeTab === "events") loadEvents(); }, [activeTab, loadEvents]);

  // ═══ ACTIONS ═══

  const changeUserRole = async (userId: string, newRole: string) => {
    if (!confirm(`Mudar role para "${newRole}"?`)) return;
    try {
      await supabase.from("users").update({ role: newRole, access_released: newRole !== "visitor" }).eq("id", userId);
      await logAction({ targetUserId: userId, actionType: "warning", reason: `Role alterado para ${newRole} pela admin.` });
      await loadUsers();
      await refreshSeats();
    } catch (err) {
      console.error("[Admin] Erro ao mudar role:", err);
    }
  };

  const resetLeadershipOnboarding = async (userId: string, userName: string) => {
    if (!confirm(`Resetar onboarding de lideranca de "${userName}"? A pessoa precisara refazer o fluxo.`)) return;
    try {
      await supabase.from("users").update({ leadership_onboarding_done: false }).eq("id", userId);
      await logAction({ targetUserId: userId, actionType: "warning", reason: `Onboarding de lideranca resetado pela admin.` });
      await loadUsers();
    } catch (err) {
      console.error("[Admin] Erro ao resetar leadership onboarding:", err);
    }
  };

  const resolveReport = async (reportId: string, action: "resolved" | "dismissed") => {
    try {
      await supabase.from("reports").update({ status: action, resolved_at: new Date().toISOString() }).eq("id", reportId);
      const report = reports.find(r => r.id === reportId);
      if (report) {
        await logAction({ targetUserId: report.reported_user_id || undefined, actionType: action === "resolved" ? "report_resolved" : "report_dismissed", reason: `Denuncia ${action === "resolved" ? "resolvida" : "dispensada"}: ${report.report_type}` });
      }
      await loadReports();
    } catch (err) {
      console.error("[Admin] Erro ao resolver:", err);
    }
  };

  const toggleAnnouncement = async (id: string, isActive: boolean) => {
    try {
      await supabase.from("home_announcements").update({ is_active: !isActive }).eq("id", id);
      await loadAnnouncements();
    } catch (err) {
      console.error("[Admin] Erro toggle anuncio:", err);
    }
  };

  const deleteEvent = async (eventId: string) => {
    if (!confirm("Excluir este evento permanentemente?")) return;
    try {
      await supabase.from("events").delete().eq("id", eventId);
      await loadEvents();
    } catch (err) {
      console.error("[Admin] Erro ao excluir evento:", err);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredUsers = userSearch
    ? users.filter(u => u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.display_name?.toLowerCase().includes(userSearch.toLowerCase()))
    : users;

  // ═══ TABS ═══

  const tabs: { key: AdminTab; label: string; icon: any; badge?: number }[] = [
    { key: "overview", label: "Visao Geral", icon: BarChart3 },
    { key: "users", label: "Membros", icon: Users, badge: stats?.totalUsers },
    { key: "communities", label: "Comunidades", icon: Globe, badge: stats?.totalCommunities },
    { key: "events", label: "Eventos & Lives", icon: Calendar, badge: stats?.totalEvents },
    { key: "content", label: "CMS / Conteudo", icon: FileText },
    { key: "reports", label: "Denuncias", icon: Flag, badge: stats?.pendingReports },
    { key: "moderation", label: "Moderacao", icon: Shield },
    { key: "badges", label: "Badges", icon: Award },
    { key: "invites", label: "Convites", icon: Link2 },
    { key: "approvals", label: "Aprovacoes", icon: CheckCircle },
    { key: "rituals", label: "Rituais", icon: Flame },
    { key: "inbox", label: "Caixa de Entrada", icon: Bell },
    { key: "investor", label: "Investidor", icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* ═══ HEADER SOBERANO ═══ */}
      <header className="sticky top-0 z-40 bg-gradient-to-r from-[#1a1a2e] via-[#16213e] to-[#0f3460] border-b border-[#C8102E]/30 shadow-lg shadow-[#C8102E]/5">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={onBack} className="text-[#81D8D0] hover:text-white transition-colors p-1">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C8102E] to-[#C8102E]/60 flex items-center justify-center">
              <Crown className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg leading-tight">Painel Soberano</h1>
              <p className="text-[#81D8D0]/60 text-[10px] leading-tight">Controle total da plataforma</p>
            </div>
          </div>
          <span className="text-xs text-[#C8102E] bg-[#C8102E]/10 border border-[#C8102E]/30 px-2.5 py-1 rounded-full ml-2 font-bold">
            super_admin
          </span>
          <div className="ml-auto flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-white/60 text-xs">{seatsUsed}/{seatsTotal} vagas</p>
              <div className="w-20 h-1.5 bg-white/10 rounded-full mt-0.5 overflow-hidden">
                <div className="h-full bg-[#81D8D0] rounded-full" style={{ width: `${Math.min(100, (seatsUsed / seatsTotal) * 100)}%` }} />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* ═══ TABS com scroll horizontal ═══ */}
        <div className="flex gap-1 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-all rounded-t-lg ${
                activeTab === tab.key
                  ? "border-[#C8102E] text-[#C8102E] bg-[#C8102E]/5"
                  : "border-transparent text-white/40 hover:text-white/70 hover:bg-white/5"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  tab.key === "reports" && tab.badge > 0 ? "bg-[#C8102E] text-white" : "bg-white/10 text-white/50"
                }`}>{tab.badge}</span>
              )}
            </button>
          ))}
        </div>

        {/* ════════════════════════════════════════════════════════════
            TAB: VISAO GERAL
        ════════════════════════════════════════════════════════════ */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {loadingStats ? (
              <LoadingSpinner />
            ) : stats && (
              <>
                {/* ═══ ALERTA CRITICO — Protecao infantil / Pedofilia ═══ */}
                {stats.criticalReports > 0 && (
                  <div
                    className="bg-[#C8102E]/15 border-2 border-[#C8102E]/60 rounded-2xl p-5 flex items-center gap-4 cursor-pointer hover:bg-[#C8102E]/20 transition-colors animate-pulse"
                    onClick={() => setActiveTab("reports")}
                  >
                    <div className="w-12 h-12 rounded-xl bg-[#C8102E]/30 flex items-center justify-center flex-shrink-0">
                      <ShieldAlert className="w-6 h-6 text-[#C8102E]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-[#C8102E] font-bold text-sm uppercase tracking-wide">
                        🚨 {stats.criticalReports} denuncia{stats.criticalReports > 1 ? "s" : ""} critica{stats.criticalReports > 1 ? "s" : ""} pendente{stats.criticalReports > 1 ? "s" : ""}
                      </h3>
                      <p className="text-white/50 text-xs mt-0.5">
                        Protecao infantil ou outro incidente critico requer atencao imediata. Clique para revisar.
                      </p>
                    </div>
                    <Flag className="w-5 h-5 text-[#C8102E] flex-shrink-0" />
                  </div>
                )}

                {/* KPI Cards - 2 rows */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  <KPICard label="Membros" value={stats.totalUsers} icon={Users} color="#81D8D0" />
                  <KPICard label="Posts" value={stats.totalPosts} icon={MessageSquare} color="#81D8D0" />
                  <KPICard label="Comentarios" value={stats.totalComments} icon={MessageSquare} color="#81D8D0" />
                  <KPICard label="Comunidades" value={stats.totalCommunities} icon={Globe} color="#81D8D0" />
                  <KPICard label="Conexoes" value={stats.activeConnections} icon={Heart} color="#81D8D0" />
                  <KPICard label="Eventos" value={stats.totalEvents} icon={Calendar} color="#81D8D0" />
                  <KPICard label="Lives" value={stats.totalLives} icon={Zap} color="#C8102E" />
                  <KPICard label="Mensagens" value={stats.totalMessages} icon={MessageSquare} color="#81D8D0" />
                  <KPICard label="Denuncias Pendentes" value={stats.pendingReports} icon={AlertTriangle} color={stats.pendingReports > 0 ? "#C8102E" : "#81D8D0"} highlight={stats.pendingReports > 0} />
                  <KPICard label="Vagas" value={`${seatsUsed}/${seatsTotal}`} icon={UserPlus} color="#81D8D0" subtitle={`Real: ${realMax - realRemaining}/${realMax}`} />
                </div>

                {/* Quick Actions */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                  <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[#C8102E]" /> Acoes Rapidas
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <QuickAction label="Aprovacoes" icon={UserCheck} onClick={() => setActiveTab("approvals")} />
                    <QuickAction label="Gerenciar Membros" icon={Users} onClick={() => setActiveTab("users")} />
                    <QuickAction label="Ver Denuncias" icon={Flag} onClick={() => setActiveTab("reports")} badge={stats.pendingReports} />
                    <QuickAction label="Editar Conteudo" icon={FileText} onClick={() => setActiveTab("content")} />
                    <QuickAction label="Rituais" icon={Flame} onClick={() => setActiveTab("rituals")} />
                    <QuickAction label="Caixa de Entrada" icon={Bell} onClick={() => setActiveTab("inbox")} />
                    <QuickAction label="Dashboard Investidor" icon={TrendingUp} onClick={() => setActiveTab("investor")} />
                  </div>
                </div>

                {/* Ultimas acoes moderativas */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                  <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#C8102E]" /> Ultimas Acoes Moderativas
                  </h3>
                  {actionsLoading ? (
                    <p className="text-white/40 text-sm">Carregando...</p>
                  ) : actions.length === 0 ? (
                    <p className="text-white/40 text-sm">Nenhuma acao registrada.</p>
                  ) : (
                    <div className="space-y-2">
                      {actions.slice(0, 8).map((a) => (
                        <div key={a.id} className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-2.5 text-sm">
                          <div className="flex items-center gap-2">
                            <Shield className="w-3 h-3 text-[#C8102E]/60" />
                            <span className="text-white">{ACTION_TYPE_LABELS[a.action_type as ModerationActionType] || a.action_type}</span>
                            {a.target_user_name && <span className="text-white/40">→ {a.target_user_name}</span>}
                          </div>
                          <span className="text-white/30 text-xs">{new Date(a.created_at).toLocaleDateString("pt-BR")}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Membros recentes */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                  <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-[#81D8D0]" /> Ultimos Membros Cadastrados
                  </h3>
                  <RecentMembersWidget onNavigateToProfile={onNavigateToProfile} />
                </div>
              </>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════
            TAB: MEMBROS
        ════════════════════════════════════════════════════════════ */}
        {activeTab === "users" && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Buscar membro..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:border-[#81D8D0]/50 text-sm"
                />
              </div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none"
              >
                <option value="all">Todos os roles</option>
                <option value="super_admin">super_admin</option>
                <option value="moderator">moderator</option>
                <option value="founder_paid">founder_paid</option>
                <option value="member_paid">member_paid</option>
                <option value="member_free_legacy">member_free_legacy</option>
                <option value="registered_unfinished">registered_unfinished</option>
                <option value="visitor">visitor</option>
                <option value="banned">banned</option>
              </select>
              <button onClick={loadUsers} className="p-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
                <RefreshCw className="w-4 h-4 text-white/60" />
              </button>
            </div>

            {loadingUsers ? (
              <LoadingSpinner />
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <p className="text-white/40 text-xs">{filteredUsers.length} membro(s) encontrado(s)</p>
                  <div className="flex gap-2 text-xs">
                    {["super_admin", "moderator", "founder_paid", "member_paid", "member_free_legacy", "visitor"].map(r => {
                      const count = users.filter(u => u.role === r).length;
                      if (count === 0) return null;
                      return (
                        <span key={r} className="px-2 py-0.5 bg-white/5 rounded-full text-white/40">
                          {r.replace("_", " ")}: {count}
                        </span>
                      );
                    })}
                  </div>
                </div>
                <div className="space-y-2">
                  {filteredUsers.map((u) => (
                    <div key={u.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-3 hover:border-white/20 transition-colors">
                      <UserAvatar name={u.name} photoUrl={u.profile_photo} size="md" onClick={() => onNavigateToProfile?.(u.id)} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-white font-medium truncate cursor-pointer hover:text-[#81D8D0]" onClick={() => onNavigateToProfile?.(u.id)}>
                            {u.display_name || u.name}
                          </p>
                          {u.legal_name && (
                            <span className="text-[9px] px-1.5 py-0.5 bg-white/5 text-white/30 rounded" title="Nome legal (privado)">
                              {u.legal_name}
                            </span>
                          )}
                          {!u.onboarding_done && <span className="text-[9px] px-1.5 py-0.5 bg-amber-500/20 text-amber-400 rounded">Onboarding pendente</span>}
                          {(u.role === 'founder_paid' || u.role === 'moderator') && (
                            u.leadership_onboarding_done
                              ? <span className="text-[9px] px-1.5 py-0.5 bg-[#81D8D0]/20 text-[#81D8D0] rounded flex items-center gap-1">Lider ✓</span>
                              : <span className="text-[9px] px-1.5 py-0.5 bg-[#C8102E]/20 text-[#C8102E] rounded">Onboarding lider pendente</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-white/40 mt-0.5 flex-wrap">
                          <RoleBadge role={u.role} />
                          <span>Score: {u.participation_score}</span>
                          <span>Desde {new Date(u.created_at).toLocaleDateString("pt-BR")}</span>
                          {u.last_active_at && <span>Ativo: {new Date(u.last_active_at).toLocaleDateString("pt-BR")}</span>}
                        </div>
                        {u.bio && <p className="text-white/30 text-xs mt-1 truncate">{u.bio}</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => copyToClipboard(u.id, u.id)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors" title="Copiar ID">
                          {copiedId === u.id ? <Check className="w-3 h-3 text-[#81D8D0]" /> : <Copy className="w-3 h-3 text-white/30" />}
                        </button>
                        {(u.role === 'founder_paid' || u.role === 'moderator') && u.leadership_onboarding_done && (
                          <button
                            onClick={() => resetLeadershipOnboarding(u.id, u.display_name || u.name)}
                            className="p-1.5 hover:bg-[#C8102E]/20 rounded-lg transition-colors"
                            title="Resetar onboarding de lideranca"
                          >
                            <RefreshCw className="w-3 h-3 text-[#C8102E]/60 hover:text-[#C8102E]" />
                          </button>
                        )}
                        <select
                          value={u.role}
                          onChange={(e) => changeUserRole(u.id, e.target.value)}
                          className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none"
                        >
                          <option value="banned">banned</option>
                          <option value="visitor">visitor</option>
                          <option value="registered_unfinished">registered_unfinished</option>
                          <option value="member_free_legacy">member_free_legacy</option>
                          <option value="member_paid">member_paid</option>
                          <option value="founder_paid">founder_paid</option>
                          <option value="moderator">moderator</option>
                          <option value="super_admin">super_admin</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════
            TAB: COMUNIDADES
        ════════════════════════════════════════════════════════════ */}
        {activeTab === "communities" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-bold flex items-center gap-2">
                <Globe className="w-5 h-5 text-[#81D8D0]" /> {communities.length} Comunidades Ativas
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {communities.map((c) => (
                <div key={c.id} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-[#81D8D0]/30 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0" style={{ background: `${c.config?.color || '#81D8D0'}20` }}>
                      {c.config?.icon ? <c.config.icon className="w-5 h-5" style={{ color: c.config.color }} /> : <Globe className="w-5 h-5 text-[#81D8D0]" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold text-sm truncate">{c.name}</h3>
                      <p className="text-white/40 text-xs mt-0.5 line-clamp-2">{c.description}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-white/30">
                        <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {c.postCount || 0} posts</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] ${c.config?.category === "core" ? "bg-[#C8102E]/20 text-[#C8102E]" : c.config?.category === "neuro" ? "bg-[#81D8D0]/20 text-[#81D8D0]" : "bg-white/10 text-white/50"}`}>
                          {c.config?.category || "outro"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {communities.length === 0 && (
              <EmptyState icon={Globe} text="Nenhuma comunidade encontrada." />
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════
            TAB: EVENTOS & LIVES
        ════════════════════════════════════════════════════════════ */}
        {activeTab === "events" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-bold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#81D8D0]" /> Todos os Eventos
              </h2>
              <button onClick={loadEvents} className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors">
                <RefreshCw className="w-4 h-4 text-white/60" />
              </button>
            </div>
            {loadingEvents ? (
              <LoadingSpinner />
            ) : events.length === 0 ? (
              <EmptyState icon={Calendar} text="Nenhum evento registrado." />
            ) : (
              <div className="space-y-2">
                {events.map((e) => {
                  const isPast = new Date(e.starts_at) < new Date();
                  return (
                    <div key={e.id} className={`bg-white/5 border border-white/10 rounded-xl p-4 ${isPast ? "opacity-60" : ""}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                              e.event_type === "live" ? "bg-[#C8102E]/20 text-[#C8102E]" :
                              e.event_type === "workshop" ? "bg-[#81D8D0]/20 text-[#81D8D0]" :
                              "bg-purple-500/20 text-purple-400"
                            }`}>
                              {EVENT_TYPE_LABELS[e.event_type as keyof typeof EVENT_TYPE_LABELS] || e.event_type}
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                              e.status === "scheduled" ? "bg-[#81D8D0]/10 text-[#81D8D0]" :
                              e.status === "live_now" ? "bg-[#C8102E] text-white animate-pulse" :
                              "bg-white/10 text-white/40"
                            }`}>{e.status}</span>
                          </div>
                          <h3 className="text-white font-semibold text-sm">{e.title}</h3>
                          <p className="text-white/40 text-xs mt-0.5">{e.description?.slice(0, 100)}</p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-white/30">
                            <span>Host: {e.host_name}</span>
                            <span>{new Date(e.starts_at).toLocaleString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                          </div>
                        </div>
                        <button onClick={() => deleteEvent(e.id)} className="p-2 hover:bg-[#C8102E]/20 rounded-lg transition-colors" title="Excluir">
                          <Trash2 className="w-4 h-4 text-[#C8102E]/60 hover:text-[#C8102E]" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            TAB: CMS / CONTEUDO
        ════════════════════════════════════════════════════════════ */}
        {activeTab === "content" && (
          <div className="space-y-6">
            {/* Anuncios */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-bold flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-[#C8102E]" /> Anuncios (home_announcements)
                </h2>
                <button onClick={loadAnnouncements} className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors">
                  <RefreshCw className="w-4 h-4 text-white/60" />
                </button>
              </div>
              {loadingAnnouncements ? (
                <LoadingSpinner />
              ) : announcements.length === 0 ? (
                <EmptyState icon={Megaphone} text="Nenhum anuncio. Crie pelo Supabase Dashboard." />
              ) : (
                <div className="space-y-2">
                  {announcements.map(a => (
                    <div key={a.id} className={`bg-white/5 border rounded-xl p-4 ${a.is_active ? "border-[#81D8D0]/30" : "border-white/10 opacity-50"}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${a.is_active ? "bg-[#81D8D0]/20 text-[#81D8D0]" : "bg-white/10 text-white/40"}`}>
                              {a.is_active ? "ATIVO" : "INATIVO"}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 bg-white/10 text-white/40 rounded-full">{a.type}</span>
                            <span className="text-[10px] text-white/30">prioridade: {a.priority}</span>
                          </div>
                          <h3 className="text-white font-semibold text-sm">{a.title}</h3>
                          <p className="text-white/40 text-xs mt-0.5 line-clamp-2">{a.content}</p>
                        </div>
                        <button
                          onClick={() => toggleAnnouncement(a.id, a.is_active)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            a.is_active ? "bg-[#C8102E]/20 text-[#C8102E] hover:bg-[#C8102E]/30" : "bg-[#81D8D0]/20 text-[#81D8D0] hover:bg-[#81D8D0]/30"
                          }`}
                        >
                          {a.is_active ? "Desativar" : "Ativar"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* CMS Links */}
            <div>
              <h2 className="text-white font-bold flex items-center gap-2 mb-4">
                <BookOpen className="w-5 h-5 text-[#81D8D0]" /> Tabelas CMS (editar via Supabase)
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { table: "platform_copy", desc: "Textos da plataforma (landing, app, admin)", icon: FileText },
                  { table: "home_sections", desc: "Secoes da landing page", icon: Globe },
                  { table: "legal_pages", desc: "Politicas legais (privacidade, termos, etc.)", icon: Shield },
                  { table: "home_announcements", desc: "Anuncios no topo do hub", icon: Megaphone },
                ].map(item => (
                  <a
                    key={item.table}
                    href={`https://supabase.com/dashboard/project/ieieohtnaymykxiqnmlc/editor/${item.table}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-[#81D8D0]/30 transition-colors group block"
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5 text-[#81D8D0]" />
                      <div className="flex-1">
                        <p className="text-white font-semibold text-sm group-hover:text-[#81D8D0] transition-colors">{item.table}</p>
                        <p className="text-white/40 text-xs">{item.desc}</p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-white/20 group-hover:text-[#81D8D0] transition-colors" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════
            TAB: DENUNCIAS
        ════════════════════════════════════════════════════════════ */}
        {activeTab === "reports" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-bold flex items-center gap-2">
                <Flag className="w-5 h-5 text-[#C8102E]" /> Denuncias ({reports.length})
              </h2>
              <button onClick={loadReports} className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors">
                <RefreshCw className="w-4 h-4 text-white/60" />
              </button>
            </div>
            {loadingReports ? (
              <LoadingSpinner />
            ) : reports.length === 0 ? (
              <EmptyState icon={CheckCircle} text="Nenhuma denuncia registrada." color="#81D8D0" />
            ) : (
              <div className="space-y-3">
                {reports.map((r) => {
                  const reportConfig = REPORT_TYPE_LABELS[r.report_type as ReportType];
                  return (
                    <div key={r.id} className={`bg-white/5 border rounded-xl p-4 ${
                      r.severity === "critical" ? "border-[#C8102E]/50" : r.severity === "high" ? "border-amber-500/30" : "border-white/10"
                    }`}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{reportConfig?.icon || "📝"}</span>
                          <span className="text-white font-medium text-sm">{reportConfig?.label || r.report_type}</span>
                          <SeverityBadge severity={r.severity} />
                          <StatusBadge status={r.status} />
                        </div>
                        <span className="text-white/30 text-xs">{new Date(r.created_at).toLocaleDateString("pt-BR")}</span>
                      </div>
                      <div className="text-sm text-white/60 mb-2">
                        <span>Denunciante: <strong className="text-white/80">{r.reporter_name}</strong></span>
                        {r.reported_user_name && <span className="ml-3">Denunciado: <strong className="text-white/80">{r.reported_user_name}</strong></span>}
                      </div>
                      {r.description && <p className="text-white/50 text-sm mb-3">{r.description}</p>}
                      {r.status === "pending" && (
                        <div className="flex gap-2">
                          <button onClick={() => resolveReport(r.id, "resolved")} className="flex items-center gap-1 px-3 py-1.5 bg-[#C8102E] text-white rounded-lg text-xs font-medium hover:bg-[#C8102E]/80">
                            <CheckCircle className="w-3 h-3" /> Resolver
                          </button>
                          <button onClick={() => resolveReport(r.id, "dismissed")} className="flex items-center gap-1 px-3 py-1.5 bg-white/10 text-white/60 rounded-lg text-xs font-medium hover:bg-white/20">
                            <XCircle className="w-3 h-3" /> Dispensar
                          </button>
                          {r.reported_user_id && (
                            <button onClick={() => onNavigateToProfile?.(r.reported_user_id!)} className="flex items-center gap-1 px-3 py-1.5 bg-white/5 text-[#81D8D0] rounded-lg text-xs font-medium hover:bg-white/10">
                              <Eye className="w-3 h-3" /> Ver perfil
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════
            TAB: MODERACAO
        ════════════════════════════════════════════════════════════ */}
        {activeTab === "moderation" && (
          <div className="space-y-3">
            <h2 className="text-white font-bold flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-[#C8102E]" /> Log de Moderacao ({actions.length} acoes)
            </h2>
            {actionsLoading ? (
              <LoadingSpinner />
            ) : actions.length === 0 ? (
              <EmptyState icon={Shield} text="Nenhuma acao moderativa registrada." />
            ) : (
              actions.map((a) => (
                <div key={a.id} className={`bg-white/5 border border-white/10 rounded-xl p-4 ${a.reversed_at ? "opacity-50" : ""}`}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-[#C8102E]" />
                      <span className="text-white font-medium text-sm">{ACTION_TYPE_LABELS[a.action_type as ModerationActionType] || a.action_type}</span>
                      {a.reversed_at && <span className="text-xs bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded">Revertido</span>}
                    </div>
                    <span className="text-white/30 text-xs">{new Date(a.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  <p className="text-white/60 text-sm">{a.reason}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-white/30">
                    <span>Moderador: {a.moderator_name}</span>
                    {a.target_user_name && <span>Alvo: {a.target_user_name}</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════
            TAB: BADGES
        ════════════════════════════════════════════════════════════ */}
        {activeTab === "badges" && (
          <div className="space-y-4">
            <h2 className="text-white font-bold flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-[#81D8D0]" /> Sistema de Badges
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(BADGE_CONFIG).map(([key, badge]) => (
                <div key={key} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-[#81D8D0]/30 transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{badge.icon}</span>
                    <div>
                      <h3 className="text-white font-semibold text-sm">{badge.label}</h3>
                      <p className="text-white/30 text-[10px] uppercase tracking-wider">{key}</p>
                    </div>
                  </div>
                  <p className="text-white/50 text-xs">{badge.description}</p>
                </div>
              ))}
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-white/40 text-xs">
                Badges sao concedidos automaticamente pelo sistema baseado em atividade.
                Para gerenciar badges manualmente, use a tabela <code className="text-[#81D8D0]">user_badges</code> no{" "}
                <a href="https://supabase.com/dashboard/project/ieieohtnaymykxiqnmlc/editor/user_badges" target="_blank" rel="noopener noreferrer" className="text-[#81D8D0] hover:underline">
                  Supabase Dashboard
                </a>.
              </p>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════
            TAB: CONVITES
        ════════════════════════════════════════════════════════════ */}
        {activeTab === "invites" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-bold flex items-center gap-2">
                <Link2 className="w-5 h-5 text-[#81D8D0]" /> Links de Convite
              </h2>
              <button
                onClick={() => createInviteLink(5)}
                className="flex items-center gap-2 px-4 py-2 bg-[#81D8D0] text-black rounded-xl text-xs font-bold hover:bg-[#81D8D0]/90 transition-colors"
              >
                <Plus className="w-4 h-4" /> Criar Convite
              </button>
            </div>
            {invitesLoading ? (
              <LoadingSpinner />
            ) : inviteLinks.length === 0 ? (
              <EmptyState icon={Link2} text="Nenhum convite criado ainda." />
            ) : (
              <div className="space-y-2">
                {inviteLinks.map(link => (
                  <div key={link.id} className={`bg-white/5 border rounded-xl p-4 ${link.is_active ? "border-[#81D8D0]/30" : "border-white/10 opacity-50"}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <code className="text-[#81D8D0] text-sm font-mono">{link.code}</code>
                          <button onClick={() => copyToClipboard(link.code, link.id)} className="p-1 hover:bg-white/10 rounded transition-colors">
                            {copiedId === link.id ? <Check className="w-3 h-3 text-[#81D8D0]" /> : <Copy className="w-3 h-3 text-white/30" />}
                          </button>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${link.is_active ? "bg-[#81D8D0]/20 text-[#81D8D0]" : "bg-white/10 text-white/40"}`}>
                            {link.is_active ? "ATIVO" : "INATIVO"}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-white/40">
                          <span>Usos: {link.uses_count}/{link.max_uses}</span>
                          <span>Criado: {new Date(link.created_at).toLocaleDateString("pt-BR")}</span>
                          {link.expires_at && <span>Expira: {new Date(link.expires_at).toLocaleDateString("pt-BR")}</span>}
                        </div>
                      </div>
                      <button
                        onClick={() => deactivateLink(link.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          link.is_active ? "bg-[#C8102E]/20 text-[#C8102E] hover:bg-[#C8102E]/30" : "bg-[#81D8D0]/20 text-[#81D8D0] hover:bg-[#81D8D0]/30"
                        }`}
                      >
                        {link.is_active ? "Desativar" : "Desativado"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════
            TAB: APROVACOES — Fase 5
            Dois painéis: (1) Novos cadastros (registered_unfinished)
                          (2) Pedidos de entrada em comunidades (community_members)
        ════════════════════════════════════════════════════════════ */}
        {activeTab === "approvals" && (
          <ApprovalsPanel
            onNavigateToProfile={onNavigateToProfile}
            logAction={logAction}
            refreshSeats={refreshSeats}
            communities={communities}
          />
        )}

        {/* ════════════════════════════════════════════════════════════
            TAB: RITUAIS — Fase 2: CRUD de Desafios Diarios
        ════════════════════════════════════════════════════════════ */}
        {activeTab === "rituals" && (
          <RituaisPanel />
        )}

        {/* ════════════════════════════════════════════════════════════
            TAB: CAIXA DE ENTRADA — contact_requests
        ════════════════════════════════════════════════════════════ */}
        {activeTab === "inbox" && (
          <InboxPanel />
        )}

        {/* ════════════════════════════════════════════════════════════
            TAB: DASHBOARD INVESTIDOR — Camada 9
        ════════════════════════════════════════════════════════════ */}
        {activeTab === "investor" && (
          <InvestorDashboard />
        )}
      </div>
    </div>
  );
}

// ═══ SUBCOMPONENTS ═══

function KPICard({ label, value, icon: Icon, color, subtitle, highlight }: { label: string; value: number | string; icon: any; color: string; subtitle?: string; highlight?: boolean }) {
  return (
    <div className={`bg-white/5 border rounded-xl p-4 transition-all ${highlight ? "border-[#C8102E]/50 bg-[#C8102E]/5" : "border-white/10"}`}>
      <div className="flex items-center justify-between mb-2">
        <Icon className="w-4 h-4" style={{ color }} />
        {highlight && <span className="w-2 h-2 rounded-full bg-[#C8102E] animate-pulse" />}
      </div>
      <p className="text-2xl font-bold" style={{ color }}>{value}</p>
      <p className="text-white/40 text-xs mt-1">{label}</p>
      {subtitle && <p className="text-white/25 text-[10px] mt-0.5">{subtitle}</p>}
    </div>
  );
}

function QuickAction({ label, icon: Icon, onClick, badge }: { label: string; icon: any; onClick: () => void; badge?: number }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-xl hover:border-[#81D8D0]/30 hover:bg-white/8 transition-all text-left"
    >
      <Icon className="w-4 h-4 text-[#81D8D0]" />
      <span className="text-white text-xs font-medium">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-[#C8102E] text-white font-bold">{badge}</span>
      )}
    </button>
  );
}

function RoleBadge({ role }: { role: string }) {
  const colors: Record<string, string> = {
    super_admin: "bg-[#C8102E]/20 text-[#C8102E]",
    moderator: "bg-purple-500/20 text-purple-400",
    founder_paid: "bg-amber-500/20 text-amber-400",
    member_paid: "bg-[#81D8D0]/20 text-[#81D8D0]",
    member_free_legacy: "bg-blue-500/20 text-blue-400",
    visitor: "bg-white/10 text-white/40",
    banned: "bg-red-500/20 text-red-400",
  };
  return <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${colors[role] || "bg-white/10 text-white/50"}`}>{role}</span>;
}

function SeverityBadge({ severity }: { severity: string }) {
  const cls = severity === "critical" ? "bg-[#C8102E]/20 text-[#C8102E]" : severity === "high" ? "bg-amber-500/20 text-amber-400" : "bg-white/10 text-white/50";
  return <span className={`text-xs px-1.5 py-0.5 rounded ${cls}`}>{severity}</span>;
}

function StatusBadge({ status }: { status: string }) {
  const cls = status === "pending" ? "bg-amber-500/20 text-amber-400" : status === "resolved" ? "bg-green-500/20 text-green-400" : "bg-white/10 text-white/40";
  return <span className={`text-xs px-1.5 py-0.5 rounded ${cls}`}>{status}</span>;
}

function LoadingSpinner() {
  return (
    <div className="flex justify-center py-12">
      <div className="w-8 h-8 border-2 border-[#C8102E] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function EmptyState({ icon: Icon, text, color = "#fff" }: { icon: any; text: string; color?: string }) {
  return (
    <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10">
      <Icon className="w-10 h-10 mx-auto mb-3 opacity-30" style={{ color }} />
      <p className="text-white/60 text-sm">{text}</p>
    </div>
  );
}

function RecentMembersWidget({ onNavigateToProfile }: { onNavigateToProfile?: (id: string) => void }) {
  const [recent, setRecent] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const { data } = await supabase.from("users").select("id, name, display_name, legal_name, role, profile_photo, created_at, last_active_at, is_public_profile, participation_score, bio, onboarding_done, leadership_onboarding_done").order("created_at", { ascending: false }).limit(5);
        setRecent((data || []) as AdminUser[]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <p className="text-white/40 text-sm">Carregando...</p>;

  return (
    <div className="space-y-2">
      {recent.map(u => (
        <div key={u.id} className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-2.5">
          <UserAvatar name={u.name} photoUrl={u.profile_photo} size="sm" onClick={() => onNavigateToProfile?.(u.id)} />
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate cursor-pointer hover:text-[#81D8D0]" onClick={() => onNavigateToProfile?.(u.id)}>{u.name}</p>
            <div className="flex items-center gap-2">
              <RoleBadge role={u.role} />
              <span className="text-white/30 text-xs">{new Date(u.created_at).toLocaleDateString("pt-BR")}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// APPROVALS PANEL — Fase 5: Central de Aprovações
// ═══════════════════════════════════════════════════════════════════

interface CommunityMemberRequest {
  id: string;
  community_id: string;
  user_id: string;
  status: string;
  request_message: string | null;
  created_at: string;
  user_name?: string;
  user_photo?: string | null;
  community_name?: string;
}

function ApprovalsPanel({
  onNavigateToProfile,
  logAction,
  refreshSeats,
  communities,
}: {
  onNavigateToProfile?: (userId: string) => void;
  logAction: (params: { targetUserId?: string; actionType: string; reason: string }) => Promise<void>;
  refreshSeats: () => Promise<void>;
  communities: CommunityWithMeta[];
}) {
  const [pendingUsers, setPendingUsers] = useState<AdminUser[]>([]);
  const [communityRequests, setCommunityRequests] = useState<CommunityMemberRequest[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingCommunity, setLoadingCommunity] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadPendingUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const { data, error } = await supabase
        .from("users")
        .select("id, name, display_name, legal_name, role, profile_photo, created_at, last_active_at, is_public_profile, participation_score, bio, onboarding_done, leadership_onboarding_done")
        .eq("role", "registered_unfinished")
        .order("created_at", { ascending: true });
      if (error) throw error;
      setPendingUsers((data || []) as AdminUser[]);
    } catch (err) {
      console.error("[Approvals] Erro ao carregar usuarios pendentes:", err);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  const loadCommunityRequests = useCallback(async () => {
    setLoadingCommunity(true);
    try {
      const { data, error } = await supabase
        .from("community_members")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: true });

      if (error) {
        if (error.code === "42P01" || error.message?.includes("does not exist") || error.message?.includes("relation")) {
          console.info("[Approvals] Tabela community_members ainda nao existe.");
        } else {
          throw error;
        }
        setCommunityRequests([]);
      } else {
        const requests = data || [];
        if (requests.length > 0) {
          const userIds = [...new Set(requests.map((r: any) => r.user_id))];
          const { data: usersData } = await supabase.from("users").select("id, name, profile_photo").in("id", userIds);
          const usersMap: Record<string, { name: string; photo: string | null }> = {};
          (usersData || []).forEach((u: any) => { usersMap[u.id] = { name: u.name, photo: u.profile_photo }; });
          const commMap: Record<string, string> = {};
          communities.forEach(c => { commMap[c.id] = c.name; });
          setCommunityRequests(requests.map((r: any) => ({
            ...r,
            user_name: usersMap[r.user_id]?.name || "Desconhecido",
            user_photo: usersMap[r.user_id]?.photo || null,
            community_name: commMap[r.community_id] || r.community_id,
          })));
        } else {
          setCommunityRequests([]);
        }
      }
    } catch (err) {
      console.error("[Approvals] Erro ao carregar pedidos:", err);
      setCommunityRequests([]);
    } finally {
      setLoadingCommunity(false);
    }
  }, [communities]);

  useEffect(() => { loadPendingUsers(); }, [loadPendingUsers]);
  useEffect(() => { loadCommunityRequests(); }, [loadCommunityRequests]);

  const approveUser = async (userId: string) => {
    setProcessingId(userId);
    try {
      await supabase.from("users").update({ role: "member_free_legacy", access_released: true }).eq("id", userId);
      await logAction({ targetUserId: userId, actionType: "warning", reason: "Cadastro aprovado. Role: member_free_legacy." });
      await refreshSeats();
      await loadPendingUsers();
    } catch (err) { console.error("[Approvals] Erro ao aprovar:", err); }
    finally { setProcessingId(null); }
  };

  const rejectUser = async (userId: string) => {
    if (!confirm("Rejeitar este cadastro?")) return;
    setProcessingId(userId);
    try {
      await supabase.from("users").update({ role: "visitor", access_released: false }).eq("id", userId);
      await logAction({ targetUserId: userId, actionType: "warning", reason: "Cadastro rejeitado. Role: visitor." });
      await loadPendingUsers();
    } catch (err) { console.error("[Approvals] Erro ao rejeitar:", err); }
    finally { setProcessingId(null); }
  };

  const approveCommunityMember = async (reqId: string, userId: string, commName: string) => {
    setProcessingId(reqId);
    try {
      await supabase.from("community_members").update({ status: "approved" }).eq("id", reqId);
      await logAction({ targetUserId: userId, actionType: "warning", reason: `Entrada aprovada: "${commName}".` });
      await loadCommunityRequests();
    } catch (err) { console.error("[Approvals] Erro:", err); }
    finally { setProcessingId(null); }
  };

  const rejectCommunityMember = async (reqId: string, userId: string, commName: string) => {
    setProcessingId(reqId);
    try {
      await supabase.from("community_members").update({ status: "rejected" }).eq("id", reqId);
      await logAction({ targetUserId: userId, actionType: "warning", reason: `Entrada rejeitada: "${commName}".` });
      await loadCommunityRequests();
    } catch (err) { console.error("[Approvals] Erro:", err); }
    finally { setProcessingId(null); }
  };

  return (
    <div className="space-y-8">
      {/* PAINEL 1: Novos Cadastros */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-bold flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-[#81D8D0]" /> Novos Cadastros Pendentes
            {pendingUsers.length > 0 && <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#C8102E] text-white font-bold animate-pulse">{pendingUsers.length}</span>}
          </h2>
          <button onClick={loadPendingUsers} className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors">
            <RefreshCw className="w-4 h-4 text-white/60" />
          </button>
        </div>
        <p className="text-white/30 text-xs mb-4">
          Usuarios com role <code className="text-amber-400">registered_unfinished</code> — na Sala de Espera.
        </p>
        {loadingUsers ? <LoadingSpinner /> : pendingUsers.length === 0 ? (
          <EmptyState icon={CheckCircle} text="Nenhum cadastro pendente." color="#81D8D0" />
        ) : (
          <div className="space-y-3">
            {pendingUsers.map((u) => (
              <div key={u.id} className="bg-white/5 border border-amber-500/30 rounded-xl p-4 flex items-center gap-3">
                <UserAvatar name={u.name} photoUrl={u.profile_photo} size="md" onClick={() => onNavigateToProfile?.(u.id)} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-white font-medium truncate cursor-pointer hover:text-[#81D8D0]" onClick={() => onNavigateToProfile?.(u.id)}>{u.display_name || u.name}</p>
                    <span className="text-[9px] px-1.5 py-0.5 bg-amber-500/20 text-amber-400 rounded font-bold">AGUARDANDO</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/40 mt-0.5">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(u.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  {u.bio && <p className="text-white/30 text-xs mt-1 truncate">{u.bio}</p>}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => approveUser(u.id)} disabled={processingId === u.id} className="flex items-center gap-1 px-4 py-2 bg-[#81D8D0] text-black rounded-lg text-xs font-bold hover:bg-[#81D8D0]/90 disabled:opacity-50 transition-colors">
                    <CheckCircle className="w-3.5 h-3.5" /> Aprovar
                  </button>
                  <button onClick={() => rejectUser(u.id)} disabled={processingId === u.id} className="flex items-center gap-1 px-4 py-2 bg-[#C8102E]/20 text-[#C8102E] rounded-lg text-xs font-bold hover:bg-[#C8102E]/30 disabled:opacity-50 transition-colors">
                    <XCircle className="w-3.5 h-3.5" /> Rejeitar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PAINEL 2: Pedidos em Comunidades */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-bold flex items-center gap-2">
            <Globe className="w-5 h-5 text-[#81D8D0]" /> Pedidos de Entrada em Comunidades
            {communityRequests.length > 0 && <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500 text-black font-bold">{communityRequests.length}</span>}
          </h2>
          <button onClick={loadCommunityRequests} className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors">
            <RefreshCw className="w-4 h-4 text-white/60" />
          </button>
        </div>
        <p className="text-white/30 text-xs mb-4">
          Pedidos para comunidades com <code className="text-amber-400">requires_approval</code>. Requer tabela <code className="text-[#81D8D0]">community_members</code>.
        </p>
        {loadingCommunity ? <LoadingSpinner /> : communityRequests.length === 0 ? (
          <EmptyState icon={Globe} text="Nenhum pedido de entrada pendente." color="#81D8D0" />
        ) : (
          <div className="space-y-3">
            {communityRequests.map((req) => (
              <div key={req.id} className="bg-white/5 border border-[#81D8D0]/20 rounded-xl p-4 flex items-center gap-3">
                <UserAvatar name={req.user_name || "?"} photoUrl={req.user_photo} size="md" onClick={() => onNavigateToProfile?.(req.user_id)} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-white font-medium truncate cursor-pointer hover:text-[#81D8D0]" onClick={() => onNavigateToProfile?.(req.user_id)}>{req.user_name}</p>
                    <span className="text-[9px] px-1.5 py-0.5 bg-[#81D8D0]/20 text-[#81D8D0] rounded font-bold">{req.community_name}</span>
                  </div>
                  {req.request_message && <p className="text-white/50 text-xs mt-1 italic">"{req.request_message}"</p>}
                  <div className="flex items-center gap-2 text-xs text-white/30 mt-0.5">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(req.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => approveCommunityMember(req.id, req.user_id, req.community_name || "")} disabled={processingId === req.id} className="flex items-center gap-1 px-4 py-2 bg-[#81D8D0] text-black rounded-lg text-xs font-bold hover:bg-[#81D8D0]/90 disabled:opacity-50 transition-colors">
                    <CheckCircle className="w-3.5 h-3.5" /> Aprovar
                  </button>
                  <button onClick={() => rejectCommunityMember(req.id, req.user_id, req.community_name || "")} disabled={processingId === req.id} className="flex items-center gap-1 px-4 py-2 bg-[#C8102E]/20 text-[#C8102E] rounded-lg text-xs font-bold hover:bg-[#C8102E]/30 disabled:opacity-50 transition-colors">
                    <XCircle className="w-3.5 h-3.5" /> Rejeitar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}