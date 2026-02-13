import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Loader2, Globe, Lock, Image, Trash2 } from "lucide-react";
import { supabase, useImageUpload, useCommunitiesContext, hasAppAccess } from "../../lib";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated?: () => void;
  defaultCommunityId?: string | null;
}

export function CreatePostModal({ isOpen, onClose, onPostCreated, defaultCommunityId }: CreatePostModalProps) {
  const [content, setContent] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState<string | null>(defaultCommunityId || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadImage, isUploading } = useImageUpload();
  const { communities } = useCommunitiesContext();
  const realCommunities = communities.filter(c => !c.id.startsWith('pending-') && !c.id.startsWith('local-'));

  useEffect(() => { if (isOpen) setSelectedCommunity(defaultCommunityId || null); }, [isOpen, defaultCommunityId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim().length === 0 && !imageFile) { setError("Escreva algo ou adicione uma imagem antes de publicar"); return; }
    if (content.length > 5000) { setError("Post muito longo. Máximo 5000 caracteres"); return; }
    setError(""); setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('Você precisa estar logado para criar um post');
      const { data: userData, error: userError } = await supabase.from('users').select('role').eq('id', session.user.id).single();
      if (userError || !userData || !hasAppAccess(userData.role)) { setError('Apenas membros podem criar posts. Solicite acesso para participar.'); setIsLoading(false); return; }
      let imageUrl: string | null = null;
      if (imageFile) { const uploadResult = await uploadImage(imageFile, 'avatars', 'post-images'); if (!uploadResult.success || !uploadResult.url) throw new Error(uploadResult.error || 'Erro ao carregar a imagem'); imageUrl = uploadResult.url; }
      const { error: postError } = await supabase.from('posts').insert({ content: content.trim(), author: session.user.id, is_public: isPublic, community: selectedCommunity, image_url: imageUrl }).select().single();
      if (postError) throw postError;
      setIsLoading(false); setContent(""); setIsPublic(false); setSelectedCommunity(null); setImageFile(null); setImagePreview(null); onClose();
      if (onPostCreated) onPostCreated();
      setCooldown(30); const timer = setInterval(() => { setCooldown(prev => { if (prev <= 1) { clearInterval(timer); return 0; } return prev - 1; }); }, 1000);
    } catch (err: any) { setIsLoading(false); setError(err.message || 'Erro ao criar post. Tente novamente.'); }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (file) { setImageFile(file); const reader = new FileReader(); reader.onloadend = () => { setImagePreview(reader.result as string); }; reader.readAsDataURL(file); } };
  const handleRemoveImage = () => { setImageFile(null); setImagePreview(null); };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="fixed inset-0 z-50 flex items-center justify-center bg-[#35363A]/90 backdrop-blur-sm px-4" onClick={onClose}>
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ duration: 0.3, ease: "easeOut" }} onClick={(e) => e.stopPropagation()} className="relative w-full max-w-2xl bg-[#35363A] rounded-2xl shadow-2xl p-8 border border-white/10 max-h-[90vh] overflow-y-auto">
            <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-white/5 rounded-lg transition-colors"><X className="h-5 w-5 text-white/60" /></button>
            <h2 className="text-2xl font-semibold mb-6 text-white">Criar Post</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              {realCommunities.length > 0 && (<div><label className="block text-sm font-medium text-white/90 mb-2">Comunidade (opcional)</label><select value={selectedCommunity || ''} onChange={(e) => setSelectedCommunity(e.target.value || null)} disabled={isLoading} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#81D8D0] focus:border-transparent transition-all text-white disabled:opacity-50 appearance-none cursor-pointer"><option value="" className="bg-[#35363A]">Feed Geral</option>{realCommunities.map(c => (<option key={c.id} value={c.id} className="bg-[#35363A]">{c.name}</option>))}</select></div>)}
              <div>
                <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="O que você está pensando?" rows={6} disabled={isLoading} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#81D8D0] focus:border-transparent transition-all text-white placeholder:text-white/40 disabled:opacity-50 resize-none text-base" />
                <div className="flex items-center justify-between mt-2"><p className="text-xs text-white/50">{content.length}/5000 caracteres</p>{content.length > 4500 && (<p className="text-xs text-[#FF6B35]">Chegando ao limite</p>)}</div>
              </div>
              <div className="relative">
                {imagePreview ? (<div className="relative"><img src={imagePreview} alt="Preview" className="w-full h-64 object-cover rounded-xl" /><button type="button" onClick={handleRemoveImage} disabled={isLoading} className="absolute top-2 right-2 p-2 bg-black/60 backdrop-blur-sm rounded-full text-white hover:bg-black/80 transition-colors disabled:opacity-50"><Trash2 className="h-4 w-4" /></button></div>) : (<button type="button" onClick={() => fileInputRef.current?.click()} disabled={isLoading} className="w-full py-8 bg-white/5 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center text-white/60 hover:text-white/90 hover:border-[#81D8D0]/40 hover:bg-white/8 transition-all disabled:opacity-50"><Image className="h-8 w-8 mb-2" /><p className="text-sm font-medium">Adicionar Imagem (opcional)</p><p className="text-xs text-white/40 mt-1">Máximo 5MB - JPG, PNG, WebP ou GIF</p></button>)}
                <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp,image/gif" ref={fileInputRef} onChange={handleImageChange} disabled={isLoading} className="hidden" />
              </div>
              <div className="space-y-3">
                <label className="block text-sm font-medium text-white/90">Visibilidade</label>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setIsPublic(false)} className={`flex-1 flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${!isPublic ? 'bg-[#81D8D0]/10 border-[#81D8D0] text-white' : 'bg-white/3 border-white/10 text-white/70 hover:bg-white/5'}`}><Lock className="h-5 w-5 flex-shrink-0" /><div className="text-left"><p className="font-semibold text-sm">Apenas Membros</p><p className="text-xs opacity-80">Somente quem tem acesso</p></div></button>
                  <button type="button" onClick={() => setIsPublic(true)} className={`flex-1 flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${isPublic ? 'bg-[#81D8D0]/10 border-[#81D8D0] text-white' : 'bg-white/3 border-white/10 text-white/70 hover:bg-white/5'}`}><Globe className="h-5 w-5 flex-shrink-0" /><div className="text-left"><p className="font-semibold text-sm">Público</p><p className="text-xs opacity-80">Qualquer visitante pode ver</p></div></button>
                </div>
              </div>
              {error && (<div className="p-3 bg-[#C8102E]/10 border border-[#C8102E]/30 rounded-xl"><p className="text-sm text-[#C8102E] font-semibold">{error}</p></div>)}
              <div className="flex gap-3">
                <button type="button" onClick={onClose} disabled={isLoading} className="flex-1 py-3 bg-white/5 border border-white/10 text-white/90 rounded-xl hover:bg-white/10 transition-colors font-medium disabled:opacity-50">Cancelar</button>
                <button type="submit" disabled={isLoading || cooldown > 0 || (content.trim().length === 0 && !imageFile)} className="flex-1 py-3 bg-[#81D8D0] text-black rounded-xl hover:bg-[#81D8D0]/90 transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {isLoading ? (<><Loader2 className="h-5 w-5 animate-spin" />Publicando...</>) : cooldown > 0 ? (`Aguarde ${cooldown}s`) : ("Publicar")}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
