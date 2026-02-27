import { motion } from "motion/react";
import { Thermometer } from "lucide-react";

interface CommunityTemperatureProps {
  temperature?: string;
  compact?: boolean;
}

const TEMP_CONFIG: Record<string, { label: string; color: string; bg: string; emoji: string; width: string }> = {
  fervendo: { label: "Fervendo", color: "#C8102E", bg: "#C8102E15", emoji: "🔥", width: "100%" },
  quente: { label: "Quente", color: "#FF6B35", bg: "#FF6B3515", emoji: "🌡️", width: "75%" },
  morna: { label: "Morna", color: "#FFB800", bg: "#FFB80015", emoji: "☀️", width: "50%" },
  fria: { label: "Fria", color: "#81D8D0", bg: "#81D8D015", emoji: "❄️", width: "25%" },
};

export function CommunityTemperature({ temperature = "fria", compact = false }: CommunityTemperatureProps) {
  const config = TEMP_CONFIG[temperature] || TEMP_CONFIG.fria;

  if (compact) {
    return (
      <div
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px]"
        style={{ background: config.bg, color: config.color, fontWeight: 600 }}
      >
        <span>{config.emoji}</span>
        <span>{config.label}</span>
      </div>
    );
  }

  return (
    <div className="bg-white/3 border border-white/6 rounded-xl p-3">
      <div className="flex items-center gap-2 mb-2">
        <Thermometer className="h-3.5 w-3.5" style={{ color: config.color }} />
        <span className="text-white/50 text-[10px] uppercase tracking-wider" style={{ fontWeight: 600 }}>
          Temperatura
        </span>
        <span className="ml-auto text-xs" style={{ color: config.color, fontWeight: 700 }}>
          {config.emoji} {config.label}
        </span>
      </div>
      {/* Barra de temperatura */}
      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: config.width }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ background: config.color }}
        />
      </div>
    </div>
  );
}
