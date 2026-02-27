import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { UserAvatar } from "./UserAvatar";

interface Testimonial {
  id: string;
  content: string;
  author_name: string;
  author_photo: string | null;
  is_approved: boolean;
}

const FALLBACK_TESTIMONIALS: Testimonial[] = [
  {
    id: "f1",
    content: "Pela primeira vez na vida, eu nao preciso explicar por que penso diferente. Aqui, diferente e o padrao.",
    author_name: "Membro fundador",
    author_photo: null,
    is_approved: true,
  },
  {
    id: "f2",
    content: "Eu desisti de redes sociais ha 3 anos. Essa e a primeira que me fez querer voltar. Porque aqui tem gente de verdade.",
    author_name: "Membro fundador",
    author_photo: null,
    is_approved: true,
  },
  {
    id: "f3",
    content: "Os rituais mudaram minha semana. A Confissao Intelectual me fez perceber que vulnerabilidade intelectual e forca.",
    author_name: "Membro fundador",
    author_photo: null,
    is_approved: true,
  },
  {
    id: "f4",
    content: "Nunca pensei que ia encontrar um lugar onde falar sobre neurodivergencia nao fosse 'coitadismo'. Aqui e potencia.",
    author_name: "Membro fundador",
    author_photo: null,
    is_approved: true,
  },
];

export function TestimonialsCarousel() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(FALLBACK_TESTIMONIALS);
  const [current, setCurrent] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  useEffect(() => {
    async function loadTestimonials() {
      try {
        const { data, error } = await supabase
          .from("testimonials")
          .select("id, content, author_id")
          .eq("is_approved", true)
          .order("created_at", { ascending: false })
          .limit(10);

        if (!error && data && data.length > 0) {
          const authorIds = [...new Set(data.map(t => t.author_id))];
          const { data: authors } = await supabase
            .from("users")
            .select("id, name, profile_photo")
            .in("id", authorIds);

          const authorMap: Record<string, { name: string; photo: string | null }> = {};
          (authors || []).forEach((a: any) => {
            authorMap[a.id] = { name: a.name, photo: a.profile_photo };
          });

          setTestimonials(
            data.map(t => ({
              id: t.id,
              content: t.content,
              author_name: authorMap[t.author_id]?.name || "Membro",
              author_photo: authorMap[t.author_id]?.photo || null,
              is_approved: true,
            }))
          );
        }
      } catch {
        // Usar fallback silenciosamente
      }
    }
    loadTestimonials();
  }, []);

  const next = useCallback(() => {
    setCurrent(c => (c + 1) % testimonials.length);
  }, [testimonials.length]);

  const prev = useCallback(() => {
    setCurrent(c => (c - 1 + testimonials.length) % testimonials.length);
  }, [testimonials.length]);

  // Auto-rotate
  useEffect(() => {
    if (!autoPlay) return;
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [autoPlay, next]);

  if (testimonials.length === 0) return null;

  return (
    <section className="w-full py-16 md:py-20" style={{ background: "#D4D4D4" }}>
      <div className="mx-auto max-w-[900px] px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#C8102E]/10 border border-[#C8102E]/20 rounded-full mb-4">
            <Quote className="h-4 w-4 text-[#C8102E]" />
            <span className="text-xs text-[#C8102E] uppercase tracking-wider" style={{ fontWeight: 700 }}>
              Vozes de dentro
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl text-[#1A1A1A] mb-2" style={{ fontWeight: 600 }}>
            O que dizem os membros
          </h2>
          <p className="text-sm text-[#777]">
            Depoimentos reais de quem vive a plataforma
          </p>
        </motion.div>

        {/* Carousel */}
        <div
          className="relative"
          onMouseEnter={() => setAutoPlay(false)}
          onMouseLeave={() => setAutoPlay(true)}
        >
          <div className="min-h-[200px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={testimonials[current].id}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.4 }}
                className="w-full bg-white rounded-3xl p-8 md:p-10 border-2 border-[#1A1A1A]/8 shadow-sm text-center"
              >
                {/* Quote mark */}
                <Quote className="h-8 w-8 text-[#C8102E]/20 mx-auto mb-4" />

                {/* Content */}
                <p className="text-lg md:text-xl text-[#1A1A1A] leading-relaxed mb-6 italic" style={{ fontWeight: 400 }}>
                  "{testimonials[current].content}"
                </p>

                {/* Author */}
                <div className="flex items-center justify-center gap-3">
                  <UserAvatar
                    name={testimonials[current].author_name}
                    photoUrl={testimonials[current].author_photo}
                    size="md"
                  />
                  <div className="text-left">
                    <p className="text-sm text-[#1A1A1A]" style={{ fontWeight: 600 }}>
                      {testimonials[current].author_name}
                    </p>
                    <p className="text-xs text-[#999]">Membro da comunidade</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={prev}
              className="w-10 h-10 rounded-full bg-white border-2 border-[#1A1A1A]/10 flex items-center justify-center hover:border-[#C8102E]/30 transition-colors"
            >
              <ChevronLeft className="h-5 w-5 text-[#1A1A1A]" />
            </button>

            {/* Dots */}
            <div className="flex gap-2">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrent(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    idx === current
                      ? "bg-[#C8102E] w-6"
                      : "bg-[#1A1A1A]/20 hover:bg-[#1A1A1A]/40"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="w-10 h-10 rounded-full bg-white border-2 border-[#1A1A1A]/10 flex items-center justify-center hover:border-[#C8102E]/30 transition-colors"
            >
              <ChevronRight className="h-5 w-5 text-[#1A1A1A]" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
