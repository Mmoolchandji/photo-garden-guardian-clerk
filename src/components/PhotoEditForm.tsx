import { useState, useEffect, useRef } from 'react';
import { Save, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import FabricSelector from './FabricSelector';
import StockStatusSelector from './StockStatusSelector';
import { Photo } from '@/types/photo';

interface PhotoEditFormProps {
  photo: Photo;
  disabled?: boolean;
  onSubmit: (fields: Partial<Photo>) => Promise<boolean | void>;
  onDirtyChange?: (dirty: boolean) => void;
  initialFocus?: boolean;
}

const getInitial = <T,>(val: T | undefined, fallback: T): T =>
  typeof val === 'undefined' || val === null ? fallback : val;

// Minimal, stateless fields for comparison
function getPhotoFields(photo: Partial<Photo>) {
  return {
    title: photo.title || "",
    description: photo.description || "",
    fabric: photo.fabric || "New Fabric",
    price: (photo.price !== undefined && photo.price !== null) ? String(photo.price) : "",
    stock_status: photo.stock_status || "Available",
  };
}

export default function PhotoEditForm({
  photo,
  disabled,
  onSubmit,
  onDirtyChange,
  initialFocus,
}: PhotoEditFormProps) {
  const [fields, setFields] = useState(getPhotoFields(photo));
  const [saving, setSaving] = useState(false);
  const [priceError, setPriceError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);

  const initialFieldsRef = useRef(fields);

  // Reset form state when incoming photo changes
  useEffect(() => {
    const newFields = getPhotoFields(photo);
    setFields(newFields);
    initialFieldsRef.current = newFields;
    setDirty(false);
    onDirtyChange?.(false);
  // We want this to run only when the photo changes (not when fields change)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photo.id]);

  // Detect dirtiness
  useEffect(() => {
    const isDirty =
      JSON.stringify(fields) !== JSON.stringify(initialFieldsRef.current);
    setDirty(isDirty);
    onDirtyChange?.(isDirty);
  // eslint-disable-next-line
  }, [fields]);

  // Focus first input if needed
  const titleInput = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (initialFocus && titleInput.current) {
      titleInput.current.focus();
    }
  }, [initialFocus]);

  // Handlers
  function handleChange(field: keyof typeof fields, value: string) {
    setFields(prev => ({ ...prev, [field]: value }));
    if (field === 'price') setPriceError(null);
  }

  // Allow only digits, dot, up to 2 decimals
  function handlePriceChange(v: string) {
    if (v === '' || /^\d*\.?\d{0,2}$/.test(v)) {
      handleChange('price', v);
      setPriceError(null);
    }
  }

  function validate(): boolean {
    if (!fields.title.trim()) {
      setPriceError(null);
      return false;
    }
    if (fields.price && isNaN(Number(fields.price))) {
      setPriceError('Price must be a valid number.');
      return false;
    }
    setPriceError(null);
    return true;
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || disabled) return;
    setSaving(true);
    await onSubmit({
      title: fields.title.trim(),
      description: fields.description.trim() || null,
      fabric: fields.fabric,
      price: fields.price ? Number(fields.price) : null,
      stock_status: fields.stock_status,
    });
    setSaving(false);
    initialFieldsRef.current = fields; // Reset dirty
    setDirty(false);
    onDirtyChange?.(false);
  };

  return (
    <form
      onSubmit={handleFormSubmit}
      className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4"
      autoComplete="off"
    >
      {/* Title */}
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title *
        </label>
        <Input
          ref={titleInput}
          type="text"
          value={fields.title}
          onChange={e => handleChange('title', e.target.value)}
          required
          disabled={disabled || saving}
        />
        {!fields.title.trim() && (
          <p className="text-xs text-red-600 mt-1">Title is required.</p>
        )}
      </div>

      {/* Fabric Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Fabric Type
        </label>
        <FabricSelector
          value={fields.fabric}
          onChange={(val) => handleChange('fabric', val)}
        />
      </div>

      {/* Price */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Price (₹, optional)
        </label>
        <Input
          type="text"
          pattern="\d*\.?\d*"
          inputMode="decimal"
          placeholder="e.g. 1500"
          value={fields.price}
          min={0}
          maxLength={10}
          onChange={e => handlePriceChange(e.target.value)}
          disabled={disabled || saving}
          className={priceError ? "border-red-500" : ""}
        />
        {priceError && (
          <p className="text-xs text-red-600 mt-1">{priceError}</p>
        )}
      </div>

      {/* Stock Status */}
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Stock Status
        </label>
        <StockStatusSelector
          value={fields.stock_status}
          onChange={(v) => handleChange('stock_status', v)}
        />
      </div>

      {/* Save Button - controlled by parent */}
      {/* External navigation buttons will use form, so no buttons here */}
    </form>
  );
}
