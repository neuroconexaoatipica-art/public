import { useLegalPage } from "../../lib/useCMS";
import type { LegalPageKey } from "../../lib/useCMS";
interface Props { pageKey: LegalPageKey; fallback?: React.ReactNode; onBack: () => void; }
export function LegalPageView({ pageKey, fallback, onBack }: Props) {
  const { page, isLoading } = useLegalPage(pageKey as any);
  if (isLoading) return (<div className="min-h-screen bg-black flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#81D8D0] border-t-transparent rounded-full animate-spin" /></div>);
  if (!page && fallback) return <>{fallback}</>;
  return (<div className="min-h-screen bg-black text-white"><div className="max-w-3xl mx-auto px-6 py-12"><button onClick={onBack} className="text-[#81D8D0] mb-6 hover:underline">Voltar</button><h1 className="text-3xl font-semibold mb-8">{page?.title || pageKey}</h1>{page?.content_html ? (<div className="legal-content" dangerouslySetInnerHTML={{ __html: page.content_html }} />) : (<p className="text-white/60">Conteudo nao encontrado.</p>)}</div></div>);
}
