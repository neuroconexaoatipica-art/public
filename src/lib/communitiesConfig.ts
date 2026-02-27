// Configuração oficial das 14 comunidades do NeuroConexão Atípica
// FONTE ÚNICA DE VERDADE da UI — nomes EXATAMENTE iguais ao banco
import {
  Scale,
  Eye,
  BrainCircuit,
  Flame,
  Link,
  Handshake,
  Activity,
  Puzzle,
  Zap,
  UsersRound,
  Briefcase,
  PenTool,
  Landmark,
  Users,
  Circle,
} from 'lucide-react';
import type { ComponentType } from 'react';

export interface CommunityConfig {
  name: string;
  description: string;
  icon: ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
  category: 'core' | 'social' | 'neuro' | 'build';
  starters?: string[];
  /** 'active' = aberta e funcionando | 'awaiting_founder' = aguardando fundador */
  status: 'active' | 'awaiting_founder';
  /** Se true, Mila é a moderadora/criadora desta comunidade */
  moderatedByMila: boolean;
}

// UUID da Mila (super_admin) — usado para fallback de owner_id
export const MILA_UUID = 'ce83116b-9593-49f5-a72a-032caa7283ad';

// Nomes exatos das 4 comunidades ativas moderadas pela Mila
export const MILA_ACTIVE_COMMUNITIES = [
  'Mentes em Tensão',
  'Sexo, Desejo & Vínculo',
  'Networking Atípico',
  'Lab de Criação',
];

// Ícone fallback para comunidades sem config
export const FALLBACK_ICON = Circle;

export const COMMUNITIES_CONFIG: CommunityConfig[] = [
  // ── BLOCO 1: Intelecto & Conflito Interno ──
  {
    name: "Campo Ético",
    description: "Filosofia aplicada, dilemas morais, decisões difíceis. Pensamento estruturado para quem não aceita respostas fáceis.",
    icon: Scale,
    color: "#8B0000",
    category: "core",
    status: "awaiting_founder",
    moderatedByMila: false,
    starters: [
      "Existe ética na omissão? Quando não agir é tão grave quanto agir errado?",
      "Lealdade a uma pessoa vs. lealdade à verdade — qual prevalece?",
      "Qual dilema moral te persegue até hoje?"
    ]
  },
  {
    name: "Observatório Social",
    description: "Crítica cultural, análise de narrativas, desmontagem de discursos. Olhar afiado, linguagem direta.",
    icon: Eye,
    color: "#1F2937",
    category: "core",
    status: "awaiting_founder",
    moderatedByMila: false,
    starters: [
      "Qual narrativa cultural você percebeu que estava engolindo sem questionar?",
      "Redes sociais criam conexão real ou só performance de pertencimento?",
      "Que padrão social te cansa mais de ver sendo normalizado?"
    ]
  },
  {
    name: "Mentes em Tensão",
    description: "Pensamento vivo e intenso. Ideias que não descansam. Conflitos internos, obsessões criativas e lucidez desconfortável.",
    icon: BrainCircuit,
    color: "#4B0082",
    category: "core",
    status: "active",
    moderatedByMila: true,
    starters: [
      "Qual pensamento não te deixa dormir ultimamente?",
      "Sua mente mais ajuda ou atrapalha quando você precisa descansar?",
      "Você já teve uma obsessão criativa que consumiu semanas? Conta."
    ]
  },

  // ── BLOCO 2: Corpo, Desejo & Relações ──
  {
    name: "Corpo & Prazer",
    description: "Experiência corporal e prazer. O corpo como território de presença e verdade. Sensações, limites, desejo e consciência sem moralismo, sem pressa.",
    icon: Flame,
    color: "#3B0A0A",
    category: "social",
    status: "awaiting_founder",
    moderatedByMila: false,
    starters: [
      "Qual sensação corporal te traz mais presença?",
      "Já aprendeu a ouvir o corpo antes da cabeça? Como foi esse processo?",
      "Prazer é tabu pra você ou é parte da sua rotina de cuidado?"
    ]
  },
  {
    name: "Sexo, Desejo & Vínculo",
    description: "Sexo, desejo e relações entre adultos. Aqui o desejo é assumido e sustentado. Escolhas explícitas, acordos claros, vínculo construído com responsabilidade.",
    icon: Link,
    color: "#2E1065",
    category: "social",
    status: "active",
    moderatedByMila: true,
    starters: [
      "O que diferencia desejo de carência pra você?",
      "Você consegue ser honesto(a) sobre o que quer dentro de uma relação?",
      "Qual a diferença entre vulnerabilidade e exposição num vínculo?"
    ]
  },
  {
    name: "Relações & Vínculos",
    description: "Amizades, relacionamentos, família. Como mentes intensas constroem e protegem conexões no mundo real.",
    icon: Handshake,
    color: "#6B21A8",
    category: "social",
    status: "awaiting_founder",
    moderatedByMila: false,
    starters: [
      "Qual o vínculo mais difícil que você sustenta hoje?",
      "Você se sente entendido(a) pelas pessoas mais próximas?",
      "Intensidade assusta as pessoas ao seu redor? Como lida?"
    ]
  },
  {
    name: "Corpo & Sensorialidade",
    description: "Hipersensibilidade, percepção corporal, limites físicos. O corpo como sistema nervoso vivo.",
    icon: Activity,
    color: "#374151",
    category: "social",
    status: "awaiting_founder",
    moderatedByMila: false,
    starters: [
      "Quais estímulos sensoriais te sobrecarregam mais no dia a dia?",
      "Você tem algum ritual sensorial que te regula? Compartilha.",
      "Hipersensibilidade já te fez parecer 'exagerado(a)' pra alguém?"
    ]
  },

  // ── BLOCO 3: Neurodivergência & Experiência ──
  {
    name: "Autismo & Masking",
    description: "Mascaramento, exaustão social, identidade autística. Tirar a máscara com lucidez.",
    icon: Puzzle,
    color: "#0F172A",
    category: "neuro",
    status: "awaiting_founder",
    moderatedByMila: false,
    starters: [
      "Quando você percebeu que estava mascarando? O que mudou depois?",
      "Qual situação social te exige mais esforço de performance?",
      "Tem algum interesse especial que te sustenta nos dias difíceis?"
    ]
  },
  {
    name: "TDAH & Produtividade",
    description: "Foco, dispersão, sistemas reais. Estratégias que funcionam fora do mito da performance constante.",
    icon: Zap,
    color: "#1E3A8A",
    category: "neuro",
    status: "awaiting_founder",
    moderatedByMila: false,
    starters: [
      "Qual sistema de organização já funcionou pra você (e por quanto tempo)?",
      "Hiperfoco: bênção ou maldição? Ou os dois?",
      "O que você gostaria que as pessoas entendessem sobre TDAH?"
    ]
  },
  {
    name: "Ansiedade Social",
    description: "Interações sociais, limites, exaustão relacional. Sem romantização.",
    icon: UsersRound,
    color: "#111827",
    category: "neuro",
    status: "awaiting_founder",
    moderatedByMila: false,
    starters: [
      "Qual interação social te drena mais: presencial ou online?",
      "Você já cancelou algo importante por ansiedade? Como lidou depois?",
      "Qual a diferença entre introversão e ansiedade social pra você?"
    ]
  },

  // ── BLOCO 4: Construção & Poder ──
  {
    name: "Networking Atípico",
    description: "Relações profissionais sem verniz corporativo. Conexões reais entre pessoas intensas, inteligentes e cansadas de superficialidade.",
    icon: Briefcase,
    color: "#92400E",
    category: "build",
    status: "active",
    moderatedByMila: true,
    starters: [
      "O que você faz e o que gostaria de estar fazendo profissionalmente?",
      "Já perdeu uma oportunidade por ser 'intenso(a) demais'?",
      "Que tipo de parceria ou colaboração você procura?"
    ]
  },
  {
    name: "Lab de Criação",
    description: "Projetos, escrita, arte, experimentação. Criar com rigor, não com pressa.",
    icon: PenTool,
    color: "#065F46",
    category: "build",
    status: "active",
    moderatedByMila: true,
    starters: [
      "Qual projeto criativo vive na sua cabeça mas nunca saiu do papel?",
      "Você cria melhor sob pressão ou com liberdade total?",
      "Compartilha algo que criou e que te orgulha."
    ]
  },
  {
    name: "Bastidores da Governança",
    description: "Transparência, decisões estruturais, regras. Discordância permitida. Opacidade não.",
    icon: Landmark,
    color: "#7C2D12",
    category: "build",
    status: "awaiting_founder",
    moderatedByMila: false,
    starters: [
      "Que regra ou decisão da plataforma você gostaria de questionar?",
      "Transparência total é possível numa comunidade? Até onde?",
      "O que faria desta plataforma algo realmente diferente das outras?"
    ]
  },

  // ── BLOCO 5: Comunidade Base ──
  {
    name: "Círculo de Pares",
    description: "Apoio horizontal. Escuta ativa. Sem hierarquia terapêutica.",
    icon: Users,
    color: "#334155",
    category: "core",
    status: "awaiting_founder",
    moderatedByMila: false,
    starters: [
      "Como você está hoje — de verdade, sem filtro?",
      "O que te ajuda quando tudo parece demais?",
      "Você sente que pertence a algum lugar? Qual?"
    ]
  },
];

// Mapa de nome -> config para acesso rápido
export const COMMUNITY_BY_NAME: Record<string, CommunityConfig> = {};
COMMUNITIES_CONFIG.forEach(c => {
  COMMUNITY_BY_NAME[c.name] = c;
});

// ═══ RITUAIS DE COMUNIDADE — Tipos disponiveis para agendar ═══
// Fonte unica de verdade. Se no futuro vier do banco, este array e fallback.
export interface CommunityRitualType {
  key: string;
  nome: string;
  desc: string;
  icone: string;
}

export const COMMUNITY_RITUAL_TYPES: CommunityRitualType[] = [
  { key: 'roda_de_escuta', nome: 'Roda de Escuta', desc: 'Cada pessoa fala, as outras escutam. Sem conselho, sem interrupcao.', icone: '🎧' },
  { key: 'checkin_coletivo', nome: 'Check-in Coletivo', desc: 'Como voce esta agora? Uma palavra, uma frase, um silencio.', icone: '🫂' },
  { key: 'sessao_de_foco', nome: 'Sessao de Foco', desc: 'Body doubling coletivo. Cada um no seu, mas juntos.', icone: '🎯' },
  { key: 'desabafo_estruturado', nome: 'Desabafo Estruturado', desc: 'Falar o que precisa sair. Com tempo, com contorno, sem plateia.', icone: '💬' },
  { key: 'debate_guiado', nome: 'Debate Guiado', desc: 'Um tema, regras claras, divergencia permitida.', icone: '⚡' },
  { key: 'ritual_de_acolhimento', nome: 'Ritual de Acolhimento', desc: 'Boas-vindas estruturada para novos membros. Presenca coletiva.', icone: '🌱' },
  { key: 'reflexao_silenciosa', nome: 'Reflexao Silenciosa', desc: 'Momento de pausa coletiva. Cada um consigo, mas em companhia.', icone: '🧘' },
];
