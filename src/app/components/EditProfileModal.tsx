import { useState } from 'react';
import { useProfileContext } from '../../lib';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function EditProfileModal({ isOpen, onClose }: Props) {
  const { user, updateProfile, uploadPhoto } = useProfileContext();
  const [name, setName] = useState(user?.name || '');
  const [displayName, setDisplayName] = useState(user?.display_name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [aboutText, setAboutText] = useState(user?.about_text || '');
  const [deepStatement, setDeepStatement] = useState(user?.deep_statement || '');
  const [isPublic, setIsPublic] = useState(user?.is_public_profile ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [photoUploading, setPhotoUploading] = useState(false);

  if (!isOpen || !user) return null;

  const handleSave = async () => {
    if (!name.trim()) { setError('Nome e obrigatorio'); return; }
    setSaving(true); setError('');
    const result = await updateProfile({
      name: name.trim(),
      display_name: displayName.trim() || name.trim(),
      bio: bio.trim() || null,
      about_text: aboutText.trim(),
      deep_statement: deepStatement.trim() || null,
      is_public_profile: isPublic,
    });
    setSaving(false);
    if (result.success) onClose();
    else setError(result.error || 'Erro ao salvar');
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoUploading(true);
    const result = await uploadPhoto(file);
    setPhotoUploading(false);
    if (!result.success) setError(result.error || 'Erro no upload');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4" onClick={onClose}>
      <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h2 className="text-white text-lg font-semibold">Editar Perfil</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white text-xl">✕</button>
        </div>
        <div className="p-5 space-y-4">
          <div className="text-center">
            <div className="relative inline-block">
              {user.profile_photo ? (
                <img src={user.profile_photo} alt="" className="w-20 h-20 rounded-full object-cover mx-auto" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-[#81D8D0]/20 flex items-center justify-center text-[#81D8D0] text-2xl font-bold mx-auto">{(user.name || 'M')[0]}</div>
              )}
              <label className="absolute bottom-0 right-0 bg-[#81D8D0] text-black w-7 h-7 rounded-full flex items-center justify-center cursor-pointer text-sm font-bold">
                {photoUploading ? '...' : '📷'}
                <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
              </label>
            </div>
          </div>
          <div>
            <label className="text-white/60 text-sm mb-1 block">Nome</label>
            <input value={name} onChange={e => setName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#81D8D0]/50" />
          </div>
          <div>
            <label className="text-white/60 text-sm mb-1 block">Nome de exibicao</label>
            <input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Como quer ser chamado(a)" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:border-[#81D8D0]/50" />
          </div>
          <div>
            <label className="text-white/60 text-sm mb-1 block">Bio curta</label>
            <input value={bio} onChange={e => setBio(e.target.value)} placeholder="Uma frase sobre voce" maxLength={160} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:border-[#81D8D0]/50" />
          </div>
          <div>
            <label className="text-white/60 text-sm mb-1 block">Sobre mim</label>
            <textarea value={aboutText} onChange={e => setAboutText(e.target.value)} rows={3} placeholder="Conte mais sobre voce..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:border-[#81D8D0]/50 resize-none" />
          </div>
          <div>
            <label className="text-white/60 text-sm mb-1 block">Declaracao profunda</label>
            <textarea value={deepStatement} onChange={e => setDeepStatement(e.target.value)} rows={2} placeholder="Algo que define quem voce e..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:border-[#81D8D0]/50 resize-none" />
          </div>
          <label className="flex items-center gap-2 text-white/60 text-sm cursor-pointer">
            <input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} className="accent-[#81D8D0]" />
            Perfil publico
          </label>
          {error && <p className="text-[#C8102E] text-sm">{error}</p>}
        </div>
        <div className="flex justify-end gap-3 p-5 border-t border-white/10">
          <button onClick={onClose} className="px-5 py-2.5 text-white/60 hover:text-white rounded-xl text-sm">Cancelar</button>
          <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 bg-[#81D8D0] text-black rounded-xl font-semibold text-sm disabled:opacity-40">
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
}
