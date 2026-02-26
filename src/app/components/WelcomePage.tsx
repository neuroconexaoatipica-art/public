interface Props {
  onCreatePost: () => void;
  onCompleteProfile: () => void;
  onContactFounder: () => void;
}

export function WelcomePage({ onCreatePost, onCompleteProfile, onContactFounder }: Props) {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">🧠</div>
        <h1 className="text-4xl font-semibold text-white mb-3">Voce esta dentro.</h1>
        <p className="text-[#81D8D0] text-xl mb-2">Bem-vindo(a) ao NeuroConexao Atipica.</p>
        <p className="text-white/50 text-sm mb-8">Um espaco seguro para mentes intensas se encontrarem.</p>
        <div className="space-y-3">
          <button onClick={onCreatePost} className="w-full py-4 bg-[#81D8D0] text-black rounded-xl font-bold text-lg hover:bg-[#81D8D0]/90 transition-colors">
            Escrever meu primeiro post
          </button>
          <button onClick={onCompleteProfile} className="w-full py-4 bg-white/5 border-2 border-white/20 text-white rounded-xl font-semibold hover:bg-white/10 transition-colors">
            Completar meu perfil
          </button>
          <button onClick={onContactFounder} className="w-full py-3 text-white/40 hover:text-[#81D8D0] text-sm transition-colors">
            Falar com a fundadora 💜
          </button>
        </div>
      </div>
    </div>
  );
}
