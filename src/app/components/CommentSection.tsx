import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageCircle, Send, Trash2, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { useComments } from "../../lib/useComments";
import { hasAppAccess, hasModAccess, useProfileContext } from "../../lib";
import { UserAvatar } from "./UserAvatar";
import { InlineBadges } from "./InlineBadges";

interface CommentSectionProps {
  postId: string;
  onAuthorClick?: (userId: string) => void;
}

export function CommentSection({ postId, onAuthorClick }: CommentSectionProps) {
  const { comments, count, isLoading, addComment, deleteComment } = useComments(postId);
  const { user } = useProfileContext();
  const canComment = hasAppAccess(user?.role);
  const canModerate = hasModAccess(user?.role);

  const [newComment, setNewComment] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSending) return;

    setIsSending(true);
    setError(null);

    const result = await addComment(newComment);

    if (result.success) {
      setNewComment("");
      setIsExpanded(true);
    } else {
      setError(result.error || "Erro ao comentar");
      setTimeout(() => setError(null), 4000);
    }

    setIsSending(false);
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm("Deletar este comentário?")) return;
    await deleteComment(commentId);
  };

  const getTimeAgo = (dateStr: string) => {
    try {
      const now = new Date();
      const date = new Date(dateStr);
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return "agora";
      if (diffMins < 60) return `${diffMins}min`;
      if (diffHours < 24) return `${diffHours}h`;
      if (diffDays < 7) return `${diffDays}d`;
      return `${Math.floor(diffDays / 7)}sem`;
    } catch {
      return "";
    }
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      founder: "text-[#81D8D0]",
      admin: "text-[#C8102E]",
      member: "text-[#FF6B35]",
    };
    return colors[role] || "text-white/60";
  };

  return (
    <div className="mt-4 pt-4 border-t border-white/5">
      {/* Toggle de comentários */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-white/60 hover:text-white/90 transition-colors mb-3"
      >
        <MessageCircle className="h-4 w-4" />
        <span className="text-sm font-medium">
          {count === 0
            ? "Comentar"
            : count === 1
            ? "1 comentário"
            : `${count} comentários`}
        </span>
        {count > 0 &&
          (isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          ))}
      </button>

      {/* Input de comentário (sempre visível se pode comentar) */}
      {canComment && (
        <form onSubmit={handleSubmit} className="flex items-start gap-3 mb-4">
          <UserAvatar
            name={user?.display_name || user?.name || ""}
            photoUrl={user?.profile_photo}
            size="sm"
          />
          <div className="flex-1 relative">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Escreva um comentário..."
              maxLength={1000}
              disabled={isSending}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-[#81D8D0] focus:border-transparent disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!newComment.trim() || isSending}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-[#81D8D0] hover:text-[#81D8D0]/80 disabled:text-white/20 disabled:cursor-not-allowed transition-colors"
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </div>
        </form>
      )}

      {/* Erro */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3 px-3 py-2 bg-[#C8102E]/10 border border-[#C8102E]/30 rounded-lg"
          >
            <p className="text-xs text-[#C8102E] font-medium">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lista de comentários */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-3 overflow-hidden"
          >
            {isLoading ? (
              <div className="flex items-center gap-2 py-3">
                <Loader2 className="h-4 w-4 animate-spin text-white/40" />
                <span className="text-sm text-white/40">Carregando...</span>
              </div>
            ) : comments.length === 0 ? (
              <p className="text-sm text-white/40 py-2">
                Nenhum comentário ainda. Seja o primeiro!
              </p>
            ) : (
              comments.map((comment) => {
                const isOwnComment = user?.id === comment.author;
                const canDelete = isOwnComment || canModerate;

                return (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-start gap-3 group"
                  >
                    <UserAvatar
                      name={comment.author_data?.display_name || comment.author_data?.name || "Membro"}
                      photoUrl={comment.author_data?.profile_photo}
                      size="sm"
                      onClick={
                        onAuthorClick
                          ? () => onAuthorClick(comment.author)
                          : undefined
                      }
                    />
                    <div className="flex-1 min-w-0">
                      <div className="bg-white/5 rounded-xl px-4 py-2.5">
                        <div className="flex items-center gap-2 mb-1">
                          <button
                            onClick={
                              onAuthorClick
                                ? () => onAuthorClick(comment.author)
                                : undefined
                            }
                            className={`text-sm font-semibold text-white hover:text-[#81D8D0] transition-colors ${
                              onAuthorClick ? "cursor-pointer" : ""
                            }`}
                          >
                            {comment.author_data?.display_name || comment.author_data?.name || "Membro"}
                          </button>
                          <InlineBadges userId={comment.author} maxVisible={2} />
                          {comment.author_data?.role &&
                            comment.author_data.role !== "member" && (
                              <span
                                className={`text-xs font-semibold ${getRoleColor(
                                  comment.author_data.role
                                )}`}
                              >
                                {comment.author_data.role === "founder"
                                  ? "Fundadora"
                                  : "Admin"}
                              </span>
                            )}
                          <span className="text-xs text-white/40">
                            {getTimeAgo(comment.created_at)}
                          </span>
                        </div>
                        <p className="text-sm text-white/85 leading-relaxed whitespace-pre-wrap">
                          {comment.content}
                        </p>
                      </div>

                      {/* Botão deletar */}
                      {canDelete && (
                        <button
                          onClick={() => handleDelete(comment.id)}
                          className="mt-1 ml-2 flex items-center gap-1 text-xs text-white/30 hover:text-[#C8102E] transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="h-3 w-3" />
                          <span>Deletar</span>
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}