import { motion } from "motion/react";
import { Instagram, Mail } from "lucide-react";
import { LogoIcon } from "./LogoIcon";

interface FooterInstitucionalProps {
  onNavigate?: (page: string) => void;
}

export function FooterInstitucional({ onNavigate }: FooterInstitucionalProps) {
  const handleLinkClick = (page: string) => { if (onNavigate) { onNavigate(page); } };

  return (
    <footer className="w-full bg-[#35363A] border-t border-white/10">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-8 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <LogoIcon size={48} className="h-12 w-12" />
            <h2 className="text-2xl md:text-3xl font-semibold text-white">NeuroConexão Atípica</h2>
          </div>
          <p className="text-base md:text-lg text-[#C0C0C0] max-w-xl mx-auto font-normal">Um espaço onde intensidade não é defeito.</p>
        </motion.div>

        <motion.nav initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }} className="flex flex-wrap justify-center gap-6 md:gap-8 mb-12">
          <button onClick={() => handleLinkClick('home')} className="text-[#C0C0C0] hover:text-[#81D8D0] transition-colors font-medium text-base">Início</button>
          <button onClick={() => handleLinkClick('ethics')} className="text-[#C0C0C0] hover:text-[#81D8D0] transition-colors font-medium text-base">Ética</button>
          <button onClick={() => handleLinkClick('warnings')} className="text-[#C0C0C0] hover:text-[#81D8D0] transition-colors font-medium text-base">Avisos</button>
          <button onClick={() => handleLinkClick('privacy')} className="text-[#C0C0C0] hover:text-[#81D8D0] transition-colors font-medium text-base">Privacidade</button>
          <button onClick={() => handleLinkClick('terms')} className="text-[#C0C0C0] hover:text-[#81D8D0] transition-colors font-medium text-base">Termos de Uso</button>
        </motion.nav>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }} className="flex flex-col items-center gap-4 mb-12">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <a href="mailto:contato@neuroconexaoatipica.com.br" className="flex items-center gap-2 text-[#C0C0C0] hover:text-[#81D8D0] transition-colors">
              <Mail className="h-5 w-5" /><span className="font-medium">contato@neuroconexaoatipica.com.br</span>
            </a>
            <span className="hidden sm:block text-white/20">|</span>
            <a href="mailto:neuroconexaoatipica@gmail.com" className="flex items-center gap-2 text-[#C0C0C0] hover:text-[#81D8D0] transition-colors">
              <Mail className="h-5 w-5" /><span className="font-medium">neuroconexaoatipica@gmail.com</span>
            </a>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <a href="https://instagram.com/neuroconexao.atipica" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[#C0C0C0] hover:text-[#81D8D0] transition-colors">
              <Instagram className="h-5 w-5" /><span className="font-medium">@neuroconexao.atipica</span>
            </a>
            <span className="hidden sm:block text-white/20">|</span>
            <a href="https://instagram.com/camilapires.oficial_" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[#C0C0C0] hover:text-[#81D8D0] transition-colors">
              <Instagram className="h-5 w-5" /><span className="font-medium">@camilapires.oficial_ <span className="text-white/40 text-xs">(fundadora)</span></span>
            </a>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.3 }} className="text-center pt-8 border-t border-white/10">
          <p className="text-sm text-[#C0C0C0]/70 font-normal">© 2026 NeuroConexão Atípica. Todos os direitos reservados.</p>
        </motion.div>
      </div>
    </footer>
  );
}
