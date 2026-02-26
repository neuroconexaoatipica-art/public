import { useState } from 'react';
import { supabase } from '../../lib/supabase';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
  onSuccess?: () => void;
}

export function SignupPopup({ isOpen, onClose, onSwitchToLogin, onSuccess }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [allowWhatsapp, setAllowWhatsapp] = useState(false);
  const [ageVerified, setAgeVerified] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) return;
    if (!ageVerified) { setError('Voce precisa confirmar que tem 18+ anos.'); return; }
    if (!termsAccepted) { setError('Voce precisa aceitar os termos.'); return; }
    if (password.length < 6) { setError('Senha deve ter no minimo 6 caracteres.'); return; }
    setLoading(true); setError('');
    try {
      const { error: err } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            name: name.trim(),
            whatsapp: whatsapp.trim() || null,
            allow_whatsapp: allowWhatsapp,
            allow_email: true,
          }
        }
      });
      if (err) throw err;
      onSuccess?.();
    } catch (err: any) {
      setError(err.message === 'User already registered' ? 'Este email ja esta cadastrado.' : err.message || 'Erro ao criar conta.');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 overflow-y-auto py-8" onClick={onClose}>
      <div className="bg-white rounded-2xl p-8 max-w-md w-full" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-semibold mb-1 text-[#1a1a1a]">Criar conta</h2>
        <p className="text-[#666] text-sm mb-6">Junte-se ao NeuroConexao Atipica.</p>
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="text-sm text-[#666] mb-1 block">Nome</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Seu nome" required className="w-full border border-[#ddd] rounded-xl px-4 py-3 focus:outline-none focus:border-[#81D8D0]" />
          </div>
          <div>
            <label className="text-sm text-[#666] mb-1 block">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" required className="w-full border border-[#ddd] rounded-xl px-4 py-3 focus:outline-none focus:border-[#81D8D0]" />
          </div>
          <div>
            <label className="text-sm text-[#666] mb-1 block">Senha</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Minimo 6 caracteres" required className="w-full border border-[#ddd] rounded-xl px-4 py-3 focus:outline-none focus:border-[#81D8D0]" />
          </div>
          <div>
            <label className="text-sm text-[#666] mb-1 block">WhatsApp (opcional)</label>
            <input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="+55 11 99999-9999" className="w-full border border-[#ddd] rounded-xl px-4 py-3 focus:outline-none focus:border-[#81D8D0]" />
          </div>
          {whatsapp && (
            <label className="flex items-center gap-2 text-sm text-[#666] cursor-pointer">
              <input type="checkbox" checked={allowWhatsapp} onChange={e => setAllowWhatsapp(e.target.checked)} className="accent-[#81D8D0]" />
              Permitir contato via WhatsApp
            </label>
          )}
          <label className="flex items-start gap-2 text-sm text-[#666] cursor-pointer">
            <input type="checkbox" checked={ageVerified} onChange={e => setAgeVerified(e.target.checked)} className="accent-[#81D8D0] mt-0.5" />
            <span>Confirmo que tenho <strong>18 anos ou mais</strong>.</span>
          </label>
          <label className="flex items-start gap-2 text-sm text-[#666] cursor-pointer">
            <input type="checkbox" checked={termsAccepted} onChange={e => setTermsAccepted(e.target.checked)} className="accent-[#81D8D0] mt-0.5" />
            <span>Li e aceito os <a href="#terms" className="text-[#C8102E] underline">Termos de Uso</a> e a <a href="#privacy" className="text-[#C8102E] underline">Politica de Privacidade</a>.</span>
          </label>
          {error && <p className="text-[#C8102E] text-sm">{error}</p>}
          <button type="submit" disabled={loading} className="w-full py-3 bg-[#C8102E] text-white rounded-xl font-bold disabled:opacity-50">
            {loading ? 'Criando...' : 'Criar minha conta'}
          </button>
        </form>
        <div className="mt-4 text-center">
          <span className="text-[#999] text-sm">Ja tem conta? </span>
          <button onClick={onSwitchToLogin} className="text-[#81D8D0] text-sm font-semibold hover:underline">Entrar</button>
        </div>
      </div>
    </div>
  );
}
