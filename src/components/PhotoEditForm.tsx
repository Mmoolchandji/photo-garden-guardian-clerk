
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import FabricSelector from './FabricSelector';
import StockStatusSelector from './StockStatusSelector';

// Only presentational, no database
interface PhotoEditFormProps {
  values: {
    title: string;
    description: string | null;
    fabric: string;
    price: string;
    stock_status: string;
  };
  onChange: (field: keyof PhotoEditFormProps['values'], value: string) => void;
  disabled?: boolean;
  showErrors?: boolean;
}

const FIELD_LABELS = {
  fabric: "Fabric Type",
  price: "Price (₹, optional)",
  stock_status: "Stock Status"
};

const PhotoEditForm = ({
  values,
  onChange,
  disabled,
  showErrors
}: PhotoEditFormProps) => (
  <form className="space-y-4">
    {/* Title */}
    <div>
      <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
        Title *
      </label>
      <Input
        id="title"
        type="text"
        value={values.title}
        onChange={e => onChange('title', e.target.value)}
        placeholder="Enter photo title"
        required
        disabled={disabled}
      />
      {showErrors && !values.title.trim() && (
        <div className="text-xs text-red-600 mt-1">Title is required</div>
      )}
    </div>

    {/* Description */}
    <div>
      <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
        Description
      </label>
      <Textarea
        id="description"
        value={values.description ?? ''}
        onChange={e => onChange('description', e.target.value)}
        placeholder="Enter photo description (optional)"
        rows={3}
        disabled={disabled}
      />
    </div>

    {/* Fabric Type */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {FIELD_LABELS.fabric}
      </label>
      <FabricSelector
        value={values.fabric || ''}
        onChange={val => onChange('fabric', val)}
      />
    </div>

    {/* Price */}
    <div>
      <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
        {FIELD_LABELS.price}
      </label>
      <Input
        id="price"
        type="text"
        pattern="\d*\.?\d*"
        inputMode="decimal"
        placeholder="e.g. 1500"
        value={values.price}
        min={0}
        maxLength={10}
        onChange={e => onChange('price', e.target.value)}
        disabled={disabled}
      />
      {showErrors && values.price && isNaN(Number(values.price)) && (
        <div className="text-xs text-red-600 mt-1">Price must be a valid number</div>
      )}
    </div>

    {/* Stock Status */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {FIELD_LABELS.stock_status}
      </label>
      <StockStatusSelector
        value={values.stock_status || 'Available'}
        onChange={val => onChange('stock_status', val)}
      />
    </div>
  </form>
);

export default PhotoEditForm;
