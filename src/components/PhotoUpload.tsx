import { useState, useRef } from 'react';
import { Upload, X, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PhotoUploadProps {
  onPhotoUploaded: () => void;
  onCancel: () => void;
}

type UploadStep = 'file-selection' | 'metadata';

const PhotoUpload = ({ onPhotoUploaded, onCancel }: PhotoUploadProps) => {
  const [step, setStep] = useState<UploadStep>('file-selection');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(selectedFile);
      setImagePreview(previewUrl);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const generateTitleFromFilename = (filename: string) => {
    return filename
      .split('.')[0] // Remove extension
      .replace(/[-_]/g, ' ') // Replace hyphens and underscores with spaces
      .replace(/\b\w/g, l => l.toUpperCase()); // Capitalize first letter of each word
  };

  const handleUpload = async (skipMetadata = false) => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `photos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data } = supabase.storage
        .from('photos')
        .getPublicUrl(filePath);

      // Use provided title or generate from filename
      const finalTitle = title.trim() || generateTitleFromFilename(file.name);

      // Save photo data to database
      const { error: dbError } = await supabase
        .from('photos')
        .insert({
          title: finalTitle,
          description: description.trim() || null,
          image_url: data.publicUrl,
        });

      if (dbError) {
        throw dbError;
      }

      toast({
        title: "Photo uploaded successfully!",
        description: "Your photo has been added to the gallery.",
      });

      // Reset form
      setTitle('');
      setDescription('');
      setFile(null);
      setImagePreview('');
      setStep('file-selection');
      onPhotoUploaded();
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload photo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleContinueToMetadata = () => {
    if (!file) return;
    setStep('metadata');
  };

  const handleBackToFileSelection = () => {
    setStep('file-selection');
  };

  const handleCancel = () => {
    // Clean up preview URL
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setFile(null);
    setImagePreview('');
    setTitle('');
    setDescription('');
    setStep('file-selection');
    onCancel();
  };

  if (step === 'file-selection') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Add New Photo</CardTitle>
            <Button variant="ghost" size="sm" onClick={handleCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {!file ? (
            <div className="text-center">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-emerald-400 transition-colors">
                <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a photo</h3>
                <p className="text-gray-500 mb-4">Choose an image file to upload to your gallery</p>
                <Button 
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={handleBrowseClick}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Browse Files
                </Button>
                <Input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg mb-3"
                />
                <p className="text-sm text-gray-600 font-medium">{file.name}</p>
                <p className="text-xs text-gray-400">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              
              <div className="flex space-x-3">
                <Button 
                  onClick={handleContinueToMetadata}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                >
                  Add Details
                </Button>
                <Button 
                  onClick={() => handleUpload(true)}
                  variant="outline"
                  className="flex-1"
                  disabled={uploading}
                >
                  {uploading ? 'Uploading...' : 'Upload Now'}
                </Button>
              </div>
              
              <Button 
                onClick={() => {
                  setFile(null);
                  setImagePreview('');
                }}
                variant="ghost"
                className="w-full"
              >
                Choose Different File
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Add Photo Details</CardTitle>
          <Button variant="ghost" size="sm" onClick={handleCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <img
            src={imagePreview}
            alt="Preview"
            className="w-full h-32 object-cover rounded-lg"
          />
          <p className="text-sm text-gray-600 mt-2">{file?.name}</p>
        </div>
        
        <form onSubmit={(e) => { e.preventDefault(); handleUpload(); }} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title (optional)
            </label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={`e.g., "${generateTitleFromFilename(file?.name || '')}"`}
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave empty to auto-generate from filename
            </p>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description (optional)
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description for your photo..."
              rows={3}
            />
          </div>

          <div className="flex space-x-3">
            <Button 
              type="submit" 
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              disabled={uploading}
            >
              {uploading ? (
                'Uploading...'
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Photo
                </>
              )}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleBackToFileSelection}
              disabled={uploading}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PhotoUpload;
