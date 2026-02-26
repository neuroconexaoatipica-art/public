import { useState } from 'react';
import { supabase } from '../../lib/supabase';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function DeleteAccountModal({ isOpen, onClose }: Props) {
  const [confirm, setConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);

  if (!isOpen) return null;

  const handleDelete = async () => {
    if (confirm !== 'EXCLUIR') return;
    setDeleting(true);
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4" onClick={onClose}>
      <div className="bg-[#111] border border-[#C8102E]/30 rounded-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="p-6 text-center">
          <div className="text-4xl mb-3">⚠️</div>
          <h2 className="text-white text-xl font-semibold mb-2">Excluir Conta</h2>
          <p className="text-white/60 text-sm mb-4">Esta acao e irreversivel. Todos os seus dados serao perdidos. Digite <strong className="text-[#C8102E]">EXCLUIR</strong> para confirmar.</p>
          <input value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Digite EXCLUIR" className="w-full bg-white/5 border border-[#C8102E]/30 rounded-xl px-4 py-2.5 text-white text-center focus:outline-none mb-4" />
          <div className="flex gap-3 justify-center">
            <button onClick={onClose} className="px-6 py-2.5 text-white/60 hover:text-white rounded-xl">Cancelar</button>
            <button onClick={handleDelete} disabled={confirm !== 'EXCLUIR' || deleting} className="px-6 py-2.5 bg-[#C8102E] text-white rounded-xl font-semibold disabled:opacity-40">
              {deleting ? 'Excluindo...' : 'Excluir minha conta'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
