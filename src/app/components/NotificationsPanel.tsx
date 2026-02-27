import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Bell, X, Eye, Users, MessageCircle, Heart, Calendar, Flame, ShieldAlert, UserPlus, Check, CheckCheck } from "lucide-react";
import { useNotifications } from "../../lib";
import type { Notification } from "../../lib";

interface NotificationsPanelProps {
  onNavigateToProfile?: (userId: string) => void;
}

const NOTIF_ICONS: Record<string, typeof Bell> = {
  profile_visit: Eye,
  testimonial: Heart,
  connection_request: UserPlus,
  connection_accepted: Users,
  new_comment: MessageCircle,
  new_reaction: Heart,
  new_message: MessageCircle,
  community_message: MessageCircle,
  event_reminder: Calendar,
  daily_challenge: Flame,
  system: Bell,
  report_update: ShieldAlert,
  ritual_reminder: Flame,
  mention: MessageCircle,
};

const NOTIF_COLORS: Record<string, string> = {
  profile_visit: "#81D8D0",
  testimonial: "#FF6B35",
  connection_request: "#81D8D0",
  connection_accepted: "#0A8F85",
  new_comment: "#81D8D0",
  new_reaction: "#FF6B35",
  new_message: "#81D8D0",
  daily_challenge: "#C8102E",
  report_update: "#C8102E",
  system: "#999",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "agora";
  if (mins < 60) return `${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return `${Math.floor(days / 7)}sem`;
}

export function NotificationsPanel({ onNavigateToProfile }: NotificationsPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, markAsRead, markAllAsRead, isLoading } = useNotifications();

  // Fechar ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleNotifClick = (notif: Notification) => {
    if (!notif.is_read) markAsRead(notif.id);
    if (notif.reference_type === "user" && notif.reference_id && onNavigateToProfile) {
      onNavigateToProfile(notif.reference_id);
    }
    // Outros tipos podem navegar para posts, eventos, etc.
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Botão do sino */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-all"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-[#C8102E] text-white text-[10px] rounded-full px-1"
            style={{ fontWeight: 700 }}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </motion.span>
        )}
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-[380px] max-h-[480px] bg-[#1E1E1E] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/8">
              <h3 className="text-white text-sm" style={{ fontWeight: 700 }}>Notificações</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="flex items-center gap-1 text-[11px] text-[#81D8D0] hover:text-[#81D8D0]/80 transition-colors"
                    style={{ fontWeight: 600 }}
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    Marcar todas
                  </button>
                )}
                <button onClick={() => setIsOpen(false)} className="text-white/30 hover:text-white/60 transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Lista */}
            <div className="overflow-y-auto max-h-[420px]">
              {isLoading ? (
                <div className="p-8 text-center">
                  <div className="w-6 h-6 border-2 border-[#81D8D0] border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="h-8 w-8 text-white/15 mx-auto mb-3" />
                  <p className="text-white/40 text-sm">Nenhuma notificação</p>
                  <p className="text-white/20 text-xs mt-1">Quando algo acontecer, aparece aqui</p>
                </div>
              ) : (
                notifications.slice(0, 30).map((notif) => {
                  const Icon = NOTIF_ICONS[notif.type] || Bell;
                  const color = NOTIF_COLORS[notif.type] || "#999";
                  return (
                    <motion.button
                      key={notif.id}
                      onClick={() => handleNotifClick(notif)}
                      className={`w-full flex items-start gap-3 px-5 py-3.5 text-left transition-colors ${
                        notif.is_read ? "hover:bg-white/3" : "bg-white/3 hover:bg-white/5"
                      }`}
                    >
                      {/* Icon */}
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: `${color}15`, border: `1px solid ${color}25` }}
                      >
                        <Icon className="h-4 w-4" style={{ color }} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm leading-snug ${notif.is_read ? "text-white/50" : "text-white/90"}`}>
                          <span style={{ fontWeight: notif.is_read ? 400 : 600 }}>{notif.title}</span>
                        </p>
                        {notif.content && (
                          <p className="text-xs text-white/30 mt-0.5 truncate">{notif.content}</p>
                        )}
                        <p className="text-[10px] text-white/20 mt-1">{timeAgo(notif.created_at)}</p>
                      </div>

                      {/* Unread dot */}
                      {!notif.is_read && (
                        <div className="w-2 h-2 rounded-full bg-[#C8102E] flex-shrink-0 mt-2" />
                      )}
                    </motion.button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
