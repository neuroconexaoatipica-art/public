import { motion } from "motion/react";
import { Users, Eye, User, ArrowRight, Lock, LogOut } from "lucide-react";
import { LogoIcon } from "./LogoIcon";
import { useProfileContext, supabase } from "../../lib";
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
  const [founderId, setFounderId] = useState<string | null>(null);

  useEffect(() => {
    const loadFounder = async () => {
      try {
        const { data, error } = await supabase.from('users').select('id').eq('role', 'founder').limit(1).single();
        if (!error && data) setFounderId(data.id);
      } catch (err) { console.error('Erro ao buscar fundadora:', err); }
    };
    loadFounder();
  }, []);

  const handleCreatorProfileClick = () => {
    if (founderId && onNavigateToUserProfile) onNavigateToUserProfile(founderId);
    else onNavigateToProfile();
  };

  const handleLogout = async () => { await supabase.auth.signOut(); };

  return (
    <div className="min-h-screen bg-black">
      <header className="w-full bg-[#35363A] border-b border-white/10 sticky top-0 z-40">
        <div className="mx-auto max-w-[1000px] px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3"><LogoIcon size={40} className="h-10 w-10" /><h1 className="text-xl font-semibold text-white">NeuroConexão Atípica</h1></div>
            <div className="flex items-center gap-3">
              {user && (<div className="flex items-center gap-2"><UserAvatar name={user.name} photoUrl={user.profile_photo} size="md" /><span className="text-sm text-white/80 font-medium hidden sm:block">{user.name}</span></div>)}
              <button onClick={handleLogout} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Sair"><LogOut className="h-5 w-5 text-white/70" /></button>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[900px] px-6 py-12 md:py-20">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="space-y-12">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#81D8D0]/20 border-2 border-[#81D8D0]/40 mb-6"><Lock className="h-10 w-10 text-[#81D8D0]" /></div>
            <h1 className="text-4xl md:text-5xl font-semibold text-white leading-tight">Conexões Mentais<br />Profundas e Reais</h1>
            <div className="max-w-3xl mx-auto space-y-4">
              <p className="text-xl md:text-2xl text-white/90 font-normal leading-relaxed">
                É uma rede social, comunidade digital para pessoas com <strong className="text-[#81D8D0] font-semibold">TDAH, autismo, borderline, bipolaridade e altas habilidades</strong> se conectarem com autenticidade para <strong className="text-[#FF6B35] font-semibold">amizade, relacionamento e networking</strong> em um espaço seguro, humano e sem rótulos limitantes, sem precisar esconder quem são.
              </p>
              <div className="pt-4"><p className="text-lg text-[#C0C0C0] font-normal italic">Este espaço está vivo, em fase inicial.<br />Continuamente estaremos aperfeiçoando.</p></div>
            </div>
          </div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }} className="bg-gradient-to-br from-[#35363A] to-black border-2 border-[#81D8D0]/30 rounded-2xl p-8 md:p-10">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#81D8D0]/20 flex items-center justify-center flex-shrink-0"><Eye className="h-6 w-6 text-[#81D8D0]" /></div>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold text-white mb-4">Você está dentro do beta</h2>
                <div className="space-y-3 text-lg text-white/80 font-normal leading-relaxed">
                  <p>Você está dentro do <strong className="text-white font-semibold">beta do NeuroConexão Atípica</strong>.</p>
                  <p>Estamos construindo a base com cuidado.</p>
                  <p><strong className="text-[#FF6B35] font-semibold">Este espaço será pago no futuro.</strong></p>
                  <p>Por você estar entre as primeiras pessoas, <strong className="text-[#81D8D0] font-semibold">não será cobrada(o)</strong>.</p>
                </div>
              </div>
            </div>
            <div className="pt-6 border-t border-white/10">
              <div className="flex items-center gap-3 text-white/70"><div className="w-3 h-3 rounded-full bg-[#FF6B35] animate-pulse"></div><span className="text-sm font-medium">Status: <strong className="text-[#FF6B35]">Aguardando liberação de acesso</strong></span></div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.4 }} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button onClick={onNavigateToCommunities} className="group bg-white/5 border-2 border-[#81D8D0]/30 hover:border-[#81D8D0]/60 rounded-2xl p-6 text-left transition-all hover:bg-white/10">
              <Users className="h-8 w-8 text-[#81D8D0] mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-[#81D8D0] transition-colors">Conhecer as Comunidades</h3>
              <p className="text-sm text-white/70 font-normal mb-4">14 comunidades curadas para conexões reais</p>
              <div className="flex items-center gap-2 text-[#81D8D0] text-sm font-semibold"><span>Ver comunidades</span><ArrowRight className="h-4 w-4" /></div>
            </button>
            <button onClick={onNavigateToRoadmap} className="group bg-white/5 border-2 border-[#FF6B35]/30 hover:border-[#FF6B35]/60 rounded-2xl p-6 text-left transition-all hover:bg-white/10">
              <Eye className="h-8 w-8 text-[#FF6B35] mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-[#FF6B35] transition-colors">Ver o que estamos construindo</h3>
              <p className="text-sm text-white/70 font-normal mb-4">Roadmap e visão de futuro</p>
              <div className="flex items-center gap-2 text-[#FF6B35] text-sm font-semibold"><span>Ver roadmap</span><ArrowRight className="h-4 w-4" /></div>
            </button>
            <button onClick={handleCreatorProfileClick} className="group bg-white/5 border-2 border-[#C8102E]/30 hover:border-[#C8102E]/60 rounded-2xl p-6 text-left transition-all hover:bg-white/10">
              <User className="h-8 w-8 text-[#C8102E] mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-[#C8102E] transition-colors">Perfil da Criadora</h3>
              <p className="text-sm text-white/70 font-normal mb-4">Conheça quem fundou este espaço</p>
              <div className="flex items-center gap-2 text-[#C8102E] text-sm font-semibold"><span>Ver perfil</span><ArrowRight className="h-4 w-4" /></div>
            </button>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.6 }} className="bg-[#C8102E]/10 border border-[#C8102E]/30 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">⚠️ Importante</h3>
            <p className="text-sm text-white/80 font-normal leading-relaxed">Seu acesso completo será liberado em breve. Por enquanto, você pode conhecer as comunidades e entender a visão do projeto. Não há pressa — estamos construindo com cuidado.</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.8 }} className="bg-white/3 border border-white/10 rounded-2xl p-8">
            <h3 className="text-2xl font-semibold text-white mb-6 text-center">O que está por vir</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-white/80">
              <div className="flex items-start gap-3"><div className="w-2 h-2 rounded-full bg-[#81D8D0] mt-1.5 flex-shrink-0"></div><span>Chat privado</span></div>
              <div className="flex items-start gap-3"><div className="w-2 h-2 rounded-full bg-[#81D8D0] mt-1.5 flex-shrink-0"></div><span>Likes conscientes</span></div>
              <div className="flex items-start gap-3"><div className="w-2 h-2 rounded-full bg-[#81D8D0] mt-1.5 flex-shrink-0"></div><span>Upload de mais fotos</span></div>
              <div className="flex items-start gap-3"><div className="w-2 h-2 rounded-full bg-[#81D8D0] mt-1.5 flex-shrink-0"></div><span>Criação de comunidades por fundadores</span></div>
              <div className="flex items-start gap-3"><div className="w-2 h-2 rounded-full bg-[#81D8D0] mt-1.5 flex-shrink-0"></div><span>Organização de eventos presenciais</span></div>
              <div className="flex items-start gap-3"><div className="w-2 h-2 rounded-full bg-[#81D8D0] mt-1.5 flex-shrink-0"></div><span>Lives organizadas por fundadores</span></div>
            </div>
            <p className="text-center text-sm text-[#C0C0C0] italic mt-6">Algumas funções serão liberadas apenas após o aplicativo principal estar finalizado.</p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
