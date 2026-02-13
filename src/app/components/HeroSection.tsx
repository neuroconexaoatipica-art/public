import { motion } from "motion/react";
import { Sparkles } from "lucide-react";

interface HeroSectionProps {
  onCtaClick: () => void;
}

export function HeroSection({ onCtaClick }: HeroSectionProps) {
  return (
    <section className="relative w-full py-16 md:py-24 lg:py-32 xl:py-40 bg-black overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ y: [0, -20, 0], x: [0, 10, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 right-10 w-64 h-64 bg-gradient-to-br from-[#81D8D0]/20 to-[#81D8D0]/5 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ y: [0, 20, 0], x: [0, -15, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-20 left-10 w-80 h-80 bg-gradient-to-tl from-[#C8102E]/10 to-transparent rounded-full blur-3xl"
        />
      </div>

      <div className="relative mx-auto max-w-[1100px] px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="flex justify-center mb-10">
            <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-5 py-2.5 shadow-sm">
              <Sparkles className="h-4 w-4 text-[#81D8D0]" />
              <span className="text-sm font-medium text-white/90">Mentes intensas, conexões reais</span>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="mb-12 space-y-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight text-white text-center font-normal">
              Um lugar onde{" "}
              <span className="font-semibold text-[#C8102E]">mentes intensas</span>
              <br />
              podem se encontrar
              <br />
              sem pedir desculpa por estar vivas.
            </h1>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.6 }} className="text-center space-y-3 text-lg md:text-xl lg:text-2xl text-white/80 font-normal">
              <p>Não é um espaço de <span className="italic">"cura etérea"</span>.</p>
              <p>Não é um refúgio de gente que quer se anestesiar.</p>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.9 }} className="text-center space-y-6">
              <p className="text-2xl md:text-3xl lg:text-4xl font-semibold text-white">
                É um espaço de gente viva.
              </p>
              <div className="text-lg md:text-xl lg:text-2xl text-white/90">
                <p className="mb-3 font-medium">Gente que:</p>
                <div className="space-y-1.5 font-light">
                  <p>pensa rápido</p><p>sente fundo</p><p>deseja</p><p>cria</p><p>erra</p><p>ama</p><p>se excita intelectualmente</p><p>se conecta</p>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 1.2 }} className="text-center space-y-2 pt-6">
              <p className="text-xl md:text-2xl lg:text-3xl text-white font-normal">
                Conexões mentais profundas não são calmas.
              </p>
              <p className="text-2xl md:text-3xl lg:text-4xl font-semibold text-[#C8102E]">
                Elas são elétricas.
              </p>
            </motion.div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 1.5 }} className="flex flex-col items-center gap-6">
            <motion.button
              onClick={onCtaClick}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="group relative inline-block text-base md:text-lg lg:text-xl px-8 md:px-10 lg:px-12 py-4 md:py-5 bg-[#81D8D0] text-black rounded-xl transition-all duration-300 shadow-xl hover:shadow-2xl font-semibold overflow-hidden"
            >
              <span className="relative z-10">
                Entre inteiro(a). Você pertence a este lugar.
              </span>
              <motion.div
                className="absolute inset-0 bg-[#81D8D0]/80"
                initial={{ x: "-100%" }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.3 }}
              />
            </motion.button>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 1.7 }} className="text-sm md:text-base text-[#C0C0C0] italic text-center max-w-2xl">
              Este espaço está vivo, em fase inicial.<br />
              Continuamente estaremos aperfeiçoando.
            </motion.p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
