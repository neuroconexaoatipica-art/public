interface Props { isOpen: boolean; onClose: () => void; onComplete: () => void; }
export function OnboardingFlow({ isOpen, onClose, onComplete }: Props) {
  if (!isOpen) return null;
  return (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"><div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center"><h2 className="text-2xl font-semibold mb-4">Bem-vindo(a)!</h2><p className="text-[#666] mb-6">Copie o arquivo real do Figma Make para o onboarding completo.</p><button onClick={onComplete} className="px-8 py-3 bg-[#81D8D0] text-black rounded-xl font-bold">Continuar</button></div></div>);
}
