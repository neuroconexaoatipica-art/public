import { motion } from "motion/react";
import { Crown, Search, Users, ShieldCheck } from "lucide-react";
import { COMMUNITIES_CONFIG, useCommunitiesContext } from "../../lib";
import { MILA_ACTIVE_COMMUNITIES } from "../../lib/communitiesConfig";

export function CommunitiesShowcase() {
  // Dados do banco — owner_id e needs_moderator vem do Supabase
  const { communities: dbCommunities } = useCommunitiesContext();

  // Mapa nome -> dados do banco para enriquecer os cards
  const dbMap: Record<string, { owner_id: string | null; needs_moderator: boolean }> = {};
  dbCommunities.forEach(c => {
    dbMap[c.name] = { owner_id: c.owner_id, needs_moderator: c.needs_moderator };
  });

  // Contar quantas comunidades precisam de founder — EXCLUINDO as 4 da Mila
  const founderCount = COMMUNITIES_CONFIG.filter(c =>
    !MILA_ACTIVE_COMMUNITIES.includes(c.name)
  ).length;

  return (
    <section className="w-full py-16 md:py-24 lg:py-28 relative overflow-hidden" style={{ background: "#C8C8C8" }}>
      <div className="relative mx-auto max-w-[1200px] px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#0A8F85]/10 border border-[#0A8F85]/20 rounded-full mb-6">
            <Users className="h-4 w-4 text-[#0A8F85]" />
            <span className="text-sm text-[#0A8F85] tracking-wide uppercase" style={{ fontWeight: 600 }}>
              Comunidades
            </span>
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl mb-4 text-[#1A1A1A]" style={{ fontWeight: 600 }}>
            {dbCommunities.length > 0 ? dbCommunities.length : 14} comunidades para quem não cabe em lugares comuns
          </h2>
          <p className="text-lg text-[#666] max-w-2xl mx-auto">
            Cada comunidade tem manifesto, ritual e vida própria — como no Orkut, mas com profundidade.
          </p>
        </motion.div>

        {/* PROCURA-SE FOUNDER — BANNER */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="max-w-2xl mx-auto mb-12"
        >
          <motion.div
            animate={{ borderColor: ["rgba(200,16,46,0.2)", "rgba(200,16,46,0.5)", "rgba(200,16,46,0.2)"] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="bg-white border-2 border-[#C8102E]/20 rounded-2xl p-5 text-center shadow-sm"
          >
            <div className="flex items-center justify-center gap-3 mb-2">
              <motion.div animate={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                <Crown className="h-6 w-6 text-[#C8102E]" />
              </motion.div>
              <span className="text-lg text-[#C8102E] uppercase tracking-wider" style={{ fontWeight: 800 }}>
                Procura-se Founders
              </span>
              <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                <Crown className="h-6 w-6 text-[#C8102E]" />
              </motion.div>
            </div>
            <p className="text-[#555] text-sm mb-2">
              <span className="text-[#1A1A1A]" style={{ fontWeight: 600 }}>{founderCount} comunidades</span> precisam de um Founder — alguém que dê vida ao espaço, crie rituais e conduza conversas.
            </p>
            <p className="text-[#0A8F85] text-sm" style={{ fontWeight: 600 }}>
              Candidate-se após o cadastro. Acesso vitalício para founders aprovados.
            </p>
          </motion.div>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
          {COMMUNITIES_CONFIG.map((community, index) => {
            const IconComponent = community.icon;
            // REGRA: se está em MILA_ACTIVE_COMMUNITIES, é da Mila. Ponto.
            const isMila = MILA_ACTIVE_COMMUNITIES.includes(community.name);
            const seekingFounder = !isMila;

            return (
              <motion.div
                key={community.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.4, delay: index * 0.04 }}
                whileHover={{ y: -4, scale: 1.01 }}
                className={`group relative bg-white border-2 rounded-2xl p-5 transition-all duration-300 hover:shadow-lg cursor-default ${
                  seekingFounder ? "border-[#C8102E]/15 hover:border-[#C8102E]/30" : "border-transparent hover:border-[#81D8D0]/30"
                }`}
              >
                {/* Barra decorativa */}
                <div
                  className="absolute top-0 left-0 w-1 h-0 rounded-r-full group-hover:h-full transition-all duration-300"
                  style={{ backgroundColor: community.color }}
                />

                {/* Badges */}
                <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
                  {isMila && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-[#81D8D0]/15 border border-[#81D8D0]/30 rounded-full">
                      <ShieldCheck className="h-3 w-3 text-[#0A8F85]" />
                      <span className="text-[10px] text-[#0A8F85] uppercase tracking-wider" style={{ fontWeight: 700 }}>
                        Aberta — Mila
                      </span>
                    </div>
                  )}
                  {seekingFounder && (
                    <motion.div
                      animate={{ boxShadow: ["0 0 0 rgba(200,16,46,0)", "0 0 10px rgba(200,16,46,0.2)", "0 0 0 rgba(200,16,46,0)"] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="flex items-center gap-1 px-2.5 py-1 bg-[#C8102E]/10 border border-[#C8102E]/30 rounded-full"
                    >
                      <Search className="h-3 w-3 text-[#C8102E]" />
                      <span className="text-[10px] text-[#C8102E] uppercase tracking-wider" style={{ fontWeight: 700 }}>
                        Procura Founder
                      </span>
                    </motion.div>
                  )}
                </div>

                <div className="relative">
                  <div className="flex items-center gap-3 mb-3 pr-24">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${community.color}15`, border: `1px solid ${community.color}30` }}
                    >
                      <IconComponent className="h-5 w-5" style={{ color: community.color }} />
                    </div>
                    <h3 className="text-base text-[#1A1A1A] group-hover:text-[#0A8F85] transition-colors" style={{ fontWeight: 600 }}>
                      {community.name}
                    </h3>
                  </div>
                  <p className="text-sm text-[#666] leading-relaxed">
                    {community.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-10"
        >
          <p className="text-[#999] text-sm">
            Sem algoritmo. Sem ranking. Sem feed infinito.{" "}
            <span className="text-[#666]" style={{ fontWeight: 500 }}>O ritual é o motor.</span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}