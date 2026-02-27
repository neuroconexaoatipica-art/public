import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { HelpCircle, ChevronDown, Brain } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    question: "Preciso ter diagnostico de neurodivergencia para entrar?",
    answer: "Nao. A NeuroConexao Atipica e para qualquer pessoa que se identifique como neurodivergente — diagnosticada ou nao. O que importa e a presenca honesta, nao o laudo.",
  },
  {
    question: "O que e 'acesso vitalicio' dos membros fundadores?",
    answer: "Os primeiros 80 membros que se cadastrarem durante o beta fechado ganham acesso permanente a toda a plataforma. Sem mensalidade. Sem renovacao. Mesmo quando a plataforma se tornar paga, voce continua com acesso total.",
  },
  {
    question: "Como funcionam os rituais?",
    answer: "Rituais sao praticas culturais da comunidade — nao sao algoritmos. Exemplos: Confissao Intelectual (compartilhar algo que voce pensa mas nunca disse), Pergunta de 24h (uma questao que desaparece em 24 horas), Teoria Nao Validada (ideias malucas sem julgamento). Cada ritual tem formato e proposito definidos.",
  },
  {
    question: "Isso e uma rede social como as outras?",
    answer: "Nao. Aqui nao tem algoritmo de engajamento, nao tem likes publicos competitivos, nao tem anuncios. A conexao e humana, os rituais substituem o scroll infinito, e a fundadora conhece cada membro pessoalmente.",
  },
  {
    question: "Preciso ter mais de 18 anos?",
    answer: "Sim. A plataforma e exclusiva para maiores de 18 anos. Isso e verificado no cadastro e faz parte do nosso compromisso com seguranca e profundidade das conversas.",
  },
  {
    question: "Posso criar minha propria comunidade?",
    answer: "Sim — como Fundador de Comunidade. Voce pode se candidatar apos o cadastro. A selecao e feita pela fundadora com base no alinhamento cultural e compromisso de presenca. Founders recebem onboarding de lideranca com 4 etapas culturais.",
  },
  {
    question: "Meus dados estao seguros?",
    answer: "Sim. Usamos Supabase com criptografia, Row Level Security em todas as tabelas, e nunca vendemos ou compartilhamos dados. Voce pode deixar seu perfil privado a qualquer momento e ativar o Modo Recolhimento para desaparecer temporariamente.",
  },
  {
    question: "Tem encontros presenciais?",
    answer: "Estamos organizando o primeiro encontro presencial em Sao Paulo para 2026. Alem disso, temos nucleos territoriais por estado para conectar membros que moram perto. A plataforma e digital E presencial.",
  },
];

export function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section className="w-full py-16 md:py-20" style={{ background: "#D4D4D4" }}>
      <div className="mx-auto max-w-[800px] px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#1A1A1A]/5 border border-[#1A1A1A]/10 rounded-full mb-4">
            <Brain className="h-4 w-4 text-[#1A1A1A]" />
            <span className="text-xs text-[#1A1A1A] uppercase tracking-wider" style={{ fontWeight: 700 }}>
              Perguntas frequentes
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl text-[#1A1A1A] mb-2" style={{ fontWeight: 600 }}>
            Antes de entrar, saiba
          </h2>
          <p className="text-sm text-[#777]">
            Respostas diretas pra quem precisa de clareza
          </p>
        </motion.div>

        {/* FAQ Items */}
        <div className="space-y-3">
          {FAQ_ITEMS.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
            >
              <button
                onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                className={`w-full text-left bg-white border-2 rounded-2xl p-5 transition-all duration-300 ${
                  openIdx === idx
                    ? "border-[#C8102E]/20 shadow-md"
                    : "border-[#1A1A1A]/8 hover:border-[#1A1A1A]/15 shadow-sm"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <HelpCircle
                      className="h-5 w-5 mt-0.5 flex-shrink-0 transition-colors"
                      style={{ color: openIdx === idx ? "#C8102E" : "#999" }}
                    />
                    <span className="text-[#1A1A1A] text-sm md:text-base leading-relaxed" style={{ fontWeight: 600 }}>
                      {item.question}
                    </span>
                  </div>
                  <motion.div
                    animate={{ rotate: openIdx === idx ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="h-5 w-5 text-[#999] flex-shrink-0" />
                  </motion.div>
                </div>

                <AnimatePresence>
                  {openIdx === idx && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <p className="text-sm text-[#555] leading-relaxed mt-4 ml-8">
                        {item.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
