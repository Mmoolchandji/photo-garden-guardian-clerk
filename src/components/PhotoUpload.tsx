import { useState, useRef } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import BulkUploadModal from './BulkUploadModal';
import FileSelectionCard from './FileSelectionCard';
import PhotoPreviewCard from './PhotoPreviewCard';
import PhotoMetadataForm from './PhotoMetadataForm';

interface PhotoUploadProps {
  onPhotoUploaded: () => void;
  onCancel: () => void;
}

type UploadStep = 'file-selection' | 'metadata';

const PhotoUpload = ({ onPhotoUploaded, onCancel }: PhotoUploadProps) => {
  const { user } = useAuth();
  const [step, setStep] = useState<UploadStep>('file-selection');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fabric, setFabric] = useState('New Fabric');
  const [price, setPrice] = useState('');
  const [stockStatus, setStockStatus] = useState('Available');
  const [file, setFile] = useState<File | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [showBulkModal, setShowBulkModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Ensure user is authenticated
  if (!user) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6 text-center">
          <p className="text-gray-600">Please sign in to upload photos.</p>
        </CardContent>
      </Card>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      
      // Check file limit
      if (selectedFiles.length > 20) {
        toast({
          title: "Too many files selected",
          description: "Please select a maximum of 20 files at once.",
          variant: "destructive",
        });
        return;
      }

      // If multiple files selected, switch to bulk upload mode
      if (selectedFiles.length > 1) {
        setFiles(selectedFiles);
        setShowBulkModal(true);
      } else {
        // Single file - keep existing behavior
        const selectedFile = selectedFiles[0];
        setFile(selectedFile);
        
        // Create preview URL
        const previewUrl = URL.createObjectURL(selectedFile);
        setImagePreview(previewUrl);
      }
    }
  };

  const generateTitleFromFilename = (filename: string) => {
    return filename
      .split('.')[0] // Remove extension
      .replace(/[-_]/g, ' ') // Replace hyphens and underscores with spaces
      .replace(/\b\w/g, l => l.toUpperCase()); // Capitalize first letter of each word
  };

  const handleUpload = async (skipMetadata = false) => {
    if (!file || !user) {
      toast({
        title: "Upload failed",
        description: "No file selected or user not authenticated.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      console.log('PhotoUpload: Starting single upload for user:', user.id);
      
      // Verify user session is still valid
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session || !session.user) {
        console.error('PhotoUpload: Session invalid during upload:', sessionError);
        throw new Error('Session expired. Please sign in again.');
      }

      // Upload file to user-specific folder in Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`; // User-specific path for RLS compliance

      console.log('PhotoUpload: Uploading to storage path:', filePath);

      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(filePath, file);

      if (uploadError) {
        console.error('PhotoUpload: Storage upload error:', uploadError);
        throw uploadError;
      }

      // Get public URL
      const { data } = supabase.storage
        .from('photos')
        .getPublicUrl(filePath);

      // Use provided title or generate from filename
      const finalTitle = title.trim() || generateTitleFromFilename(file.name);

      // Save photo data to database with explicit user_id for RLS compliance
      const photoData = {
        title: finalTitle,
        description: description.trim() || null,
        image_url: data.publicUrl,
        fabric: fabric,
        price: price ? parseFloat(price) : null,
        stock_status: stockStatus,
        user_id: user.id, // Explicitly set user_id for RLS
      };

      console.log('PhotoUpload: Inserting photo data:', { ...photoData, image_url: '[URL]' });

      const { error: dbError } = await supabase
        .from('photos')
        .insert(photoData);

      if (dbError) {
        console.error('PhotoUpload: Database insert error:', dbError);
        throw dbError;
      }

      console.log('PhotoUpload: Successfully uploaded photo');

      toast({
        title: "Photo uploaded successfully!",
        description: "Your photo has been added to your gallery.",
      });

      // Reset form
      setTitle('');
      setDescription('');
      setFabric('New Fabric');
      setPrice('');
      setStockStatus('Available');
      setFile(null);
      setImagePreview('');
      setStep('file-selection');
      onPhotoUploaded();
    } catch (error: any) {
      console.error('PhotoUpload: Upload error:', error);
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
    setFiles([]);
    setImagePreview('');
    setTitle('');
    setDescription('');
    setFabric('New Fabric');
    setPrice('');
    setStockStatus('Available');
    setStep('file-selection');
    setShowBulkModal(false);
    onCancel();
  };

  const handleBulkUploadComplete = () => {
    setShowBulkModal(false);
    setFiles([]);
    onPhotoUploaded();
  };

  const handleChooseDifferentFiles = () => {
    setShowBulkModal(false);
    setFiles([]);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Show bulk upload modal if multiple files are selected
  if (showBulkModal) {
    return (
      <BulkUploadModal
        files={files}
        onUploadComplete={handleBulkUploadComplete}
        onCancel={handleCancel}
        onChooseDifferentFiles={handleChooseDifferentFiles}
      />
    );
  }

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
            <FileSelectionCard onFileChange={handleFileChange} />
          ) : (
            <PhotoPreviewCard
              file={file}
              imagePreview={imagePreview}
              uploading={uploading}
              onContinueToMetadata={handleContinueToMetadata}
              onUploadNow={() => handleUpload(true)}
              onChooseDifferentFile={() => {
                setFile(null);
                setImagePreview('');
              }}
            />
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
        <PhotoMetadataForm
          file={file!}
          imagePreview={imagePreview}
          title={title}
          description={description}
          fabric={fabric}
          price={price}
          stockStatus={stockStatus}
          uploading={uploading}
          onTitleChange={setTitle}
          onDescriptionChange={setDescription}
          onFabricChange={setFabric}
          onPriceChange={setPrice}
          onStockStatusChange={setStockStatus}
          onUpload={handleUpload}
          onBack={handleBackToFileSelection}
          generateTitleFromFilename={generateTitleFromFilename}
        />
      </CardContent>
    </Card>
  );
};

export default PhotoUpload;
