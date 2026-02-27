import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Video, Play, ExternalLink, Loader2 } from "lucide-react";
import { supabase } from "../../lib/supabase";

interface VideoAnnouncement {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  is_active: boolean;
  created_at: string;
}

export function FounderVideoSection() {
  const [video, setVideo] = useState<VideoAnnouncement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadVideo() {
      try {
        // Buscar video mais recente ativo da tabela home_video_announcements
        // Se a tabela nao existir ainda, usa fallback silencioso
        const { data, error } = await supabase
          .from("home_video_announcements")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: false })
          .limit(1);

        if (!error && data && data.length > 0 && !cancelled) {
          setVideo(data[0]);
        }
      } catch {
        // Tabela pode nao existir ainda — silencioso
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadVideo();
    return () => { cancelled = true; };
  }, []);

  // Se nao tem video, nao renderiza nada (nao polui a landing)
  if (isLoading || !video) return null;

  // Detectar tipo de video (YouTube, Vimeo, direto)
  const isYoutube = video.video_url.includes("youtube.com") || video.video_url.includes("youtu.be");
  const isVimeo = video.video_url.includes("vimeo.com");

  function getEmbedUrl(url: string): string {
    if (url.includes("youtube.com/watch")) {
      const videoId = new URL(url).searchParams.get("v");
      return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }
    if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1]?.split("?")[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }
    if (url.includes("vimeo.com/")) {
      const videoId = url.split("vimeo.com/")[1]?.split("?")[0];
      return `https://player.vimeo.com/video/${videoId}?autoplay=1`;
    }
    return url;
  }

  return (
    <section className="w-full py-12 md:py-16" style={{ background: "#1A1A1A" }}>
      <div className="mx-auto max-w-[900px] px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-[#C8102E]/15 border border-[#C8102E]/25 flex items-center justify-center">
              <Video className="h-5 w-5 text-[#C8102E]" />
            </div>
            <div>
              <h2 className="text-white text-lg" style={{ fontWeight: 700 }}>Mural da Fundadora</h2>
              <p className="text-white/40 text-xs">Mensagem direta da Mila</p>
            </div>
          </div>

          {/* Video Player */}
          <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black aspect-video">
            {isPlaying && (isYoutube || isVimeo) ? (
              <iframe
                src={getEmbedUrl(video.video_url)}
                className="absolute inset-0 w-full h-full"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                title={video.title}
              />
            ) : isPlaying && !isYoutube && !isVimeo ? (
              <video
                src={video.video_url}
                className="absolute inset-0 w-full h-full object-cover"
                controls
                autoPlay
              />
            ) : (
              /* Thumbnail com botao play */
              <button
                onClick={() => setIsPlaying(true)}
                className="absolute inset-0 w-full h-full flex items-center justify-center group"
              >
                {video.thumbnail_url ? (
                  <img
                    src={video.thumbnail_url}
                    alt={video.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#C8102E]/20 to-[#1A1A1A]" />
                )}
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="relative w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-2xl"
                >
                  <Play className="h-7 w-7 text-[#C8102E] ml-1" />
                </motion.div>
              </button>
            )}
          </div>

          {/* Titulo e descricao */}
          <div className="mt-4">
            <h3 className="text-white text-base mb-1" style={{ fontWeight: 600 }}>{video.title}</h3>
            {video.description && (
              <p className="text-white/50 text-sm leading-relaxed">{video.description}</p>
            )}
            <p className="text-white/20 text-xs mt-2">
              {new Date(video.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
