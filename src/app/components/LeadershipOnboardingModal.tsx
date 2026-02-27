/**
 * LeadershipOnboardingModal — Fase 6: Onboarding de Lideranca
 *
 * Modal multi-step para founders/moderators:
 *   Etapa 1: Convocacao — o que e lideranca aqui
 *   Etapa 2: Escolha de comunidade (awaiting_founder) OU criar propria
 *   Etapa 3: Responsabilidades — checklist de compromissos
 *   Etapa 4: Aceite formal + indicacao de co-moderador
 *
 * No fim:
 *   - Grava leadership_onboarding_done = true em public.users
 *   - Grava dados em contact_requests com prefixo [LEADERSHIP_ONBOARDING]
 *   - Atualiza owner_id da comunidade escolhida (se awaiting_founder)
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X, ArrowRight, ArrowLeft, CheckCircle, Loader2, Crown,
  Shield, Users, Flame, BookOpen, AlertTriangle, Plus,
  Heart, Eye, Radio, Scale, Sparkles
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useProfileContext } from "../../lib/ProfileContext";
import { COMMUNITIES_CONFIG } from "../../lib/communitiesConfig";
import type { CommunityConfig } from "../../lib/communitiesConfig";

interface LeadershipOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

// Responsabilidades que o founder deve aceitar
const RESPONSIBILITIES = [
  {
    key: "moderar",
    icon: Shield,
    title: "Moderar com presenca",
    desc: "Manter o espaco seguro. Remover conteudo que viole os principios. Agir com firmeza e empatia.",
  },
  {
    key: "rituais",
    icon: Flame,
    title: "Organizar rituais e encontros",
    desc: "Criar rodas de escuta, debates, sessoes de foco. A comunidade so vive se voce convoca.",
  },
  {
    key: "cultura",
    icon: Heart,
    title: "Proteger a cultura",
    desc: "Definir manifesto, tom e limites. Voce e quem decide o que cabe e o que nao cabe.",
  },
  {
    key: "escalar",
    icon: AlertTriangle,
    title: "Escalar quando necessario",
    desc: "Situacoes graves vao direto pra Mila (super_admin). Voce nao carrega tudo sozinho(a).",
  },
  {
    key: "presenca",
    icon: Eye,
    title: "Estar presente",
    desc: "Lideranca aqui nao e cargo — e presenca. Se sumir, a comunidade morre.",
  },
  {
    key: "manifesto",
    icon: BookOpen,
    title: "Criar o manifesto da comunidade",
    desc: "Voce tem a obrigacao de escrever o manifesto. Ele define a alma do espaco.",
  },
];

export function LeadershipOnboardingModal({
  isOpen,
  onClose,
  onComplete,
}: LeadershipOnboardingModalProps) {
  const { user, refreshProfile } = useProfileContext();

  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 2: Community choice
  const [choiceType, setChoiceType] = useState<"existing" | "create" | null>(null);
  const [selectedCommunity, setSelectedCommunity] = useState<string | null>(null);
  const [newCommunityName, setNewCommunityName] = useState("");
  const [newCommunityDesc, setNewCommunityDesc] = useState("");

  // Step 3: Responsibilities
  const [acceptedResponsibilities, setAcceptedResponsibilities] = useState<Set<string>>(new Set());

  // Step 4: Final
  const [coModeratorName, setCoModeratorName] = useState("");
  const [leadershipAccepted, setLeadershipAccepted] = useState(false);

  const totalSteps = 4;

  // Comunidades awaiting_founder
  const awaitingCommunities = COMMUNITIES_CONFIG.filter(
    (c) => c.status === "awaiting_founder"
  );

  // Reset ao abrir
  useEffect(() => {
    if (!isOpen) return;
    setCurrentStep(0);
    setChoiceType(null);
    setSelectedCommunity(null);
    setNewCommunityName("");
    setNewCommunityDesc("");
    setAcceptedResponsibilities(new Set());
    setCoModeratorName("");
    setLeadershipAccepted(false);
    setIsSubmitting(false);
  }, [isOpen]);

  const toggleResponsibility = (key: string) => {
    setAcceptedResponsibilities((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return true; // Step 1 is informational
      case 1:
        if (choiceType === "existing") return !!selectedCommunity;
        if (choiceType === "create") return newCommunityName.trim().length >= 3 && newCommunityDesc.trim().length >= 10;
        return false;
      case 2:
        return acceptedResponsibilities.size === RESPONSIBILITIES.length;
      case 3:
        return leadershipAccepted;
      default:
        return false;
    }
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
    if (!user?.id) return;
    setIsSubmitting(true);

    try {
      // 1. Gravar leadership_onboarding_done = true
      const { error: updateError } = await supabase
        .from("users")
        .update({ leadership_onboarding_done: true })
        .eq("id", user.id);

      if (updateError) {
        console.error("[LeadershipOnboarding] Erro ao atualizar usuario:", updateError);
      }

      // 2. Se escolheu comunidade existente, TENTAR atualizar owner_id
      // NOTA: RLS pode bloquear este UPDATE. Se falhar, a info fica salva
      // no contact_requests e a Mila faz manualmente no Supabase Dashboard.
      let communityInfo = "";
      let ownerIdSet = false;
      if (choiceType === "existing" && selectedCommunity) {
        communityInfo = `Comunidade escolhida: ${selectedCommunity}`;

        // Buscar o ID real da comunidade no banco
        const { data: dbCommunity } = await supabase
          .from("communities")
          .select("id")
          .eq("name", selectedCommunity)
          .single();

        if (dbCommunity?.id) {
          const { data: updated, error: ownerError } = await supabase
            .from("communities")
            .update({ owner_id: user.id, needs_moderator: false })
            .eq("id", dbCommunity.id)
            .select("id")
            .single();

          if (ownerError || !updated) {
            console.warn("[LeadershipOnboarding] owner_id nao atualizado (RLS provavel). Mila fara manualmente.", ownerError);
            communityInfo += ` [ACAO NECESSARIA: setar owner_id = ${user.id} na comunidade "${selectedCommunity}" (id: ${dbCommunity.id})]`;
          } else {
            ownerIdSet = true;
            console.log(`[LeadershipOnboarding] owner_id setado com sucesso para comunidade ${selectedCommunity}`);
          }
        }
      } else if (choiceType === "create") {
        communityInfo = `Nova comunidade proposta: "${newCommunityName.trim()}" — ${newCommunityDesc.trim()} [ACAO NECESSARIA: criar comunidade no banco]`;
      }

      // 3. Gravar dados do onboarding em contact_requests
      // Este INSERT funciona via RLS (ja testado em ContactFounderModal, PulsoVivo, etc.)
      const onboardingData = [
        `[LEADERSHIP_ONBOARDING]`,
        `Founder: ${user.display_name || user.name} (${user.id})`,
        communityInfo,
        ownerIdSet ? "owner_id: OK" : "owner_id: PENDENTE (Mila precisa setar)",
        coModeratorName.trim()
          ? `Co-moderador indicado: ${coModeratorName.trim()}`
          : "Sem co-moderador indicado",
        `Responsabilidades aceitas: ${RESPONSIBILITIES.map((r) => r.key).join(", ")}`,
        `Data: ${new Date().toISOString()}`,
      ].join(" | ");

      const { error: contactError } = await supabase
        .from("contact_requests")
        .insert({
          user_id: user.id,
          reason: "other",
          message: onboardingData,
          status: "pending",
        });

      if (contactError) {
        console.error("[LeadershipOnboarding] Erro ao salvar contact_request:", contactError);
      }

      // 4. Refresh profile para pegar leadership_onboarding_done = true
      await refreshProfile();
    } catch (err) {
      console.error("[LeadershipOnboarding] Erro geral:", err);
    }

    setIsSubmitting(false);
    onComplete();
  };

  const getSelectedConfig = (): CommunityConfig | undefined => {
    return awaitingCommunities.find((c) => c.name === selectedCommunity);
  };

  if (!isOpen) return null;

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
            className="relative w-full max-w-2xl bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#35363A] to-[#1A1A1A] px-8 py-6 relative">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-white/60" />
              </button>

              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#C8102E]/20 flex items-center justify-center">
                  <Crown className="h-5 w-5 text-[#C8102E]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {currentStep === 0
                      ? "Onboarding de Lideranca"
                      : currentStep === 1
                      ? "Escolha seu territorio"
                      : currentStep === 2
                      ? "Suas responsabilidades"
                      : "Aceite de lideranca"}
                  </h2>
                  <p className="text-white/50 text-sm">
                    Etapa {currentStep + 1} de {totalSteps}
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
                  transition={{ duration: 0.3 }}
                  className="h-full bg-[#C8102E]"
                />
              </div>
            </div>

            {/* Content */}
            <div className="px-8 py-8 max-h-[60vh] overflow-y-auto">
              <AnimatePresence mode="wait">

                {/* ═══ ETAPA 1: Convocacao ═══ */}
                {currentStep === 0 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-2xl bg-[#C8102E]/10 border border-[#C8102E]/20 flex items-center justify-center mx-auto mb-4">
                        <Crown className="h-8 w-8 text-[#C8102E]" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-3">
                        Voce foi convocado(a) para liderar.
                      </h3>
                      <p className="text-white/60 max-w-md mx-auto leading-relaxed">
                        Lideranca aqui nao e cargo. Nao e titulo. E presenca.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                        <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-[#81D8D0]" />
                          O que um founder faz
                        </h4>
                        <ul className="space-y-2 text-white/60 text-sm">
                          <li className="flex items-start gap-2">
                            <span className="text-[#81D8D0] mt-1">•</span>
                            Cria e modera uma comunidade tematica
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-[#81D8D0] mt-1">•</span>
                            Escreve o manifesto — define a alma do espaco
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-[#81D8D0] mt-1">•</span>
                            Organiza rituais, lives e debates
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-[#81D8D0] mt-1">•</span>
                            Pode indicar alguem para co-moderar
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-[#81D8D0] mt-1">•</span>
                            Escala situacoes graves pra Mila (super_admin)
                          </li>
                        </ul>
                      </div>

                      <div className="bg-[#C8102E]/5 border border-[#C8102E]/20 rounded-xl p-5">
                        <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-[#C8102E]" />
                          O que um founder NAO e
                        </h4>
                        <ul className="space-y-2 text-white/60 text-sm">
                          <li className="flex items-start gap-2">
                            <span className="text-[#C8102E] mt-1">•</span>
                            Nao e dono — e guardiao temporario
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-[#C8102E] mt-1">•</span>
                            Nao tem poder absoluto — a governanca e coletiva
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-[#C8102E] mt-1">•</span>
                            Nao pode sumir — ausencia prolongada leva a revogacao
                          </li>
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ═══ ETAPA 2: Escolha de comunidade ═══ */}
                {currentStep === 1 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">
                        Escolha seu territorio
                      </h3>
                      <p className="text-white/50 text-sm">
                        Escolha uma das comunidades que aguardam um(a) fundador(a), ou proponha a criacao de uma nova.
                      </p>
                    </div>

                    {/* Toggle: existente vs criar */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => { setChoiceType("existing"); setNewCommunityName(""); setNewCommunityDesc(""); }}
                        className={`flex-1 py-3 px-4 rounded-xl border text-sm font-semibold transition-all ${
                          choiceType === "existing"
                            ? "bg-[#81D8D0]/10 border-[#81D8D0]/40 text-[#81D8D0]"
                            : "bg-white/5 border-white/10 text-white/50 hover:border-white/20"
                        }`}
                      >
                        <Users className="h-4 w-4 inline mr-2" />
                        Escolher existente
                      </button>
                      <button
                        onClick={() => { setChoiceType("create"); setSelectedCommunity(null); }}
                        className={`flex-1 py-3 px-4 rounded-xl border text-sm font-semibold transition-all ${
                          choiceType === "create"
                            ? "bg-[#C8102E]/10 border-[#C8102E]/40 text-[#C8102E]"
                            : "bg-white/5 border-white/10 text-white/50 hover:border-white/20"
                        }`}
                      >
                        <Plus className="h-4 w-4 inline mr-2" />
                        Criar nova
                      </button>
                    </div>

                    {/* Lista de comunidades awaiting_founder */}
                    {choiceType === "existing" && (
                      <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1">
                        {awaitingCommunities.map((c) => {
                          const isSelected = selectedCommunity === c.name;
                          const IconComp = c.icon;
                          return (
                            <button
                              key={c.name}
                              onClick={() => setSelectedCommunity(c.name)}
                              className={`w-full text-left p-4 rounded-xl border transition-all ${
                                isSelected
                                  ? "border-[#81D8D0]/50 bg-[#81D8D0]/5"
                                  : "border-white/10 bg-white/3 hover:border-white/20"
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div
                                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                                  style={{ background: `${c.color}20` }}
                                >
                                  <IconComp className="w-5 h-5" style={{ color: c.color }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <h4 className="text-white font-semibold text-sm">{c.name}</h4>
                                    {isSelected && (
                                      <CheckCircle className="h-5 w-5 text-[#81D8D0] flex-shrink-0" />
                                    )}
                                  </div>
                                  <p className="text-white/40 text-xs mt-1 leading-relaxed">
                                    {c.description}
                                  </p>
                                  <span
                                    className="inline-block mt-2 text-[10px] px-2 py-0.5 rounded-full"
                                    style={{
                                      background: `${c.color}15`,
                                      color: c.color,
                                    }}
                                  >
                                    {c.category}
                                  </span>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Criar nova comunidade */}
                    {choiceType === "create" && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-white/70 mb-2">
                            Nome da comunidade
                          </label>
                          <input
                            type="text"
                            value={newCommunityName}
                            onChange={(e) => setNewCommunityName(e.target.value)}
                            placeholder="Ex: Mentes Criativas"
                            maxLength={60}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#81D8D0]/50 transition-all"
                          />
                          {newCommunityName.length > 0 && newCommunityName.trim().length < 3 && (
                            <p className="text-xs text-[#C8102E] mt-1">Minimo 3 caracteres</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-white/70 mb-2">
                            Descricao curta
                          </label>
                          <textarea
                            value={newCommunityDesc}
                            onChange={(e) => setNewCommunityDesc(e.target.value)}
                            placeholder="Sobre o que e essa comunidade? Qual a proposta?"
                            rows={3}
                            maxLength={300}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#81D8D0]/50 resize-none transition-all"
                          />
                          <p className="text-xs text-white/30 mt-1">
                            {newCommunityDesc.length}/300
                            {newCommunityDesc.length > 0 && newCommunityDesc.trim().length < 10 && (
                              <span className="text-[#C8102E] ml-2">Minimo 10 caracteres</span>
                            )}
                          </p>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                          <p className="text-white/50 text-xs leading-relaxed">
                            <AlertTriangle className="h-3 w-3 inline text-amber-400 mr-1" />
                            A proposta sera analisada pela Mila antes da criacao. Voce recebera uma resposta na Caixa de Entrada.
                          </p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* ═══ ETAPA 3: Responsabilidades ═══ */}
                {currentStep === 2 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">
                        Aceite cada responsabilidade
                      </h3>
                      <p className="text-white/50 text-sm">
                        Marque TODAS. Se voce nao concorda com alguma, este papel nao e pra voce — e tudo bem.
                      </p>
                    </div>

                    <div className="space-y-3">
                      {RESPONSIBILITIES.map((r) => {
                        const isAccepted = acceptedResponsibilities.has(r.key);
                        const IconComp = r.icon;
                        return (
                          <button
                            key={r.key}
                            onClick={() => toggleResponsibility(r.key)}
                            className={`w-full text-left p-4 rounded-xl border transition-all ${
                              isAccepted
                                ? "border-[#81D8D0]/40 bg-[#81D8D0]/5"
                                : "border-white/10 bg-white/3 hover:border-white/20"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                                isAccepted ? "bg-[#81D8D0]/20" : "bg-white/10"
                              }`}>
                                {isAccepted ? (
                                  <CheckCircle className="w-4 h-4 text-[#81D8D0]" />
                                ) : (
                                  <IconComp className="w-4 h-4 text-white/40" />
                                )}
                              </div>
                              <div>
                                <h4 className={`text-sm font-semibold transition-colors ${
                                  isAccepted ? "text-[#81D8D0]" : "text-white"
                                }`}>
                                  {r.title}
                                </h4>
                                <p className="text-white/40 text-xs mt-0.5 leading-relaxed">
                                  {r.desc}
                                </p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Contador */}
                    <div className="text-center">
                      <p className="text-sm text-white/40">
                        <span className={`font-bold ${
                          acceptedResponsibilities.size === RESPONSIBILITIES.length
                            ? "text-[#81D8D0]"
                            : "text-white"
                        }`}>
                          {acceptedResponsibilities.size}
                        </span>
                        /{RESPONSIBILITIES.length} aceitas
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* ═══ ETAPA 4: Aceite final + co-moderador ═══ */}
                {currentStep === 3 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">
                        Confirmacao final
                      </h3>
                      <p className="text-white/50 text-sm">
                        Revise e confirme. Depois disso, voce e oficialmente um(a) founder.
                      </p>
                    </div>

                    {/* Resumo */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-3">
                      <h4 className="text-white font-semibold text-sm flex items-center gap-2">
                        <Crown className="h-4 w-4 text-[#C8102E]" />
                        Resumo do onboarding
                      </h4>
                      <div className="text-sm text-white/60 space-y-1.5">
                        <p>
                          <span className="text-white/40">Comunidade:</span>{" "}
                          {choiceType === "existing" ? (
                            <span className="text-[#81D8D0] font-medium">{selectedCommunity}</span>
                          ) : (
                            <span className="text-[#C8102E] font-medium">
                              Nova: "{newCommunityName.trim()}" (pendente de aprovacao)
                            </span>
                          )}
                        </p>
                        <p>
                          <span className="text-white/40">Responsabilidades:</span>{" "}
                          <span className="text-[#81D8D0]">{RESPONSIBILITIES.length}/{RESPONSIBILITIES.length} aceitas</span>
                        </p>
                      </div>
                    </div>

                    {/* Co-moderador (opcional) */}
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2">
                        Indicar co-moderador(a)
                        <span className="text-white/30 font-normal ml-1">(opcional)</span>
                      </label>
                      <input
                        type="text"
                        value={coModeratorName}
                        onChange={(e) => setCoModeratorName(e.target.value)}
                        placeholder="Nome ou apelido da pessoa que vai te ajudar"
                        maxLength={100}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#81D8D0]/50 transition-all"
                      />
                      <p className="text-xs text-white/30 mt-1">
                        A pessoa sera contatada pela Mila para confirmar.
                      </p>
                    </div>

                    {/* Aceite formal */}
                    <div className="bg-[#C8102E]/5 border border-[#C8102E]/20 rounded-xl p-5">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          id="leadership-accept"
                          checked={leadershipAccepted}
                          onChange={(e) => setLeadershipAccepted(e.target.checked)}
                          className="mt-1 h-5 w-5 rounded border-2 border-white/30 accent-[#C8102E] cursor-pointer flex-shrink-0"
                        />
                        <label
                          htmlFor="leadership-accept"
                          className="text-sm text-white/80 cursor-pointer leading-relaxed"
                        >
                          <span className="font-bold text-white">
                            Aceito a convocacao de lideranca.
                          </span>{" "}
                          Compreendo que lideranca aqui e servico, nao poder. Me comprometo a moderar com
                          presenca, criar o manifesto da comunidade, organizar rituais, e escalar situacoes
                          graves. Entendo que ausencia prolongada ou abuso de poder resultam em revogacao.
                        </label>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="bg-white/3 px-8 py-5 flex items-center justify-between border-t border-white/10">
              {currentStep > 0 ? (
                <button
                  onClick={handleBack}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white/60 hover:bg-white/5 transition-all disabled:opacity-50"
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
                    ? "bg-[#C8102E] text-white hover:bg-[#C8102E]/90 shadow-lg hover:shadow-xl"
                    : "bg-white/10 text-white/30 cursor-not-allowed"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Salvando...
                  </>
                ) : currentStep === totalSteps - 1 ? (
                  <>
                    Assumir lideranca
                    <Crown className="h-5 w-5" />
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