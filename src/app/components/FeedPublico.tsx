export function FeedPublico(props: any) {
  const goBack = props.onBack || (() => {});
  return (<div className="min-h-screen bg-black text-white p-8"><div className="max-w-2xl mx-auto"><button onClick={goBack} className="text-[#81D8D0] mb-6 hover:underline">Voltar</button><h1 className="text-3xl font-semibold mb-4">FeedPublico</h1><p className="text-white/60">Componente em implantacao. Copie o arquivo real do Figma Make.</p></div></div>);
}
