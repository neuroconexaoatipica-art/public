interface Props { isOpen: boolean; onClose: () => void; onSwitchToSignup: () => void; onLoginSuccess?: () => void; }
export function LoginPopup({ isOpen, onClose, onSwitchToSignup }: Props) {
  if (!isOpen) return null;
  return (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"><div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4"><h2 className="text-2xl font-semibold mb-4">Entrar</h2><p className="text-[#666] mb-4">Copie o arquivo real do Figma Make para o formulario completo.</p><div className="flex gap-3"><button onClick={onClose} className="px-6 py-2 border rounded-xl">Fechar</button><button onClick={onSwitchToSignup} className="px-6 py-2 bg-[#81D8D0] text-black rounded-xl">Criar conta</button></div></div></div>);
}
