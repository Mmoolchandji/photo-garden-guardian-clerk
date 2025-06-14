
import { useState, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { compressImage, ImageCompressionOptions, CompressedImageResult } from '@/utils/imageCompression';

interface CompressionProgress {
  fileIndex: number;
  fileName: string;
  progress: number;
  stage: 'preparing' | 'compressing' | 'generating-variants' | 'complete' | 'error';
}

interface UseImageCompressionReturn {
  compressing: boolean;
  progress: CompressionProgress[];
  compressedResults: CompressedImageResult[];
  compressSingleImage: (file: File, options?: Partial<ImageCompressionOptions>) => Promise<CompressedImageResult | null>;
  compressMultipleImages: (files: File[], options?: Partial<ImageCompressionOptions>) => Promise<CompressedImageResult[]>;
  resetCompression: () => void;
  getTotalProgress: () => number;
}

export const useImageCompression = (): UseImageCompressionReturn => {
  const [compressing, setCompressing] = useState(false);
  const [progress, setProgress] = useState<CompressionProgress[]>([]);
  const [compressedResults, setCompressedResults] = useState<CompressedImageResult[]>([]);
  const { toast } = useToast();

  const updateProgress = useCallback((fileIndex: number, fileName: string, progressValue: number, stage: CompressionProgress['stage']) => {
    setProgress(prev => {
      const newProgress = [...prev];
      newProgress[fileIndex] = {
        fileIndex,
        fileName,
        progress: progressValue,
        stage
      };
      return newProgress;
    });
  }, []);

  const compressSingleImage = useCallback(async (
    file: File, 
    options: Partial<ImageCompressionOptions> = {}
  ): Promise<CompressedImageResult | null> => {
    try {
      setCompressing(true);
      setProgress([{ fileIndex: 0, fileName: file.name, progress: 0, stage: 'preparing' }]);

      console.log('useImageCompression: Starting compression for:', file.name);

      // Update progress for compression start
      updateProgress(0, file.name, 25, 'compressing');

      const result = await compressImage(file, options);

      // Update progress for variants generation
      updateProgress(0, file.name, 75, 'generating-variants');

      // Complete
      updateProgress(0, file.name, 100, 'complete');

      setCompressedResults([result]);

      console.log('useImageCompression: Compression complete for:', file.name);
      console.log('useImageCompression: Original size:', (file.size / 1024 / 1024).toFixed(2), 'MB');
      console.log('useImageCompression: Compressed size:', (result.compressedFile.size / 1024 / 1024).toFixed(2), 'MB');
      console.log('useImageCompression: Compression ratio:', result.compressionRatio.toFixed(2));

      return result;
    } catch (error: any) {
      console.error('useImageCompression: Compression error for', file.name, ':', error);
      updateProgress(0, file.name, 0, 'error');
      
      toast({
        title: "Compression failed",
        description: `Failed to compress ${file.name}: ${error.message}`,
        variant: "destructive",
      });
      
      return null;
    } finally {
      setCompressing(false);
    }
  }, [updateProgress, toast]);

  const compressMultipleImages = useCallback(async (
    files: File[], 
    options: Partial<ImageCompressionOptions> = {}
  ): Promise<CompressedImageResult[]> => {
    try {
      setCompressing(true);
      setCompressedResults([]);
      
      // Initialize progress for all files
      const initialProgress = files.map((file, index) => ({
        fileIndex: index,
        fileName: file.name,
        progress: 0,
        stage: 'preparing' as const
      }));
      setProgress(initialProgress);

      console.log('useImageCompression: Starting batch compression for', files.length, 'files');

      const results: CompressedImageResult[] = [];
      const totalFiles = files.length;

      // Process files sequentially to avoid overwhelming the browser
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        try {
          console.log(`useImageCompression: Processing file ${i + 1}/${totalFiles}:`, file.name);
          
          // Update progress for current file
          updateProgress(i, file.name, 25, 'compressing');

          const result = await compressImage(file, options);

          updateProgress(i, file.name, 75, 'generating-variants');

          results.push(result);

          // Complete current file
          updateProgress(i, file.name, 100, 'complete');

          console.log(`useImageCompression: Completed ${i + 1}/${totalFiles} files`);

          // Small delay between files to prevent browser freezing
          if (i < files.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 50));
          }
        } catch (error: any) {
          console.error(`useImageCompression: Error compressing file ${i + 1}:`, file.name, error);
          updateProgress(i, file.name, 0, 'error');
          
          // Continue with other files even if one fails
          toast({
            title: "Compression failed",
            description: `Failed to compress ${file.name}`,
            variant: "destructive",
          });
        }
      }

      setCompressedResults(results);

      if (results.length > 0) {
        const totalOriginalSize = files.reduce((sum, file) => sum + file.size, 0);
        const totalCompressedSize = results.reduce((sum, result) => sum + result.compressedFile.size, 0);
        const overallRatio = ((totalOriginalSize - totalCompressedSize) / totalOriginalSize) * 100;

        console.log('useImageCompression: Batch compression complete');
        console.log('useImageCompression: Total original size:', (totalOriginalSize / 1024 / 1024).toFixed(2), 'MB');
        console.log('useImageCompression: Total compressed size:', (totalCompressedSize / 1024 / 1024).toFixed(2), 'MB');
        console.log('useImageCompression: Overall compression:', overallRatio.toFixed(1), '%');

        toast({
          title: "Compression complete!",
          description: `${results.length} images compressed. Saved ${overallRatio.toFixed(1)}% space.`,
        });
      }

      return results;
    } catch (error: any) {
      console.error('useImageCompression: Batch compression error:', error);
      toast({
        title: "Batch compression failed",
        description: error.message || "Failed to compress images",
        variant: "destructive",
      });
      return [];
    } finally {
      setCompressing(false);
    }
  }, [updateProgress, toast]);

  const resetCompression = useCallback(() => {
    setCompressing(false);
    setProgress([]);
    setCompressedResults([]);
  }, []);

  const getTotalProgress = useCallback(() => {
    if (progress.length === 0) return 0;
    const totalProgress = progress.reduce((sum, p) => sum + p.progress, 0);
    return totalProgress / progress.length;
  }, [progress]);

  return {
    compressing,
    progress,
    compressedResults,
    compressSingleImage,
    compressMultipleImages,
    resetCompression,
    getTotalProgress,
  };
};
