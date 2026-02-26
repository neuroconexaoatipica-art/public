import { useState } from 'react';
import { supabase } from '../../lib/supabase';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignup: () => void;
  onLoginSuccess?: () => void;
}

export function LoginPopup({ isOpen, onClose, onSwitchToSignup, onLoginSuccess }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setLoading(true); setError('');
    try {
      const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (err) throw err;
      onLoginSuccess?.();
    } catch (err: any) {
      setError(err.message === 'Invalid login credentials' ? 'Email ou senha incorretos.' : err.message || 'Erro ao entrar.');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-8 max-w-md w-full" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-semibold mb-1 text-[#1a1a1a]">Entrar</h2>
        <p className="text-[#666] text-sm mb-6">Bem-vindo(a) de volta ao NeuroConexao.</p>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-sm text-[#666] mb-1 block">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" required className="w-full border border-[#ddd] rounded-xl px-4 py-3 focus:outline-none focus:border-[#81D8D0]" />
          </div>
          <div>
            <label className="text-sm text-[#666] mb-1 block">Senha</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Sua senha" required className="w-full border border-[#ddd] rounded-xl px-4 py-3 focus:outline-none focus:border-[#81D8D0]" />
          </div>
          {error && <p className="text-[#C8102E] text-sm">{error}</p>}
          <button type="submit" disabled={loading} className="w-full py-3 bg-[#81D8D0] text-black rounded-xl font-bold disabled:opacity-50">
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        <div className="mt-4 text-center">
          <span className="text-[#999] text-sm">Nao tem conta? </span>
          <button onClick={onSwitchToSignup} className="text-[#C8102E] text-sm font-semibold hover:underline">Criar conta</button>
        </div>
        <button onClick={onClose} className="absolute top-4 right-4 text-[#999] hover:text-[#333] text-xl hidden">✕</button>
      </div>
    </div>
  );
}
