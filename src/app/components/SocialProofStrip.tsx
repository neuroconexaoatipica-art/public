import { motion } from "motion/react";
import { Flame, Users, Shield, Video, Brain } from "lucide-react";

// ═══════════════════════════════════════════════════════════
// SOCIAL PROOF STRIP — Mostra DIFERENCIAIS, não métricas vazias
// Nunca expõe número de membros (plataforma em beta)
// ═══════════════════════════════════════════════════════════

const DIFERENCIAIS = [
  {
    icon: Users,
    label: "14 comunidades temáticas",
    sublabel: "Com manifesto e ritual próprio",
    color: "#81D8D0",
  },
  {
    icon: Flame,
    label: "8 rituais culturais",
    sublabel: "Práticas únicas, não algoritmos",
    color: "#C8102E",
  },
  {
    icon: Video,
    label: "Lives semanais ao vivo",
    sublabel: "Com temas escolhidos pela comunidade",
    color: "#FF6B35",
  },
  {
    icon: Shield,
    label: "Curadoria humana",
    sublabel: "Sem algoritmo, sem anúncio, sem like",
    color: "#0A8F85",
  },
  {
    icon: Brain,
    label: "Feita por neurodivergentes",
    sublabel: "Para quem pensa diferente",
    color: "#C8102E",
  },
];

export function SocialProofStrip() {
  return (
    <section className="w-full py-10 md:py-14" style={{ background: "#1A1A1A" }}>
      <div className="mx-auto max-w-[1200px] px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Label */}
          <p className="text-center text-xs text-white/40 uppercase tracking-[0.2em] mb-8" style={{ fontWeight: 600 }}>
            O que faz a NeuroConexão diferente de tudo
          </p>

          {/* Diferenciais */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-4">
            {DIFERENCIAIS.map((item, idx) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="text-center group"
              >
                <div className="flex items-center justify-center mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                    style={{ background: `${item.color}15`, border: `1px solid ${item.color}30` }}
                  >
                    <item.icon className="h-5 w-5" style={{ color: item.color }} />
                  </div>
                </div>
                <p className="text-sm text-white mb-0.5" style={{ fontWeight: 700 }}>
                  {item.label}
                </p>
                <p className="text-[11px] text-white/40" style={{ fontWeight: 500 }}>
                  {item.sublabel}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
