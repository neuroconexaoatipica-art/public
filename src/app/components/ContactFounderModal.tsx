import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useProfileContext } from '../../lib';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function ContactFounderModal({ isOpen, onClose }: Props) {
  const { user } = useProfileContext();
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!message.trim() || !user) return;
    setSending(true);
    try {
      await supabase.from('private_messages').insert({
        sender_id: user.id,
        receiver_id: 'ce83116b-9593-49f5-a72a-032caa7283ad',
        content: message.trim(),
      });
      setSent(true);
    } catch (err) { console.error(err); }
    finally { setSending(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4" onClick={onClose}>
      <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        {sent ? (
          <div className="text-center">
            <div className="text-4xl mb-3">💜</div>
            <h2 className="text-white text-xl font-semibold mb-2">Mensagem enviada!</h2>
            <p className="text-white/60 text-sm mb-4">Mila vai responder assim que possivel.</p>
            <button onClick={onClose} className="px-6 py-2.5 bg-[#81D8D0] text-black rounded-xl font-semibold">Fechar</button>
          </div>
        ) : (
          <>
            <h2 className="text-white text-lg font-semibold mb-1">Falar com a Fundadora</h2>
            <p className="text-white/50 text-sm mb-4">Envie uma mensagem direta para Mila.</p>
            <textarea value={message} onChange={e => setMessage(e.target.value)} rows={4} placeholder="Sua mensagem..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#81D8D0]/50 resize-none mb-4" />
            <div className="flex justify-end gap-3">
              <button onClick={onClose} className="px-5 py-2.5 text-white/60 hover:text-white rounded-xl text-sm">Cancelar</button>
              <button onClick={handleSend} disabled={!message.trim() || sending} className="px-6 py-2.5 bg-[#81D8D0] text-black rounded-xl font-semibold text-sm disabled:opacity-40">
                {sending ? 'Enviando...' : 'Enviar'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
