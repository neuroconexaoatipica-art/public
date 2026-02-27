import { motion } from "motion/react";

export function ManifestoSection() {
  return (
    <section id="etica" className="w-full py-16 md:py-24 lg:py-28 bg-black">
      <div className="mx-auto max-w-[900px] px-6 lg:px-8">
        {/* Título */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl mb-4 font-semibold text-white">
            MANIFESTO NEUROCONEXÃO ATÍPICA
          </h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-[#C8102E] italic leading-relaxed font-medium"
          >
            Não fomos feitos para caber.<br />
            Fomos feitos para nos encontrar.
          </motion.p>
        </motion.div>

        {/* Conteúdo do Manifesto - Usando fonte Lora para texto longo */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative bg-[#1A1A1A] border-2 border-white/10 rounded-3xl p-8 md:p-12 lg:p-14 shadow-xl"
        >
          {/* Borda animada no hover */}
          <motion.div
            className="absolute inset-0 rounded-3xl border-2 border-transparent"
            whileHover={{ borderColor: "rgba(129,216,208,0.2)" }}
            transition={{ duration: 0.3 }}
          />

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.2
                }
              }
            }}
            className="space-y-8 text-lg md:text-xl leading-relaxed text-white font-manifesto"
          >
            <motion.p
              variants={{
                hidden: { opacity: 0, x: -20 },
                visible: { opacity: 1, x: 0 }
              }}
            >
              A NeuroConexão Atípica nasce onde a mente não precisa se esconder,<br />
              onde a diferença não pede permissão<br />
              e onde o vínculo não é raso.
            </motion.p>

            <motion.p
              variants={{
                hidden: { opacity: 0, x: -20 },
                visible: { opacity: 1, x: 0 }
              }}
              className="font-semibold text-[#C8102E]"
            >
              Aqui, conexão não é quantidade.<br />
              É qualidade de presença.
            </motion.p>

            <motion.p
              variants={{
                hidden: { opacity: 0, x: -20 },
                visible: { opacity: 1, x: 0 }
              }}
            >
              Não buscamos normalizar o que é singular.<br />
              Buscamos sustentar o encontro entre inteligências que pensam, sentem e percebem fora do padrão.
            </motion.p>

            <motion.div
              variants={{
                hidden: { opacity: 0, x: -20 },
                visible: { opacity: 1, x: 0 }
              }}
              className="bg-[#81D8D0]/10 border-l-4 border-[#81D8D0] pl-8 py-6 rounded-r-xl"
            >
              <p>
                Acreditamos no magnetismo entre mentes.<br />
                Na tensão que gera criação.<br />
                No desejo que não invade.<br />
                Na ética que não esfria.
              </p>
            </motion.div>

            <motion.p
              variants={{
                hidden: { opacity: 0, x: -20 },
                visible: { opacity: 1, x: 0 }
              }}
            >
              Não prometemos respostas prontas.<br />
              Oferecemos espaço.
            </motion.p>

            <motion.p
              variants={{
                hidden: { opacity: 0, x: -20 },
                visible: { opacity: 1, x: 0 }
              }}
              className="italic"
            >
              Espaço para pensar.<br />
              Espaço para sentir.<br />
              Espaço para se reconhecer no outro sem se perder de si.
            </motion.p>

            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
              className="pt-8 border-t border-white/20"
            >
              <p className="text-xl md:text-2xl font-bold text-center text-white">
                NeuroConexão Atípica<br />
                <span className="text-[#C8102E]">não é um lugar para todos.</span><br />
                É um lugar para quem sempre soube que não era comum<br />
                e nunca quis ser.
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}