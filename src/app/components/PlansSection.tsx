import { motion } from "motion/react";
import { Crown, Star, Zap, Check, Gift } from "lucide-react";

interface PlansSectionProps {
  onCtaClick?: () => void;
}

const PLANS = [
  {
    name: "Membro Fundador",
    badge: "VITALICIO",
    badgeColor: "#C8102E",
    icon: Gift,
    iconColor: "#C8102E",
    description: "Os primeiros 50 membros ganham acesso vitalicio. Sem mensalidade. Sem condicao. So presenca.",
    features: [
      "Acesso total a todas as comunidades",
      "Participacao em todas as lives e rituais",
      "Chat em tempo real",
      "Mensagens privadas",
      "Badge exclusivo de fundador",
      "Acesso eterno — mesmo quando virar pago",
    ],
    highlight: true,
    ctaText: "Garantir minha vaga",
  },
  {
    name: "Membro",
    badge: "MENSAL",
    badgeColor: "#0A8F85",
    icon: Star,
    iconColor: "#0A8F85",
    description: "Para quem chega depois dos fundadores. Mesmo acesso. Mesmo territorio.",
    features: [
      "Acesso total a todas as comunidades",
      "Todas as lives e rituais",
      "Chat e mensagens privadas",
      "Reconhecimentos e vinculos",
      "Busca e perfil completo",
    ],
    highlight: false,
    ctaText: "Em breve",
  },
  {
    name: "Fundador de Comunidade",
    badge: "LIDERANCA",
    badgeColor: "#FF6B35",
    icon: Crown,
    iconColor: "#FF6B35",
    description: "Para quem quer criar e liderar. Ate 4 comunidades proprias. Nucleo estrategico.",
    features: [
      "Tudo do plano Membro",
      "Criar ate 4 comunidades",
      "Moderar suas comunidades",
      "Sala de reunioes (diretoria)",
      "Criar e agendar rituais",
      "Acesso ao nucleo estrategico",
    ],
    highlight: false,
    ctaText: "Em breve",
  },
];

export function PlansSection({ onCtaClick }: PlansSectionProps) {
  return (
    <section className="w-full py-12 md:py-16" style={{ background: "#C8C8C8" }}>
      <div className="mx-auto max-w-[1200px] px-6 lg:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl md:text-4xl text-[#1A1A1A] mb-3" style={{ fontWeight: 700 }}>
            Estrutura de Pertencimento
          </h2>
          <p className="text-lg text-[#555] max-w-2xl mx-auto">
            Nao e assinatura. E investimento em territorio. Quem paga, participa. Quem participa, constroi.
          </p>
        </motion.div>

        {/* Plans grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan, idx) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.12 }}
              className={`relative bg-white rounded-2xl p-6 md:p-8 transition-all duration-300 ${
                plan.highlight
                  ? "border-3 border-[#C8102E]/40 shadow-xl ring-1 ring-[#C8102E]/10"
                  : "border-2 border-[#1A1A1A]/10 shadow-sm hover:shadow-md"
              }`}
            >
              {/* Destaque badge */}
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <motion.div
                    animate={{ y: [0, -3, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-[#C8102E] text-white rounded-full text-xs shadow-lg"
                    style={{ fontWeight: 700 }}
                  >
                    <Zap className="h-3 w-3" />
                    VAGAS LIMITADAS
                  </motion.div>
                </div>
              )}

              {/* Icon + Badge */}
              <div className="flex items-center gap-3 mb-5 mt-2">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: `${plan.iconColor}15`, border: `2px solid ${plan.iconColor}25` }}>
                  <plan.icon className="h-6 w-6" style={{ color: plan.iconColor }} />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full text-white"
                    style={{ background: plan.badgeColor, fontWeight: 700 }}>
                    {plan.badge}
                  </span>
                </div>
              </div>

              {/* Name */}
              <h3 className="text-xl text-[#1A1A1A] mb-3" style={{ fontWeight: 700 }}>
                {plan.name}
              </h3>

              {/* Description */}
              <p className="text-sm text-[#555] leading-relaxed mb-6">
                {plan.description}
              </p>

              {/* Features */}
              <ul className="space-y-2.5 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <Check className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: plan.iconColor }} />
                    <span className="text-sm text-[#333]">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <motion.button
                onClick={plan.highlight ? onCtaClick : undefined}
                whileHover={plan.highlight ? { scale: 1.02, y: -1 } : {}}
                whileTap={plan.highlight ? { scale: 0.98 } : {}}
                className={`w-full py-3.5 rounded-xl text-sm transition-all duration-300 ${
                  plan.highlight
                    ? "bg-[#C8102E] text-white shadow-lg hover:shadow-xl cursor-pointer"
                    : "bg-[#EBEBEB] text-[#999] border border-[#1A1A1A]/8 cursor-default"
                }`}
                style={{ fontWeight: 700 }}
                disabled={!plan.highlight}
              >
                {plan.ctaText}
              </motion.button>
            </motion.div>
          ))}
        </div>

        {/* Nota de transparencia */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-sm text-[#777] mt-8 max-w-xl mx-auto"
        >
          A cobranca so sera ativada quando o territorio tiver vida propria — rituais, encontros e pelo menos 3 eventos realizados com sucesso.
        </motion.p>
      </div>
    </section>
  );
}