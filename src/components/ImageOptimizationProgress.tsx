
import { Progress } from '@/components/ui/progress';
import { OptimizationProgress } from '@/hooks/useImageOptimization';

interface ImageOptimizationProgressProps {
  progress: OptimizationProgress;
  isOptimizing: boolean;
}

const ImageOptimizationProgress = ({ progress, isOptimizing }: ImageOptimizationProgressProps) => {
  if (!isOptimizing) return null;

  return (
    <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-blue-900">Optimizing Images</h4>
        <span className="text-sm text-blue-600">{Math.round(progress.progress)}%</span>
      </div>
      
      <Progress value={progress.progress} className="h-2" />
      
      <div className="text-sm text-blue-700">
        {progress.stage === 'compressing' && (
          <span>Compressing and optimizing images...</span>
        )}
        {progress.stage === 'uploading' && (
          <span>Uploading optimized images...</span>
        )}
        {progress.stage === 'complete' && (
          <span>Optimization complete!</span>
        )}
        {progress.currentVariant && (
          <div className="text-xs text-blue-500 mt-1">
            Processing: {progress.currentVariant}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageOptimizationProgress;
