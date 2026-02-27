import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft, MessageCircle, BookOpen, Video, Flame, Lock,
  MessageSquare, PlusCircle, Image, Camera, Sparkles, Users,
  Mail, CalendarPlus, AlertTriangle, X, Loader2, Check,
  Heart, ExternalLink, ShieldCheck, Send, Radio, Calendar,
  Mic, Lightbulb
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useProfileContext, hasAppAccess, hasModAccess, isSuperAdmin, usePosts } from "../../lib";
import { useEvents } from "../../lib/useEvents";
import { useChat } from "../../lib/useChat";
import type { EventWithMeta } from "../../lib/useEvents";
import type { CommunityWithMeta } from "../../lib";
import { MILA_UUID, MILA_ACTIVE_COMMUNITIES, COMMUNITY_RITUAL_TYPES } from "../../lib/communitiesConfig";
import { PostCard } from "./PostCard";
import { CreatePostModal } from "./CreatePostModal";
import { UserAvatar } from "./UserAvatar";
import { MembershipGate } from "./MembershipGate";
import { FounderPanel } from "./FounderPanel";
import { CommunityNarratives } from "./CommunityNarratives";

interface CommunityPageProps {
  community: CommunityWithMeta;
  onBack: () => void;
  onNavigateToProfile: (userId: string) => void;
}

type Tab = "mural" | "forum" | "manifesto" | "lives" | "eventos" | "rituais" | "chat";

// Rituais agora vem da config centralizada (communitiesConfig.ts)
const RITUAIS = COMMUNITY_RITUAL_TYPES;

function formatEventDate(isoDate: string) {
  const d = new Date(isoDate);
  const dia = d.getDate().toString().padStart(2, "0");
  const meses = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
  const hora = `${d.getHours()}h${d.getMinutes().toString().padStart(2, "0")}`;
  return { dia, mesLabel: meses[d.getMonth()], hora };
}

export function CommunityPage({ community, onBack, onNavigateToProfile }: CommunityPageProps) {
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("mural");
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [formData, setFormData] = useState({ nome: "", email: "", mensagem: "", tema: "", horario: "" });
  const [formSent, setFormSent] = useState<Record<string, boolean>>({});
  const [formLoading, setFormLoading] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [sendingChat, setSendingChat] = useState(false);
  const [showNarratives, setShowNarratives] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const { user } = useProfileContext();
  const canPost = hasAppAccess(user?.role);
  const canModerate = hasModAccess(user?.role);
  const isAdmin = isSuperAdmin(user?.role);

  const isRealCommunity = !community.id.startsWith("pending-") && !community.id.startsWith("local-");

  // ═══ DETECTAR SE É COMUNIDADE ATIVA DA MILA ═══
  const isMilaActive = MILA_ACTIVE_COMMUNITIES.includes(community.name);
  const effectiveOwnerId = isMilaActive ? (community.owner_id || MILA_UUID) : community.owner_id;

  // ═══ MODERADOR INFO ═══
  const [ownerData, setOwnerData] = useState<{ name: string; photo: string | null } | null>(null);

  useEffect(() => {
    if (!effectiveOwnerId) return;
    supabase
      .from("users")
      .select("name, profile_photo")
      .eq("id", effectiveOwnerId)
      .single()
      .then(({ data }) => {
        if (data) setOwnerData({ name: data.name, photo: data.profile_photo });
      });
  }, [effectiveOwnerId]);

  // ═══ MANIFESTO ═══
  const manifesto = community.manifesto_text && community.manifesto_text.trim().length > 0
    ? community.manifesto_text
    : community.description;

  // ═══ POSTS DO MURAL ═══
  const { posts, isLoading, isLoadingMore, hasMore, loadMore, refreshPosts } = usePosts(
    isRealCommunity ? { communityId: community.id } : {}
  );
  const sortedPosts = [...posts].sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  // ═══ LIVES & EVENTOS DO SUPABASE ═══
  const { events: communityEvents, isLoading: eventsLoading, joinEvent, leaveEvent } = useEvents(
    isRealCommunity ? { communityId: community.id, upcoming: true } : {}
  );
  const lives = communityEvents.filter(e => e.event_type === "live");
  const eventos = communityEvents.filter(e => e.event_type !== "live");

  // ═══ CHAT EM GRUPO ═══
  const { messages: chatMessages, isLoading: chatLoading, sendMessage } = useChat(
    isRealCommunity ? community.id : null
  );

  useEffect(() => {
    if (activeTab === "chat") {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, activeTab]);

  const handleSendChat = async () => {
    if (!chatInput.trim() || sendingChat) return;
    setSendingChat(true);
    await sendMessage(chatInput.trim());
    setChatInput("");
    setSendingChat(false);
  };

  const IconComponent = community.config.icon;

  // ═══ TOGGLE INTERESSE EM LIVE/EVENTO ═══
  const handleToggleEventInterest = async (event: EventWithMeta) => {
    if (!user) return;
    try {
      if (event.is_participating) {
        await leaveEvent(event.id);
      } else {
        await joinEvent(event.id, "interested");
      }
    } catch (err) {
      console.error("[CommunityPage] Erro ao participar:", err);
    }
  };

  // ═══ FORM SUBMIT ═══
  const handleFormSubmit = async (tipo: string) => {
    setFormLoading(true);
    try {
      const fullMessage = [
        `[${tipo.toUpperCase()}]`,
        `Comunidade: ${community.name}`,
        formData.nome ? `Nome: ${formData.nome}` : null,
        formData.email ? `Email: ${formData.email}` : null,
        formData.tema ? `Tema: ${formData.tema}` : null,
        formData.horario ? `Horario sugerido: ${formData.horario}` : null,
        formData.mensagem ? `\n${formData.mensagem}` : null,
      ].filter(Boolean).join(" | ");

      await supabase.from("contact_requests").insert({
        user_id: user?.id || null,
        reason: tipo === "denuncia" ? "other" : tipo === "live_application" ? "other" : tipo === "evento_sugestao" ? "other" : tipo === "tema_live" ? "other" : "feedback",
        message: fullMessage,
        status: "pending",
      });
    } catch (err) {
      console.error("[CommunityPage] Erro ao enviar formulario:", err);
    } finally {
      setFormLoading(false);
      setFormSent(prev => ({ ...prev, [tipo]: true }));
      setFormData({ nome: "", email: "", mensagem: "", tema: "", horario: "" });
      setTimeout(() => setActiveModal(null), 1500);
    }
  };

  // ═══ ACESSO: só membros aceitos ═══
  const isLoggedIn = !!user;
  const hasMemberAccess = isLoggedIn && canPost;

  const inputClass = "w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-white/30 focus:border-[#81D8D0]/50 focus:outline-none";

  const tabs: { key: Tab; label: string; icon: typeof MessageCircle }[] = [
    { key: "mural", label: "Mural", icon: MessageCircle },
    { key: "forum", label: "Fórum", icon: MessageSquare },
    { key: "manifesto", label: "Manifesto", icon: BookOpen },
    { key: "lives", label: "Lives", icon: Radio },
    { key: "eventos", label: "Eventos", icon: Calendar },
    { key: "rituais", label: "Rituais", icon: Flame },
    { key: "chat", label: "Chat", icon: MessageSquare },
  ];

  return (
    <MembershipGate
      communityId={isRealCommunity ? community.id : undefined}
      communityName={community.name}
      communityColor={community.config.color}
      onBack={onBack}
    >
    <div className="min-h-screen bg-black">
      {/* ═══ HEADER ═══ */}
      <div className="w-full bg-[#35363A] border-b border-white/10 sticky top-0 z-40">
        <div className="mx-auto max-w-[1200px] px-6 py-3">
          <div className="flex items-center justify-between">
            <button onClick={onBack} className="flex items-center gap-2 text-white/80 hover:text-[#81D8D0] transition-colors">
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Voltar</span>
            </button>
            <div className="flex items-center gap-2">
              <IconComponent className="h-5 w-5" style={{ color: community.config.color }} />
              <h1 className="text-lg text-white font-semibold">{community.name}</h1>
              {isMilaActive && <span className="text-[9px] px-1.5 py-0.5 bg-[#81D8D0]/20 text-[#81D8D0] rounded-full font-bold">ATIVA</span>}
            </div>
            <div className="w-20" />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1200px] px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* ═══ SIDEBAR ═══ */}
          <div className="space-y-4">
            {/* Community Card */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: `${community.config.color}20`, border: `2px solid ${community.config.color}40` }}>
                <IconComponent className="h-7 w-7" style={{ color: community.config.color }} />
              </div>
              <h2 className="text-xl text-white font-bold mb-2">{community.name}</h2>
              <p className="text-sm text-white/60 leading-relaxed mb-4">{community.description}</p>

              {/* Stats */}
              <div className="flex items-center gap-4 text-xs text-white/40 mb-4">
                <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" /> {community.postCount} posts</span>
                {communityEvents.length > 0 && (
                  <span className="flex items-center gap-1"><Video className="h-3 w-3" /> {communityEvents.length} eventos</span>
                )}
              </div>

              {/* ═══ MODERADOR — com foto ═══ */}
              {(isMilaActive || effectiveOwnerId) && (
                <div className="border-t border-white/10 pt-4">
                  <span className="text-[10px] text-white/40 uppercase tracking-wider font-bold">Moderação</span>
                  <div className="flex items-center gap-3 mt-2">
                    <UserAvatar
                      name={ownerData?.name || "Mila"}
                      photoUrl={ownerData?.photo}
                      size="md"
                      onClick={() => effectiveOwnerId && onNavigateToProfile(effectiveOwnerId)}
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm text-white font-semibold">{ownerData?.name || "Mila"}</span>
                        <ShieldCheck className="h-3.5 w-3.5 text-[#81D8D0]" />
                      </div>
                      <span className="text-[10px] text-white/40">Criadora & Moderadora</span>
                    </div>
                  </div>
                </div>
              )}

              {/* ═══ AGUARDANDO FOUNDER — só para comunidades NÃO ativas ═══ */}
              {!isMilaActive && community.needs_moderator && !community.owner_id && (
                <div className="mt-4 border-t border-white/10 pt-4">
                  <motion.div
                    animate={{ opacity: [1, 0.7, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="bg-[#C8102E]/10 border border-[#C8102E]/30 rounded-xl p-3 text-center"
                  >
                    <span className="text-[11px] text-[#C8102E] uppercase tracking-wider font-bold">
                      AGUARDANDO FUNDADOR(A)
                    </span>
                    <p className="text-[10px] text-white/40 mt-1">Esta comunidade precisa de um(a) fundador(a) para abrir</p>
                  </motion.div>
                </div>
              )}
            </div>

            {/* ═══ AÇÕES ═══ */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
              <h3 className="text-xs text-white uppercase tracking-wider mb-2 font-bold">Ações</h3>
              {[
                { key: "contato", icon: Mail, color: "#81D8D0", label: "Falar com a equipe" },
                { key: "tema_live", icon: Lightbulb, color: "#C8102E", label: "Sugerir tema para live" },
                { key: "evento_sugestao", icon: CalendarPlus, color: "#FF6B35", label: "Sugerir evento" },
                { key: "live_application", icon: Mic, color: "#C8102E", label: "Quero fazer uma Live" },
                { key: "denuncia", icon: AlertTriangle, color: "#C8102E", label: "Fazer denúncia" },
              ].map((action) => (
                <button
                  key={action.key}
                  onClick={() => hasMemberAccess ? setActiveModal(action.key) : alert("Faça login e aguarde aprovação para acessar.")}
                  className="flex items-center gap-2 w-full px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-left"
                >
                  <action.icon className="h-4 w-4" style={{ color: action.color }} />
                  <span className="text-xs text-white/70 font-semibold">{action.label}</span>
                </button>
              ))}
            </div>

            {/* ═══ FOUNDER PANEL — visível para owner ou super_admin ═══ */}
            {isRealCommunity && (effectiveOwnerId === user?.id || isAdmin) && (
              <FounderPanel
                communityId={community.id}
                communityName={community.name}
                communityColor={community.config.color}
                currentManifesto={manifesto}
                onNavigateToProfile={onNavigateToProfile}
              />
            )}

            {/* ══ MENSAGEM PRIVADA 1:1 ═══ */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="h-4 w-4 text-[#81D8D0]" />
                <h3 className="text-xs text-white uppercase tracking-wider font-bold">Chat Privado 1:1</h3>
              </div>
              <p className="text-[11px] text-white/40 leading-relaxed mb-3">
                Quer conversar em particular com outro membro? Acesse o perfil da pessoa e envie uma mensagem direta.
              </p>
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                <MessageSquare className="h-5 w-5 text-white/20 mx-auto mb-1" />
                <span className="text-[10px] text-white/30 font-semibold">Clique no avatar de um membro</span>
              </div>
            </div>
          </div>

          {/* ═══ MAIN CONTENT ═══ */}
          <div className="lg:col-span-3">
            {/* ═══ TABS ═══ */}
            <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-2xl p-1.5 mb-5 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs whitespace-nowrap transition-all font-semibold ${
                    activeTab === tab.key
                      ? "bg-white text-black"
                      : "text-white/50 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <tab.icon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {/* ════════════════════════════════════════
                    TAB: MURAL
                ════════════════════════════════════════ */}
                {activeTab === "mural" && (
                  <div className="space-y-4">
                    {isRealCommunity && user && canPost && (
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                        <button onClick={() => setIsCreatePostOpen(true)} className="flex items-center gap-3 w-full text-left">
                          <UserAvatar name={user.name} photoUrl={user.profile_photo} size="md" />
                          <span className="text-sm text-white/40">Escreva algo para a comunidade...</span>
                        </button>
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/10">
                          <button onClick={() => setIsCreatePostOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 text-[11px] text-white/50 hover:bg-white/10 transition-colors font-semibold">
                            <Image className="h-3.5 w-3.5" /> Foto
                          </button>
                          <button onClick={() => setIsCreatePostOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 text-[11px] text-white/50 hover:bg-white/10 transition-colors font-semibold">
                            <Camera className="h-3.5 w-3.5" /> Imagem
                          </button>
                          <button
                            onClick={() => setShowNarratives(!showNarratives)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors ${
                              showNarratives ? "bg-[#FF6B35]/15 text-[#FF6B35]" : "bg-white/5 text-white/50 hover:bg-white/10"
                            }`}
                          >
                            <Sparkles className="h-3.5 w-3.5" /> Narrativas
                          </button>
                        </div>
                      </div>
                    )}

                    {/* ═══ NARRATIVAS TEMATICAS ═══ */}
                    <AnimatePresence>
                      {showNarratives && canPost && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="bg-white/5 border border-white/10 rounded-2xl p-5 overflow-hidden"
                        >
                          <CommunityNarratives
                            communityCategory={community.config.category}
                            communityColor={community.config.color}
                            onSelectNarrative={(prompt, title) => {
                              navigator.clipboard.writeText(prompt);
                              setShowNarratives(false);
                              setIsCreatePostOpen(true);
                            }}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {isLoading ? (
                      <div className="text-center py-12">
                        <div className="w-12 h-12 border-4 border-[#81D8D0] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-white/40">Carregando...</p>
                      </div>
                    ) : sortedPosts.length === 0 ? (
                      <EmptyMural community={community} IconComponent={IconComponent} canPost={canPost} onCreatePost={() => setIsCreatePostOpen(true)} />
                    ) : (
                      <div className="space-y-4">
                        {sortedPosts.map((post) => (
                          <PostCard
                            key={post.id}
                            post={post}
                            currentUserId={user?.id}
                            canModerate={canModerate}
                            onDelete={refreshPosts}
                            onPinToggle={refreshPosts}
                            onAuthorClick={onNavigateToProfile}
                          />
                        ))}
                        {hasMore && (
                          <button onClick={loadMore} disabled={isLoadingMore} className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white/60 hover:bg-white/10 transition-colors font-semibold">
                            {isLoadingMore ? "Carregando..." : "Carregar mais"}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* ════════════════════════════════════════
                    TAB: FÓRUM (Discussões)
                ════════════════════════════════════════ */}
                {activeTab === "forum" && (
                  <div className="space-y-4">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg text-white font-bold">Fórum de Discussão</h2>
                        {canPost && (
                          <button onClick={() => setIsCreatePostOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-[#81D8D0] text-black rounded-xl text-xs font-bold hover:bg-[#81D8D0]/90 transition-colors">
                            <PlusCircle className="h-4 w-4" /> Nova discussão
                          </button>
                        )}
                      </div>
                      <p className="text-sm text-white/50 mb-4">Abra tópicos, faça perguntas, compartilhe reflexões. Aqui a conversa é mais longa e profunda.</p>
                    </div>

                    {isLoading ? (
                      <div className="text-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#81D8D0] mb-3" />
                        <p className="text-sm text-white/40">Carregando discussões...</p>
                      </div>
                    ) : sortedPosts.length === 0 ? (
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
                        <MessageSquare className="h-10 w-10 text-white/20 mx-auto mb-3" />
                        <p className="text-white/50 text-sm">Nenhuma discussão ainda. Seja a primeira pessoa a abrir um tópico!</p>
                        {canPost && (
                          <button onClick={() => setIsCreatePostOpen(true)} className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-[#81D8D0] text-black rounded-xl text-sm font-bold hover:bg-[#81D8D0]/90 transition-colors">
                            <PlusCircle className="h-5 w-5" /> Abrir tópico
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {sortedPosts.map((post) => (
                          <div key={post.id} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-white/20 transition-colors cursor-pointer">
                            <div className="flex items-start gap-3">
                              <UserAvatar name={post.author_data?.display_name || post.author_data?.name || ""} photoUrl={post.author_data?.profile_photo} size="sm" onClick={() => onNavigateToProfile(post.author)} />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-white font-semibold text-sm cursor-pointer hover:text-[#81D8D0]" onClick={() => onNavigateToProfile(post.author)}>
                                    {post.author_data?.display_name || post.author_data?.name || "Membro"}
                                  </span>
                                  <span className="text-white/30 text-xs">{new Date(post.created_at).toLocaleDateString("pt-BR")}</span>
                                  {post.is_pinned && <span className="text-[9px] px-1.5 py-0.5 bg-[#C8102E]/20 text-[#C8102E] rounded font-bold">FIXADO</span>}
                                </div>
                                <p className="text-white/70 text-sm line-clamp-3">{post.content}</p>
                                <div className="flex items-center gap-3 mt-2 text-xs text-white/30">
                                  <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" /> Comentar</span>
                                  <span className="flex items-center gap-1"><Heart className="h-3 w-3" /> Reagir</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ════════════════════════════════════════
                    TAB: MANIFESTO
                ════════════════════════════════════════ */}
                {activeTab === "manifesto" && (
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${community.config.color}20`, border: `2px solid ${community.config.color}40` }}>
                        <BookOpen className="h-6 w-6" style={{ color: community.config.color }} />
                      </div>
                      <div>
                        <h2 className="text-xl text-white font-bold">Manifesto</h2>
                        <span className="text-xs text-white/40">{community.name}</span>
                      </div>
                    </div>
                    <div className="border-l-4 pl-6 py-4 rounded-r-lg" style={{ borderColor: community.config.color, backgroundColor: `${community.config.color}10` }}>
                      <p className="text-white/80 text-lg leading-relaxed italic">
                        "{manifesto}"
                      </p>
                    </div>
                    {(isMilaActive || effectiveOwnerId) && ownerData && (
                      <div className="flex items-center gap-3 mt-6 pt-4 border-t border-white/10">
                        <UserAvatar name={ownerData.name} photoUrl={ownerData.photo} size="sm" />
                        <p className="text-xs text-white/40">— Escrito por {ownerData.name}, criadora do NeuroConexão Atípica</p>
                      </div>
                    )}
                  </div>
                )}

                {/* ════════════════════════════════════════
                    TAB: LIVES
                ════════════════════════════════════════ */}
                {activeTab === "lives" && (
                  <div className="space-y-4">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg text-white font-bold flex items-center gap-2">
                          <Radio className="h-5 w-5 text-[#C8102E]" /> Lives
                        </h2>
                        <button onClick={() => setActiveModal("live_application")} className="flex items-center gap-2 px-4 py-2 bg-[#C8102E] text-white rounded-xl text-xs font-bold hover:bg-[#C8102E]/80 transition-colors">
                          <Mic className="h-4 w-4" /> Quero fazer uma Live
                        </button>
                      </div>

                      {eventsLoading ? (
                        <div className="text-center py-8">
                          <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#C8102E] mb-3" />
                          <p className="text-sm text-white/40">Carregando lives...</p>
                        </div>
                      ) : lives.length === 0 ? (
                        <div className="text-center py-8">
                          <Radio className="h-10 w-10 text-white/20 mx-auto mb-3" />
                          <p className="text-sm text-white/50">Nenhuma live agendada ainda.</p>
                          <p className="text-xs text-white/30 mt-1">Tem algo pra compartilhar? Inscreva-se para fazer uma!</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {lives.map((event) => (
                            <EventCard key={event.id} event={event} onToggle={handleToggleEventInterest} user={user} />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* ═══ SUGERIR TEMA PARA LIVE — DESTAQUE ═══ */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                      className="bg-gradient-to-br from-[#C8102E]/15 to-[#C8102E]/5 border border-[#C8102E]/30 rounded-2xl p-5"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-9 h-9 rounded-lg bg-[#C8102E] flex items-center justify-center flex-shrink-0">
                          <Lightbulb className="h-4 w-4 text-white" />
                        </div>
                        <h3 className="text-sm text-white font-bold">Sugira um tema para live</h3>
                      </div>
                      <p className="text-xs text-white/60 mb-3 leading-relaxed">
                        Que assunto você gostaria de ver numa live desta comunidade? Sua sugestão vai direto pra equipe e influencia a agenda.
                      </p>
                      <button
                        onClick={() => hasMemberAccess ? setActiveModal("tema_live") : alert("Faça login e aguarde aprovação para acessar.")}
                        className="w-full py-2.5 bg-white text-[#C8102E] rounded-xl text-sm transition-all hover:bg-white/90 cursor-pointer font-bold"
                      >
                        Enviar sugestão de tema
                      </button>
                    </motion.div>
                  </div>
                )}

                {/* ════════════════════════════════════════
                    TAB: EVENTOS
                ════════════════════════════════════════ */}
                {activeTab === "eventos" && (
                  <div className="space-y-4">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg text-white font-bold flex items-center gap-2">
                          <Calendar className="h-5 w-5 text-[#81D8D0]" /> Eventos
                        </h2>
                        <button onClick={() => setActiveModal("evento_sugestao")} className="flex items-center gap-2 px-4 py-2 bg-[#81D8D0] text-black rounded-xl text-xs font-bold hover:bg-[#81D8D0]/90 transition-colors">
                          <CalendarPlus className="h-4 w-4" /> Sugerir evento
                        </button>
                      </div>

                      {eventsLoading ? (
                        <div className="text-center py-8">
                          <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#81D8D0] mb-3" />
                        </div>
                      ) : eventos.length === 0 ? (
                        <div className="text-center py-8">
                          <Calendar className="h-10 w-10 text-white/20 mx-auto mb-3" />
                          <p className="text-sm text-white/50">Nenhum evento agendado.</p>
                          <p className="text-xs text-white/30 mt-1">Sugira um workshop, debate, encontro ou ritual!</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {eventos.map((event) => (
                            <EventCard key={event.id} event={event} onToggle={handleToggleEventInterest} user={user} />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ════════════════════════════════════════
                    TAB: RITUAIS
                ════════════════════════════════════════ */}
                {activeTab === "rituais" && (
                  <div className="space-y-5">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg text-white font-bold">Rituais Disponíveis</h2>
                        {community.ritual_enabled && (
                          <span className="text-[10px] text-[#81D8D0] bg-[#81D8D0]/15 px-2 py-0.5 rounded-full border border-[#81D8D0]/20 font-bold">
                            Rituais habilitados
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {RITUAIS.map((ritual) => (
                          <div key={ritual.nome} className="border border-white/10 rounded-xl p-4 hover:border-[#81D8D0]/30 transition-colors bg-white/3">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xl">{ritual.icone}</span>
                              <h4 className="text-white font-semibold">{ritual.nome}</h4>
                            </div>
                            <p className="text-xs text-white/50 leading-relaxed">{ritual.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ════════════════════════════════════════
                    TAB: CHAT EM GRUPO (Realtime)
                ════════════════════════════════════════ */}
                {activeTab === "chat" && (
                  <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                    {/* Chat Header */}
                    <div className="bg-white/5 border-b border-white/10 px-5 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-[#81D8D0]" />
                        <h2 className="text-white font-bold text-sm">Chat da Comunidade</h2>
                        <span className="text-[10px] text-[#81D8D0] bg-[#81D8D0]/15 px-2 py-0.5 rounded-full font-bold">TEMPO REAL</span>
                      </div>
                      <span className="text-white/30 text-xs">{chatMessages.length} mensagens</span>
                    </div>

                    {!hasMemberAccess ? (
                      <div className="p-8 text-center">
                        <Lock className="h-10 w-10 text-white/20 mx-auto mb-3" />
                        <p className="text-white/50 text-sm font-semibold">Chat disponível apenas para membros aprovados</p>
                        <p className="text-white/30 text-xs mt-1">Faça login e aguarde aprovação para participar.</p>
                      </div>
                    ) : (
                      <>
                        {/* Messages area */}
                        <div className="h-[400px] overflow-y-auto p-4 space-y-3">
                          {chatLoading ? (
                            <div className="text-center py-8">
                              <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#81D8D0] mb-3" />
                              <p className="text-sm text-white/40">Carregando chat...</p>
                            </div>
                          ) : chatMessages.length === 0 ? (
                            <div className="text-center py-12">
                              <MessageSquare className="h-10 w-10 text-white/10 mx-auto mb-3" />
                              <p className="text-white/30 text-sm">Nenhuma mensagem ainda. Comece a conversa!</p>
                            </div>
                          ) : (
                            chatMessages.map((msg) => {
                              const isMe = msg.author_id === user?.id;
                              return (
                                <div key={msg.id} className={`flex items-start gap-2 ${isMe ? "flex-row-reverse" : ""}`}>
                                  <UserAvatar
                                    name={msg.author_data?.display_name || msg.author_data?.name || "Membro"}
                                    photoUrl={msg.author_data?.profile_photo || null}
                                    size="sm"
                                    onClick={() => onNavigateToProfile(msg.author_id)}
                                  />
                                  <div className={`max-w-[70%] ${isMe ? "items-end" : "items-start"}`}>
                                    <div className="flex items-center gap-2 mb-0.5">
                                      {!isMe && (
                                        <span className="text-[10px] text-white/50 font-semibold">{msg.author_data?.display_name || msg.author_data?.name}</span>
                                      )}
                                      <span className="text-[9px] text-white/20">
                                        {new Date(msg.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                                      </span>
                                    </div>
                                    <div className={`px-3 py-2 rounded-xl text-sm ${
                                      isMe
                                        ? "bg-[#81D8D0] text-black rounded-br-sm"
                                        : "bg-white/10 text-white rounded-bl-sm"
                                    }`}>
                                      {msg.content}
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                          )}
                          <div ref={chatEndRef} />
                        </div>

                        {/* Chat Input */}
                        <div className="border-t border-white/10 p-3 flex items-center gap-2">
                          <input
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendChat()}
                            placeholder="Digite sua mensagem..."
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#81D8D0]/50"
                          />
                          <button
                            onClick={handleSendChat}
                            disabled={!chatInput.trim() || sendingChat}
                            className="p-2.5 bg-[#81D8D0] text-black rounded-xl hover:bg-[#81D8D0]/90 transition-colors disabled:opacity-50"
                          >
                            {sendingChat ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Create Post Modal */}
      {isRealCommunity && (
        <CreatePostModal
          isOpen={isCreatePostOpen}
          onClose={() => setIsCreatePostOpen(false)}
          onPostCreated={refreshPosts}
          defaultCommunityId={community.id}
        />
      )}

      {/* ═══ ACTION MODALS ═══ */}
      {["contato", "tema_live", "evento_sugestao", "live_application", "denuncia"].map((tipo) => {
        const config: Record<string, { title: string; placeholder: string; btnText: string; btnColor: string; successMsg: string; description: string; showTema?: boolean; showHorario?: boolean }> = {
          contato: {
            title: "Falar com a equipe",
            placeholder: "Sua mensagem",
            btnText: "Enviar",
            btnColor: "#81D8D0",
            successMsg: "Mensagem enviada!",
            description: "",
          },
          tema_live: {
            title: "Sugerir tema para live",
            placeholder: "Descreva o tema que gostaria de abordar na live",
            btnText: "Enviar sugestão",
            btnColor: "#C8102E",
            successMsg: "Sugestão enviada! Vamos avaliar.",
            description: "Tem uma ideia de tema para uma live? Descreva o formato e o que espera.",
            showTema: true,
            showHorario: true,
          },
          evento_sugestao: {
            title: "Sugerir evento para a comunidade",
            placeholder: "Descreva sua ideia de evento (workshop, debate, encontro, ritual...)",
            btnText: "Enviar sugestão",
            btnColor: "#FF6B35",
            successMsg: "Sugestão enviada! Vamos avaliar.",
            description: "Tem uma ideia de evento? Descreva o formato, tema e o que espera.",
            showTema: true,
            showHorario: true,
          },
          live_application: {
            title: "Inscrição para fazer uma Live",
            placeholder: "Sobre o que você quer falar? Qual o formato? (palestra, bate-papo, debate...)",
            btnText: "Enviar inscrição",
            btnColor: "#C8102E",
            successMsg: "Inscrição enviada! Entraremos em contato.",
            description: "Quer compartilhar algo com a comunidade ao vivo? Preencha o formulário abaixo.",
            showTema: true,
            showHorario: true,
          },
          denuncia: {
            title: "Fazer denúncia",
            placeholder: "Descreva a situação com o máximo de detalhes possível...",
            btnText: "Enviar denúncia",
            btnColor: "#C8102E",
            successMsg: "Denúncia recebida. Será tratada com sigilo.",
            description: "Relatos são tratados com seriedade e sigilo absoluto.",
          },
        };
        const c = config[tipo];
        if (!c) return null;
        return (
          <AnimatePresence key={tipo}>
            {activeModal === tipo && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                onClick={() => setActiveModal(null)}
              >
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                  className="relative bg-[#1a1a2e] rounded-2xl p-6 max-w-md w-full shadow-2xl border border-white/10"
                >
                  <button onClick={() => setActiveModal(null)} className="absolute top-3 right-3 p-1 hover:bg-white/10 rounded-lg">
                    <X className="h-5 w-5 text-white/40" />
                  </button>
                  <h3 className="text-lg text-white font-bold mb-4">{c.title}</h3>
                  {formSent[tipo] ? (
                    <div className="text-center py-4">
                      <Check className="h-10 w-10 mx-auto mb-3" style={{ color: c.btnColor }} />
                      <p className="text-white font-semibold">{c.successMsg}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {c.description && <p className="text-sm text-white/50">{c.description}</p>}
                      <input type="text" placeholder="Seu nome" value={formData.nome} onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))} className={inputClass} />
                      <input type="email" placeholder="Seu email" value={formData.email} onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} className={inputClass} />
                      {c.showTema && (
                        <input type="text" placeholder="Tema / Assunto" value={formData.tema} onChange={(e) => setFormData(prev => ({ ...prev, tema: e.target.value }))} className={inputClass} />
                      )}
                      {c.showHorario && (
                        <input type="text" placeholder="Horário sugerido (ex: Sábado 20h)" value={formData.horario} onChange={(e) => setFormData(prev => ({ ...prev, horario: e.target.value }))} className={inputClass} />
                      )}
                      <textarea placeholder={c.placeholder} value={formData.mensagem} onChange={(e) => setFormData(prev => ({ ...prev, mensagem: e.target.value }))} rows={4} className={`${inputClass} resize-none`} />
                      <button
                        onClick={() => handleFormSubmit(tipo)}
                        disabled={formLoading}
                        className="w-full py-2.5 text-white rounded-xl text-sm font-bold hover:opacity-90 transition-colors disabled:opacity-50"
                        style={{ backgroundColor: c.btnColor }}
                      >
                        <span className="flex items-center justify-center gap-2">
                          {formLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                          {formLoading ? "Enviando..." : c.btnText}
                        </span>
                      </button>
                    </div>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        );
      })}
    </div>
    </MembershipGate>
  );
}

// ═══ SUBCOMPONENTS ═══

function EmptyMural({ community, IconComponent, canPost, onCreatePost }: { community: CommunityWithMeta; IconComponent: any; canPost: boolean; onCreatePost: () => void }) {
  const isRealCommunity = !community.id.startsWith("pending-") && !community.id.startsWith("local-");
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
      <div className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${community.config.color}20` }}>
        <IconComponent className="h-8 w-8" style={{ color: community.config.color }} />
      </div>
      <h3 className="text-xl text-white font-semibold mb-2">
        {isRealCommunity ? "O mural está esperando por você" : "Comunidade em preparação"}
      </h3>
      <p className="text-sm text-white/50 mb-4 max-w-md mx-auto">
        {isRealCommunity ? "Nenhum post ainda. Seja a primeira pessoa a falar." : "Em breve esta comunidade será ativada."}
      </p>
      {community.config.starters && community.config.starters.length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 mt-4 text-left max-w-lg mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4" style={{ color: community.config.color }} />
            <span className="text-sm text-white font-semibold">Sugestões para começar</span>
          </div>
          <div className="space-y-2">
            {community.config.starters.map((s, idx) => (
              <button key={idx} onClick={canPost ? onCreatePost : undefined} className="block w-full text-left p-3 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-colors">
                <span className="text-sm text-white/60">{s}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      {isRealCommunity && canPost && (
        <button onClick={onCreatePost} className="mt-4 inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white transition-all hover:scale-[1.02] font-semibold" style={{ backgroundColor: community.config.color }}>
          <PlusCircle className="h-5 w-5" /> Iniciar conversa
        </button>
      )}
    </div>
  );
}

function EventCard({ event, onToggle, user }: { event: EventWithMeta; onToggle: (e: EventWithMeta) => void; user: any }) {
  const dt = formatEventDate(event.starts_at);
  const isLive = event.event_type === "live";
  const isLiveNow = event.status === "live" || event.status === "live_now";

  return (
    <div className={`border rounded-xl p-4 ${isLiveNow ? "border-[#C8102E]/50 bg-[#C8102E]/5" : isLive ? "border-[#C8102E]/20" : "border-white/10"}`}>
      <div className="flex items-center gap-3">
        <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center flex-shrink-0 ${isLiveNow ? "bg-[#C8102E]" : isLive ? "bg-[#C8102E]/10" : "bg-white/5"}`}>
          <span className={`text-lg font-bold ${isLiveNow ? "text-white" : isLive ? "text-[#C8102E]" : "text-white"}`}>{dt.dia}</span>
          <span className={`text-[10px] uppercase font-semibold ${isLiveNow ? "text-white/80" : isLive ? "text-[#C8102E]/60" : "text-white/40"}`}>{dt.mesLabel}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold ${
              isLive ? "bg-[#C8102E] text-white" : event.event_type === "workshop" ? "bg-[#81D8D0] text-black" : "bg-purple-500 text-white"
            }`}>
              {event.event_type === "ritual" ? "RITUAL" : event.event_type === "workshop" ? "WORKSHOP" : "LIVE"}
            </span>
            {isLiveNow && <span className="text-[10px] uppercase px-2 py-0.5 bg-[#C8102E] text-white rounded-full animate-pulse font-bold">AO VIVO</span>}
          </div>
          <h4 className="text-white font-semibold">{event.title}</h4>
          <div className="flex items-center gap-2 text-xs text-white/40 mt-0.5">
            <span>{dt.hora} • Host: {event.host_name}</span>
            {event.participant_count > 0 && (
              <span className="flex items-center gap-0.5 text-[#81D8D0]">
                <Users className="h-3 w-3" /> {event.participant_count}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-1.5 flex-shrink-0">
          {event.location_url ? (
            <a href={event.location_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#C8102E] text-white rounded-lg text-xs font-semibold">
              <ExternalLink className="h-3 w-3" /> Acessar
            </a>
          ) : (
            <span className="text-[10px] text-white/30 px-2 py-1 bg-white/5 rounded-lg text-center">Link em breve</span>
          )}
          {user && (
            <button
              onClick={() => onToggle(event)}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs border transition-colors font-semibold ${
                event.is_participating
                  ? "bg-[#81D8D0] text-black border-[#81D8D0]"
                  : "bg-white/5 text-white/60 border-white/10 hover:border-white/30"
              }`}
            >
              {event.is_participating ? <><Check className="h-3 w-3" /> Interesse!</> : <><Heart className="h-3 w-3" /> Participar</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}