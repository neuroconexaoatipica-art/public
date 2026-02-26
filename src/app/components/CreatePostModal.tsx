import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useProfileContext, useCommunitiesContext, useImageUpload } from '../../lib';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  defaultCommunityId?: string | null;
}

export function CreatePostModal({ isOpen, onClose, onSuccess, defaultCommunityId }: Props) {
  const { user } = useProfileContext();
  const { communities } = useCommunitiesContext();
  const { uploadImage, isUploading } = useImageUpload();
  const [content, setContent] = useState('');
  const [communityId, setCommunityId] = useState(defaultCommunityId || '');
  const [isPublic, setIsPublic] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !user) return null;

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError('Imagem muito grande (max 5MB)'); return; }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!content.trim() || sending) return;
    setSending(true); setError('');
    try {
      let imageUrl: string | null = null;
      if (imageFile) {
        const result = await uploadImage(imageFile, 'post-images', 'posts');
        if (!result.success) throw new Error(result.error);
        imageUrl = result.url || null;
      }
      const { error: err } = await supabase.from('posts').insert({
        content: content.trim(),
        author: user.id,
        community: communityId || null,
        is_public: isPublic,
        is_pinned: false,
        image_url: imageUrl,
      });
      if (err) throw err;
      setContent(''); setCommunityId(''); setImageFile(null); setImagePreview(null);
      onSuccess?.();
      onClose();
    } catch (err: any) { setError(err.message || 'Erro ao publicar'); }
    finally { setSending(false); }
  };

  const realCommunities = communities.filter(c => !c.id.startsWith('pending-') && !c.id.startsWith('local-'));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4" onClick={onClose}>
      <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h2 className="text-white text-lg font-semibold">Novo Post</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white text-xl">✕</button>
        </div>
        <div className="p-5 space-y-4">
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="O que esta na sua mente?"
            rows={5}
            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-white/30 focus:outline-none focus:border-[#81D8D0]/50 resize-none"
            autoFocus
          />
          {imagePreview && (
            <div className="relative">
              <img src={imagePreview} alt="Preview" className="rounded-xl max-h-48 w-full object-cover" />
              <button onClick={() => { setImageFile(null); setImagePreview(null); }} className="absolute top-2 right-2 bg-black/60 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm">✕</button>
            </div>
          )}
          <div className="flex flex-wrap gap-3">
            <select value={communityId} onChange={e => setCommunityId(e.target.value)} className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none flex-1 min-w-[160px]">
              <option value="">Feed geral</option>
              {realCommunities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <label className="flex items-center gap-2 text-white/60 text-sm cursor-pointer">
              <input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} className="accent-[#81D8D0]" />
              Publico
            </label>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-white/50 hover:text-[#81D8D0] cursor-pointer text-sm flex items-center gap-1">
              📷 Imagem
              <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
            </label>
          </div>
          {error && <p className="text-[#C8102E] text-sm">{error}</p>}
        </div>
        <div className="flex justify-end gap-3 p-5 border-t border-white/10">
          <button onClick={onClose} className="px-5 py-2.5 text-white/60 hover:text-white rounded-xl text-sm">Cancelar</button>
          <button onClick={handleSubmit} disabled={!content.trim() || sending || isUploading} className="px-6 py-2.5 bg-[#81D8D0] text-black rounded-xl font-semibold text-sm disabled:opacity-40">
            {sending || isUploading ? 'Publicando...' : 'Publicar'}
          </button>
        </div>
      </div>
    </div>
  );
}
