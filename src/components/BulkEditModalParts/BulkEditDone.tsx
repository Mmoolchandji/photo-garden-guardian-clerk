
import { Button } from '@/components/ui/button';

type Props = {
  anyEdited: boolean;
  onDone: () => void;
};

export default function BulkEditDone({ anyEdited, onDone }: Props) {
  return (
    <div className="px-6 pb-3">
      <Button className="w-full mt-2" onClick={onDone}>
        Done
      </Button>
    </div>
  );
}
