import { motion } from "motion/react";
import { Shield, AlertTriangle, CheckCircle, Users, Scale, XCircle } from "lucide-react";

export function EthicsPage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="w-full py-20 md:py-28 bg-gradient-to-b from-[#35363A] to-black">
        <div className="mx-auto max-w-[900px] px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Shield className="h-16 w-16 text-[#81D8D0] mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-white mb-6">
              Ética e Governança
            </h1>
            <p className="text-xl md:text-2xl text-white/80 font-normal">
              Este espaço é sustentado por escolhas conscientes.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Governança Centralizada */}
      <section className="w-full py-16 md:py-20 bg-black">
        <div className="mx-auto max-w-[900px] px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-white/3 border-2 border-[#C8102E]/30 rounded-2xl p-8 md:p-10"
          >
            <div className="flex items-center gap-3 mb-4">
              <Scale className="h-8 w-8 text-[#C8102E]" />
              <h2 className="text-2xl md:text-3xl font-semibold text-white">
                Governança Centralizada
              </h2>
            </div>
            
            <p className="text-xl font-semibold text-white mb-4">
              O NeuroConexão Atípica não é democrático.
            </p>

            <div className="space-y-4 text-lg text-white/80 font-normal leading-relaxed">
              <p>
                A governança é centralizada porque segurança exige clareza de responsabilidade.
              </p>
              <p>
                Decisões finais sobre moderação, comunidades e eventos são tomadas pela equipe de governança (liderada pela Mila).
              </p>
              <p className="font-semibold text-white">
                Isso não é controle arbitrário. É cuidado estrutural.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* O que NÃO toleramos */}
      <section className="w-full py-16 md:py-20 bg-black">
        <div className="mx-auto max-w-[900px] px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <XCircle className="h-8 w-8 text-[#C8102E]" />
              <h2 className="text-2xl md:text-3xl font-semibold text-white">
                O que NÃO toleramos
              </h2>
            </div>

            <div className="space-y-4">
              {[
                "Violência de qualquer tipo (física, psicológica, sexual)",
                "Discurso de ódio (racismo, lgbtfobia, capacitismo, etc.)",
                "Assédio, stalking ou insistência não consentida",
                "Compartilhamento de conteúdo privado sem consentimento",
                "Manipulação emocional ou gaslighting",
                "Spam, propaganda ou autopromoção não solicitada",
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex items-start gap-3 bg-[#C8102E]/5 border border-[#C8102E]/20 rounded-xl p-4"
                >
                  <div className="flex-shrink-0 w-2 h-2 rounded-full bg-[#C8102E] mt-2" />
                  <span className="text-white/90 font-normal text-lg">{item}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* O que sustentamos */}
      <section className="w-full py-16 md:py-20 bg-black">
        <div className="mx-auto max-w-[900px] px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <CheckCircle className="h-8 w-8 text-[#81D8D0]" />
              <h2 className="text-2xl md:text-3xl font-semibold text-white">
                O que sustentamos
              </h2>
            </div>

            <div className="space-y-4">
              {[
                "Consentimento explícito em todas as interações",
                "Responsabilidade pelo que se diz e faz",
                "Intensidade emocional sem violência",
                "Conflito construtivo, não destrutivo",
                "Vulnerabilidade honesta, não manipulação",
                "Diversidade de experiências e perspectivas",
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex items-start gap-3 bg-[#81D8D0]/5 border border-[#81D8D0]/20 rounded-xl p-4"
                >
                  <CheckCircle className="h-6 w-6 text-[#81D8D0] flex-shrink-0" />
                  <span className="text-white/90 font-normal text-lg">{item}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Processo de Moderação */}
      <section className="w-full py-16 md:py-20 bg-black">
        <div className="mx-auto max-w-[900px] px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <AlertTriangle className="h-8 w-8 text-[#FF6B35]" />
              <h2 className="text-2xl md:text-3xl font-semibold text-white">
                Processo de Moderação
              </h2>
            </div>

            <div className="space-y-6">
              <div className="bg-white/3 border border-white/10 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-3">
                  1. Denúncia
                </h3>
                <p className="text-white/80 font-normal">
                  Qualquer membro pode denunciar conteúdo ou comportamento que viole as diretrizes.
                </p>
              </div>

              <div className="bg-white/3 border border-white/10 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-3">
                  2. Análise
                </h3>
                <p className="text-white/80 font-normal">
                  A equipe de governança analisa a denúncia com cuidado e contexto.
                </p>
              </div>

              <div className="bg-white/3 border border-white/10 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-3">
                  3. Ação
                </h3>
                <p className="text-white/80 font-normal mb-3">
                  Dependendo da gravidade:
                </p>
                <ul className="space-y-2 ml-4">
                  {[
                    "Advertência privada",
                    "Remoção de conteúdo",
                    "Suspensão temporária (7 a 30 dias)",
                    "Banimento permanente (casos graves)",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-white/80">
                      <span className="text-[#81D8D0]">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white/3 border border-white/10 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-3">
                  4. Transparência
                </h3>
                <p className="text-white/80 font-normal">
                  O denunciante é informado sobre a resolução (sem detalhes da punição).
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Papel dos Fundadores */}
      <section className="w-full py-16 md:py-20 bg-black">
        <div className="mx-auto max-w-[900px] px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-[#81D8D0]/10 to-[#81D8D0]/5 border border-[#81D8D0]/30 rounded-2xl p-8 md:p-10"
          >
            <div className="flex items-center gap-3 mb-6">
              <Users className="h-8 w-8 text-[#81D8D0]" />
              <h2 className="text-2xl md:text-3xl font-semibold text-white">
                Papel dos Fundadores
              </h2>
            </div>

            <p className="text-lg text-white/80 font-normal mb-6">
              Fundadores têm poder para criar e gerenciar comunidades e eventos.
            </p>

            <p className="text-lg font-semibold text-white mb-4">
              Mas poder vem com responsabilidade:
            </p>

            <ul className="space-y-3">
              {[
                "Fundadores passam por curadoria ética antes de aprovação",
                "Fundadores podem perder status se violarem diretrizes",
                "Fundadores são exemplo de comportamento ético",
                "Fundadores não têm imunidade de moderação",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-white/90">
                  <CheckCircle className="h-5 w-5 text-[#81D8D0] flex-shrink-0 mt-0.5" />
                  <span className="font-normal">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* Suas responsabilidades */}
      <section className="w-full py-16 md:py-24 bg-black">
        <div className="mx-auto max-w-[900px] px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl md:text-3xl font-semibold text-white mb-8">
              Suas responsabilidades
            </h2>

            <div className="bg-white/5 border-2 border-white/10 rounded-2xl p-8">
              <p className="text-lg text-white/80 font-normal mb-6">
                Ao usar o NeuroConexão Atípica, você concorda em:
              </p>

              <ul className="space-y-4">
                {[
                  "Respeitar os limites de outras pessoas",
                  "Pedir consentimento antes de interações íntimas ou profundas",
                  "Denunciar comportamentos violadores",
                  "Aceitar as decisões da governança",
                  "Sair do espaço se ele não for mais adequado para você",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-white/90">
                    <CheckCircle className="h-5 w-5 text-[#81D8D0] flex-shrink-0 mt-0.5" />
                    <span className="font-normal text-lg">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 text-center">
              <p className="text-xl md:text-2xl font-semibold text-white">
                Este não é um espaço de "tudo pode".
              </p>
              <p className="text-xl md:text-2xl font-semibold text-[#81D8D0] mt-2">
                É um espaço de "tudo pode dentro de ética clara".
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
