interface Props { isOpen: boolean; onClose: () => void; }
export function ContactFounderModal({ isOpen, onClose }: Props) {
  if (!isOpen) return null;
  return (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"><div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4"><h2 className="text-2xl font-semibold mb-4">Falar com a fundadora</h2><p className="text-[#666] mb-4">Copie o arquivo real do Figma Make.</p><button onClick={onClose} className="px-6 py-2 bg-[#81D8D0] text-black rounded-xl font-bold">Fechar</button></div></div>);
}
