
import { useState, useEffect } from 'react';
import { Upload, X, ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
      description: ''
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

          // Save photo data to database
          const { error: dbError } = await supabase
            .from('photos')
            .insert({
              title: fileData.title.trim() || fileData.title,
              description: fileData.description.trim() || null,
              image_url: data.publicUrl,
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

  const handleMetadataChange = (field: 'title' | 'description', value: string) => {
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

  if (step === 'preview') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Bulk Photo Upload ({files.length} photos)</CardTitle>
              <Button variant="ghost" size="sm" onClick={handleCancel}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Carousel Preview */}
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={prevPhoto}
                  disabled={filesWithMetadata.length <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-gray-600">
                  {currentIndex + 1} of {filesWithMetadata.length}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={nextPhoto}
                  disabled={filesWithMetadata.length <= 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              
              {filesWithMetadata[currentIndex] && (
                <div className="text-center">
                  <img
                    src={filesWithMetadata[currentIndex].preview}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-lg mb-3"
                  />
                  <p className="text-sm text-gray-600 font-medium">
                    {filesWithMetadata[currentIndex].file.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {(filesWithMetadata[currentIndex].file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              )}
            </div>

            {/* Upload Progress */}
            {uploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading photos...</span>
                  <span>{Math.round(uploadProgress)}%</span>
                </div>
                <Progress value={uploadProgress} className="w-full" />
              </div>
            )}

            {/* Upload Results */}
            {uploadResults && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm">
                  <span className="font-medium text-green-600">
                    {uploadResults.success} successful
                  </span>
                  {uploadResults.failed.length > 0 && (
                    <span className="text-red-600 ml-2">
                      • {uploadResults.failed.length} failed
                    </span>
                  )}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <Button 
                onClick={() => setStep('metadata')}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                disabled={uploading}
              >
                Add Details
              </Button>
              <Button 
                onClick={handleUploadAll}
                variant="outline"
                className="flex-1"
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : 'Upload Now'}
              </Button>
            </div>
            
            <Button 
              onClick={onChooseDifferentFiles}
              variant="ghost"
              className="w-full"
              disabled={uploading}
            >
              Choose Different Files
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Metadata editing step
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Edit Photo Details ({currentIndex + 1} of {filesWithMetadata.length})</CardTitle>
            <Button variant="ghost" size="sm" onClick={handleCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {filesWithMetadata[currentIndex] && (
            <div className="space-y-4">
              {/* Photo Preview */}
              <div className="mb-4">
                <img
                  src={filesWithMetadata[currentIndex].preview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <p className="text-sm text-gray-600 mt-2">
                  {filesWithMetadata[currentIndex].file.name}
                </p>
              </div>

              {/* Metadata Form */}
              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Title (optional)
                  </label>
                  <Input
                    id="title"
                    type="text"
                    value={filesWithMetadata[currentIndex].title}
                    onChange={(e) => handleMetadataChange('title', e.target.value)}
                    placeholder="Enter photo title..."
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description (optional)
                  </label>
                  <Textarea
                    id="description"
                    value={filesWithMetadata[currentIndex].description}
                    onChange={(e) => handleMetadataChange('description', e.target.value)}
                    placeholder="Add a description for your photo..."
                    rows={3}
                  />
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  onClick={prevPhoto}
                  disabled={currentIndex === 0}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                
                <span className="text-sm text-gray-600">
                  {currentIndex + 1} of {filesWithMetadata.length}
                </span>
                
                <Button
                  variant="outline"
                  onClick={nextPhoto}
                  disabled={currentIndex === filesWithMetadata.length - 1}
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <Button 
                  onClick={handleUploadAll}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                  disabled={uploading}
                >
                  {uploading ? (
                    'Uploading...'
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload All Photos
                    </>
                  )}
                </Button>
                <Button 
                  onClick={() => setStep('preview')}
                  variant="outline"
                  disabled={uploading}
                >
                  Back to Preview
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BulkUploadModal;
