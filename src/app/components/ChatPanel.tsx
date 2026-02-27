import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, Loader2, MessageCircle } from "lucide-react";
import { useChat } from "../../lib";
import type { ChatMessage } from "../../lib";
import { useProfileContext } from "../../lib";
import { UserAvatar } from "./UserAvatar";
import { InlineBadges } from "./InlineBadges";

interface ChatPanelProps {
  communityId: string;
  onNavigateToProfile?: (userId: string) => void;
}

function timeFormat(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function dateLabel(dateStr: string): string {
  const d = new Date(dateStr);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return "Hoje";
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "Ontem";
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

export function ChatPanel({ communityId, onNavigateToProfile }: ChatPanelProps) {
  const { messages, sendMessage, isLoading } = useChat(communityId);
  const { user } = useProfileContext();
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll ao receber mensagem
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    setSending(true);
    try {
      await sendMessage(input.trim());
      setInput("");
    } catch (err) {
      console.error("Erro ao enviar:", err);
    }
    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Agrupar mensagens por data
  let lastDate = "";

  return (
    <div className="flex flex-col h-full max-h-[500px] bg-black/30 border border-white/8 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/8 bg-white/3">
        <MessageCircle className="h-4 w-4 text-[#81D8D0]" />
        <h3 className="text-white text-sm" style={{ fontWeight: 700 }}>Chat da Comunidade</h3>
        <span className="text-white/20 text-[10px] ml-auto">
          {messages.length > 0 ? `${messages.length} mensagens` : ""}
        </span>
      </div>

      {/* Mensagens */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-5 w-5 text-white/20 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="h-8 w-8 text-white/10 mx-auto mb-3" />
            <p className="text-white/30 text-sm">Nenhuma mensagem ainda</p>
            <p className="text-white/15 text-xs mt-1">Seja a primeira pessoa a falar</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.author_id === user?.id;
            const msgDate = dateLabel(msg.created_at);
            const showDate = msgDate !== lastDate;
            lastDate = msgDate;

            return (
              <div key={msg.id}>
                {showDate && (
                  <div className="flex items-center gap-2 py-2">
                    <div className="flex-1 h-px bg-white/5" />
                    <span className="text-white/15 text-[10px]" style={{ fontWeight: 600 }}>{msgDate}</span>
                    <div className="flex-1 h-px bg-white/5" />
                  </div>
                )}
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2 py-1 ${isOwn ? "flex-row-reverse" : ""}`}
                >
                  {!isOwn && (
                    <button
                      onClick={() => onNavigateToProfile?.(msg.author_id)}
                      className="flex-shrink-0 mt-1"
                    >
                      <UserAvatar name={msg.author_data?.display_name || msg.author_data?.name || "?"} photoUrl={msg.author_data?.profile_photo} size={24} />
                    </button>
                  )}
                  <div className={`max-w-[75%] ${isOwn ? "text-right" : ""}`}>
                    {!isOwn && (
                      <span className="flex items-center gap-1 mb-0.5">
                        <button
                          onClick={() => onNavigateToProfile?.(msg.author_id)}
                          className="text-[10px] text-white/30 hover:text-white/50 transition-colors"
                          style={{ fontWeight: 600 }}
                        >
                          {msg.author_data?.display_name || msg.author_data?.name || "Membro"}
                        </button>
                        <InlineBadges userId={msg.author_id} maxVisible={2} className="text-[10px]" />
                      </span>
                    )}
                    <div className={`inline-block px-3 py-2 rounded-xl text-sm ${
                      isOwn
                        ? "bg-[#81D8D0]/15 text-white/90 rounded-br-md"
                        : "bg-white/5 text-white/70 rounded-bl-md"
                    }`}>
                      <p className="break-words">{msg.content}</p>
                    </div>
                    <p className="text-[9px] text-white/15 mt-0.5 px-1">{timeFormat(msg.created_at)}</p>
                  </div>
                </motion.div>
              </div>
            );
          })
        )}
      </div>

      {/* Input */}
      <div className="border-t border-white/8 px-3 py-2.5">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite uma mensagem..."
            maxLength={2000}
            rows={1}
            className="flex-1 px-3 py-2 bg-white/5 border border-white/8 rounded-xl text-white text-sm placeholder:text-white/20 focus:border-white/15 focus:outline-none resize-none"
            style={{ minHeight: 38, maxHeight: 100 }}
          />
          <motion.button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2.5 bg-[#81D8D0] rounded-xl text-[#1A1A1A] disabled:opacity-30 transition-opacity"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </motion.button>
        </div>
      </div>
    </div>
  );
}