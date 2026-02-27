import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MapPin, Bell, Check, X } from "lucide-react";
import { supabase } from "../../lib/supabase";

export function EncounterBanner() {
  const [wantsNotify, setWantsNotify] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.includes("@")) return;
    setLoading(true);
    try {
      await supabase.from("contact_requests").insert({
        reason: "other",
        message: `[ENCONTRO SP] Email para aviso: ${email}`,
        status: "pending",
      });
    } catch {
      // Silencioso — nao punir usuario
    }
    setLoading(false);
    setSubmitted(true);
    setShowForm(false);
  };

  return (
    <section className="w-full py-12 md:py-16" style={{ background: "#1A1A1A" }}>
      <div className="mx-auto max-w-[900px] px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-2xl p-8 md:p-12 text-center"
          style={{ background: "linear-gradient(135deg, #1A1A1A 0%, #2A2A2A 100%)", border: "2px solid rgba(255,107,53,0.3)" }}
        >
          {/* Glow */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#FF6B35]/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#C8102E]/8 rounded-full blur-3xl" />
          </div>

          <div className="relative">
            {/* Badge */}
            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="inline-flex items-center gap-2 bg-[#FF6B35]/15 border border-[#FF6B35]/30 rounded-full px-4 py-2 mb-6"
            >
              <MapPin className="h-4 w-4 text-[#FF6B35]" />
              <span className="text-sm text-[#FF6B35]" style={{ fontWeight: 700 }}>ENCONTRO PRESENCIAL</span>
            </motion.div>

            {/* Title */}
            <h2 className="text-3xl md:text-4xl text-white mb-3" style={{ fontWeight: 700 }}>
              Encontro SP — Junho 2026
            </h2>
            <p className="text-lg text-white/60 mb-8 max-w-lg mx-auto">
              Em organizacao. O primeiro encontro presencial da comunidade. Saindo da tela. Entrando na vida.
            </p>

            {/* CTA */}
            {submitted ? (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#0A8F85] text-white rounded-xl"
                style={{ fontWeight: 600 }}
              >
                <Check className="h-5 w-5" />
                Voce sera avisado!
              </motion.div>
            ) : showForm ? (
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col sm:flex-row items-center gap-3 max-w-md mx-auto"
                >
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Seu melhor email"
                    className="flex-1 w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:border-[#FF6B35]/50 focus:outline-none text-sm"
                  />
                  <div className="flex gap-2">
                    <motion.button
                      onClick={handleSubmit}
                      disabled={loading || !email.includes("@")}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-6 py-3 bg-[#FF6B35] text-white rounded-xl text-sm disabled:opacity-50 transition-opacity"
                      style={{ fontWeight: 700 }}
                    >
                      {loading ? "Enviando..." : "Quero ser avisado"}
                    </motion.button>
                    <button
                      onClick={() => setShowForm(false)}
                      className="p-3 text-white/40 hover:text-white/70 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <motion.button
                  onClick={() => setShowForm(true)}
                  whileHover={{ scale: 1.03, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-[#FF6B35] text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
                  style={{ fontWeight: 700 }}
                >
                  <Bell className="h-5 w-5" />
                  Quero ser avisado
                </motion.button>
                <motion.button
                  onClick={() => setWantsNotify(!wantsNotify)}
                  whileTap={{ scale: 0.95 }}
                  className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm border transition-all ${
                    wantsNotify
                      ? "bg-white/10 text-white border-white/30"
                      : "bg-transparent text-white/50 border-white/10 hover:border-white/25"
                  }`}
                  style={{ fontWeight: 600 }}
                >
                  <MapPin className="h-4 w-4" />
                  {wantsNotify ? "Sou de SP — anotado!" : "Sou de SP / regiao"}
                </motion.button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
