import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Loader2, Camera, Eye, EyeOff, VolumeX, ImagePlus, Trash2, Globe, Lock, Instagram, Link2, Brain, Heart, MessageCircle, Sparkles } from "lucide-react";
import { useProfileContext, supabase, TIMEOUTS } from "../../lib";
import type { User } from "../../lib";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onProfileUpdated?: () => void;
}

function withTimeout<T>(promise: PromiseLike<T>, ms: number, label = ''): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout ${label} (${ms}ms)`)), ms)
    ),
  ]) as Promise<T>;
}

// ─── Constantes para chips selecionaveis ───
const PRONOUNS_OPTIONS = ['ela/dela', 'ele/dele', 'elu/delu', 'ile/dile', 'personalizado'];

const NEURODIVERGENCE_OPTIONS = [
  'TDAH', 'TEA (Autismo)', 'Dislexia', 'Discalculia', 'Disgrafia',
  'Altas Habilidades', 'TOC', 'Sindrome de Tourette', 'DPI (Dis. Proc. Sensorial)',
  'Bipolaridade', 'Dispraxia',
];

const COMMUNICATION_STYLE_OPTIONS = [
  'Sou direto(a)', 'Preciso de contexto', 'Prefiro texto a audio',
  'Posso demorar pra responder', 'Ironia me confunde',
  'Preciso de pausas', 'Sou literal', 'Processo devagar e ta tudo bem',
  'Prefiro mensagens curtas', 'Funciono melhor com listas',
];

const INTEREST_OPTIONS = [
  'Musica', 'Arte', 'Tecnologia', 'Natureza', 'Escrita', 'Games',
  'Cinema', 'Podcasts', 'Filosofia', 'Psicologia', 'Meditacao',
  'Culinaria', 'Fotografia', 'Danca', 'Livros', 'Ciencia',
  'Educacao', 'Empreendedorismo', 'Esportes', 'Viagens',
];

export function EditProfileModal({ isOpen, onClose, currentUser, onProfileUpdated }: EditProfileModalProps) {
  // ─── Campos existentes ───
  const [name, setName] = useState(currentUser.name);
  const [bio, setBio] = useState(currentUser.bio || "");
  const [deepStatement, setDeepStatement] = useState(currentUser.deep_statement || "");
  const [deepStatementPublic, setDeepStatementPublic] = useState(currentUser.deep_statement_public ?? false);
  const [isPublicProfile, setIsPublicProfile] = useState(currentUser.is_public_profile ?? true);
  const [isAnonymousMode, setIsAnonymousMode] = useState(currentUser.is_anonymous_mode ?? false);
  const [galleryPhotos, setGalleryPhotos] = useState<string[]>(currentUser.gallery_photos || []);

  // ─── Novos campos V1.3 ───
  const [pronouns, setPronouns] = useState(currentUser.pronouns || "");
  const [customPronoun, setCustomPronoun] = useState("");
  const [neurodivergences, setNeurodivergences] = useState<string[]>(currentUser.neurodivergences || []);
  const [neurodivergencesPublic, setNeurodivergencesPublic] = useState(currentUser.neurodivergences_public ?? false);
  const [customNeuro, setCustomNeuro] = useState("");
  const [calmingStatement, setCalmingStatement] = useState(currentUser.calming_statement || "");
  const [calmingStatementPublic, setCalmingStatementPublic] = useState(currentUser.calming_statement_public ?? true);
  const [communicationStyle, setCommunicationStyle] = useState<string[]>(currentUser.communication_style || []);
  const [interests, setInterests] = useState<string[]>(currentUser.interests || []);
  const [socialInstagram, setSocialInstagram] = useState(currentUser.social_instagram || "");
  const [socialLink, setSocialLink] = useState(currentUser.social_link || "");

  // ─── Estado geral ───
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(currentUser.profile_photo);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const isSavingRef = useRef(false);

  const { updateProfile, uploadPhoto } = useProfileContext();

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen && !isSavingRef.current) {
      setName(currentUser.name);
      setBio(currentUser.bio || "");
      setDeepStatement(currentUser.deep_statement || "");
      setDeepStatementPublic(currentUser.deep_statement_public ?? false);
      setIsPublicProfile(currentUser.is_public_profile ?? true);
      setIsAnonymousMode(currentUser.is_anonymous_mode ?? false);
      setGalleryPhotos(currentUser.gallery_photos || []);
      setPronouns(currentUser.pronouns || "");
      setCustomPronoun("");
      setNeurodivergences(currentUser.neurodivergences || []);
      setNeurodivergencesPublic(currentUser.neurodivergences_public ?? false);
      setCustomNeuro("");
      setCalmingStatement(currentUser.calming_statement || "");
      setCalmingStatementPublic(currentUser.calming_statement_public ?? true);
      setCommunicationStyle(currentUser.communication_style || []);
      setInterests(currentUser.interests || []);
      setSocialInstagram(currentUser.social_instagram || "");
      setSocialLink(currentUser.social_link || "");
      setPhotoPreview(currentUser.profile_photo);
      setPhotoFile(null);
      setError("");
      setSuccess(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) isSavingRef.current = false;
  }, [isOpen]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError("Imagem muito grande. Maximo 5MB."); return; }
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) { setError("Use JPG, PNG ou WebP."); return; }
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
    setError("");
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser?.id) return;
    if (galleryPhotos.length >= 3) { setError("Maximo de 3 fotos na galeria."); return; }
    if (file.size > 5 * 1024 * 1024) { setError("Imagem muito grande. Maximo 5MB."); return; }
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) { setError("Use JPG, PNG ou WebP."); return; }

    setGalleryUploading(true);
    setError("");
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${currentUser.id}-gallery-${Date.now()}.${fileExt}`;
      const filePath = `profile-photos/${fileName}`;

      const { error: upErr } = await withTimeout(
        supabase.storage.from('avatars').upload(filePath, file, { cacheControl: '3600', upsert: true }),
        TIMEOUTS.UPLOAD, 'gallery-upload'
      );
      if (upErr) throw upErr;

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
      setGalleryPhotos(prev => [...prev, publicUrl]);
    } catch (err: any) {
      setError(err.message || "Erro ao fazer upload.");
    } finally {
      setGalleryUploading(false);
      if (galleryInputRef.current) galleryInputRef.current.value = "";
    }
  };

  const removeGalleryPhoto = (index: number) => {
    setGalleryPhotos(prev => prev.filter((_, i) => i !== index));
  };

  // Toggle chip in array
  const toggleChip = (arr: string[], item: string, setter: (v: string[]) => void) => {
    setter(arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item]);
  };

  const addCustomNeuro = () => {
    const trimmed = customNeuro.trim();
    if (trimmed && !neurodivergences.includes(trimmed) && neurodivergences.length < 10) {
      setNeurodivergences(prev => [...prev, trimmed]);
      setCustomNeuro("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length === 0) { setError("Nome nao pode estar vazio"); return; }
    if (name.length > 100) { setError("Nome muito longo. Maximo 100 caracteres"); return; }
    if (bio.length > 1000) { setError("Bio muito longa. Maximo 1000 caracteres"); return; }
    if (deepStatement.length > 500) { setError("'O que me atravessa' muito longo. Maximo 500 caracteres"); return; }
    if (calmingStatement.length > 500) { setError("'O que me acalma' muito longo. Maximo 500 caracteres"); return; }

    setError("");
    setIsLoading(true);
    setSuccess(false);
    isSavingRef.current = true;

    // Resolve pronouns
    let finalPronouns = pronouns;
    if (pronouns === 'personalizado' && customPronoun.trim()) {
      finalPronouns = customPronoun.trim().slice(0, 30);
    } else if (pronouns === 'personalizado') {
      finalPronouns = '';
    }

    try {
      if (photoFile) {
        const uploadResult = await uploadPhoto(photoFile);
        if (!uploadResult.success) throw new Error(uploadResult.error || 'Erro ao fazer upload da foto');
      }

      const updates: Partial<User> = {
        name: name.trim(),
        bio: bio.trim() || null,
        deep_statement: deepStatement.trim() || null,
        deep_statement_public: deepStatementPublic,
        is_public_profile: isPublicProfile,
        is_anonymous_mode: isAnonymousMode,
        gallery_photos: galleryPhotos,
        pronouns: finalPronouns || null,
        neurodivergences,
        neurodivergences_public: neurodivergencesPublic,
        calming_statement: calmingStatement.trim() || null,
        calming_statement_public: calmingStatementPublic,
        communication_style: communicationStyle,
        interests,
        social_instagram: socialInstagram.trim() || null,
        social_link: socialLink.trim() || null,
      };

      const result = await updateProfile(updates);
      if (!result.success) throw new Error(result.error || 'Erro ao atualizar perfil');

      setSuccess(true);
      isSavingRef.current = false;
      if (onProfileUpdated) onProfileUpdated();
      setTimeout(() => onClose(), 1500);
    } catch (err: any) {
      isSavingRef.current = false;
      setError(err.message || 'Erro ao atualizar perfil. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#81D8D0] focus:border-transparent transition-all text-white placeholder:text-white/40 disabled:opacity-50";

  const chipClass = (active: boolean) =>
    `px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer select-none ${
      active
        ? "bg-[#81D8D0]/15 text-[#81D8D0] border-[#81D8D0]/30"
        : "bg-white/3 text-white/50 border-white/10 hover:border-white/20"
    }`;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#35363A]/90 backdrop-blur-sm px-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl bg-[#35363A] rounded-2xl shadow-2xl p-8 border border-white/10 max-h-[90vh] overflow-y-auto"
          >
            <button onClick={onClose} disabled={isLoading} className="absolute top-4 right-4 p-2 hover:bg-white/5 rounded-lg transition-colors disabled:opacity-50">
              <X className="h-5 w-5 text-white/60" />
            </button>

            <h2 className="text-2xl font-semibold mb-6 text-white">Editar Perfil</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* ═══ FOTO DE PERFIL ═══ */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-white/10 flex items-center justify-center overflow-hidden border-4 border-[#35363A]">
                    {photoPreview ? (
                      <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl font-bold text-white/70">{name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                    className="absolute bottom-0 right-0 p-3 bg-[#81D8D0] rounded-full hover:bg-[#81D8D0]/90 transition-colors shadow-lg disabled:opacity-50"
                  >
                    <Camera className="h-5 w-5 text-black" />
                  </button>
                </div>
                <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" ref={fileInputRef} onChange={handlePhotoChange} disabled={isLoading} className="hidden" />
                <p className="text-xs text-white/50 text-center">Foto principal do perfil — Maximo 5MB</p>
              </div>

              {/* ═══ GALERIA DE FOTOS (ate 3) ═══ */}
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  <ImagePlus className="h-4 w-4 inline mr-1.5 text-[#81D8D0]" />
                  Galeria de fotos <span className="text-white/40 font-normal">({galleryPhotos.length}/3)</span>
                </label>
                <p className="text-xs text-white/40 mb-3">Adicione ate 3 fotos extras que representem voce.</p>
                <div className="grid grid-cols-3 gap-3">
                  {galleryPhotos.map((url, idx) => (
                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-white/10 group">
                      <img src={url} alt={`Galeria ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeGalleryPhoto(idx)}
                        className="absolute top-1.5 right-1.5 p-1.5 bg-black/70 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-[#C8102E]" />
                      </button>
                    </div>
                  ))}
                  {galleryPhotos.length < 3 && (
                    <button
                      type="button"
                      onClick={() => galleryInputRef.current?.click()}
                      disabled={galleryUploading || isLoading}
                      className="aspect-square rounded-xl border-2 border-dashed border-white/20 hover:border-[#81D8D0]/50 flex flex-col items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      {galleryUploading ? (
                        <Loader2 className="h-5 w-5 text-white/40 animate-spin" />
                      ) : (
                        <>
                          <ImagePlus className="h-5 w-5 text-white/30" />
                          <span className="text-[10px] text-white/30 font-semibold">Adicionar</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
                <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" ref={galleryInputRef} onChange={handleGalleryUpload} className="hidden" />
              </div>

              {/* ═══ NOME ═══ */}
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Nome <span className="text-[#C8102E]">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                  disabled={isLoading}
                  maxLength={100}
                  className={inputClass}
                />
                <p className="text-xs text-white/50 mt-1">{name.length}/100 caracteres</p>
              </div>

              {/* ═══ PRONOMES ═══ */}
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  <Sparkles className="h-4 w-4 inline mr-1.5 text-[#81D8D0]" />
                  Pronomes <span className="text-white/40 font-normal">(opcional)</span>
                </label>
                <p className="text-xs text-white/40 mb-3">Aparece ao lado do seu nome no perfil.</p>
                <div className="flex flex-wrap gap-2">
                  {PRONOUNS_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setPronouns(pronouns === opt ? "" : opt)}
                      className={chipClass(pronouns === opt)}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                {pronouns === 'personalizado' && (
                  <input
                    type="text"
                    value={customPronoun}
                    onChange={(e) => setCustomPronoun(e.target.value)}
                    placeholder="Digite seus pronomes (ex: ze/zir)"
                    maxLength={30}
                    className={`${inputClass} mt-3`}
                  />
                )}
              </div>

              {/* ═══ BIO ═══ */}
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">Bio / Sobre voce</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Conte um pouco sobre voce, suas experiencias, o que te traz aqui..."
                  rows={4}
                  disabled={isLoading}
                  maxLength={1000}
                  className={`${inputClass} resize-none`}
                />
                <p className="text-xs text-white/50 mt-1">{bio.length}/1000 caracteres</p>
              </div>

              {/* ═══ NEURODIVERGENCIAS ═══ */}
              <div className="border border-[#81D8D0]/15 rounded-xl p-4 bg-[#81D8D0]/3">
                <label className="block text-sm font-semibold text-white mb-1">
                  <Brain className="h-4 w-4 inline mr-1.5 text-[#81D8D0]" />
                  Neurodivergencias <span className="text-white/40 font-normal">(opcional)</span>
                </label>
                <p className="text-xs text-white/40 mb-3 leading-relaxed">
                  Auto-identificacao livre. Ninguem e obrigado a se rotular. Voce controla a visibilidade.
                </p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {NEURODIVERGENCE_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => toggleChip(neurodivergences, opt, setNeurodivergences)}
                      className={chipClass(neurodivergences.includes(opt))}
                    >
                      {opt}
                    </button>
                  ))}
                  {/* Custom chips that aren't in the default list */}
                  {neurodivergences.filter(n => !NEURODIVERGENCE_OPTIONS.includes(n)).map((custom) => (
                    <button
                      key={custom}
                      type="button"
                      onClick={() => toggleChip(neurodivergences, custom, setNeurodivergences)}
                      className={chipClass(true)}
                    >
                      {custom} <X className="h-3 w-3 inline ml-1" />
                    </button>
                  ))}
                </div>
                {/* Add custom */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customNeuro}
                    onChange={(e) => setCustomNeuro(e.target.value)}
                    placeholder="Outro (digite e adicione)"
                    maxLength={40}
                    className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-[#81D8D0]"
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomNeuro(); } }}
                  />
                  <button
                    type="button"
                    onClick={addCustomNeuro}
                    disabled={!customNeuro.trim()}
                    className="px-3 py-2 bg-[#81D8D0]/15 text-[#81D8D0] rounded-lg text-xs font-semibold disabled:opacity-30"
                  >
                    + Adicionar
                  </button>
                </div>
                {/* Toggle visibilidade */}
                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setNeurodivergencesPublic(!neurodivergencesPublic)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      neurodivergencesPublic
                        ? "bg-[#81D8D0]/15 text-[#81D8D0] border border-[#81D8D0]/30"
                        : "bg-white/5 text-white/40 border border-white/10"
                    }`}
                  >
                    {neurodivergencesPublic ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                    {neurodivergencesPublic ? "Visivel no perfil" : "Apenas para mim"}
                  </button>
                </div>
              </div>

              {/* ═══ O QUE ME ATRAVESSA (deep statement) ═══ */}
              <div className="border border-[#C8102E]/20 rounded-xl p-4 bg-[#C8102E]/5">
                <label className="block text-sm font-semibold text-white mb-1">
                  O que me atravessa
                </label>
                <p className="text-xs text-white/40 mb-3 leading-relaxed">
                  Uma frase que define o que voce sente, o que te move ou te desafia. Pode ser poetica, direta, crua. E sua.
                </p>
                <textarea
                  value={deepStatement}
                  onChange={(e) => setDeepStatement(e.target.value)}
                  placeholder="Ex: 'A solidao de existir num mundo que nao foi desenhado pra mim.'"
                  rows={2}
                  disabled={isLoading}
                  maxLength={500}
                  className={`${inputClass} resize-none italic`}
                  style={{ fontFamily: 'Lora, serif' }}
                />
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-white/40">{deepStatement.length}/500</p>
                  <button
                    type="button"
                    onClick={() => setDeepStatementPublic(!deepStatementPublic)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      deepStatementPublic
                        ? "bg-[#81D8D0]/15 text-[#81D8D0] border border-[#81D8D0]/30"
                        : "bg-white/5 text-white/40 border border-white/10"
                    }`}
                  >
                    {deepStatementPublic ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                    {deepStatementPublic ? "Visivel no perfil" : "Apenas para mim"}
                  </button>
                </div>
              </div>

              {/* ═══ O QUE ME ACALMA ═══ */}
              <div className="border border-[#81D8D0]/20 rounded-xl p-4 bg-[#81D8D0]/3">
                <label className="block text-sm font-semibold text-white mb-1">
                  <Heart className="h-4 w-4 inline mr-1.5 text-[#81D8D0]" />
                  O que me acalma
                </label>
                <p className="text-xs text-white/40 mb-3 leading-relaxed">
                  O que traz regulacao, o que cura, o que te devolve a si. Complemento ao que te atravessa.
                </p>
                <textarea
                  value={calmingStatement}
                  onChange={(e) => setCalmingStatement(e.target.value)}
                  placeholder="Ex: 'O barulho da chuva, silencio compartilhado e musica sem letra.'"
                  rows={2}
                  disabled={isLoading}
                  maxLength={500}
                  className={`${inputClass} resize-none italic`}
                  style={{ fontFamily: 'Lora, serif' }}
                />
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-white/40">{calmingStatement.length}/500</p>
                  <button
                    type="button"
                    onClick={() => setCalmingStatementPublic(!calmingStatementPublic)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      calmingStatementPublic
                        ? "bg-[#81D8D0]/15 text-[#81D8D0] border border-[#81D8D0]/30"
                        : "bg-white/5 text-white/40 border border-white/10"
                    }`}
                  >
                    {calmingStatementPublic ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                    {calmingStatementPublic ? "Visivel no perfil" : "Apenas para mim"}
                  </button>
                </div>
              </div>

              {/* ═══ ESTILO DE COMUNICACAO ═══ */}
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  <MessageCircle className="h-4 w-4 inline mr-1.5 text-[#81D8D0]" />
                  Estilo de comunicacao <span className="text-white/40 font-normal">(opcional)</span>
                </label>
                <p className="text-xs text-white/40 mb-3">Ajuda os outros a saberem como interagir com voce. Selecione quantos quiser.</p>
                <div className="flex flex-wrap gap-2">
                  {COMMUNICATION_STYLE_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => toggleChip(communicationStyle, opt, setCommunicationStyle)}
                      className={chipClass(communicationStyle.includes(opt))}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* ═══ INTERESSES ═══ */}
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  <Sparkles className="h-4 w-4 inline mr-1.5 text-[#FF6B35]" />
                  Interesses <span className="text-white/40 font-normal">(opcional)</span>
                </label>
                <p className="text-xs text-white/40 mb-3">O que te faz perder a nocao do tempo?</p>
                <div className="flex flex-wrap gap-2">
                  {INTEREST_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => toggleChip(interests, opt, setInterests)}
                      className={chipClass(interests.includes(opt))}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* ═══ LINKS SOCIAIS ═══ */}
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  <Link2 className="h-4 w-4 inline mr-1.5 text-[#81D8D0]" />
                  Links sociais <span className="text-white/40 font-normal">(opcional)</span>
                </label>
                <div className="space-y-3">
                  <div className="relative">
                    <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                    <input
                      type="text"
                      value={socialInstagram}
                      onChange={(e) => setSocialInstagram(e.target.value)}
                      placeholder="@seuinstagram"
                      maxLength={100}
                      disabled={isLoading}
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                  <div className="relative">
                    <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                    <input
                      type="text"
                      value={socialLink}
                      onChange={(e) => setSocialLink(e.target.value)}
                      placeholder="https://seu-site-ou-link.com"
                      maxLength={200}
                      disabled={isLoading}
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </div>
              </div>

              {/* ═══ PRIVACIDADE & SILENCIO ═══ */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Lock className="h-4 w-4 text-[#81D8D0]" />
                  Privacidade e modo silencio
                </h3>

                {/* Toggle: Perfil publico */}
                <div
                  className={`flex items-center justify-between p-4 rounded-xl border transition-colors cursor-pointer ${
                    isPublicProfile ? "bg-[#81D8D0]/10 border-[#81D8D0]/30" : "bg-white/3 border-white/10"
                  }`}
                  onClick={() => setIsPublicProfile(!isPublicProfile)}
                >
                  <div className="flex items-center gap-3">
                    <Globe className={`h-5 w-5 ${isPublicProfile ? "text-[#81D8D0]" : "text-white/30"}`} />
                    <div>
                      <p className="text-sm text-white font-semibold">Perfil publico</p>
                      <p className="text-xs text-white/40">
                        {isPublicProfile
                          ? "Qualquer membro pode ver seu perfil."
                          : "Seu perfil so e visivel para conexoes aprovadas."}
                      </p>
                    </div>
                  </div>
                  <div className={`w-11 h-6 rounded-full flex items-center transition-colors ${isPublicProfile ? "bg-[#81D8D0]" : "bg-white/20"}`}>
                    <motion.div
                      layout
                      className="w-5 h-5 bg-white rounded-full shadow"
                      style={{ marginLeft: isPublicProfile ? "auto" : 2, marginRight: isPublicProfile ? 2 : "auto" }}
                    />
                  </div>
                </div>

                {/* Toggle: Modo silencio */}
                <div
                  className={`flex items-center justify-between p-4 rounded-xl border transition-colors cursor-pointer ${
                    isAnonymousMode ? "bg-[#C8102E]/10 border-[#C8102E]/30" : "bg-white/3 border-white/10"
                  }`}
                  onClick={() => setIsAnonymousMode(!isAnonymousMode)}
                >
                  <div className="flex items-center gap-3">
                    <VolumeX className={`h-5 w-5 ${isAnonymousMode ? "text-[#C8102E]" : "text-white/30"}`} />
                    <div>
                      <p className="text-sm text-white font-semibold">Modo silencio</p>
                      <p className="text-xs text-white/40">
                        {isAnonymousMode
                          ? "Ativado — voce nao aparece em listagens e seu status fica oculto."
                          : "Desativado — voce aparece normalmente na plataforma."}
                      </p>
                    </div>
                  </div>
                  <div className={`w-11 h-6 rounded-full flex items-center transition-colors ${isAnonymousMode ? "bg-[#C8102E]" : "bg-white/20"}`}>
                    <motion.div
                      layout
                      className="w-5 h-5 bg-white rounded-full shadow"
                      style={{ marginLeft: isAnonymousMode ? "auto" : 2, marginRight: isAnonymousMode ? 2 : "auto" }}
                    />
                  </div>
                </div>
              </div>

              {/* ═══ FEEDBACK ═══ */}
              {success && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-[#81D8D0]/10 border border-[#81D8D0]/30 rounded-xl">
                  <p className="text-sm text-[#81D8D0] font-semibold text-center">Perfil atualizado com sucesso!</p>
                </motion.div>
              )}
              {error && (
                <div className="p-3 bg-[#C8102E]/10 border border-[#C8102E]/30 rounded-xl">
                  <p className="text-sm text-[#C8102E] font-semibold">{error}</p>
                </div>
              )}

              {/* ═══ BOTOES ═══ */}
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={onClose} disabled={isLoading} className="flex-1 py-3 bg-white/5 border border-white/10 text-white/90 rounded-xl hover:bg-white/10 transition-colors font-medium disabled:opacity-50">
                  Cancelar
                </button>
                <button type="submit" disabled={isLoading || success} className="flex-1 py-3 bg-[#81D8D0] text-black rounded-xl hover:bg-[#81D8D0]/90 transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {isLoading ? (<><Loader2 className="h-5 w-5 animate-spin" />Salvando...</>) : success ? "Salvo!" : "Salvar Alteracoes"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
