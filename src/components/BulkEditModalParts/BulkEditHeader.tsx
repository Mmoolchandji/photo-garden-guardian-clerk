
import { Button } from '@/components/ui/button';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { X } from 'lucide-react';

type Props = {
  progressStr: string;
  saving: boolean;
  onClose: () => void;
};

export default function BulkEditHeader({ progressStr, saving, onClose }: Props) {
  return (
    <DialogHeader>
      <DialogTitle>Bulk Edit Photos</DialogTitle>
      <div className="mb-2 mt-1 flex items-center justify-between">
        <span className="text-xs text-gray-500">{progressStr}</span>
        <Button
          variant="ghost"
          className="ml-auto text-gray-500"
          onClick={onClose}
          disabled={saving}
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </DialogHeader>
  );
}
