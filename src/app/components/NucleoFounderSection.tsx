import { forwardRef } from "react";
import { motion } from "motion/react";
import { Crown, Users, Video, Landmark, Calendar, Shield, Flame, Star } from "lucide-react";

export const NucleoFounderSection = forwardRef<HTMLElement>(
  function NucleoFounderSection(_props, ref) {
    const founderRoles = [
      {
        icon: Users,
        title: "Criar e moderar comunidades",
        text: "Founders dão vida a comunidades temáticas. Definem manifesto, rituais e cultura interna.",
      },
      {
        icon: Video,
        title: "Organizar lives e debates",
        text: "Lives autorais, rodas de escuta, debates profundos. O founder é quem convoca.",
      },
      {
        icon: Landmark,
        title: "Governança e cultura",
        text: "Participam das decisões iniciais. Moldam as diretrizes que vão definir a plataforma.",
      },
      {
        icon: Calendar,
        title: "Encontros presenciais",
        text: "No futuro, coordenam encontros territoriais. A plataforma é digital e presencial.",
      },
    ];

    const founderBenefits = [
      { icon: Star, text: "Acesso vitalício gratuito" },
      { icon: Shield, text: "Badge de membro fundador" },
      { icon: Flame, text: "Prioridade em eventos e lives" },
      { icon: Crown, text: "Participação nas decisões iniciais" },
    ];

    return (
      <section
        ref={ref}
        id="nucleo-fundador"
        className="w-full py-16 md:py-24 lg:py-28 bg-[#35363A] relative overflow-hidden"
      >
        {/* Decorativo */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute top-20 right-20 w-96 h-96 bg-[#81D8D0] rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-[#C8102E] rounded-full blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-[1100px] px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#81D8D0]/10 border border-[#81D8D0]/30 rounded-full mb-6">
              <Crown className="h-4 w-4 text-[#81D8D0]" />
              <span className="text-sm text-[#81D8D0] tracking-wide uppercase" style={{ fontWeight: 600 }}>
                Núcleo Fundador
              </span>
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl mb-6 text-white" style={{ fontWeight: 600 }}>
              Construa este espaço com a gente
            </h2>

            <p className="text-lg md:text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
              Os primeiros 50 a 80 ajudam a definir diretrizes iniciais.
              Fundadores moldam a cultura do espaço desde o primeiro dia.
            </p>
          </motion.div>

          {/* O que founders fazem */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12"
          >
            {founderRoles.map((role, i) => {
              const IconComponent = role.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 * i }}
                  className="flex items-start gap-4 bg-black/30 border border-white/10 rounded-xl p-5 hover:border-[#81D8D0]/30 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#81D8D0]/15 flex items-center justify-center flex-shrink-0">
                    <IconComponent className="h-5 w-5 text-[#81D8D0]" />
                  </div>
                  <div>
                    <h3 className="text-white mb-1" style={{ fontWeight: 600 }}>{role.title}</h3>
                    <p className="text-sm text-white/60">{role.text}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Benefícios */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="max-w-2xl mx-auto mb-12"
          >
            <h3 className="text-center text-white/50 text-sm uppercase tracking-widest mb-6">
              Benefícios do Fundador
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {founderBenefits.map((benefit, i) => {
                const IconComponent = benefit.icon;
                return (
                  <div
                    key={i}
                    className="flex items-center gap-3 bg-black/20 border border-white/5 rounded-lg px-4 py-3"
                  >
                    <IconComponent className="h-4 w-4 text-[#81D8D0] flex-shrink-0" />
                    <span className="text-sm text-white/80" style={{ fontWeight: 500 }}>{benefit.text}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Reforço estrutural */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center mb-12"
          >
            <p className="text-xl md:text-2xl text-white leading-relaxed" style={{ fontWeight: 600 }}>
              Aqui você não entra apenas para consumir.
              <br />
              <span className="text-[#81D8D0]">Você entra para construir.</span>
            </p>
          </motion.div>

          {/* Nota sobre pagamento futuro */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="max-w-2xl mx-auto bg-black/40 border border-white/10 rounded-xl p-6 text-center"
          >
            <p className="text-white/60 leading-relaxed">
              Este espaço será pago no futuro para garantir sustentabilidade.
            </p>
            <p className="text-[#81D8D0] mt-2" style={{ fontWeight: 500 }}>
              Quem está no núcleo inicial participa gratuitamente como membro
              fundador — com acesso vitalício.
            </p>
          </motion.div>
        </div>
      </section>
    );
  }
);