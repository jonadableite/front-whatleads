// src/hooks/useMediaUpload.ts
import { MediaContent, UseMediaUploadResult } from "@/types/warmup.types";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import Compressor from "compressorjs";

export function useMediaUpload(): UseMediaUploadResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const compressImage = async (file: File, maxSizeMb = 2): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      new Compressor(file, {
        quality: 0.8,
        maxWidth: 1920,
        maxHeight: 1080,
        success(result) {
          if (result.size > maxSizeMb * 1024 * 1024) {
            // Se ainda estiver muito grande, comprimir mais
            new Compressor(file, {
              quality: 0.6,
              maxWidth: 1280,
              maxHeight: 720,
              success: resolve,
              error: reject,
            });
          } else {
            resolve(result);
          }
        },
        error: reject,
      });
    });
  };

  const processFile = async (file: Blob, type: MediaContent['type']): Promise<MediaContent> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        try {
          const base64String = reader.result as string;
          const base64Data = base64String.split(',')[1];

          const getMimetype = (type: string) => {
            switch (type) {
              case 'image':
                return 'image/jpeg';
              case 'video':
                return 'video/mp4';
              case 'audio':
                return 'audio/mp3';
              case 'sticker':
                return 'image/webp';
              default:
                return (file as File).type;
            }
          };

          const newMedia: MediaContent = {
            type,
            base64: base64Data,
            fileName: (file as File).name,
            mimetype: getMimetype(type),
            preview: base64String,
          };

          resolve(newMedia);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const uploadMedia = async (files: FileList, type: MediaContent['type']): Promise<MediaContent[]> => {
    setLoading(true);
    setError(null);

    try {
      const maxTotalSize = 50 * 1024 * 1024; // 50MB total
      const maxFileSize = 10 * 1024 * 1024; // 10MB por arquivo

      const totalSize = Array.from(files).reduce((acc, file) => acc + file.size, 0);
      
      if (totalSize > maxTotalSize) {
        throw new Error('O tamanho total dos arquivos excede 50MB');
      }

      const processedFiles: MediaContent[] = [];

      for (const file of Array.from(files)) {
        if (file.size > maxFileSize) {
          toast({
            title: "Arquivo muito grande",
            description: `O arquivo ${file.name} excede 10MB`,
            variant: "destructive",
          });
          continue;
        }

        let processedFile: Blob = file;

        if (type === 'image') {
          processedFile = await compressImage(file);
        }

        const mediaContent = await processFile(processedFile, type);
        processedFiles.push(mediaContent);
      }

      toast({
        title: "Arquivos processados",
        description: `${processedFiles.length} arquivo(s) processado(s) com sucesso!`,
        variant: "default",
      });

      return processedFiles;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao processar arquivos';
      setError(new Error(errorMessage));
      
      toast({
        title: "Erro no upload",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    uploadMedia,
    compressImage,
    loading,
    error,
  };
}