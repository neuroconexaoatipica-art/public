import { supabase, useImageUpload, useCommunitiesContext, TIMEOUTS } from "../../lib";
import { cleanTextInput, validateImageFile, RATE_LIMITS, MAX_LENGTHS } from "../../lib";
import { motion, AnimatePresence } from "motion/react";
import { X, Loader2, Globe, Lock, Image, Trash2, CheckCircle } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated?: () => void;
  defaultCommunityId?: string | null;
}

// Mensagens progressivas de loading — feedback visual pro usuário saber que está funcionando
const LOADING_STAGES = [
  { delay: 0, text: "Publicando..." },
  { delay: 4000, text: "Conectando ao servidor..." },
  { delay: 10000, text: "Servidor acordando (plano gratuito)... aguarde" },
  { delay: 20000, text: "Quase lá... não feche a janela" },
  { delay: 35000, text: "Última tentativa..." },
];

export function CreatePostModal({ isOpen, onClose, onPostCreated, defaultCommunityId }: CreatePostModalProps) {
  const [content, setContent] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState<string | null>(defaultCommunityId || null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Publicando...");
  const [error, setError] = useState("");
  const [debugInfo, setDebugInfo] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const loadingTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const { uploadImage } = useImageUpload();
  const { communities } = useCommunitiesContext();

  const realCommunities = communities.filter(c => !c.id.startsWith('pending-') && !c.id.startsWith('local-'));

  useEffect(() => {
    if (isOpen) {
      // RESET COMPLETO — garante estado limpo toda vez que o modal abre
      setContent("");
      setIsPublic(false);
      setSelectedCommunity(defaultCommunityId || null);
      setIsLoading(false);
      setLoadingText("Publicando...");
      setError("");
      setDebugInfo("");
      setImageFile(null);
      setImagePreview(null);
      setCooldown(0);
      setShowSuccess(false);
      // Limpar qualquer timer residual de loading progressivo
      loadingTimersRef.current.forEach(clearTimeout);
      loadingTimersRef.current = [];
    }
  }, [isOpen, defaultCommunityId]);

  // Limpar timers ao desmontar
  useEffect(() => {
    return () => {
      loadingTimersRef.current.forEach(clearTimeout);
    };
  }, []);

  const startProgressiveLoading = () => {
    // Limpar timers anteriores
    loadingTimersRef.current.forEach(clearTimeout);
    loadingTimersRef.current = [];

    LOADING_STAGES.forEach(stage => {
      const timer = setTimeout(() => setLoadingText(stage.text), stage.delay);
      loadingTimersRef.current.push(timer);
    });
  };

  const stopProgressiveLoading = () => {
    loadingTimersRef.current.forEach(clearTimeout);
    loadingTimersRef.current = [];
  };

  // Traduz código de erro do Supabase em mensagem que um humano entende
  const translateError = (code: string, message: string, hint: string): string => {
    switch (code) {
      case '42501':
        return 'Permissão negada. Seu perfil pode não ter acesso para postar nesta comunidade. Entre em contato com a administração.';
      case '23503':
        return 'A comunidade selecionada não existe no banco de dados. Tente selecionar outra comunidade.';
      case '23502':
        return `Campo obrigatório faltando no banco: ${hint || message}. Isso é um bug — entre em contato com a administração.`;
      case '23505':
        return 'Post duplicado detectado. Aguarde alguns segundos e tente novamente.';
      case 'PGRST301':
        return 'Sua sessão expirou. Faça logout e entre novamente.';
      default:
        if (message?.includes('JWT')) return 'Sessão expirada. Faça logout e entre novamente.';
        if (message?.includes('timeout') || message?.includes('abort')) return 'O servidor demorou para responder. Isso acontece quando o servidor está "dormindo" (plano gratuito). Tente novamente — a segunda tentativa costuma ser instantânea.';
        return message || 'Erro desconhecido. Tente novamente.';
    }
  };

  const doSubmit = async (isRetry = false) => {
    setError("");
    setDebugInfo("");

    // v1.1: Rate limit local anti-spam
    const rateCheck = RATE_LIMITS.CREATE_POST();
    if (!rateCheck.allowed) {
      setError(`Voce esta postando rapido demais. Aguarde ${Math.ceil(rateCheck.retryAfterMs / 1000)}s.`);
      return;
    }

    setIsLoading(true);
    setShowSuccess(false);
    startProgressiveLoading();

    try {
      // 1. Sessão (instantâneo — dados locais)
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw { userMessage: 'Você precisa estar logada. Faça logout e entre novamente.' };
      }

      const userId = session.user.id;

      // 2. Upload de imagem (se houver)
      let imageUrl: string | null = null;
      if (imageFile) {
        // v1.1: Validacao de imagem
        const imgValidation = validateImageFile(imageFile);
        if (!imgValidation.valid) {
          throw { userMessage: imgValidation.message };
        }
        setLoadingText("Enviando imagem...");
        try {
          const uploadResult = await uploadImage(imageFile, 'avatars', 'post-images');
          if (!uploadResult.success || !uploadResult.url) {
            throw { userMessage: `Falha no upload da imagem: ${uploadResult.error || 'tente novamente'}` };
          }
          imageUrl = uploadResult.url;
        } catch (e: any) {
          if (e.userMessage) throw e;
          throw { userMessage: `Falha no upload: ${e.message}` };
        }
      }

      // 3. Montar payload completo — todos os campos obrigatórios explícitos
      const postPayload = {
        content: cleanTextInput(content, MAX_LENGTHS.POST_CONTENT),
        author: userId,
        is_public: isPublic,
        is_pinned: false,
        community: selectedCommunity || null,
        image_url: imageUrl,
      };

      console.log('[CreatePost] Enviando payload:', {
        content_length: postPayload.content.length,
        community: postPayload.community,
        is_public: postPayload.is_public,
        has_image: !!imageUrl,
        is_retry: isRetry,
      });

      setLoadingText(isRetry ? "Tentando novamente..." : "Publicando...");

      // 4. INSERT — direto pelo supabase-js (timeout global de 45s já configurado)
      const { error: postError, data: postData } = await supabase
        .from('posts')
        .insert(postPayload)
        .select()
        .single();

      if (postError) {
        const code = (postError as any).code || '';
        const hint = (postError as any).hint || '';
        console.error('[CreatePost] Erro Supabase:', { code, message: postError.message, hint });
        setDebugInfo(`Código: ${code} | ${postError.message} | ${hint} | community: ${postPayload.community}`);
        throw { userMessage: translateError(code, postError.message, hint) };
      }

      // 5. SUCESSO
      console.log('[CreatePost] Post criado:', postData?.id);
      stopProgressiveLoading();
      setIsLoading(false);
      setShowSuccess(true);
      setContent("");
      setIsPublic(false);
      setSelectedCommunity(null);
      setImageFile(null);
      setImagePreview(null);

      // Fechar modal após feedback visual
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
        try { onPostCreated?.(); } catch {}
      }, 1500);

      // Cooldown anti-spam
      setCooldown(30);
      const timer = setInterval(() => {
        setCooldown(prev => {
          if (prev <= 1) { clearInterval(timer); return 0; }
          return prev - 1;
        });
      }, 1000);

    } catch (err: any) {
      stopProgressiveLoading();
      setIsLoading(false);

      const message = err.userMessage || err.message || 'Erro desconhecido';

      // Auto-retry UMA vez em caso de timeout (cold start)
      if (!isRetry && (message.includes('abort') || message.includes('timeout') || message.includes('dormindo'))) {
        console.log('[CreatePost] Timeout detectado, retry automático...');
        setLoadingText("Servidor acordou! Tentando novamente...");
        setTimeout(() => doSubmit(true), 1000);
        return;
      }

      setError(message);
      console.error('[CreatePost] ERRO FINAL:', message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim().length === 0 && !imageFile) {
      setError("Escreva algo ou adicione uma imagem antes de publicar");
      return;
    }
    if (content.length > 5000) {
      setError("Post muito longo. Máximo 5000 caracteres");
      return;
    }
    await doSubmit();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => { setImagePreview(reader.result as string); };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

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
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-white/5 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-white/60" />
            </button>

            <h2 className="text-2xl font-semibold mb-6 text-white">Criar Post</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {realCommunities.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">
                    Comunidade (opcional)
                  </label>
                  <select
                    value={selectedCommunity || ''}
                    onChange={(e) => setSelectedCommunity(e.target.value || null)}
                    disabled={isLoading}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#81D8D0] focus:border-transparent transition-all text-white disabled:opacity-50 appearance-none cursor-pointer"
                  >
                    <option value="" className="bg-[#35363A]">Feed Geral</option>
                    {realCommunities.map(c => (
                      <option key={c.id} value={c.id} className="bg-[#35363A]">
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="O que você está pensando?"
                  rows={6}
                  disabled={isLoading}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#81D8D0] focus:border-transparent transition-all text-white placeholder:text-white/40 disabled:opacity-50 resize-none text-base"
                />
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-white/50">{content.length}/5000 caracteres</p>
                  {content.length > 4500 && (
                    <p className="text-xs text-[#FF6B35]">Chegando ao limite</p>
                  )}
                </div>
              </div>

              <div className="relative">
                {imagePreview ? (
                  <div className="relative">
                    <img src={imagePreview} alt="Preview" className="w-full h-64 object-cover rounded-xl" />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      disabled={isLoading}
                      className="absolute top-2 right-2 p-2 bg-black/60 backdrop-blur-sm rounded-full text-white hover:bg-black/80 transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                    className="w-full py-8 bg-white/5 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center text-white/60 hover:text-white/90 hover:border-[#81D8D0]/40 hover:bg-white/8 transition-all disabled:opacity-50"
                  >
                    <Image className="h-8 w-8 mb-2" />
                    <p className="text-sm font-medium">Adicionar Imagem (opcional)</p>
                    <p className="text-xs text-white/40 mt-1">Máximo 5MB - JPG, PNG, WebP ou GIF</p>
                  </button>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  disabled={isLoading}
                  className="hidden"
                />
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-white/90">Visibilidade</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsPublic(false)}
                    className={`flex-1 flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                      !isPublic
                        ? 'bg-[#81D8D0]/10 border-[#81D8D0] text-white'
                        : 'bg-white/3 border-white/10 text-white/70 hover:bg-white/5'
                    }`}
                  >
                    <Lock className="h-5 w-5 flex-shrink-0" />
                    <div className="text-left">
                      <p className="font-semibold text-sm">Apenas Membros</p>
                      <p className="text-xs opacity-80">Somente quem tem acesso</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPublic(true)}
                    className={`flex-1 flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                      isPublic
                        ? 'bg-[#81D8D0]/10 border-[#81D8D0] text-white'
                        : 'bg-white/3 border-white/10 text-white/70 hover:bg-white/5'
                    }`}
                  >
                    <Globe className="h-5 w-5 flex-shrink-0" />
                    <div className="text-left">
                      <p className="font-semibold text-sm">Público</p>
                      <p className="text-xs opacity-80">Qualquer visitante pode ver</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Erro + debug info */}
              {error && (
                <div className="p-4 bg-[#C8102E]/10 border border-[#C8102E]/30 rounded-xl space-y-2">
                  <p className="text-sm text-[#C8102E]">{error}</p>
                  {debugInfo && (
                    <details className="text-xs text-[#C8102E]/60">
                      <summary className="cursor-pointer hover:text-[#C8102E]/80">Detalhes técnicos (para suporte)</summary>
                      <p className="font-mono break-all mt-1 p-2 bg-black/20 rounded">{debugInfo}</p>
                    </details>
                  )}
                  <button
                    type="button"
                    onClick={() => doSubmit()}
                    className="w-full mt-2 py-2.5 bg-[#FF6B35] text-white rounded-xl hover:bg-[#FF6B35]/90 transition-colors font-semibold text-sm"
                  >
                    Tentar Novamente
                  </button>
                </div>
              )}

              {/* Sucesso */}
              {showSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center gap-2"
                >
                  <CheckCircle className="h-5 w-5 text-green-400 shrink-0" />
                  <p className="text-sm text-green-400 font-semibold">Post publicado com sucesso!</p>
                </motion.div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 py-3 bg-white/5 border border-white/10 text-white/90 rounded-xl hover:bg-white/10 transition-colors font-medium disabled:opacity-50"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={isLoading || cooldown > 0 || (content.trim().length === 0 && !imageFile)}
                  className="flex-1 py-3 bg-[#81D8D0] text-black rounded-xl hover:bg-[#81D8D0]/90 transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      {loadingText}
                    </>
                  ) : cooldown > 0 ? (
                    `Aguarde ${cooldown}s`
                  ) : (
                    "Publicar"
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}