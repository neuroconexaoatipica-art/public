import { motion } from "motion/react";
import { AlertTriangle, Phone, Shield, Lock, Users, Eye, Heart, LogOut } from "lucide-react";

export function WarningsPage() {
  return (
    <div className="min-h-screen bg-black">
      <section className="w-full py-20 md:py-28 bg-gradient-to-b from-[#C8102E]/20 to-black">
        <div className="mx-auto max-w-[900px] px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <AlertTriangle className="h-16 w-16 text-[#FF6B35] mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-white mb-6">Avisos Importantes</h1>
            <p className="text-xl md:text-2xl text-white/80 font-normal">Leia com atenção antes de entrar.</p>
          </motion.div>
        </div>
      </section>

      <section className="w-full py-16 md:py-20 bg-black">
        <div className="mx-auto max-w-[900px] px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="bg-[#C8102E]/10 border-2 border-[#C8102E]/30 rounded-2xl p-8 md:p-10">
            <div className="flex items-center gap-3 mb-6"><Heart className="h-8 w-8 text-[#C8102E]" /><h2 className="text-2xl md:text-3xl font-semibold text-white">Não somos substituição para tratamento profissional</h2></div>
            <p className="text-lg text-white/90 font-normal mb-6 leading-relaxed">O NeuroConexão Atípica é um espaço de conexão e suporte entre pares, não é um serviço de saúde mental.</p>
            <div className="bg-black/40 rounded-xl p-6 mb-6">
              <p className="text-white font-semibold mb-4">Se você está em crise, com ideação suicida ou em situação de risco:</p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-white/90"><Phone className="h-5 w-5 text-[#81D8D0] flex-shrink-0 mt-0.5" /><span><strong>CVV (Centro de Valorização da Vida):</strong> 188 (24h, gratuito)</span></li>
                <li className="flex items-start gap-3 text-white/90"><Phone className="h-5 w-5 text-[#81D8D0] flex-shrink-0 mt-0.5" /><span><strong>CAPS (Centro de Atenção Psicossocial):</strong> Busque o mais próximo de você</span></li>
                <li className="flex items-start gap-3 text-white/90"><Phone className="h-5 w-5 text-[#81D8D0] flex-shrink-0 mt-0.5" /><span><strong>Emergência:</strong> 192 (SAMU) ou 193 (Bombeiros)</span></li>
              </ul>
            </div>
            <p className="text-lg font-semibold text-white">Conexões são importantes, mas não substituem terapia, medicação ou acompanhamento profissional.</p>
          </motion.div>
        </div>
      </section>

      <section className="w-full py-16 md:py-20 bg-black">
        <div className="mx-auto max-w-[900px] px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <div className="flex items-center gap-3 mb-6"><Users className="h-8 w-8 text-[#81D8D0]" /><h2 className="text-2xl md:text-3xl font-semibold text-white">Este é um espaço para adultos (+18)</h2></div>
            <div className="space-y-6 text-lg text-white/80 font-normal leading-relaxed">
              <p>Algumas comunidades abordam temas como sexualidade, desejo, corpo e prazer de forma explícita e sem filtros.</p>
              <p className="font-semibold text-white">Isso não significa que o espaço é pornográfico ou sexualizado.</p>
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <p className="font-medium text-white mb-3">Significa que:</p>
                <ul className="space-y-2">{["Conversas sobre sexo são adultas, conscientes e consentidas","Não há infantilização ou moralismo","Você decide de quais comunidades participar","Consentimento é inegociável"].map((item, i) => (<li key={i} className="flex items-start gap-2"><span className="text-[#81D8D0]">•</span><span>{item}</span></li>))}</ul>
              </div>
              <p className="font-bold text-[#C8102E] text-xl">Se você tem menos de 18 anos, este espaço não é para você. Respeite esse limite.</p>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="w-full py-16 md:py-20 bg-black">
        <div className="mx-auto max-w-[900px] px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <div className="flex items-center gap-3 mb-6"><AlertTriangle className="h-8 w-8 text-[#FF6B35]" /><h2 className="text-2xl md:text-3xl font-semibold text-white">Intensidade não é violência</h2></div>
            <div className="space-y-6 text-lg text-white/80 font-normal leading-relaxed">
              <p>Este espaço acolhe emoções intensas, pensamentos rápidos, sensibilidade profunda.</p>
              <div className="bg-white/5 border-l-4 border-[#81D8D0] rounded-r-xl p-6">
                <p className="font-semibold text-white mb-3">Mas há uma diferença fundamental:</p>
                <ul className="space-y-3">
                  <li><span className="font-semibold text-[#81D8D0]">Intensidade:</span> Sentir fundo, pensar rápido, viver com presença</li>
                  <li><span className="font-semibold text-[#C8102E]">Violência:</span> Descarregar emoções de forma destrutiva em outras pessoas</li>
                </ul>
              </div>
              <p>Você pode estar em crise. Você pode estar sofrendo. Você pode estar furioso(a).</p>
              <p className="font-bold text-[#C8102E] text-xl">Mas não pode descarregar isso violentamente em outras pessoas. Isso é linha vermelha.</p>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="w-full py-16 md:py-20 bg-black">
        <div className="mx-auto max-w-[900px] px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <div className="flex items-center gap-3 mb-6"><Lock className="h-8 w-8 text-[#81D8D0]" /><h2 className="text-2xl md:text-3xl font-semibold text-white">Privacidade e confidencialidade</h2></div>
            <p className="text-xl font-semibold text-white mb-6">O que é compartilhado aqui permanece aqui.</p>
            <div className="space-y-4">
              {["Não faça prints de conversas privadas sem consentimento","Não compartilhe informações pessoais de outros membros fora da plataforma","Não use conteúdo do espaço para fins comerciais ou públicos","Respeite anonimato e pseudônimos"].map((item, i) => (
                <div key={i} className="flex items-start gap-3 bg-white/3 border border-white/10 rounded-xl p-4"><Shield className="h-5 w-5 text-[#81D8D0] flex-shrink-0 mt-0.5" /><span className="text-white/90 font-normal text-lg">{item}</span></div>
              ))}
            </div>
            <div className="mt-6 bg-[#C8102E]/10 border border-[#C8102E]/30 rounded-xl p-6"><p className="text-lg font-bold text-[#C8102E]">Violação de privacidade resulta em banimento imediato.</p></div>
          </motion.div>
        </div>
      </section>

      <section className="w-full py-16 md:py-20 bg-black">
        <div className="mx-auto max-w-[900px] px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <div className="flex items-center gap-3 mb-6"><Eye className="h-8 w-8 text-[#FF6B35]" /><h2 className="text-2xl md:text-3xl font-semibold text-white">Avisos de conteúdo (Content Warnings)</h2></div>
            <p className="text-lg text-white/80 font-normal mb-6">Incentivamos o uso de avisos de conteúdo quando você for compartilhar temas sensíveis como:</p>
            <ul className="space-y-2 mb-6">{["Violência (física, sexual, psicológica)","Suicídio ou automutilação","Abuso ou trauma","Transtornos alimentares","Conteúdo sexualmente explícito"].map((item, i) => (<li key={i} className="flex items-start gap-2 text-white/80"><span className="text-[#FF6B35]">•</span><span>{item}</span></li>))}</ul>
            <div className="bg-[#81D8D0]/10 border border-[#81D8D0]/30 rounded-xl p-6">
              <p className="font-semibold text-white mb-3">Como usar:</p>
              <p className="text-white/80 mb-3">Comece o post com "CW: [tema]" antes do conteúdo.</p>
              <div className="bg-black/40 rounded-lg p-4 font-mono text-sm text-white/70">Exemplo: "CW: menção a automutilação — [seu texto]"</div>
            </div>
            <p className="text-lg font-semibold text-white mt-6">Isso não é censura. É cuidado com quem está do outro lado.</p>
          </motion.div>
        </div>
      </section>

      <section className="w-full py-16 md:py-20 bg-black">
        <div className="mx-auto max-w-[900px] px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <div className="flex items-center gap-3 mb-6"><Shield className="h-8 w-8 text-[#81D8D0]" /><h2 className="text-2xl md:text-3xl font-semibold text-white">Não coletamos dados desnecessários</h2></div>
            <p className="text-lg text-white/80 font-normal mb-6">Este espaço não é voltado para coleta de PII (Informações Pessoais Identificáveis) ou dados sensíveis para fins comerciais.</p>
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
              <p className="font-semibold text-white mb-4">O que coletamos:</p>
              <ul className="space-y-3">{["Email (para login e comunicação)","Nome de exibição (você escolhe)","Dados de uso básicos (para melhorar a plataforma)"].map((item, i) => (<li key={i} className="flex items-start gap-3 text-white/80"><span className="text-[#81D8D0]">•</span><span>{item}</span></li>))}</ul>
            </div>
            <p className="text-lg font-semibold text-white mb-3">Não vendemos, compartilhamos ou comercializamos seus dados.</p>
            <p className="text-lg font-semibold text-[#81D8D0]">Segurança de dados não é promessa de marketing. É compromisso ético.</p>
          </motion.div>
        </div>
      </section>

      <section className="w-full py-16 md:py-24 bg-black">
        <div className="mx-auto max-w-[900px] px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <div className="flex items-center gap-3 mb-6"><LogOut className="h-8 w-8 text-[#C0C0C0]" /><h2 className="text-2xl md:text-3xl font-semibold text-white">Você pode sair quando quiser</h2></div>
            <p className="text-lg text-white/80 font-normal mb-6">Se este espaço deixar de fazer sentido para você, você pode sair.</p>
            <ul className="space-y-4 mb-8">{["Cancele sua assinatura a qualquer momento (sem multas ou truques)","Delete sua conta se desejar (dados removidos em até 30 dias)","Não há pressão para \"ficar\" se não estiver bem"].map((item, i) => (<li key={i} className="flex items-start gap-3 text-white/90"><span className="text-[#81D8D0]">•</span><span className="text-lg font-normal">{item}</span></li>))}</ul>
            <p className="text-xl font-semibold text-white">Este espaço existe para servir você, não para te prender.</p>
          </motion.div>
        </div>
      </section>

      <section className="w-full py-16 md:py-20 bg-gradient-to-t from-[#35363A] to-black">
        <div className="mx-auto max-w-[900px] px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="bg-white/5 border-2 border-[#81D8D0]/30 rounded-2xl p-8 md:p-10">
            <p className="text-lg text-white/80 font-normal mb-6">Ao se cadastrar no NeuroConexão Atípica, você confirma que:</p>
            <ul className="space-y-4 mb-8">{["Tem 18 anos ou mais","Leu e compreendeu estes avisos","Concorda com as diretrizes éticas","Assume responsabilidade por suas interações"].map((item, i) => (<li key={i} className="flex items-start gap-3"><span className="text-[#81D8D0] text-xl">✓</span><span className="text-white text-lg font-normal">{item}</span></li>))}</ul>
            <p className="text-2xl font-semibold text-white text-center">Entrar aqui é uma escolha consciente.</p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
