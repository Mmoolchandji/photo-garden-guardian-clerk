import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import BulkPreviewStep from './BulkPreviewStep';
import BulkMetadataStep from './BulkMetadataStep';

interface BulkUploadModalProps {
  files: File[];
  onUploadComplete: () => void;
  onCancel: () => void;
  onChooseDifferentFiles: () => void;
}

interface FileWithMetadata {
  file: File;
  preview: string;
  title: string;
  description: string;
  fabric: string;
  price: string;
  stockStatus: string;
}

type BulkUploadStep = 'preview' | 'metadata';

const BulkUploadModal = ({ files, onUploadComplete, onCancel, onChooseDifferentFiles }: BulkUploadModalProps) => {
  const [step, setStep] = useState<BulkUploadStep>('preview');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [filesWithMetadata, setFilesWithMetadata] = useState<FileWithMetadata[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResults, setUploadResults] = useState<{ success: number; failed: string[] } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize files with metadata and previews
    const initialFiles = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      title: generateTitleFromFilename(file.name),
      description: '',
      fabric: 'New Fabric',
      price: '',
      stockStatus: 'Available'
    }));
    setFilesWithMetadata(initialFiles);

    // Cleanup function
    return () => {
      initialFiles.forEach(fileData => URL.revokeObjectURL(fileData.preview));
    };
  }, [files]);

  const generateTitleFromFilename = (filename: string) => {
    return filename
      .split('.')[0]
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  const handleUploadAll = async () => {
    setUploading(true);
    setUploadProgress(0);
    
    const results = { success: 0, failed: [] as string[] };
    const totalFiles = filesWithMetadata.length;

    try {
      for (let i = 0; i < filesWithMetadata.length; i++) {
        const fileData = filesWithMetadata[i];
        
        try {
          // Upload file to Supabase Storage
          const fileExt = fileData.file.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
          const filePath = `photos/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('photos')
            .upload(filePath, fileData.file);

          if (uploadError) {
            throw uploadError;
          }

          // Get public URL
          const { data } = supabase.storage
            .from('photos')
            .getPublicUrl(filePath);

          // Save photo data to database with new metadata fields
          const { error: dbError } = await supabase
            .from('photos')
            .insert({
              title: fileData.title.trim() || fileData.title,
              description: fileData.description.trim() || null,
              image_url: data.publicUrl,
              fabric: fileData.fabric,
              price: fileData.price ? parseFloat(fileData.price) : null,
              stock_status: fileData.stockStatus,
            });

          if (dbError) {
            throw dbError;
          }

          results.success++;
        } catch (error: any) {
          console.error(`Upload error for ${fileData.file.name}:`, error);
          results.failed.push(fileData.file.name);
        }

        // Update progress
        setUploadProgress(((i + 1) / totalFiles) * 100);
      }

      setUploadResults(results);

      if (results.success > 0) {
        toast({
          title: `${results.success} photo${results.success > 1 ? 's' : ''} uploaded successfully!`,
          description: results.failed.length > 0 
            ? `${results.failed.length} file${results.failed.length > 1 ? 's' : ''} failed to upload.`
            : "All photos have been added to the gallery.",
        });
      }

      if (results.failed.length > 0) {
        toast({
          title: "Some uploads failed",
          description: `Failed files: ${results.failed.join(', ')}`,
          variant: "destructive",
        });
      }

      if (results.success > 0) {
        setTimeout(() => {
          onUploadComplete();
        }, 2000);
      }
    } catch (error: any) {
      console.error('Bulk upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload photos. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleMetadataChange = (field: 'title' | 'description' | 'fabric' | 'price' | 'stockStatus', value: string) => {
    setFilesWithMetadata(prev => 
      prev.map((item, index) => 
        index === currentIndex ? { ...item, [field]: value } : item
      )
    );
  };

  const nextPhoto = () => {
    setCurrentIndex(prev => (prev + 1) % filesWithMetadata.length);
  };

  const prevPhoto = () => {
    setCurrentIndex(prev => (prev - 1 + filesWithMetadata.length) % filesWithMetadata.length);
  };

  const handleCancel = () => {
    filesWithMetadata.forEach(fileData => URL.revokeObjectURL(fileData.preview));
    onCancel();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl mx-auto max-h-[90vh] flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle>
              {step === 'preview' 
                ? `Bulk Photo Upload (${files.length} photos)` 
                : `Edit Photo Details (${currentIndex + 1} of ${filesWithMetadata.length})`
              }
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={handleCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-6">
          {step === 'preview' ? (
            <BulkPreviewStep
              filesWithMetadata={filesWithMetadata}
              currentIndex={currentIndex}
              uploading={uploading}
              uploadProgress={uploadProgress}
              uploadResults={uploadResults}
              onNextPhoto={nextPhoto}
              onPrevPhoto={prevPhoto}
              onSetStep={setStep}
              onUploadAll={handleUploadAll}
              onChooseDifferentFiles={onChooseDifferentFiles}
            />
          ) : (
            <BulkMetadataStep
              filesWithMetadata={filesWithMetadata}
              currentIndex={currentIndex}
              uploading={uploading}
              uploadProgress={uploadProgress}
              uploadResults={uploadResults}
              onMetadataChange={handleMetadataChange}
              onNextPhoto={nextPhoto}
              onPrevPhoto={prevPhoto}
              onUploadAll={handleUploadAll}
              onSetStep={setStep}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BulkUploadModal;
