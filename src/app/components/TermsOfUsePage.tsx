import { motion } from "motion/react";
import { FileText, AlertCircle } from "lucide-react";

export function TermsOfUsePage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="w-full py-20 md:py-28 bg-gradient-to-b from-[#35363A] to-black">
        <div className="mx-auto max-w-[900px] px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <FileText className="h-16 w-16 text-[#81D8D0] mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-white mb-6">
              Termos de Uso
            </h1>
            <p className="text-xl md:text-2xl text-white/80 font-normal">
              NeuroConexão Atípica
            </p>
          </motion.div>
        </div>
      </section>

      {/* Conteúdo */}
      <section className="w-full py-16 md:py-20 bg-black">
        <div className="mx-auto max-w-[900px] px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-8 text-lg text-white/80 font-normal leading-relaxed"
          >
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
              <p className="mb-6">
                A <strong className="text-white">NeuroConexão Atípica</strong> é uma rede social de interação entre pessoas.
              </p>

              <div className="bg-[#C8102E]/10 border border-[#C8102E]/30 rounded-xl p-6 mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-6 w-6 text-[#C8102E] flex-shrink-0 mt-1" />
                  <p className="font-semibold text-white">
                    Este espaço não oferece terapia, diagnóstico ou tratamento de saúde.
                  </p>
                </div>
              </div>

              <p className="mb-6">
                As interações ocorrem entre usuários, sob responsabilidade individual, baseadas em consentimento mútuo.
              </p>

              <p className="mb-6">
                A plataforma não se responsabiliza por encontros presenciais, decisões pessoais ou conteúdos trocados entre usuários.
              </p>

              <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
                <p className="font-semibold text-white mb-4">Não é permitido:</p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <span className="text-[#C8102E]">•</span>
                    <span>Discurso de ódio</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#C8102E]">•</span>
                    <span>Assédio</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#C8102E]">•</span>
                    <span>Uso da plataforma para fins ilegais</span>
                  </li>
                </ul>
              </div>

              <p className="mb-6">
                A moderação pode remover conteúdos ou suspender contas que violem estes termos.
              </p>

              <p className="font-semibold text-white">
                O uso da plataforma implica concordância com estes Termos de Uso.
              </p>
            </div>

            <div className="text-center pt-8 border-t border-white/10">
              <p className="text-white/60 text-base">
                © 2026 NeuroConexão Atípica
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
