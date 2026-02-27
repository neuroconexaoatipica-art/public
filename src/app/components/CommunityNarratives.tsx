/**
 * CommunityNarratives — Narrativas tematicas por comunidade
 * 
 * Cada comunidade tem formatos de post tematico:
 * "Confissao Intelectual", "Carta Aberta", "Relato de Fronteira" etc.
 * O membro escolhe um formato e recebe um prompt que ajuda a escrever.
 * Ao clicar, abre o modal de criacao de post com o prompt pre-preenchido.
 */

import { motion } from "motion/react";
import {
  Feather, ScrollText, BookOpen, Heart, Flame, Lightbulb,
  Eye, Shield, Sparkles, PenTool
} from "lucide-react";
import type { ComponentType } from "react";

interface NarrativeTemplate {
  id: string;
  title: string;
  description: string;
  prompt: string;
  icon: ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
}

// Narrativas por categoria de comunidade
const NARRATIVES_BY_CATEGORY: Record<string, NarrativeTemplate[]> = {
  core: [
    {
      id: "confissao_intelectual",
      title: "Confissao Intelectual",
      description: "Algo que voce pensa mas nunca diz em voz alta",
      prompt: "[Confissao Intelectual]\n\nEu penso algo que nunca digo em voz alta:\n\n",
      icon: ScrollText,
      color: "#C8102E",
    },
    {
      id: "pensamento_proibido",
      title: "Pensamento Proibido",
      description: "Uma ideia que incomoda ate voce mesmo",
      prompt: "[Pensamento Proibido]\n\nTem uma ideia que me incomoda ate a mim:\n\n",
      icon: Eye,
      color: "#4B0082",
    },
    {
      id: "lucidez_desconfortavel",
      title: "Lucidez Desconfortavel",
      description: "Quando voce enxerga algo que preferiria nao ver",
      prompt: "[Lucidez Desconfortavel]\n\nEu enxergo algo que preferiria nao ver:\n\n",
      icon: Lightbulb,
      color: "#FF6B35",
    },
  ],
  social: [
    {
      id: "carta_aberta",
      title: "Carta Aberta",
      description: "Uma carta para alguem que nunca vai ler",
      prompt: "[Carta Aberta]\n\nPara voce, que nunca vai ler isso:\n\n",
      icon: Feather,
      color: "#6B21A8",
    },
    {
      id: "relato_de_fronteira",
      title: "Relato de Fronteira",
      description: "O momento em que voce cruzou um limite pessoal",
      prompt: "[Relato de Fronteira]\n\nExistiu um momento em que eu cruzei meu proprio limite:\n\n",
      icon: Shield,
      color: "#2E1065",
    },
    {
      id: "o_que_nao_se_diz",
      title: "O Que Nao Se Diz",
      description: "O nao-dito que pesa mais que qualquer palavra",
      prompt: "[O Que Nao Se Diz]\n\nO que eu nunca digo, mas carrego:\n\n",
      icon: Heart,
      color: "#3B0A0A",
    },
  ],
  neuro: [
    {
      id: "diario_sensorial",
      title: "Diario Sensorial",
      description: "Como seu corpo sentiu o mundo hoje",
      prompt: "[Diario Sensorial]\n\nHoje meu corpo sentiu o mundo assim:\n\n",
      icon: Flame,
      color: "#374151",
    },
    {
      id: "mapa_da_sobrecarga",
      title: "Mapa da Sobrecarga",
      description: "O que te sobrecarregou e como voce lidou",
      prompt: "[Mapa da Sobrecarga]\n\nO que me sobrecarregou e o que fiz:\n\n",
      icon: Sparkles,
      color: "#0F766E",
    },
  ],
  build: [
    {
      id: "prototipo_em_voz_alta",
      title: "Prototipo em Voz Alta",
      description: "Uma ideia crua que voce quer testar com o grupo",
      prompt: "[Prototipo em Voz Alta]\n\nTenho uma ideia crua e quero testar:\n\n",
      icon: PenTool,
      color: "#059669",
    },
    {
      id: "fracasso_util",
      title: "Fracasso Util",
      description: "Algo que deu errado mas ensinou muito",
      prompt: "[Fracasso Util]\n\nIsso deu errado, mas aprendi:\n\n",
      icon: BookOpen,
      color: "#B45309",
    },
  ],
};

// Narrativas universais (aparecem em todas as comunidades)
const UNIVERSAL_NARRATIVES: NarrativeTemplate[] = [
  {
    id: "gratidao_atipica",
    title: "Gratidao Atipica",
    description: "Algo pelo qual voce e grato de um jeito que so voce entende",
    prompt: "[Gratidao Atipica]\n\nEu sou grato por algo que talvez so eu entenda:\n\n",
    icon: Heart,
    color: "#81D8D0",
  },
];

interface CommunityNarrativesProps {
  communityCategory: "core" | "social" | "neuro" | "build";
  communityColor: string;
  onSelectNarrative: (prompt: string, title: string) => void;
}

export function CommunityNarratives({
  communityCategory,
  communityColor,
  onSelectNarrative,
}: CommunityNarrativesProps) {
  const categoryNarratives = NARRATIVES_BY_CATEGORY[communityCategory] || NARRATIVES_BY_CATEGORY.core;
  const allNarratives = [...categoryNarratives, ...UNIVERSAL_NARRATIVES];

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Feather className="h-4 w-4" style={{ color: communityColor }} />
        <h3 className="text-xs text-white uppercase tracking-wider font-bold">Narrativas</h3>
        <span className="text-[9px] text-white/25 ml-1">Escolha um formato para escrever</span>
      </div>

      {/* Grid de narrativas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {allNarratives.map((narrative, idx) => {
          const IconComp = narrative.icon;
          return (
            <motion.button
              key={narrative.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              onClick={() => onSelectNarrative(narrative.prompt, narrative.title)}
              className="flex items-start gap-3 p-3 bg-white/3 hover:bg-white/8 border border-white/8 hover:border-white/15 rounded-xl text-left transition-all group"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 transition-transform group-hover:scale-110"
                style={{ background: `${narrative.color}15`, border: `1px solid ${narrative.color}25` }}
              >
                <IconComp className="h-4 w-4" style={{ color: narrative.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white font-semibold truncate group-hover:text-[#81D8D0] transition-colors">
                  {narrative.title}
                </p>
                <p className="text-[10px] text-white/35 leading-relaxed mt-0.5 line-clamp-2">
                  {narrative.description}
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// Export para uso em outros componentes
export { NARRATIVES_BY_CATEGORY, UNIVERSAL_NARRATIVES };
export type { NarrativeTemplate };
