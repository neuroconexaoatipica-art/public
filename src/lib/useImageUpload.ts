import { useState } from 'react';
import { supabase } from './supabase';

interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export function useImageUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadImage = async (
    file: File,
    bucket: 'avatars' | 'post-images' = 'avatars',
    folder?: string
  ): Promise<UploadResult> => {
    try {
      setIsUploading(true);
      setProgress(0);

      // Validações
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        return {
          success: false,
          error: 'Imagem muito grande. Máximo 5MB.'
        };
      }

      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        return {
          success: false,
          error: 'Tipo de arquivo não suportado. Use JPG, PNG, WebP ou GIF.'
        };
      }

      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        return {
          success: false,
          error: 'Você precisa estar logado para fazer upload.'
        };
      }

      // Criar nome único para o arquivo
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${session.user.id}-${Date.now()}.${fileExt}`;
      const filePath = folder ? `${folder}/${fileName}` : fileName;

      setProgress(50);

      // Upload para Supabase Storage
      const { error: uploadError, data } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      setProgress(80);

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      setProgress(100);

      return {
        success: true,
        url: publicUrl
      };
    } catch (error: any) {
      console.error('Erro ao fazer upload:', error);
      return {
        success: false,
        error: error.message || 'Erro ao fazer upload da imagem.'
      };
    } finally {
      setIsUploading(false);
      setTimeout(() => setProgress(0), 500);
    }
  };

  const deleteImage = async (
    url: string,
    bucket: 'avatars' | 'post-images' = 'avatars'
  ): Promise<boolean> => {
    try {
      // Extrair o caminho do arquivo da URL
      const urlParts = url.split(`/${bucket}/`);
      if (urlParts.length < 2) return false;

      const filePath = urlParts[1];

      const { error } = await supabase.storage
        .from(bucket)
        .remove([filePath]);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Erro ao deletar imagem:', error);
      return false;
    }
  };

  return {
    uploadImage,
    deleteImage,
    isUploading,
    progress
  };
}
