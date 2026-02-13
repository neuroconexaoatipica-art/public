import { motion } from "motion/react";
import { Shield, Mail } from "lucide-react";

export function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-black">
      <section className="w-full py-20 md:py-28 bg-gradient-to-b from-[#35363A] to-black">
        <div className="mx-auto max-w-[900px] px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Shield className="h-16 w-16 text-[#81D8D0] mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-white mb-6">Política de Privacidade</h1>
            <p className="text-xl md:text-2xl text-white/80 font-normal">NeuroConexão Atípica</p>
          </motion.div>
        </div>
      </section>

      <section className="w-full py-16 md:py-20 bg-black">
        <div className="mx-auto max-w-[900px] px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="space-y-8 text-lg text-white/80 font-normal leading-relaxed">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
              <p className="mb-6">A <strong className="text-white">NeuroConexão Atípica</strong> é uma plataforma social destinada à interação, relacionamento, amizade e networking entre usuários.</p>
              <p className="mb-6">Coletamos apenas os dados necessários para o funcionamento da plataforma, como nome, e-mail, informações de perfil e conteúdos publicados voluntariamente pelos usuários.</p>
              <div className="bg-black/40 rounded-xl p-6 mb-6">
                <p className="font-semibold text-white mb-4">Não utilizamos dados para fins clínicos, terapêuticos ou diagnósticos.</p>
                <p>As informações dos usuários não são vendidas a terceiros.</p>
              </div>
              <p className="mb-4 font-semibold text-white">Os dados são utilizados exclusivamente para:</p>
              <ul className="space-y-2 mb-6 ml-6">
                <li className="flex items-start gap-2"><span className="text-[#81D8D0]">•</span><span>Funcionamento da plataforma</span></li>
                <li className="flex items-start gap-2"><span className="text-[#81D8D0]">•</span><span>Comunicação essencial</span></li>
                <li className="flex items-start gap-2"><span className="text-[#81D8D0]">•</span><span>Segurança e moderação</span></li>
              </ul>
              <div className="bg-[#81D8D0]/10 border border-[#81D8D0]/30 rounded-xl p-6">
                <div className="flex items-start gap-3 mb-4">
                  <Mail className="h-6 w-6 text-[#81D8D0] flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-white mb-2">O usuário pode solicitar a exclusão de sua conta e dados a qualquer momento pelos e-mails:</p>
                    <div className="space-y-1">
                      <a href="mailto:contato@neuroconexaoatipica.com.br" className="text-[#81D8D0] font-semibold hover:underline text-lg block">contato@neuroconexaoatipica.com.br</a>
                      <a href="mailto:neuroconexaoatipica@gmail.com" className="text-[#81D8D0] font-semibold hover:underline text-lg block">neuroconexaoatipica@gmail.com</a>
                    </div>
                  </div>
                </div>
              </div>
              <p className="mt-8 font-semibold text-white">Ao utilizar a plataforma, o usuário concorda com esta Política de Privacidade.</p>
            </div>
            <div className="text-center pt-8 border-t border-white/10"><p className="text-white/60 text-base">© 2026 NeuroConexão Atípica</p></div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
