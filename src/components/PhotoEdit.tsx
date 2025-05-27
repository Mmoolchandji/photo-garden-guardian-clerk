
import { useState, useEffect } from 'react';
import { Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Photo {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  created_at: string;
}

interface PhotoEditProps {
  photo: Photo;
  onPhotoUpdated: () => void;
  onCancel: () => void;
}

const PhotoEdit = ({ photo, onPhotoUpdated, onCancel }: PhotoEditProps) => {
  const [title, setTitle] = useState(photo.title);
  const [description, setDescription] = useState(photo.description || '');
  const [updating, setUpdating] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide a title for the photo.",
        variant: "destructive",
      });
      return;
    }

    setUpdating(true);

    try {
      const { error } = await supabase
        .from('photos')
        .update({
          title: title.trim(),
          description: description.trim() || null,
        })
        .eq('id', photo.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Photo updated successfully!",
        description: "Your changes have been saved.",
      });

      onPhotoUpdated();
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
    <Card className="w-full max-w-md mx-auto">
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
            className="w-full h-32 object-cover rounded-lg"
          />
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter photo title"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter photo description (optional)"
              rows={3}
            />
          </div>

          <div className="flex space-x-3">
            <Button 
              type="submit" 
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              disabled={updating}
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
