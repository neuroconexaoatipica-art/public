import { forwardRef } from "react";
export const CommunitiesShowcase = forwardRef<HTMLElement>(function CommunitiesShowcase(props: any, ref) {
  return (<section ref={ref} className="w-full py-16 md:py-24" style={{ background: "#D4D4D4" }}><div className="mx-auto max-w-[1200px] px-6 text-center"><p className="text-[#999] text-sm uppercase tracking-wider mb-4">Secao</p><h2 className="text-3xl md:text-4xl text-[#1A1A1A] font-semibold">CommunitiesShowcase</h2><p className="text-[#666] mt-4">Copie o arquivo real do Figma Make para ver esta secao completa.</p></div></section>);
});
