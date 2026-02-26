import {
  Scale, Eye, BrainCircuit, Flame, Link, Handshake, Activity,
  Puzzle, Zap, UsersRound, Briefcase, PenTool, Landmark, Users, Circle,
} from 'lucide-react';
import type { ComponentType } from 'react';

export interface CommunityConfig {
  name: string;
  description: string;
  icon: ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
  category: 'core' | 'social' | 'neuro' | 'build';
  starters?: string[];
}

export const FALLBACK_ICON = Circle;

export const COMMUNITIES_CONFIG: CommunityConfig[] = [
  { name: "Campo Etico", description: "Filosofia aplicada, dilemas morais, decisoes dificeis.", icon: Scale, color: "#8B0000", category: "core", starters: ["Existe etica na omissao?","Lealdade a uma pessoa vs. lealdade a verdade?","Qual dilema moral te persegue?"] },
  { name: "Observatorio Social", description: "Critica cultural, analise de narrativas, desmontagem de discursos.", icon: Eye, color: "#1F2937", category: "core", starters: ["Qual narrativa cultural voce engolia sem questionar?","Redes sociais criam conexao real?","Que padrao social te cansa?"] },
  { name: "Mentes em Tensao", description: "Pensamento vivo e intenso. Ideias que nao descansam.", icon: BrainCircuit, color: "#4B0082", category: "core", starters: ["Qual pensamento nao te deixa dormir?","Sua mente mais ajuda ou atrapalha?","Ja teve uma obsessao criativa?"] },
  { name: "Corpo & Prazer", description: "Experiencia corporal e prazer. O corpo como territorio de presenca.", icon: Flame, color: "#3B0A0A", category: "social", starters: ["Qual sensacao corporal te traz mais presenca?","Ja aprendeu a ouvir o corpo antes da cabeca?","Prazer e tabu pra voce?"] },
  { name: "Sexo, Desejo & Vinculo", description: "Sexo, desejo e relacoes entre adultos.", icon: Link, color: "#2E1065", category: "social", starters: ["O que diferencia desejo de carencia?","Voce consegue ser honesto sobre o que quer?","Qual a diferenca entre vulnerabilidade e exposicao?"] },
  { name: "Relacoes & Vinculos", description: "Amizades, relacionamentos, familia.", icon: Handshake, color: "#6B21A8", category: "social", starters: ["Qual o vinculo mais dificil que voce sustenta?","Voce se sente entendido(a)?","Intensidade assusta as pessoas?"] },
  { name: "Corpo & Sensorialidade", description: "Hipersensibilidade, percepcao corporal, limites fisicos.", icon: Activity, color: "#374151", category: "social", starters: ["Quais estimulos sensoriais te sobrecarregam?","Voce tem algum ritual sensorial que te regula?","Hipersensibilidade ja te fez parecer exagerado(a)?"] },
  { name: "Autismo & Masking", description: "Mascaramento, exaustao social, identidade autistica.", icon: Puzzle, color: "#0F172A", category: "neuro", starters: ["Quando voce percebeu que estava mascarando?","Qual situacao social te exige mais esforco?","Tem algum interesse especial que te sustenta?"] },
  { name: "TDAH & Produtividade", description: "Foco, dispersao, sistemas reais.", icon: Zap, color: "#1E3A8A", category: "neuro", starters: ["Qual sistema de organizacao ja funcionou?","Hiperfoco: bencao ou maldicao?","O que voce gostaria que as pessoas entendessem sobre TDAH?"] },
  { name: "Ansiedade Social", description: "Interacoes sociais, limites, exaustao relacional.", icon: UsersRound, color: "#111827", category: "neuro", starters: ["Qual interacao social te drena mais?","Voce ja cancelou algo importante por ansiedade?","Qual a diferenca entre introversao e ansiedade social?"] },
  { name: "Networking Atipico", description: "Relacoes profissionais sem verniz corporativo.", icon: Briefcase, color: "#92400E", category: "build", starters: ["O que voce faz e o que gostaria de estar fazendo?","Ja perdeu uma oportunidade por ser intenso(a) demais?","Que tipo de parceria voce procura?"] },
  { name: "Lab de Criacao", description: "Projetos, escrita, arte, experimentacao.", icon: PenTool, color: "#065F46", category: "build", starters: ["Qual projeto criativo vive na sua cabeca?","Voce cria melhor sob pressao ou com liberdade?","Compartilha algo que criou e que te orgulha."] },
  { name: "Bastidores da Governanca", description: "Transparencia, decisoes estruturais, regras.", icon: Landmark, color: "#7C2D12", category: "build", starters: ["Que regra voce gostaria de questionar?","Transparencia total e possivel?","O que faria desta plataforma algo diferente?"] },
  { name: "Circulo de Pares", description: "Apoio horizontal. Escuta ativa. Sem hierarquia terapeutica.", icon: Users, color: "#334155", category: "core", starters: ["Como voce esta hoje de verdade?","O que te ajuda quando tudo parece demais?","Voce sente que pertence a algum lugar?"] },
];

export const COMMUNITY_BY_NAME: Record<string, CommunityConfig> = {};
COMMUNITIES_CONFIG.forEach(c => {
  COMMUNITY_BY_NAME[c.name] = c;
});
