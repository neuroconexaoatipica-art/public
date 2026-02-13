import { motion } from "motion/react";
import { ArrowLeft, Zap, Users, MessageCircle, Heart, Camera, Calendar, MapPin, Shield } from "lucide-react";

interface RoadmapPageProps {
  onBack: () => void;
}

export function RoadmapPage({ onBack }: RoadmapPageProps) {
  const features = [
    { icon: MessageCircle, title: "Chat Privado", description: "Conversas diretas entre membros, com consentimento mútuo", color: "#81D8D0", status: "Futuro" },
    { icon: Heart, title: "Likes Conscientes", description: "Sistema de reações simples, sem gamificação ou números públicos", color: "#C8102E", status: "Futuro" },
    { icon: Camera, title: "Upload de Fotos", description: "Compartilhe mais imagens no seu perfil e posts", color: "#FF6B35", status: "Futuro" },
    { icon: Users, title: "Criação de Comunidades", description: "Fundadores poderão criar e moderar suas próprias comunidades", color: "#81D8D0", status: "Futuro" },
    { icon: MapPin, title: "Eventos Presenciais", description: "Organização de encontros reais entre membros", color: "#FF6B35", status: "Futuro" },
    { icon: Calendar, title: "Lives Organizadas", description: "Fundadores poderão criar e gerenciar lives e workshops", color: "#C8102E", status: "Futuro" }
  ];

  return (
    <div className="min-h-screen bg-black">
      <div className="w-full bg-[#35363A] border-b border-white/10">
        <div className="mx-auto max-w-[1000px] px-6 py-4">
          <button onClick={onBack} className="flex items-center gap-2 text-white/80 hover:text-[#81D8D0] transition-colors"><ArrowLeft className="h-5 w-5" /><span className="font-medium">Voltar</span></button>
        </div>
      </div>

      <div className="mx-auto max-w-[1000px] px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="space-y-12">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#FF6B35]/20 border-2 border-[#FF6B35]/40 mb-6"><Zap className="h-10 w-10 text-[#FF6B35]" /></div>
            <h1 className="text-4xl md:text-5xl font-semibold text-white leading-tight">O que estamos construindo</h1>
            <p className="text-xl text-white/80 font-normal leading-relaxed max-w-3xl mx-auto">Este é um espaço vivo, em construção consciente. Estamos começando com o essencial: conexões reais, moderação ética e comunidades curadas.</p>
          </div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }} className="bg-gradient-to-br from-[#81D8D0]/20 to-transparent border-2 border-[#81D8D0]/30 rounded-2xl p-8">
            <div className="flex items-start gap-4 mb-6">
              <Shield className="h-8 w-8 text-[#81D8D0] flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-semibold text-white mb-4">Beta Fechado — Fase Atual</h2>
                <div className="space-y-3 text-base text-white/90 font-normal leading-relaxed">
                  <p><strong className="text-white">✓ 14 Comunidades Curadas</strong> — Espaços com propósito claro e regras específicas</p>
                  <p><strong className="text-white">✓ Posts de Texto</strong> — Compartilhe pensamentos, dúvidas e reflexões</p>
                  <p><strong className="text-white">✓ Feed Público</strong> — Alguns posts são visíveis para todos</p>
                  <p><strong className="text-white">✓ Perfis Editáveis</strong> — Nome, bio, foto e autenticidade</p>
                  <p><strong className="text-white">✓ Moderação Ativa</strong> — Governança centralizada com ética clara</p>
                  <p><strong className="text-white">◇ Manifestação de Interesse em Lives</strong> — Sistema para organizar eventos futuros</p>
                </div>
              </div>
            </div>
            <div className="pt-6 border-t border-white/10"><p className="text-sm text-white/70 font-normal">Estamos focando na base: conexões verdadeiras, segurança ética e comunidade funcional.</p></div>
          </motion.div>

          <div className="space-y-6">
            <h2 className="text-3xl font-semibold text-white text-center">Funcionalidades Futuras</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <motion.div key={index} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }} className="bg-white/3 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${feature.color}20`, border: `2px solid ${feature.color}40` }}>
                      <feature.icon className="h-6 w-6" style={{ color: feature.color }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                        <span className="px-2 py-0.5 rounded text-xs font-semibold" style={{ backgroundColor: `${feature.color}20`, color: feature.color }}>{feature.status}</span>
                      </div>
                      <p className="text-sm text-white/70 font-normal leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 1.0 }} className="bg-[#C8102E]/10 border border-[#C8102E]/30 rounded-2xl p-8">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">⚠️ Transparência total</h3>
            <div className="space-y-3 text-base text-white/80 font-normal leading-relaxed">
              <p><strong className="text-white">Algumas funções serão liberadas apenas após o aplicativo principal estar finalizado.</strong></p>
              <p>Não prometemos datas. Prometemos <strong className="text-[#81D8D0]">qualidade, ética e cuidado</strong> em cada fase.</p>
              <p>Este não é um produto. É um <strong className="text-[#C8102E]">espaço vivo</strong>, construído por quem sente e pensa a necessidade dele.</p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 1.2 }} className="bg-white/3 border border-white/10 rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-semibold text-white mb-4">A visão é clara</h3>
            <p className="text-lg text-white/80 font-normal leading-relaxed max-w-2xl mx-auto mb-6">
              Criar uma <strong className="text-[#81D8D0]">rede social funcional</strong> para pessoas intensas, neurodivergentes e profundamente humanas se conectarem — <strong className="text-[#FF6B35]"> para amizade, relacionamento e networking</strong> — sem performar normalidade.
            </p>
            <div className="pt-6 border-t border-white/10">
              <p className="text-sm text-[#C0C0C0] italic">Não é sobre ter todas as funcionalidades agora.<br />É sobre ter as <strong>certas</strong>, no momento <strong>certo</strong>, com <strong>ética clara</strong>.</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
