
import { Progress } from '@/components/ui/progress';

interface BulkUploadProgressProps {
  uploading: boolean;
  uploadProgress: number;
}

const BulkUploadProgress = ({ uploading, uploadProgress }: BulkUploadProgressProps) => {
  if (!uploading) return null;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>Uploading photos...</span>
        <span>{Math.round(uploadProgress)}%</span>
      </div>
      <Progress value={uploadProgress} className="w-full" />
    </div>
  );
};

export default BulkUploadProgress;
