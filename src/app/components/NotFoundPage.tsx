import { motion } from "motion/react";
import { ArrowLeft, Search } from "lucide-react";
import { useNavigate } from "react-router";
import { LogoIcon } from "./LogoIcon";

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "#D4D4D4" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-md"
      >
        <LogoIcon size={56} className="h-14 w-14 mx-auto mb-6" />

        <h1 className="text-6xl md:text-7xl text-[#C8102E] mb-4" style={{ fontWeight: 800 }}>
          404
        </h1>

        <h2 className="text-xl md:text-2xl text-[#1A1A1A] mb-3" style={{ fontWeight: 600 }}>
          Pagina nao encontrada
        </h2>

        <p className="text-[#666] mb-8">
          Essa pagina nao existe ou foi movida. Mas o territorio continua aqui.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#C8102E] text-white rounded-xl text-sm transition-all hover:bg-[#A50D24]"
            style={{ fontWeight: 600 }}
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao inicio
          </button>

          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/80 text-[#1A1A1A] border border-[#1A1A1A]/15 rounded-xl text-sm transition-all hover:bg-white"
            style={{ fontWeight: 500 }}
          >
            <Search className="h-4 w-4" />
            Pagina anterior
          </button>
        </div>
      </motion.div>
    </div>
  );
}