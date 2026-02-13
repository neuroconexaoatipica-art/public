import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Loader2, Camera } from "lucide-react";
import { useProfileContext } from "../../lib";
import type { User } from "../../lib";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onProfileUpdated?: () => void;
}

export function EditProfileModal({ isOpen, onClose, currentUser, onProfileUpdated }: EditProfileModalProps) {
  const [name, setName] = useState(currentUser.name);
  const [bio, setBio] = useState(currentUser.bio || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(currentUser.profile_photo);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isSavingRef = useRef(false);

  const { updateProfile, uploadPhoto } = useProfileContext();

  useEffect(() => {
    if (isOpen && !isSavingRef.current) {
      setName(currentUser.name);
      setBio(currentUser.bio || "");
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
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) { setError("Imagem muito grande. Máximo 5MB."); return; }
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) { setError("Tipo de arquivo não suportado. Use JPG, PNG ou WebP."); return; }
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => { setPhotoPreview(reader.result as string); };
    reader.readAsDataURL(file);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length === 0) { setError("Nome não pode estar vazio"); return; }
    if (name.length > 100) { setError("Nome muito longo. Máximo 100 caracteres"); return; }
    if (bio.length > 1000) { setError("Bio muito longa. Máximo 1000 caracteres"); return; }

    setError(""); setIsLoading(true); setSuccess(false);
    isSavingRef.current = true;
    const nameToSave = name.trim();
    const bioToSave = bio.trim();

    try {
      if (photoFile) {
        const uploadResult = await uploadPhoto(photoFile);
        if (!uploadResult.success) throw new Error(uploadResult.error || 'Erro ao fazer upload da foto');
      }
      const updates: Partial<User> = { name: nameToSave, bio: bioToSave || null };
      const result = await updateProfile(updates);
      if (!result.success) throw new Error(result.error || 'Erro ao atualizar perfil');
      setSuccess(true);
      isSavingRef.current = false;
      if (onProfileUpdated) onProfileUpdated();
      setTimeout(() => { onClose(); }, 1500);
    } catch (err: any) {
      isSavingRef.current = false;
      setError(err.message || 'Erro ao atualizar perfil. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="fixed inset-0 z-50 flex items-center justify-center bg-[#35363A]/90 backdrop-blur-sm px-4" onClick={onClose}>
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ duration: 0.3, ease: "easeOut" }} onClick={(e) => e.stopPropagation()} className="relative w-full max-w-2xl bg-[#35363A] rounded-2xl shadow-2xl p-8 border border-white/10 max-h-[90vh] overflow-y-auto">
            <button onClick={onClose} disabled={isLoading} className="absolute top-4 right-4 p-2 hover:bg-white/5 rounded-lg transition-colors disabled:opacity-50"><X className="h-5 w-5 text-white/60" /></button>
            <h2 className="text-2xl font-semibold mb-6 text-white">Editar Perfil</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-white/10 flex items-center justify-center overflow-hidden border-4 border-[#35363A]">
                    {photoPreview ? (<img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />) : (<span className="text-4xl font-bold text-white/70">{name.charAt(0).toUpperCase()}</span>)}
                  </div>
                  <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isLoading} className="absolute bottom-0 right-0 p-3 bg-[#81D8D0] rounded-full hover:bg-[#81D8D0]/90 transition-colors shadow-lg disabled:opacity-50"><Camera className="h-5 w-5 text-black" /></button>
                </div>
                <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" ref={fileInputRef} onChange={handlePhotoChange} disabled={isLoading} className="hidden" />
                <p className="text-xs text-white/50 text-center">Clique no ícone da câmera para alterar a foto<br />Máximo 5MB - JPG, PNG ou WebP</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">Nome <span className="text-[#C8102E]">*</span></label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" disabled={isLoading} maxLength={100} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#81D8D0] focus:border-transparent transition-all text-white placeholder:text-white/40 disabled:opacity-50" />
                <p className="text-xs text-white/50 mt-1">{name.length}/100 caracteres</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">Bio / Sobre você</label>
                <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Conte um pouco sobre você, suas experiências, o que te traz aqui..." rows={5} disabled={isLoading} maxLength={1000} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#81D8D0] focus:border-transparent transition-all text-white placeholder:text-white/40 disabled:opacity-50 resize-none" />
                <p className="text-xs text-white/50 mt-1">{bio.length}/1000 caracteres</p>
              </div>
              {success && (<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-[#81D8D0]/10 border border-[#81D8D0]/30 rounded-xl"><p className="text-sm text-[#81D8D0] font-semibold text-center">Perfil atualizado com sucesso!</p></motion.div>)}
              {error && (<div className="p-3 bg-[#C8102E]/10 border border-[#C8102E]/30 rounded-xl"><p className="text-sm text-[#C8102E] font-semibold">{error}</p></div>)}
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={onClose} disabled={isLoading} className="flex-1 py-3 bg-white/5 border border-white/10 text-white/90 rounded-xl hover:bg-white/10 transition-colors font-medium disabled:opacity-50">Cancelar</button>
                <button type="submit" disabled={isLoading || success} className="flex-1 py-3 bg-[#81D8D0] text-black rounded-xl hover:bg-[#81D8D0]/90 transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {isLoading ? (<><Loader2 className="h-5 w-5 animate-spin" />Salvando...</>) : success ? ("Salvo!") : ("Salvar Alterações")}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
