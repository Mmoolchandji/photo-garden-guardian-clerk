import { useState, useEffect } from 'react';
import { Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import FabricSelector from './FabricSelector';
import StockStatusSelector from './StockStatusSelector';
import type { Photo } from '@/types/photo';

interface PhotoEditProps {
  photo: Photo;
  onPhotoUpdated: () => void;
  onCancel: () => void;
  onDataRefresh?: () => void;
}

// Map field name to display label for easy code reuse
const FIELD_LABELS = {
  fabric: "Fabric Type",
  price: "Price (₹, optional)",
  stock_status: "Stock Status"
};

const getInitial = <T,>(val: T | undefined, fallback: T): T =>
  typeof val === 'undefined' || val === null ? fallback : val;

const PhotoEdit = ({ photo, onPhotoUpdated, onCancel, onDataRefresh }: PhotoEditProps) => {
  const [title, setTitle] = useState(photo.title);
  const [description, setDescription] = useState(photo.description || '');
  const [fabric, setFabric] = useState(getInitial(photo.fabric, 'New Fabric'));
  const [price, setPrice] = useState(
    photo.price !== undefined && photo.price !== null
      ? String(photo.price)
      : ''
  );
  const [stockStatus, setStockStatus] = useState(getInitial(photo.stock_status, 'Available'));
  const [updating, setUpdating] = useState(false);
  const { toast } = useToast();
  const [priceError, setPriceError] = useState<string | null>(null);

  // Legacy photo: block editing if legacy and not to be edited
  const isReadOnly = !!photo.legacy;

  // Handle price changes - must allow empty (optional) or valid number >= 0
  const handlePriceChange = (v: string) => {
    // allow only digits, dot (.), no minus, up to 2 decimals
    if (v === '' || /^\d*\.?\d{0,2}$/.test(v)) {
      setPrice(v);
      setPriceError(null);
    }
  };

  const validateForm = (): boolean => {
    if (!title.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide a title for the photo.",
        variant: "destructive",
      });
      return false;
    }
    if (price && isNaN(Number(price))) {
      setPriceError("Price must be a valid number.");
      return false;
    }
    setPriceError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setUpdating(true);

    try {
      // Only pass the fields (all optional if blank)
      const valuesToUpdate: Partial<Photo> = {
        title: title.trim(),
        description: description.trim() || null,
        fabric: fabric || null,
        price: price ? Number(price) : null,
        stock_status: stockStatus || null,
      };
      // Remove keys with undefined/null for correct patch update except nullables
      Object.keys(valuesToUpdate).forEach(key => {
        // Allow null intentionally
        if (
          typeof (valuesToUpdate as any)[key] === 'undefined'
        ) {
          delete (valuesToUpdate as any)[key];
        }
      });

      const { error } = await supabase
        .from('photos')
        .update(valuesToUpdate)
        .eq('id', photo.id);

      if (error) throw error;

      toast({
        title: "Photo details updated successfully.",
        description: "All changes have been saved.",
      });

      onPhotoUpdated();
      if (onDataRefresh) onDataRefresh();
    } catch (error: any) {
      console.error('Update error:', error);
      toast({
        title: "Update failed",
        description: error.message || "Failed to update photo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Edit Photo</CardTitle>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <img
            src={photo.image_url}
            alt={photo.title}
            className="w-full h-40 object-cover rounded-lg"
          />
        </div>
        {isReadOnly ? (
          <div className="mb-4 text-yellow-800 bg-yellow-100 border border-yellow-400 rounded p-3">
            <b>This photo is marked as legacy and cannot be edited.</b>
          </div>
        ) : null}

        <form
          onSubmit={handleSubmit}
          className="space-y-4 max-h-[65vh] overflow-y-auto"
        >
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Enter photo title"
              required
              disabled={isReadOnly || updating}
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Enter photo description (optional)"
              rows={3}
              disabled={isReadOnly || updating}
            />
          </div>

          {/* Fabric Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {FIELD_LABELS.fabric}
            </label>
            <FabricSelector
              value={fabric || ''}
              onChange={(val) => setFabric(val)}
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
              value={price}
              min={0}
              maxLength={10}
              onChange={e => handlePriceChange(e.target.value)}
              disabled={isReadOnly || updating}
              className={priceError ? "border-red-500" : ""}
            />
            {priceError && (
              <p className="text-xs text-red-600 mt-1">{priceError}</p>
            )}
          </div>

          {/* Stock Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {FIELD_LABELS.stock_status}
            </label>
            <StockStatusSelector
              value={stockStatus || 'Available'}
              onChange={setStockStatus}
            />
          </div>

          {/* Save/Cancel */}
          <div className="flex space-x-3 pt-2">
            <Button
              type="submit"
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              disabled={updating || isReadOnly}
            >
              {updating ? (
                'Saving...'
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={updating}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PhotoEdit;
