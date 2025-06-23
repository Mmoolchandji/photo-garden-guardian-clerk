
import { Button } from '@/components/ui/button';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { X } from 'lucide-react';

type Props = {
  progressStr: string;
  saving: boolean;
  onClose: () => void;
};

export default function BulkEditHeader({ progressStr }: Props) {
  return (
    <DialogHeader className="flex-row items-center justify-between border-b p-4">
      <div>
        <DialogTitle className="text-lg font-semibold">Bulk Edit Photos</DialogTitle>
        <span className="text-sm text-gray-500">{progressStr}</span>
      </div>
    </DialogHeader>
  );
}
