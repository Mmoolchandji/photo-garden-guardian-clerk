
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Zap, FileArchive } from 'lucide-react';

interface CompressionToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

const CompressionToggle = ({ enabled, onToggle }: CompressionToggleProps) => {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-emerald-100 rounded-lg">
          {enabled ? (
            <Zap className="h-4 w-4 text-emerald-600" />
          ) : (
            <FileArchive className="h-4 w-4 text-gray-500" />
          )}
        </div>
        <div>
          <Label htmlFor="compression-toggle" className="text-sm font-medium">
            Smart Compression
          </Label>
          <p className="text-xs text-gray-500">
            {enabled 
              ? "Automatically compress images to save space and improve performance" 
              : "Upload original file without compression"
            }
          </p>
        </div>
      </div>
      <Switch
        id="compression-toggle"
        checked={enabled}
        onCheckedChange={onToggle}
      />
    </div>
  );
};

export default CompressionToggle;
