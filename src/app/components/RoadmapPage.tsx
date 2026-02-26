interface Props {
  onBack: () => void;
}

const ROADMAP = [
  { phase: 'Fase 1 — Fundacao', status: 'done', items: ['Cadastro e autenticacao', 'Landing page institucional', '14 comunidades criadas', 'Feed publico e posts', 'Sistema de roles (6 niveis)', 'Chat em tempo real', 'Paginas legais (etica, privacidade, termos)'] },
  { phase: 'Fase 2 — Conexao', status: 'active', items: ['Sistema de conexoes entre membros', 'Perfil completo com abas', 'Reacoes semanticas (6 tipos)', 'Eventos e rituais', 'Notificacoes em tempo real', 'Mensagens privadas', 'Desafios diarios'] },
  { phase: 'Fase 3 — Profundidade', status: 'planned', items: ['Nucleos territoriais ativos', 'Governanca participativa', 'Sistema de moderacao comunitaria', 'Metricas de participacao', 'Planos pagos (member_paid)', 'Selo de fundador'] },
  { phase: 'Fase 4 — Expansao', status: 'planned', items: ['App mobile (PWA)', 'Integracao com WhatsApp', 'API publica', 'Marketplace de servicos', 'Eventos presenciais', 'Parcerias institucionais'] },
];

export function RoadmapPage({ onBack }: Props) {
  return (
    <div className="min-h-screen bg-black">
      <header className="sticky top-0 z-40 bg-black/95 backdrop-blur border-b border-white/10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={onBack} className="text-[#81D8D0] hover:underline text-sm">← Voltar</button>
          <h1 className="text-white font-semibold">Roadmap</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <p className="text-white/60 mb-8">O caminho que estamos construindo juntos. Transparencia total.</p>
        <div className="space-y-8">
          {ROADMAP.map((phase, i) => (
            <div key={i} className={`relative pl-8 border-l-2 ${phase.status === 'done' ? 'border-[#81D8D0]' : phase.status === 'active' ? 'border-[#C8102E]' : 'border-white/10'}`}>
              <div className={`absolute -left-2.5 top-0 w-5 h-5 rounded-full border-2 ${phase.status === 'done' ? 'bg-[#81D8D0] border-[#81D8D0]' : phase.status === 'active' ? 'bg-[#C8102E] border-[#C8102E] animate-pulse' : 'bg-black border-white/20'}`}></div>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-white font-semibold">{phase.phase}</h3>
                {phase.status === 'done' && <span className="text-xs bg-[#81D8D0]/20 text-[#81D8D0] px-2 py-0.5 rounded-full">Concluido</span>}
                {phase.status === 'active' && <span className="text-xs bg-[#C8102E]/20 text-[#C8102E] px-2 py-0.5 rounded-full">Em andamento</span>}
                {phase.status === 'planned' && <span className="text-xs bg-white/10 text-white/40 px-2 py-0.5 rounded-full">Planejado</span>}
              </div>
              <ul className="space-y-1.5">
                {phase.items.map((item, j) => (
                  <li key={j} className="text-white/60 text-sm flex items-center gap-2">
                    <span className={phase.status === 'done' ? 'text-[#81D8D0]' : 'text-white/30'}>{phase.status === 'done' ? '✓' : '○'}</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
