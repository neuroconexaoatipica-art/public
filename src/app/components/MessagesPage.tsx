import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Send } from "lucide-react";
import { usePrivateMessages, useProfileContext } from "../../lib";
import type { Conversation } from "../../lib";
import { UserAvatar } from "./UserAvatar";

interface MessagesPageProps {
  onBack: () => void;
  onNavigateToProfile?: (userId: string) => void;
  initialConversationUserId?: string | null;
}

export function MessagesPage({ onBack, onNavigateToProfile, initialConversationUserId }: MessagesPageProps) {
  const { user } = useProfileContext();
  const [activeConversation, setActiveConversation] = useState<string | null>(initialConversationUserId || null);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-black">
      <header className="sticky top-0 z-40 bg-[#35363A] border-b border-white/10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={activeConversation ? () => setActiveConversation(null) : onBack} className="text-[#81D8D0] hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-white font-semibold">
            {activeConversation ? "Conversa" : "Mensagens"}
          </h1>
        </div>
      </header>

      <div className="max-w-3xl mx-auto">
        {activeConversation ? (
          <ConversationView
            otherUserId={activeConversation}
            currentUserId={user.id}
            onNavigateToProfile={onNavigateToProfile}
          />
        ) : (
          <ConversationsList
            onSelectConversation={setActiveConversation}
            onNavigateToProfile={onNavigateToProfile}
          />
        )}
      </div>
    </div>
  );
}

// Lista de conversas
function ConversationsList({
  onSelectConversation,
  onNavigateToProfile,
}: {
  onSelectConversation: (userId: string) => void;
  onNavigateToProfile?: (userId: string) => void;
}) {
  const { conversations, isLoading } = usePrivateMessages();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-2 border-[#81D8D0] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="text-center py-16 px-6">
        <div className="text-5xl mb-4">💬</div>
        <h2 className="text-white text-xl font-semibold mb-2">Nenhuma conversa ainda</h2>
        <p className="text-white/50 text-sm">Quando alguem te enviar uma mensagem, ela aparecera aqui.</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-white/5">
      {conversations.map((conv: Conversation) => (
        <button
          key={conv.other_user_id}
          onClick={() => onSelectConversation(conv.other_user_id)}
          className="w-full flex items-center gap-3 px-4 py-4 hover:bg-white/5 transition-colors text-left"
        >
          <div className="relative">
            <UserAvatar
              name={conv.other_user_name}
              photoUrl={conv.other_user_photo}
              size="md"
            />
            {conv.unread_count > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#C8102E] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold">
                {conv.unread_count > 9 ? "9+" : conv.unread_count}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-white font-medium truncate">{conv.other_user_name}</span>
              <span className="text-white/30 text-xs whitespace-nowrap ml-2">
                {formatTimeAgo(conv.last_message_at)}
              </span>
            </div>
            <p className={`text-sm truncate mt-0.5 ${conv.unread_count > 0 ? "text-white/80 font-medium" : "text-white/40"}`}>
              {conv.last_message}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}

// Conversa individual
function ConversationView({
  otherUserId,
  currentUserId,
  onNavigateToProfile,
}: {
  otherUserId: string;
  currentUserId: string;
  onNavigateToProfile?: (userId: string) => void;
}) {
  const { messages, isLoading, sendMessage } = usePrivateMessages(otherUserId);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    await sendMessage(otherUserId, text.trim());
    setText("");
    setSending(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-2 border-[#81D8D0] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 57px)" }}>
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-white/30 text-sm text-center py-8">Comece a conversa...</p>
        )}
        {messages.map((m) => {
          const isMe = m.sender_id === currentUserId;
          return (
            <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div className={`flex gap-2 max-w-[75%] ${isMe ? "flex-row-reverse" : ""}`}>
                {!isMe && (
                  <UserAvatar
                    name={m.sender_data?.display_name || m.sender_data?.name || "M"}
                    photoUrl={m.sender_data?.profile_photo}
                    size="sm"
                    onClick={() => onNavigateToProfile?.(m.sender_id)}
                  />
                )}
                <div>
                  <div
                    className={`rounded-2xl px-4 py-2.5 ${
                      isMe
                        ? "bg-[#81D8D0] text-black rounded-br-md"
                        : "bg-white/10 text-white rounded-bl-md"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                  </div>
                  <p className={`text-xs text-white/20 mt-1 ${isMe ? "text-right" : ""}`}>
                    {new Date(m.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-white/10 px-4 py-3 bg-[#111]">
        <div className="flex items-center gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Sua mensagem..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:border-[#81D8D0]/50 text-sm"
          />
          <button
            onClick={handleSend}
            disabled={!text.trim() || sending}
            className="p-2.5 bg-[#81D8D0] text-black rounded-xl disabled:opacity-30 transition-opacity"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function formatTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "agora";
  if (diffMin < 60) return `${diffMin}min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `${diffD}d`;
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}