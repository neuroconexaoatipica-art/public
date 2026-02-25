interface ClaritySectionProps {
  onCtaClick: () => void;
}

export function ClaritySection({ onCtaClick }: ClaritySectionProps) {
  return (
    <section className="w-full py-16 md:py-24" style={{ background: "#D4D4D4" }}>
      <div className="mx-auto max-w-[900px] px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl lg:text-5xl mb-6 text-[#1A1A1A]" style={{ fontWeight: 600 }}>
            O que acontece depois do cadastro
          </h2>
          <p className="text-lg md:text-xl text-[#666] max-w-2xl mx-auto">
            Transparencia total. Sem surpresas. Entrada ritualizada.
          </p>
        </div>
        <div className="text-center">
          <button
            onClick={onCtaClick}
            className="inline-block px-10 py-4 bg-[#81D8D0] text-black rounded-xl text-lg shadow-lg hover:shadow-xl transition-all"
            style={{ fontWeight: 700 }}
          >
            Entrar na Comunidade
          </button>
        </div>
      </div>
    </section>
  );
}
