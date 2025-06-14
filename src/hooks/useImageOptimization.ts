
import { useState, useCallback } from 'react';
import { ImageOptimizer, ImageVariant } from '@/utils/imageOptimization';

export interface OptimizationProgress {
  stage: 'compressing' | 'uploading' | 'complete';
  progress: number;
  currentVariant?: string;
}

export const useImageOptimization = () => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [progress, setProgress] = useState<OptimizationProgress>({
    stage: 'compressing',
    progress: 0
  });

  const optimizeImages = useCallback(async (files: File[]): Promise<ImageVariant[][]> => {
    setIsOptimizing(true);
    setProgress({ stage: 'compressing', progress: 0 });

    const allVariants: ImageVariant[][] = [];
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        setProgress({
          stage: 'compressing',
          progress: (i / files.length) * 100,
          currentVariant: file.name
        });

        const variants = await ImageOptimizer.createImageVariants(file);
        allVariants.push(variants);
      }

      setProgress({ stage: 'complete', progress: 100 });
      return allVariants;
    } catch (error) {
      console.error('Image optimization failed:', error);
      throw error;
    } finally {
      setIsOptimizing(false);
    }
  }, []);

  const optimizeSingleImage = useCallback(async (file: File): Promise<ImageVariant[]> => {
    setIsOptimizing(true);
    setProgress({ stage: 'compressing', progress: 0, currentVariant: file.name });

    try {
      const variants = await ImageOptimizer.createImageVariants(file);
      setProgress({ stage: 'complete', progress: 100 });
      return variants;
    } catch (error) {
      console.error('Single image optimization failed:', error);
      throw error;
    } finally {
      setIsOptimizing(false);
    }
  }, []);

  return {
    isOptimizing,
    progress,
    optimizeImages,
    optimizeSingleImage
  };
};
