/**
 * FoundersRoom — Sala privada para founders e super_admin
 * 
 * Chat em tempo real apenas para roles: founder_paid, moderator, super_admin.
 * Canal unico identificado como "founders_room" no sistema de chat.
 * Acesso pela sidebar do SocialHub.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft, Crown, Send, Loader2, Users, Lock,
  Sparkles, MessageCircle
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useProfileContext } from "../../lib/ProfileContext";
import { UserAvatar } from "./UserAvatar";
import { LogoIcon } from "./LogoIcon";

interface FoundersMessage {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  user_name: string;
  user_photo: string | null;
  user_role: string;
}

// ID fixo da "comunidade" founders room (usamos um UUID determinístico)
const FOUNDERS_ROOM_ID = "00000000-0000-0000-0000-f0und3r5r00m";

interface FoundersRoomProps {
  onBack: () => void;
  onNavigateToProfile?: (userId: string) => void;
}

export function FoundersRoom({ onBack, onNavigateToProfile }: FoundersRoomProps) {
  const { user } = useProfileContext();
  const [messages, setMessages] = useState<FoundersMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [onlineCount, setOnlineCount] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Mapa de users para evitar re-queries
  const userCache = useRef<Record<string, { name: string; photo: string | null; role: string }>>({});

  // Carregar usuario no cache
  const loadUserInfo = useCallback(async (userId: string) => {
    if (userCache.current[userId]) return userCache.current[userId];

    const { data } = await supabase
      .from("users")
      .select("name, display_name, profile_photo, role")
      .eq("id", userId)
      .single();

    if (data) {
      userCache.current[userId] = {
        name: data.display_name || data.name,
        photo: data.profile_photo,
        role: data.role,
      };
      return userCache.current[userId];
    }
    return { name: "Membro", photo: null, role: "member_free_legacy" };
  }, []);

  // Carregar mensagens iniciais
  useEffect(() => {
    async function loadMessages() {
      setIsLoading(true);
      try {
        // Buscar mensagens do chat com channel_id = FOUNDERS_ROOM_ID
        const { data: msgs, error } = await supabase
          .from("chat_messages")
          .select("id, user_id, content, created_at")
          .eq("community_id", FOUNDERS_ROOM_ID)
          .order("created_at", { ascending: true })
          .limit(100);

        if (error) {
          // Tabela pode nao ter o registro — nao e erro critico
          console.log("[FoundersRoom] Nenhuma mensagem ainda ou erro:", error.message);
          setIsLoading(false);
          return;
        }

        if (msgs && msgs.length > 0) {
          const enriched: FoundersMessage[] = [];
          for (const msg of msgs) {
            const info = await loadUserInfo(msg.user_id);
            enriched.push({
              id: msg.id,
              user_id: msg.user_id,
              content: msg.content,
              created_at: msg.created_at,
              user_name: info.name,
              user_photo: info.photo,
              user_role: info.role,
            });
          }
          setMessages(enriched);
        }
      } catch (err) {
        console.error("[FoundersRoom] Erro ao carregar:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadMessages();
  }, [loadUserInfo]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`founders-room`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `community_id=eq.${FOUNDERS_ROOM_ID}`,
        },
        async (payload) => {
          const msg = payload.new as any;
          const info = await loadUserInfo(msg.user_id);
          setMessages(prev => [...prev, {
            id: msg.id,
            user_id: msg.user_id,
            content: msg.content,
            created_at: msg.created_at,
            user_name: info.name,
            user_photo: info.photo,
            user_role: info.role,
          }]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [loadUserInfo]);

  // Contar founders online (aproximado)
  useEffect(() => {
    async function countFounders() {
      const { count } = await supabase
        .from("users")
        .select("id", { count: "exact", head: true })
        .in("role", ["founder_paid", "moderator", "super_admin"]);
      setOnlineCount(count || 0);
    }
    countFounders();
  }, []);

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Enviar mensagem
  const handleSend = async () => {
    if (!newMessage.trim() || !user || sending) return;
    setSending(true);

    try {
      const { error } = await supabase.from("chat_messages").insert({
        community_id: FOUNDERS_ROOM_ID,
        user_id: user.id,
        content: newMessage.trim(),
      });

      if (error) throw error;
      setNewMessage("");
      inputRef.current?.focus();
    } catch (err) {
      console.error("[FoundersRoom] Erro ao enviar:", err);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  function getRoleBadge(role: string) {
    switch (role) {
      case "super_admin":
        return { label: "Admin", color: "#C8102E" };
      case "moderator":
        return { label: "Mod", color: "#81D8D0" };
      case "founder_paid":
        return { label: "Founder", color: "#FF6B35" };
      default:
        return null;
    }
  }

  function formatTime(dateStr: string) {
    return new Date(dateStr).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  }

  function formatDate(dateStr: string) {
    const date = new Date(dateStr);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) return "Hoje";
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) return "Ontem";
    return date.toLocaleDateString("pt-BR", { day: "numeric", month: "short" });
  }

  // Agrupar mensagens por dia
  let lastDate = "";

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <div className="bg-[#35363A] border-b border-white/10 px-6 py-3 flex-shrink-0">
        <div className="mx-auto max-w-[800px] flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 text-white/80 hover:text-[#81D8D0] transition-colors">
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium text-sm">Voltar</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FF6B35]/15 border border-[#FF6B35]/30 flex items-center justify-center">
              <Crown className="h-5 w-5 text-[#FF6B35]" />
            </div>
            <div>
              <h1 className="text-base text-white font-bold">Sala dos Fundadores</h1>
              <div className="flex items-center gap-2">
                <Lock className="h-2.5 w-2.5 text-white/30" />
                <span className="text-[10px] text-white/30">Privada</span>
                <span className="text-[10px] text-white/30">|</span>
                <Users className="h-2.5 w-2.5 text-[#FF6B35]" />
                <span className="text-[10px] text-[#FF6B35] font-semibold">{onlineCount} fundadores</span>
              </div>
            </div>
          </div>
          <div className="w-20" />
        </div>
      </div>

      {/* Welcome banner */}
      <div className="mx-auto max-w-[800px] w-full px-6 pt-4">
        <div className="bg-[#FF6B35]/8 border border-[#FF6B35]/15 rounded-xl p-4 mb-4">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-[#FF6B35] mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-[#FF6B35] font-bold mb-1">Territorio exclusivo</p>
              <p className="text-[11px] text-white/40 leading-relaxed">
                Aqui e onde fundadores, moderadores e a criadora se encontram. 
                Discuta estrategias, alinhe decisoes e fortaleca o territorio.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-6">
        <div className="mx-auto max-w-[800px] py-4 space-y-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-3 border-[#FF6B35] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-16">
              <MessageCircle className="h-12 w-12 text-white/10 mx-auto mb-3" />
              <p className="text-sm text-white/30 font-semibold">Nenhuma mensagem ainda</p>
              <p className="text-xs text-white/20 mt-1">Comece a conversa entre fundadores!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const msgDate = formatDate(msg.created_at);
              const showDateSeparator = msgDate !== lastDate;
              lastDate = msgDate;
              const isMe = msg.user_id === user?.id;
              const badge = getRoleBadge(msg.user_role);

              return (
                <div key={msg.id}>
                  {showDateSeparator && (
                    <div className="flex items-center gap-3 py-3">
                      <div className="flex-1 h-px bg-white/8" />
                      <span className="text-[10px] text-white/25 font-semibold">{msgDate}</span>
                      <div className="flex-1 h-px bg-white/8" />
                    </div>
                  )}
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-start gap-3 py-2 px-3 rounded-xl hover:bg-white/3 transition-colors ${
                      isMe ? "" : ""
                    }`}
                  >
                    <UserAvatar
                      name={msg.user_name}
                      photoUrl={msg.user_photo}
                      size="sm"
                      onClick={() => onNavigateToProfile?.(msg.user_id)}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-xs font-bold cursor-pointer hover:text-[#81D8D0] transition-colors"
                          style={{ color: isMe ? "#81D8D0" : "#fff" }}
                          onClick={() => onNavigateToProfile?.(msg.user_id)}
                        >
                          {msg.user_name}
                        </span>
                        {badge && (
                          <span
                            className="text-[9px] px-1.5 py-0.5 rounded-full font-bold"
                            style={{ background: `${badge.color}20`, color: badge.color }}
                          >
                            {badge.label}
                          </span>
                        )}
                        <span className="text-[10px] text-white/20">{formatTime(msg.created_at)}</span>
                      </div>
                      <p className="text-sm text-white/75 leading-relaxed mt-0.5 break-words">
                        {msg.content}
                      </p>
                    </div>
                  </motion.div>
                </div>
              );
            })
          )}
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="bg-[#1A1A1A] border-t border-white/10 px-6 py-4 flex-shrink-0">
        <div className="mx-auto max-w-[800px] flex items-center gap-3">
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escreva para os fundadores..."
            className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-white/25 focus:border-[#FF6B35]/50 focus:outline-none"
          />
          <button
            onClick={handleSend}
            disabled={!newMessage.trim() || sending}
            className="px-4 py-3 bg-[#FF6B35] hover:bg-[#FF6B35]/90 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition-all"
          >
            {sending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}