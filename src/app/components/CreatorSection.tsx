import { motion } from "motion/react";
import { Quote } from "lucide-react";
import { useState } from "react";

const milaImg = "/mila-creator.png";

export function CreatorSection() {
  const [imgError, setImgError] = useState(false);

  return (
    <section className="w-full py-12 md:py-16" style={{ background: "#C8C8C8" }}>
      <div className="mx-auto max-w-[1100px] px-6 lg:px-8">
        {/* Título */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-4xl lg:text-5xl mb-10 text-center font-semibold text-[#1A1A1A]"
        >
          Criadora deste espaço
        </motion.h2>

        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
          {/* Imagem com efeito parallax */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="w-full lg:w-4/12"
          >
            <div className="relative group">
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="aspect-square max-w-[280px] mx-auto rounded-3xl overflow-hidden shadow-xl ring-4 ring-[#81D8D0]/20"
              >
                {imgError ? (
                  <div className="w-full h-full bg-gradient-to-br from-[#C8102E]/30 to-[#81D8D0]/30 flex items-center justify-center">
                    <span className="text-6xl text-white/60 font-bold">M</span>
                  </div>
                ) : (
                  <img
                    src={milaImg}
                    alt="Mila, criadora da NeuroConexão Atípica"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={() => setImgError(true)}
                  />
                )}
              </motion.div>
              
              {/* Elemento decorativo - Tiffany (campo de segurança) */}
              <div className="absolute -bottom-6 -right-6 w-40 h-40 bg-[#81D8D0]/20 rounded-3xl -z-10 blur-2xl" />
            </div>
          </motion.div>

          {/* Texto */}
          <div className="w-full lg:w-7/12 space-y-6">
            {/* Quote icon - Vermelho (pulsão) */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 0.15 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Quote className="h-16 w-16 text-[#C8102E]" />
            </motion.div>

            {/* Parágrafos com animação stagger */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.15
                  }
                }
              }}
              className="space-y-6 text-lg md:text-xl leading-relaxed text-[#333]"
            >
              <motion.p
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
              >
                <strong className="text-2xl font-bold">Sou a Mila.</strong><br />
                Há 31 anos sentindo demais.
              </motion.p>

              <motion.p
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
                className="font-medium"
              >
                TDAH, bipolar, e alguém que aprendeu cedo que sentir fundo, muitas vezes, é sentir sozinha.
              </motion.p>

              <motion.p
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
              >
                O NeuroConexão Atípica nasceu de uma necessidade real: criar um lugar onde intensidade não fosse tratada como defeito e onde cuidado não precisasse vir acompanhado de culpa, vergonha ou silêncio.
              </motion.p>

              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
                className="border-l-4 border-[#C8102E] pl-6 py-2 bg-[#C8102E]/5 rounded-r-lg"
              >
                <p className="italic font-medium">
                  Não sou especialista na sua vida.<br />
                  Não estou aqui para te consertar<br />
                  nem para te dizer como sentir.
                </p>
              </motion.div>

              <motion.p
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
                className="font-bold text-[#C8102E]"
              >
                Sou alguém que construiu o espaço que precisou<br />
                e que talvez você também estivesse procurando.
              </motion.p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}