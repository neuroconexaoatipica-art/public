import { motion } from "motion/react";
import { UserPlus, Users, Flame, MapPin } from "lucide-react";

const STEPS = [
  {
    icon: UserPlus,
    title: "Crie seu perfil",
    description: "Diga quem voce e. Sem filtro. Sem personagem. So voce.",
    color: "#C8102E",
  },
  {
    icon: Users,
    title: "Entre em comunidades",
    description: "14 territorios tematicos. Etica, desejo, criatividade, neurodivergencia. Escolha onde se reconhece.",
    color: "#81D8D0",
  },
  {
    icon: Flame,
    title: "Participe de rituais",
    description: "Confissao Intelectual. Pergunta de 24h. Teoria Nao Validada. Rituais que criam identidade, nao engagement.",
    color: "#FF6B35",
  },
  {
    icon: MapPin,
    title: "Encontre pessoas ao vivo",
    description: "Lives semanais. Encontros presenciais. Conexoes que saem da tela.",
    color: "#1A1A1A",
  },
];

export function HowItWorksSection() {
  return (
    <section className="w-full py-12 md:py-16" style={{ background: "#D4D4D4" }}>
      <div className="mx-auto max-w-[1100px] px-6 lg:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl md:text-4xl text-[#1A1A1A] mb-3" style={{ fontWeight: 700 }}>
            Como funciona
          </h2>
          <p className="text-lg text-[#555] max-w-xl mx-auto">
            Simples. Direto. Sem exagero.
          </p>
        </motion.div>

        {/* Steps grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((step, idx) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.12 }}
              className="relative bg-white border-2 border-[#1A1A1A]/10 rounded-2xl p-6 hover:border-[#1A1A1A]/25 transition-all duration-300 group"
            >
              {/* Step number */}
              <div className="absolute -top-3 -left-2 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm"
                style={{ background: step.color, fontWeight: 700 }}>
                {idx + 1}
              </div>

              {/* Icon */}
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors"
                style={{ background: `${step.color}15`, border: `2px solid ${step.color}25` }}>
                <step.icon className="h-6 w-6" style={{ color: step.color }} />
              </div>

              {/* Content */}
              <h3 className="text-[#1A1A1A] text-lg mb-2" style={{ fontWeight: 700 }}>
                {step.title}
              </h3>
              <p className="text-sm text-[#555] leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}