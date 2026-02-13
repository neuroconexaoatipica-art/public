import { motion } from "motion/react";
import { Check, Users, Video, Calendar, MessageSquare } from "lucide-react";

interface MembershipSectionProps {
  onJoinClick: () => void;
}

export function MembershipSection({ onJoinClick }: MembershipSectionProps) {
  return (
    <section className="w-full py-16 md:py-24 lg:py-28 bg-[#35363A] relative overflow-hidden">
      <div className="absolute inset-0 opacity-5"><div className="absolute top-20 right-20 w-96 h-96 bg-[#81D8D0] rounded-full blur-3xl" /></div>
      <div className="relative mx-auto max-w-[1100px] px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl mb-6 font-semibold text-white">Acesso ao espaço</h2>
          <p className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto font-normal leading-relaxed">Dois níveis de participação. Você escolhe como quer estar presente.</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }} className="bg-black/40 backdrop-blur-sm border-2 border-white/10 rounded-2xl p-8 hover:border-[#C0C0C0]/30 transition-all">
            <div className="flex items-center gap-3 mb-4"><Users className="h-8 w-8 text-[#C0C0C0]" /><h3 className="text-2xl font-semibold text-white">Visitante</h3></div>
            <p className="text-lg text-white/70 mb-6 font-normal">Acesso livre e gratuito</p>
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3"><Check className="h-5 w-5 text-[#C0C0C0] mt-0.5 flex-shrink-0" /><span className="text-white/80 font-normal">Feed público com posts da comunidade</span></div>
              <div className="flex items-start gap-3"><Check className="h-5 w-5 text-[#C0C0C0] mt-0.5 flex-shrink-0" /><span className="text-white/80 font-normal">Visualização das 14 comunidades temáticas</span></div>
              <div className="flex items-start gap-3"><Check className="h-5 w-5 text-[#C0C0C0] mt-0.5 flex-shrink-0" /><span className="text-white/80 font-normal">Páginas de ética, governança e manifesto</span></div>
            </div>
            <p className="text-sm text-white/60 italic font-normal">Você pode observar, mas não participa das comunidades.</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }} className="bg-gradient-to-br from-[#81D8D0]/20 to-[#81D8D0]/5 backdrop-blur-sm border-2 border-[#81D8D0]/40 rounded-2xl p-8 relative overflow-hidden hover:border-[#81D8D0]/60 transition-all">
            <div className="absolute top-4 right-4 bg-[#C8102E] text-white text-xs font-bold px-3 py-1 rounded-full">ACESSO COMPLETO</div>
            <div className="flex items-center gap-3 mb-4"><Video className="h-8 w-8 text-[#81D8D0]" /><h3 className="text-2xl font-semibold text-white">Membro</h3></div>
            <p className="text-lg text-white/70 mb-6 font-normal">Participação ativa no espaço</p>
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3"><Check className="h-5 w-5 text-[#81D8D0] mt-0.5 flex-shrink-0" /><span className="text-white font-medium">Acesso a todas as 14 comunidades temáticas</span></div>
              <div className="flex items-start gap-3"><Check className="h-5 w-5 text-[#81D8D0] mt-0.5 flex-shrink-0" /><span className="text-white font-medium">Criar posts em qualquer comunidade</span></div>
              <div className="flex items-start gap-3"><Check className="h-5 w-5 text-[#81D8D0] mt-0.5 flex-shrink-0" /><span className="text-white font-medium">Perfil editável com foto e bio</span></div>
              <div className="flex items-start gap-3"><Check className="h-5 w-5 text-[#81D8D0] mt-0.5 flex-shrink-0" /><span className="text-white font-medium">Feed exclusivo de membros</span></div>
              <div className="flex items-start gap-3"><Check className="h-5 w-5 text-[#81D8D0] mt-0.5 flex-shrink-0" /><span className="text-white font-medium">Interação direta com outros membros</span></div>
              <div className="flex items-start gap-3"><Check className="h-5 w-5 text-[#81D8D0] mt-0.5 flex-shrink-0" /><span className="text-white/70 font-medium italic">Lives e eventos (em desenvolvimento)</span></div>
            </div>
            <motion.button onClick={onJoinClick} whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }} className="w-full py-4 bg-[#81D8D0] text-black rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all">Tornar-se membro</motion.button>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.3 }} className="max-w-2xl mx-auto bg-black/60 backdrop-blur-sm border border-white/10 rounded-xl p-8">
          <h3 className="text-xl font-semibold text-white mb-3">Sobre a assinatura</h3>
          <div className="space-y-3 text-white/80 font-normal leading-relaxed">
            <p>Intensidade requer estrutura. Estrutura requer cuidado.</p>
            <p className="font-medium">Assinatura não é paywall — é compromisso com a existência deste campo.</p>
            <p className="text-sm text-white/60 italic">Este espaço não se sustenta sozinho. Assinar mantém a estrutura que permite o encontro.</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.5 }} className="mt-12 text-center">
          <p className="text-sm text-white/50 font-normal">Estamos no início. Estrutura e UX evoluem com o tempo.</p>
        </motion.div>
      </div>
    </section>
  );
}
