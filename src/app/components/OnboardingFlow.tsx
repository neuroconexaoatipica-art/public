import { useState } from 'react';
import { useCommunitiesContext } from '../../lib';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function OnboardingFlow({ isOpen, onClose, onComplete }: Props) {
  const { communities } = useCommunitiesContext();
  const [step, setStep] = useState(0);
  const [selectedCommunities, setSelectedCommunities] = useState<string[]>([]);

  if (!isOpen) return null;

  const toggleCommunity = (name: string) => {
    setSelectedCommunities(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]);
  };

  const steps = [
    // Step 0: Boas-vindas
    <div key="welcome" className="text-center">
      <div className="text-5xl mb-4">🧠</div>
      <h2 className="text-2xl font-semibold mb-2 text-[#1a1a1a]">Bem-vindo(a) ao NeuroConexao</h2>
      <p className="text-[#666] mb-6">Um espaco seguro para mentes atipicas se conectarem.</p>
      <button onClick={() => setStep(1)} className="px-8 py-3 bg-[#81D8D0] text-black rounded-xl font-bold">Vamos la!</button>
    </div>,
    // Step 1: Comunidades
    <div key="communities">
      <h2 className="text-xl font-semibold mb-2 text-[#1a1a1a]">Escolha comunidades</h2>
      <p className="text-[#666] text-sm mb-4">Voce pode mudar depois. Selecione as que te interessam:</p>
      <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto mb-4">
        {communities.slice(0, 14).map(c => (
          <button key={c.id} onClick={() => toggleCommunity(c.name)}
            className={`text-left p-3 rounded-xl border text-sm transition-colors ${selectedCommunities.includes(c.name) ? 'bg-[#81D8D0]/10 border-[#81D8D0] text-[#1a1a1a]' : 'border-[#ddd] text-[#666] hover:border-[#81D8D0]/50'}`}>
            <span className="font-medium">{c.name}</span>
          </button>
        ))}
      </div>
      <button onClick={onComplete} className="w-full py-3 bg-[#81D8D0] text-black rounded-xl font-bold">
        {selectedCommunities.length > 0 ? `Entrar (${selectedCommunities.length} selecionadas)` : 'Pular e entrar'}
      </button>
    </div>,
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 px-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full max-h-[85vh] overflow-y-auto">
        {steps[step]}
      </div>
    </div>
  );
}
