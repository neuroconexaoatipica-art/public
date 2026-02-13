import { motion } from "motion/react";
import { COMMUNITIES_CONFIG } from "../../lib";

export function CommunitiesShowcase() {
  return (
    <section className="w-full py-16 md:py-24 lg:py-28 bg-black">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px", amount: 0.3 }} transition={{ duration: 0.5 }} className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl mb-4 font-semibold text-white">
            14 comunidades para quem não cabe em lugares comuns
          </h2>
          <p className="text-lg text-white/70 max-w-2xl mx-auto font-normal">
            Espaços curados para conexões reais entre mentes intensas
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
          {COMMUNITIES_CONFIG.map((community, index) => {
            const IconComponent = community.icon;
            return (
              <motion.div
                key={community.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.4, delay: index * 0.06 }}
                whileHover={{ y: -4, scale: 1.01, borderColor: `${community.color}60` }}
                className="group relative bg-[#1A1A1A] border border-white/10 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl cursor-default"
                style={{ '--community-color': community.color } as React.CSSProperties}
              >
                <div
                  className="absolute top-0 left-0 w-1 h-0 rounded-r-full group-hover:h-full transition-all duration-300"
                  style={{ backgroundColor: community.color }}
                />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${community.color}20`, border: `1px solid ${community.color}40` }}
                    >
                      <IconComponent className="h-5 w-5" style={{ color: community.color }} />
                    </div>
                    <h3 className="text-lg font-semibold text-white group-hover:text-[#81D8D0] transition-colors">
                      {community.name}
                    </h3>
                  </div>
                  <p className="text-sm text-white/70 leading-relaxed">
                    {community.description}
                  </p>
                  <div className="mt-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-10 h-px" style={{ backgroundColor: community.color }} />
                    <span className="text-xs text-white/50 font-medium">Cadastre-se para participar</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
