import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ArrowRight, ArrowLeft, CheckCircle, Loader2, Shield } from "lucide-react";
import { supabase, COMMUNITIES_CONFIG } from "../../lib";

interface OnboardingFlowProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function OnboardingFlow({ isOpen, onClose, onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [displayName, setDisplayName] = useState("");
  const [shortBio, setShortBio] = useState("");
  const [selectedCommunities, setSelectedCommunities] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ethicalAccepted, setEthicalAccepted] = useState(false);

  const totalSteps = 3;

  useEffect(() => {
    if (!isOpen) return;

    setCurrentStep(0);
    setShortBio("");
    setSelectedCommunities([]);
    setIsSubmitting(false);
    setEthicalAccepted(false);

    const loadName = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.user_metadata?.name) {
          setDisplayName(user.user_metadata.name);
        } else {
          setDisplayName("");
        }
      } catch {
        setDisplayName("");
      }
    };

    loadName();
  }, [isOpen]);

  const toggleCommunity = (communityName: string) => {
    setSelectedCommunities(prev =>
      prev.includes(communityName)
        ? prev.filter(n => n !== communityName)
        : [...prev, communityName]
    );
  };

  const canProceed = () => {
    if (currentStep === 0) return displayName.trim().length >= 2;
    if (currentStep === 1) return selectedCommunities.length >= 1;
    if (currentStep === 2) return ethicalAccepted;
    return false;
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinalize();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinalize = async () => {
    setIsSubmitting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        const onboardingPayload = {
          display_name: displayName.trim(),
          short_bio: shortBio.trim() || null,
          interested_communities: selectedCommunities,
          ethical_accepted: true,
          ethical_accepted_at: new Date().toISOString(),
          onboarded_at: new Date().toISOString()
        };

        const { error } = await supabase
          .from('users')
          .update({
            name: displayName.trim(),
            bio: shortBio.trim() || null,
            onboarding_data: onboardingPayload
          })
          .eq('id', session.user.id);

        if (error) {
          console.error('Erro ao salvar onboarding_data:', error);
        }
      }
    } catch (err) {
      console.error('Erro no onboarding:', err);
    }

    setIsSubmitting(false);
    onComplete();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-[#35363A] px-8 py-6 relative">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-white" />
              </button>

              <h2 className="text-2xl font-semibold text-white">
                {currentStep === 0
                  ? "Bem-vindo(a) ao NeuroConexão Atípica"
                  : currentStep === 1
                  ? "O que te interessa?"
                  : "Aceite ético"
                }
              </h2>
              <p className="text-white/70 mt-2 font-normal">
                Etapa {currentStep + 1} de {totalSteps}
              </p>

              {/* Progress bar */}
              <div className="mt-4 h-1 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
                  transition={{ duration: 0.3 }}
                  className="h-full bg-[#81D8D0]"
                />
              </div>
            </div>

            {/* Content */}
            <div className="px-8 py-8 max-h-[60vh] overflow-y-auto">
              <AnimatePresence mode="wait">

                {/* ETAPA 1: Boas-vindas + Nome + Bio opcional */}
                {currentStep === 0 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-2xl font-semibold text-[#35363A] mb-2">
                        Que bom ter você aqui!
                      </h3>
                      <p className="text-[#35363A]/70 font-normal">
                        Vamos personalizar sua experiência. É rápido — 2 passos e você já está dentro.
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#35363A] mb-2">
                        Como quer ser chamado(a)?
                      </label>
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Seu nome ou apelido"
                        className="w-full px-4 py-3 border-2 border-[#35363A]/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#81D8D0] focus:border-transparent transition-all text-[#35363A]"
                      />
                      {displayName.length > 0 && displayName.trim().length < 2 && (
                        <p className="text-xs text-[#C8102E] mt-1">Mínimo 2 caracteres</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#35363A] mb-2">
                        Uma frase sobre você
                        <span className="text-[#35363A]/40 font-normal ml-1">(opcional)</span>
                      </label>
                      <textarea
                        value={shortBio}
                        onChange={(e) => setShortBio(e.target.value)}
                        placeholder="O que te trouxe aqui? Como você se define?"
                        rows={3}
                        maxLength={280}
                        className="w-full px-4 py-3 border-2 border-[#35363A]/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#81D8D0] focus:border-transparent resize-none transition-all text-[#35363A]"
                      />
                      {shortBio.length > 0 && (
                        <p className="text-xs text-[#35363A]/40 mt-1">
                          {shortBio.length}/280 caracteres
                        </p>
                      )}
                    </div>

                    <div className="flex items-start gap-3 bg-[#81D8D0]/10 border border-[#81D8D0]/30 rounded-xl p-4">
                      <Shield className="h-5 w-5 text-[#81D8D0] flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-[#35363A]/70 font-normal">
                        Seus dados ficam seguros. Nada é compartilhado publicamente sem sua permissão.
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* ETAPA 2: Comunidades de interesse */}
                {currentStep === 1 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-2xl font-semibold text-[#35363A] mb-2">
                        Escolha suas comunidades
                      </h3>
                      <p className="text-[#35363A]/70 font-normal">
                        Selecione as que mais combinam com você. Pode mudar depois, sem compromisso.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {COMMUNITIES_CONFIG.map((community) => {
                        const isSelected = selectedCommunities.includes(community.name);
                        const IconComponent = community.icon;
                        return (
                          <button
                            key={community.name}
                            onClick={() => toggleCommunity(community.name)}
                            className="text-left p-4 border-2 rounded-xl transition-all relative"
                            style={{
                              borderColor: isSelected ? community.color : 'rgba(53,54,58,0.12)',
                              backgroundColor: isSelected ? `${community.color}12` : 'transparent'
                            }}
                          >
                            <div className="flex flex-col gap-1.5">
                              <div className="flex items-center justify-between">
                                <IconComponent
                                  className="h-5 w-5"
                                  style={{ color: community.color }}
                                />
                                {isSelected && (
                                  <CheckCircle
                                    className="h-5 w-5 flex-shrink-0"
                                    style={{ color: community.color }}
                                  />
                                )}
                              </div>
                              <h4 className="font-semibold text-[#35363A] text-sm">
                                {community.name}
                              </h4>
                              <p className="text-xs text-[#35363A]/60 font-normal leading-snug">
                                {community.description}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="text-center">
                      <p className="text-sm text-[#35363A]/60 font-normal">
                        {selectedCommunities.length === 0 ? (
                          "Selecione ao menos 1 comunidade"
                        ) : (
                          <>
                            <span className="font-semibold text-[#35363A]">
                              {selectedCommunities.length}
                            </span>
                            {" "}
                            {selectedCommunities.length === 1
                              ? "comunidade selecionada"
                              : "comunidades selecionadas"
                            }
                          </>
                        )}
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* ETAPA 3: Aceite ético */}
                {currentStep === 2 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-2xl font-semibold text-[#35363A] mb-2">
                        Princípios do espaço
                      </h3>
                      <p className="text-[#35363A]/70 font-normal">
                        Antes de entrar, leia e aceite os princípios que sustentam este campo.
                      </p>
                    </div>

                    <div className="bg-[#35363A]/5 border border-[#35363A]/10 rounded-xl p-6 space-y-4 text-[#35363A]/80 text-sm leading-relaxed">
                      <p className="font-semibold text-[#35363A] text-base">
                        Este não é um espaço de terapia, nem de consumo passivo.
                      </p>
                      <p>
                        Aqui, presença importa. Respeito não é opcional. Intensidade é bem-vinda, violência não.
                      </p>
                      <p>
                        Não romantize caos, trauma ou autodestruição. Isso não é acolhimento.
                      </p>
                      <p>
                        Falar direto não é desculpa para agressão. Discordância é permitida. Opacidade não.
                      </p>
                      <p>
                        Moderação é humana. Denúncias são levadas a sério.
                      </p>
                      <p className="font-semibold text-[#C8102E]">
                        Se você não se identifica com esses princípios, este espaço não é para você.
                      </p>
                    </div>

                    <div className="flex items-start gap-3 pt-2">
                      <input
                        type="checkbox"
                        id="ethical-accept"
                        checked={ethicalAccepted}
                        onChange={(e) => setEthicalAccepted(e.target.checked)}
                        className="mt-1 h-5 w-5 rounded border-2 border-[#35363A]/30 text-[#81D8D0] focus:ring-[#81D8D0] accent-[#81D8D0] cursor-pointer"
                      />
                      <label htmlFor="ethical-accept" className="text-sm text-[#35363A] cursor-pointer leading-relaxed font-medium">
                        Li, compreendo e aceito os princípios deste espaço. Entendo que o descumprimento pode resultar em suspensão.
                      </label>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

            {/* Footer com botões */}
            <div className="bg-[#35363A]/5 px-8 py-6 flex items-center justify-between border-t border-[#35363A]/10">
              {currentStep > 0 ? (
                <button
                  onClick={handleBack}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-[#35363A] hover:bg-[#35363A]/10 transition-all disabled:opacity-50"
                >
                  <ArrowLeft className="h-5 w-5" />
                  Voltar
                </button>
              ) : (
                <div />
              )}

              <button
                onClick={handleNext}
                disabled={!canProceed() || isSubmitting}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                  canProceed() && !isSubmitting
                    ? "bg-[#81D8D0] text-black hover:bg-[#81D8D0]/90 shadow-lg hover:shadow-xl"
                    : "bg-[#35363A]/20 text-[#35363A]/40 cursor-not-allowed"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Salvando...
                  </>
                ) : currentStep === totalSteps - 1 ? (
                  <>
                    Finalizar
                    <CheckCircle className="h-5 w-5" />
                  </>
                ) : (
                  <>
                    Continuar
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

