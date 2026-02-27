/**
 * SettingsPage — Configuracoes do usuario
 * Controles de privacidade, visibilidade e modo recolhimento.
 */

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  ArrowLeft, Shield, Eye, EyeOff, Bell, BellOff, Moon,
  Globe, Lock, Save, Loader2, CheckCircle, LogOut, Trash2,
  Heart, Brain, MessageCircle, User, Pen
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useProfileContext } from "../../lib/ProfileContext";
import { LogoIcon } from "./LogoIcon";

interface SettingsPageProps {
  onBack: () => void;
}

interface SettingsState {
  is_public_profile: boolean;
  is_anonymous_mode: boolean;
  use_real_name: boolean;
  neurodivergences_public: boolean;
  deep_statement_public: boolean;
  calming_statement_public: boolean;
  allow_whatsapp: boolean;
  allow_email: boolean;
}

export function SettingsPage({ onBack }: SettingsPageProps) {
  const { user, refreshProfile } = useProfileContext();
  const [settings, setSettings] = useState<SettingsState>({
    is_public_profile: true,
    is_anonymous_mode: false,
    use_real_name: false,
    neurodivergences_public: false,
    deep_statement_public: false,
    calming_statement_public: false,
    allow_whatsapp: false,
    allow_email: false,
  });
  const [displayName, setDisplayName] = useState("");
  const [legalName, setLegalName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Carregar settings do user
  useEffect(() => {
    if (user) {
      setSettings({
        is_public_profile: user.is_public_profile ?? true,
        is_anonymous_mode: user.is_anonymous_mode ?? false,
        use_real_name: user.use_real_name ?? false,
        neurodivergences_public: user.neurodivergences_public ?? false,
        deep_statement_public: user.deep_statement_public ?? false,
        calming_statement_public: user.calming_statement_public ?? false,
        allow_whatsapp: user.allow_whatsapp ?? false,
        allow_email: user.allow_email ?? false,
      });
      setDisplayName(user.display_name || "");
      setLegalName(user.legal_name || "");
    }
  }, [user]);

  const handleToggle = (key: keyof SettingsState) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    setHasChanges(true);
    setSaved(false);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("users")
        .update({
          ...settings,
          display_name: displayName.trim() || user.name,
          legal_name: legalName.trim() || null,
        })
        .eq("id", user.id);

      if (error) throw error;
      await refreshProfile();
      setSaved(true);
      setHasChanges(false);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("[SettingsPage] Erro ao salvar:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (!user) return null;

  const sections = [
    {
      title: "Identidade",
      icon: User,
      color: "#81D8D0",
      type: "identity" as const,
      toggles: [
        {
          key: "use_real_name" as keyof SettingsState,
          label: "Exibir nome real",
          description: "Quando desligado, outros membros veem seu apelido (display name). Quando ligado, veem seu nome de cadastro.",
          iconOn: User,
          iconOff: Pen,
        },
      ],
    },
    {
      title: "Privacidade do Perfil",
      icon: Shield,
      color: "#81D8D0",
      toggles: [
        {
          key: "is_public_profile" as keyof SettingsState,
          label: "Perfil publico",
          description: "Membros podem encontrar e ver seu perfil",
          iconOn: Globe,
          iconOff: Lock,
        },
        {
          key: "is_anonymous_mode" as keyof SettingsState,
          label: "Modo recolhimento",
          description: "Oculta seu nome em visitas e atividades recentes. Voce continua podendo participar normalmente.",
          iconOn: Moon,
          iconOff: Eye,
          inverted: true, // quando ON = recolhido
        },
      ],
    },
    {
      title: "Visibilidade de Informacoes",
      icon: Eye,
      color: "#FF6B35",
      toggles: [
        {
          key: "neurodivergences_public" as keyof SettingsState,
          label: "Mostrar neurodivergencias",
          description: "Exibe suas neurodivergencias no perfil publico",
          iconOn: Brain,
          iconOff: EyeOff,
        },
        {
          key: "deep_statement_public" as keyof SettingsState,
          label: "Mostrar frase profunda",
          description: "Exibe seu 'deep statement' no perfil",
          iconOn: Heart,
          iconOff: EyeOff,
        },
        {
          key: "calming_statement_public" as keyof SettingsState,
          label: "Mostrar frase de acolhimento",
          description: "Exibe sua frase de acolhimento no perfil",
          iconOn: MessageCircle,
          iconOff: EyeOff,
        },
      ],
    },
    {
      title: "Comunicacao",
      icon: Bell,
      color: "#C8102E",
      toggles: [
        {
          key: "allow_whatsapp" as keyof SettingsState,
          label: "Permitir contato por WhatsApp",
          description: "Outros membros podem ver seu WhatsApp (somente membros aprovados)",
          iconOn: Bell,
          iconOff: BellOff,
        },
        {
          key: "allow_email" as keyof SettingsState,
          label: "Permitir contato por email",
          description: "Receber comunicacoes da plataforma por email",
          iconOn: Bell,
          iconOff: BellOff,
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="w-full bg-[#35363A] border-b border-white/10 sticky top-0 z-40">
        <div className="mx-auto max-w-[800px] px-6 py-4">
          <div className="flex items-center justify-between">
            <button onClick={onBack} className="flex items-center gap-2 text-white/80 hover:text-[#81D8D0] transition-colors">
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Voltar</span>
            </button>
            <div className="flex items-center gap-2">
              <LogoIcon size={28} className="h-7 w-7" />
              <h1 className="text-lg text-white font-semibold">Configuracoes</h1>
            </div>
            <div className="w-20" />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[800px] px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Secoes */}
          {sections.map((section) => (
            <div key={section.title} className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${section.color}15`, border: `1px solid ${section.color}30` }}>
                  <section.icon className="h-5 w-5" style={{ color: section.color }} />
                </div>
                <h2 className="text-white font-bold">{section.title}</h2>
              </div>

              <div className="space-y-4">
                {/* Campos de identidade (display_name + legal_name) */}
                {'type' in section && section.type === 'identity' && (
                  <div className="space-y-4 mb-4 pb-4 border-b border-white/10">
                    <div>
                      <label className="text-xs text-white/60 font-semibold mb-2 block">
                        Apelido / Display Name
                      </label>
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => { setDisplayName(e.target.value); setHasChanges(true); setSaved(false); }}
                        placeholder="Como voce quer ser chamado(a)"
                        maxLength={50}
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-white/25 focus:border-[#81D8D0]/50 focus:outline-none"
                      />
                      <p className="text-[10px] text-white/25 mt-1">Este e o nome que outros membros veem. Se vazio, usa seu nome de cadastro.</p>
                    </div>
                    <div>
                      <label className="text-xs text-white/60 font-semibold mb-2 block">
                        Nome legal <span className="text-white/25">(privado, opcional)</span>
                      </label>
                      <input
                        type="text"
                        value={legalName}
                        onChange={(e) => { setLegalName(e.target.value); setHasChanges(true); setSaved(false); }}
                        placeholder="Seu nome completo real (somente a fundadora ve)"
                        maxLength={100}
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-white/25 focus:border-[#81D8D0]/50 focus:outline-none"
                      />
                      <p className="text-[10px] text-white/25 mt-1">
                        Nunca sera exibido publicamente. Apenas a fundadora (Mila) pode ver para fins administrativos.
                      </p>
                    </div>
                  </div>
                )}

                {section.toggles.map((toggle) => {
                  const value = toggle.inverted ? settings[toggle.key] : settings[toggle.key];
                  const displayOn = toggle.inverted ? !value : value;
                  const OnIcon = toggle.iconOn;
                  const OffIcon = toggle.iconOff;

                  return (
                    <div key={toggle.key} className="flex items-center justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="mt-0.5">
                          {displayOn ? (
                            <OnIcon className="h-4 w-4 text-white/40" />
                          ) : (
                            <OffIcon className="h-4 w-4 text-white/20" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm text-white font-medium">{toggle.label}</p>
                          <p className="text-xs text-white/40 mt-0.5 leading-relaxed">{toggle.description}</p>
                        </div>
                      </div>

                      {/* Toggle switch */}
                      <button
                        onClick={() => handleToggle(toggle.key)}
                        className={`relative w-12 h-7 rounded-full transition-all duration-300 flex-shrink-0 ${
                          value
                            ? "bg-[#81D8D0]"
                            : "bg-white/15"
                        }`}
                      >
                        <motion.div
                          animate={{ x: value ? 20 : 2 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm"
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Salvar */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={!hasChanges || saving}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold transition-all ${
                hasChanges
                  ? "bg-[#81D8D0] text-black hover:bg-[#81D8D0]/90"
                  : "bg-white/10 text-white/30 cursor-not-allowed"
              }`}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : saved ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saving ? "Salvando..." : saved ? "Salvo!" : hasChanges ? "Salvar alteracoes" : "Sem alteracoes"}
            </button>
          </div>

          {/* Acoes da conta */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-white font-bold mb-4">Conta</h2>
            <div className="space-y-3">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/60 hover:text-white transition-all text-left"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm font-medium">Sair da conta</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}