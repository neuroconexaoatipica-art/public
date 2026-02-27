import { motion } from "motion/react";
import {
  UserCheck,
  CheckCircle,
  Shield,
  MessageCircle,
  Flame,
  MapPin,
} from "lucide-react";

interface ClaritySectionProps {
  onCtaClick: () => void;
}

export function ClaritySection({ onCtaClick }: ClaritySectionProps) {
  const steps = [
    {
      icon: UserCheck,
      title: "Confirmação 18+ e aceite do código cultural",
      description:
        "Responsabilidade pessoal é pré-requisito. Sem confirmação, não entra.",
    },
    {
      icon: CheckCircle,
      title: "Perfil criado e comunidades liberadas",
      description:
        "Acesse todas as 14 comunidades desde o primeiro momento. Escolha onde pulsar.",
    },
    {
      icon: Flame,
      title: "Ritual de entrada respondido",
      description:
        "Sem ritual, não vira membro ativo. O ritual ancora a presença.",
    },
    {
      icon: MapPin,
      title: "Escolha seu estado e núcleo territorial",
      description:
        "Conecte-se com quem está perto. Lives territoriais, encontros reais.",
    },
    {
      icon: Shield,
      title: "Candidatura a Founder — curadoria ética",
      description:
        "Founders constroem a base. A seleção é humana e cuidadosa.",
    },
    {
      icon: MessageCircle,
      title: "Contato humano estruturado",
      description: "Nada automatizado. Cada interação é real.",
    },
  ];

  return (
    <section className="w-full py-16 md:py-24 lg:py-28" style={{ background: "#D4D4D4" }}>
      <div className="mx-auto max-w-[900px] px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2
            className="text-3xl md:text-4xl lg:text-5xl mb-6 text-[#1A1A1A]"
            style={{ fontWeight: 600 }}
          >
            O que acontece depois do cadastro
          </h2>
          <p className="text-lg md:text-xl text-[#666] max-w-2xl mx-auto leading-relaxed">
            Transparência total. Sem surpresas. Entrada ritualizada.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="space-y-4 mb-14">
          {steps.map((step, i) => {
            const IconComponent = step.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.08 * i }}
                className="flex items-start gap-5 bg-white border border-black/5 rounded-xl p-5 hover:border-[#81D8D0]/30 transition-colors group shadow-sm"
              >
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-xs text-[#CCC] w-5 text-right" style={{ fontWeight: 600 }}>
                    {i + 1}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-[#81D8D0]/15 flex items-center justify-center">
                    <IconComponent className="h-5 w-5 text-[#81D8D0]" />
                  </div>
                </div>
                <div>
                  <h3
                    className="text-[#1A1A1A] mb-1 group-hover:text-[#0A8F85] transition-colors"
                    style={{ fontWeight: 600 }}
                  >
                    {step.title}
                  </h3>
                  <p className="text-[#777] text-sm">{step.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Reforço final */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center"
        >
          <p className="text-lg text-[#999] italic mb-8">
            Sem automatização invasiva.
            <br />
            Sem spam.
            <br />
            Sem pressão.
          </p>

          <motion.button
            onClick={onCtaClick}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="inline-block px-10 py-4 bg-[#81D8D0] text-black rounded-xl text-lg shadow-lg hover:shadow-xl transition-all"
            style={{ fontWeight: 700 }}
          >
            Entrar na Comunidade
          </motion.button>

          <p className="text-xs text-[#CCC] mt-6">
            NeuroConexão Atípica — Onde intensidade não é defeito.
          </p>
        </motion.div>
      </div>
    </section>
  );
}