import { motion } from "motion/react";
import { Sparkles, ChevronDown, Calendar } from "lucide-react";

interface HeroSectionProps {
  onCtaClick: () => void;
  onScrollToAgenda?: () => void;
  onScrollToNucleo?: () => void;
}

export function HeroSection({ onCtaClick, onScrollToAgenda }: HeroSectionProps) {
  return (
    <section className="relative w-full min-h-[80vh] flex items-center justify-center overflow-hidden" style={{ background: "linear-gradient(180deg, #C8C8C8 0%, #D4D4D4 100%)" }}>
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ y: [0, -30, 0], x: [0, 15, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-10 right-10 w-80 h-80 bg-gradient-to-br from-[#81D8D0]/20 to-[#81D8D0]/5 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ y: [0, 25, 0], x: [0, -20, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-20 left-10 w-96 h-96 bg-gradient-to-tl from-[#C8102E]/8 to-transparent rounded-full blur-3xl"
        />
        <motion.div
          animate={{ y: [0, -20, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-gradient-to-br from-[#C8102E]/4 to-[#81D8D0]/4 rounded-full blur-3xl"
        />
        {/* Particulas flutuantes */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ y: [0, -40 - i * 6, 0], opacity: [0.05, 0.25, 0.05] }}
            transition={{ duration: 5 + i * 1.2, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}
            className="absolute w-1 h-1 bg-[#81D8D0] rounded-full"
            style={{ top: `${10 + i * 7}%`, left: `${5 + i * 8}%` }}
          />
        ))}
      </div>

      <div className="relative mx-auto max-w-[1100px] px-6 lg:px-8 py-12 md:py-16">
        <div className="max-w-5xl mx-auto text-center">

          {/* Badge 18+ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex justify-center mb-10"
          >
            <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-sm border-2 border-[#1A1A1A]/15 rounded-full px-5 py-2.5 shadow-sm">
              <Sparkles className="h-4 w-4 text-[#81D8D0]" />
              <span className="text-sm text-[#1A1A1A]">Rede adulta para mentes intensas e neurodivergentes</span>
            </div>
          </motion.div>

          {/* TITULO GIGANTE — O ORKUT VOLTOU */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-3"
          >
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-[#1A1A1A] tracking-tight" style={{ fontWeight: 800, lineHeight: 1.05 }}>
              O ORKUT{" "}
              <motion.span
                animate={{ color: ["#C8102E", "#E01030", "#C8102E"] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                VOLTOU.
              </motion.span>
            </h1>
          </motion.div>

          {/* SUBTITULO */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-xl sm:text-2xl md:text-3xl mb-10"
            style={{ color: "#0A8F85", fontFamily: "Lora, serif", fontStyle: "italic" }}
          >
            O Orkut das mentes intensas e neurodivergentes.
          </motion.p>

          {/* MANIFESTO CURTO */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="max-w-2xl mx-auto mb-12"
          >
            <div className="space-y-1.5">
              <p className="text-lg md:text-xl text-[#333]">Um territorio sem algoritmo.</p>
              <p className="text-lg md:text-xl text-[#333]">Sem disputa por validacao.</p>
              <p className="text-lg md:text-xl text-[#333]">Sem exposicao forcada.</p>
              <p className="text-lg md:text-xl text-[#1A1A1A]" style={{ fontWeight: 600 }}>
                So pertencimento estruturado.
              </p>
            </div>
          </motion.div>

          {/* BOTOES */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            {/* CTA PRINCIPAL */}
            <motion.button
              onClick={onCtaClick}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 text-base md:text-lg px-10 md:px-12 py-4 md:py-5 bg-[#C8102E] text-white rounded-xl transition-all duration-300 shadow-xl hover:shadow-2xl"
              style={{ fontWeight: 700 }}
            >
              Quero fazer parte
            </motion.button>

            {/* CTA SECUNDARIO */}
            <motion.button
              onClick={onScrollToAgenda}
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 text-base md:text-lg px-8 md:px-10 py-4 md:py-5 bg-white/80 backdrop-blur-sm text-[#1A1A1A] border-2 border-[#1A1A1A]/20 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:border-[#1A1A1A]/35"
              style={{ fontWeight: 600 }}
            >
              <Calendar className="h-5 w-5 text-[#C8102E]" />
              Ver proximas lives
            </motion.button>
          </motion.div>

          {/* PROVA SOCIAL — vagas */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.8 }}
            className="mt-8"
          >
            <p className="text-sm text-[#666]">
              Primeiros <span className="text-[#C8102E]" style={{ fontWeight: 700 }}>50 membros</span> com acesso vitalicio gratuito
            </p>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 1 }}
            className="mt-10"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="flex flex-col items-center gap-2 text-[#999]"
            >
              <ChevronDown className="h-5 w-5" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}