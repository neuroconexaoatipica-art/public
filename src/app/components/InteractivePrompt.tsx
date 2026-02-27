import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, MessageCircle, Heart, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { supabase } from "../../lib/supabase";

interface InteractivePromptProps {
  promptType: "desafio" | "pergunta";
  title: string;
  subtitle?: string;
  text: string;
  author?: string;
  icon: React.ReactNode;
  borderColor: string;
  accentColor: string;
}

interface PromptResponse {
  id: string;
  author_name: string;
  content: string;
  likes: number;
  created_at: string;
}

export function InteractivePrompt({
  promptType,
  title,
  subtitle,
  text,
  author,
  icon,
  borderColor,
  accentColor,
}: InteractivePromptProps) {
  const [responses, setResponses] = useState<PromptResponse[]>([]);
  const [showResponses, setShowResponses] = useState(false);
  const [newResponse, setNewResponse] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isLoadingResponses, setIsLoadingResponses] = useState(false);
  const [responseCount, setResponseCount] = useState(0);

  // Carregar contagem de respostas
  useEffect(() => {
    async function loadCount() {
      try {
        // Busca posts publicos marcados com tag do prompt
        const tag = promptType === "desafio" ? "[DESAFIO]" : "[PERGUNTA]";
        const { data, error } = await supabase
          .from("posts")
          .select("id", { count: "exact" })
          .eq("is_public", true)
          .ilike("content", `${tag}%`)
          .limit(0);

        if (!error) {
          setResponseCount((data as any)?.length || 0);
        }
      } catch {
        // Silencioso
      }
    }
    loadCount();
  }, [promptType]);

  // Carregar respostas quando abrir
  const loadResponses = async () => {
    setIsLoadingResponses(true);
    try {
      const tag = promptType === "desafio" ? "[DESAFIO]" : "[PERGUNTA]";
      const { data: posts } = await supabase
        .from("posts")
        .select("id, content, author, created_at")
        .eq("is_public", true)
        .ilike("content", `${tag}%`)
        .order("created_at", { ascending: false })
        .limit(10);

      if (posts && posts.length > 0) {
        const authorIds = [...new Set(posts.map(p => p.author))];
        const { data: authors } = await supabase
          .from("users")
          .select("id, name")
          .in("id", authorIds);

        const authorMap: Record<string, string> = {};
        (authors || []).forEach((a: any) => { authorMap[a.id] = a.name; });

        setResponses(posts.map(p => ({
          id: p.id,
          author_name: authorMap[p.author] || "Membro",
          content: p.content.replace(/^\[(DESAFIO|PERGUNTA)\]\s*/, ""),
          likes: 0,
          created_at: p.created_at,
        })));
        setResponseCount(posts.length);
      }
    } catch {
      // Silencioso
    }
    setIsLoadingResponses(false);
  };

  const handleToggleResponses = () => {
    if (!showResponses) {
      loadResponses();
    }
    setShowResponses(!showResponses);
  };

  const handleSubmit = async () => {
    if (!newResponse.trim()) return;
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Usuario logado — criar post publico
        const tag = promptType === "desafio" ? "[DESAFIO]" : "[PERGUNTA]";
        await supabase.from("posts").insert({
          content: `${tag} ${newResponse.trim()}`,
          author: user.id,
          is_public: true,
        });
        setSubmitted(true);
        setNewResponse("");
        // Recarregar respostas
        if (showResponses) loadResponses();
        setResponseCount(prev => prev + 1);
      } else {
        // Visitante — salvar como contact_request
        await supabase.from("contact_requests").insert({
          reason: "other",
          message: `[${promptType.toUpperCase()} RESPOSTA] ${newResponse.trim()}`,
          status: "pending",
        });
        setSubmitted(true);
        setNewResponse("");
      }
    } catch (err) {
      console.error("Erro ao enviar resposta:", err);
    }

    setIsSubmitting(false);
    setTimeout(() => setSubmitted(false), 3000);
  };

  function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white rounded-2xl p-5 transition-all"
      style={{ border: `2px solid ${borderColor}` }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <div>
          <h3 className="text-[#1A1A1A] text-sm" style={{ fontWeight: 700 }}>{title}</h3>
          {subtitle && (
            <span className="text-[10px] uppercase tracking-wider" style={{ color: `${accentColor}99`, fontWeight: 600 }}>
              {subtitle}
            </span>
          )}
        </div>
      </div>

      {/* Texto do prompt */}
      <p className="text-[#333] text-sm leading-relaxed mb-3" style={{ fontFamily: "Lora, serif", fontStyle: "italic" }}>
        "{text}"
      </p>
      {author && (
        <span className="text-xs" style={{ color: `${accentColor}99` }}>— {author}</span>
      )}

      {/* Area de resposta — aberta para todos */}
      <div className="mt-4 pt-3 border-t border-[#1A1A1A]/8">
        {submitted ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-center py-2"
            style={{ color: accentColor, fontWeight: 600 }}
          >
            Resposta registrada!
          </motion.p>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              value={newResponse}
              onChange={(e) => setNewResponse(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="Sua resposta..."
              maxLength={500}
              className="flex-1 px-3 py-2 bg-[#F5F5F5] border border-[#1A1A1A]/8 rounded-lg text-sm text-[#1A1A1A] placeholder:text-[#999] focus:border-[#1A1A1A]/20 focus:outline-none"
            />
            <motion.button
              onClick={handleSubmit}
              disabled={!newResponse.trim() || isSubmitting}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg text-white disabled:opacity-40 transition-opacity"
              style={{ background: accentColor }}
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </motion.button>
          </div>
        )}
      </div>

      {/* Ver respostas */}
      <button
        onClick={handleToggleResponses}
        className="w-full flex items-center justify-center gap-1.5 mt-3 py-1.5 text-xs transition-colors hover:text-[#1A1A1A]"
        style={{ color: "#999", fontWeight: 600 }}
      >
        <MessageCircle className="h-3 w-3" />
        {responseCount > 0 ? `${responseCount} respostas` : "Ver respostas"}
        {showResponses ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>

      {/* Lista de respostas */}
      <AnimatePresence>
        {showResponses && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-2 pt-2 border-t border-[#1A1A1A]/5 space-y-2">
              {isLoadingResponses ? (
                <div className="py-4 text-center">
                  <Loader2 className="h-4 w-4 animate-spin mx-auto" style={{ color: accentColor }} />
                </div>
              ) : responses.length === 0 ? (
                <p className="text-xs text-[#999] text-center py-3">
                  Nenhuma resposta ainda. Seja a primeira pessoa!
                </p>
              ) : (
                responses.map((r) => (
                  <div key={r.id} className="flex gap-2 p-2 rounded-lg bg-[#F9F9F9]">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-[#1A1A1A]" style={{ fontWeight: 700 }}>{r.author_name}</span>
                        <span className="text-[9px] text-[#CCC]">{timeAgo(r.created_at)}</span>
                      </div>
                      <p className="text-xs text-[#555] mt-0.5 leading-relaxed">{r.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
