import { motion } from "motion/react";
import { Users, Eye, User, ArrowRight, Lock, LogOut, Clock } from "lucide-react";
import { LogoIcon } from "./LogoIcon";
import { useProfileContext, useSeats, supabase } from "../../lib";
import { UserAvatar } from "./UserAvatar";
import { useState, useEffect } from "react";

interface IndexPageProps {
  onNavigateToCommunities: () => void;
  onNavigateToProfile: () => void;
  onNavigateToRoadmap: () => void;
  onNavigateToUserProfile?: (userId: string) => void;
}

export function IndexPage({ onNavigateToCommunities, onNavigateToProfile, onNavigateToRoadmap, onNavigateToUserProfile }: IndexPageProps) {
  const { user } = useProfileContext();
  const { seatsUsed, seatsTotal, seatsRemaining, isFull } = useSeats();
  const [founderId, setFounderId] = useState<string | null>(null);

  // Buscar o ID da fundadora ao montar
  useEffect(() => {
    const loadFounder = async () => {
      try {
        // Buscar criadora: primeiro tenta admin, depois founder
        const { data, error } = await supabase
          .from('users')
          .select('id')
          .in('role', ['admin', 'founder'])
          .limit(1)
          .maybeSingle();
        
        if (!error && data) {
          setFounderId(data.id);
        }
      } catch (err) {
        console.error('Erro ao buscar fundadora:', err);
      }
    };
    loadFounder();
  }, []);

  const handleCreatorProfileClick = () => {
    if (founderId && onNavigateToUserProfile) {
      onNavigateToUserProfile(founderId);
    } else {
      onNavigateToProfile();
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header Simples */}
      <header className="w-full bg-[#35363A] border-b border-white/10 sticky top-0 z-40">
        <div className="mx-auto max-w-[1000px] px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <LogoIcon size={40} className="h-10 w-10" />
              <h1 className="text-xl font-semibold text-white">
                NeuroConexão Atípica
              </h1>
            </div>

            {/* User info + Logout */}
            <div className="flex items-center gap-3">
              {user && (
                <div className="flex items-center gap-2">
                  <UserAvatar
                    name={user.name}
                    photoUrl={user.profile_photo}
                    size="md"
                  />
                  <span className="text-sm text-white/80 font-medium hidden sm:block">{user.name}</span>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title="Sair"
              >
                <LogOut className="h-5 w-5 text-white/70" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <div className="mx-auto max-w-[900px] px-6 py-12 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="space-y-12"
        >
          {/* Bloco Principal */}
          <div className="text-center space-y-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#FF6B35]/20 border-2 border-[#FF6B35]/40 mb-6">
              <Clock className="h-10 w-10 text-[#FF6B35]" />
            </div>

            <h1 className="text-4xl md:text-5xl font-semibold text-white leading-tight">
              Seu acesso está<br />sendo avaliado
            </h1>

            <div className="max-w-3xl mx-auto space-y-4">
              <p className="text-xl md:text-2xl text-white/90 font-normal leading-relaxed">
                Você completou o cadastro. Agora a administração vai avaliar seu perfil 
                e liberar o acesso às comunidades.
              </p>
            </div>
          </div>

          {/* Contador de Vagas */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="bg-gradient-to-br from-[#81D8D0]/10 to-[#81D8D0]/5 border-2 border-[#81D8D0]/30 rounded-2xl p-8 text-center"
          >
            <h3 className="text-lg font-semibold text-[#81D8D0] mb-4 uppercase tracking-wide">
              Núcleo Fundador — Beta Fechado
            </h3>
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-5xl font-semibold text-white">{seatsUsed}</span>
              <span className="text-2xl text-white/40">/</span>
              <span className="text-5xl font-semibold text-white/40">{seatsTotal}</span>
            </div>
            <div className="w-full max-w-md mx-auto h-3 bg-white/10 rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-gradient-to-r from-[#81D8D0] to-[#81D8D0]/70 rounded-full transition-all duration-700"
                style={{ width: `${Math.min(100, (seatsUsed / seatsTotal) * 100)}%` }}
              />
            </div>
            <p className="text-white/60 font-normal">
              {isFull
                ? 'Todas as vagas foram preenchidas. Você está na lista de espera.'
                : `${seatsRemaining} vaga${seatsRemaining !== 1 ? 's' : ''} restante${seatsRemaining !== 1 ? 's' : ''} no Núcleo Fundador`
              }
            </p>
          </motion.div>

          {/* Bloco de Transparência */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="bg-gradient-to-br from-[#35363A] to-black border-2 border-[#81D8D0]/30 rounded-2xl p-8 md:p-10"
          >
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#81D8D0]/20 flex items-center justify-center flex-shrink-0">
                <Eye className="h-6 w-6 text-[#81D8D0]" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold text-white mb-4">
                  O que é o Beta Fechado
                </h2>
                <div className="space-y-3 text-lg text-white/80 font-normal leading-relaxed">
                  <p>
                    Estamos selecionando <strong className="text-white font-semibold">{seatsTotal} pessoas</strong> para 
                    construir a base deste espaço.
                  </p>
                  <p>
                    <strong className="text-[#FF6B35] font-semibold">Este espaço será pago no futuro.</strong>
                  </p>
                  <p>
                    Os primeiros membros do Núcleo Fundador terão 
                    <strong className="text-[#81D8D0] font-semibold"> isenção permanente</strong> como 
                    reconhecimento pela construção da base.
                  </p>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="pt-6 border-t border-white/10">
              <div className="flex items-center gap-3 text-white/70">
                <div className="w-3 h-3 rounded-full bg-[#FF6B35] animate-pulse"></div>
                <span className="text-sm font-medium">Seu status: <strong className="text-[#FF6B35]">Aguardando aprovação</strong></span>
              </div>
            </div>
          </motion.div>

          {/* Botões Permitidos */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* Conhecer Comunidades */}
            <button
              onClick={onNavigateToCommunities}
              className="group bg-white/5 border-2 border-[#81D8D0]/30 hover:border-[#81D8D0]/60 rounded-2xl p-6 text-left transition-all hover:bg-white/10"
            >
              <Users className="h-8 w-8 text-[#81D8D0] mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-[#81D8D0] transition-colors">
                Conhecer os Temas
              </h3>
              <p className="text-sm text-white/70 font-normal mb-4">
                Veja os nomes e descrições das 14 comunidades
              </p>
              <div className="flex items-center gap-2 text-[#81D8D0] text-sm font-semibold">
                <span>Ver comunidades</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </button>

            {/* Ver o que estamos construindo */}
            <button
              onClick={onNavigateToRoadmap}
              className="group bg-white/5 border-2 border-[#FF6B35]/30 hover:border-[#FF6B35]/60 rounded-2xl p-6 text-left transition-all hover:bg-white/10"
            >
              <Eye className="h-8 w-8 text-[#FF6B35] mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-[#FF6B35] transition-colors">
                Ver o que estamos construindo
              </h3>
              <p className="text-sm text-white/70 font-normal mb-4">
                Roadmap e visão de futuro
              </p>
              <div className="flex items-center gap-2 text-[#FF6B35] text-sm font-semibold">
                <span>Ver roadmap</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </button>

            {/* Perfil da Criadora */}
            <button
              onClick={handleCreatorProfileClick}
              className="group bg-white/5 border-2 border-[#C8102E]/30 hover:border-[#C8102E]/60 rounded-2xl p-6 text-left transition-all hover:bg-white/10"
            >
              <User className="h-8 w-8 text-[#C8102E] mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-[#C8102E] transition-colors">
                Perfil da Criadora
              </h3>
              <p className="text-sm text-white/70 font-normal mb-4">
                Conheça quem fundou este espaço
              </p>
              <div className="flex items-center gap-2 text-[#C8102E] text-sm font-semibold">
                <span>Ver perfil</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </button>
          </motion.div>

          {/* Aviso Ético */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="bg-[#C8102E]/10 border border-[#C8102E]/30 rounded-2xl p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              Como funciona a aprovação
            </h3>
            <div className="space-y-2 text-sm text-white/80 font-normal leading-relaxed">
              <p>
                A administração avalia cada cadastro individualmente. Quando aprovado, seu acesso 
                será liberado automaticamente — basta recarregar a página.
              </p>
              <p className="text-white/50 italic">
                Não há prazo fixo. Estamos construindo com cuidado, não com pressa.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}