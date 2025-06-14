import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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

export const useBulkUploadLogic = (files: File[]) => {
  const { user } = useAuth();
  const [step, setStep] = useState<BulkUploadStep>('preview');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [filesWithMetadata, setFilesWithMetadata] = useState<FileWithMetadata[]>([]);
  const [sessionCustomFabrics, setSessionCustomFabrics] = useState<string[]>([]);
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
      fabric: '',
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

  const addCustomFabric = (fabricName: string) => {
    const trimmedFabric = fabricName.trim();
    if (trimmedFabric && !sessionCustomFabrics.includes(trimmedFabric)) {
      setSessionCustomFabrics(prev => [...prev, trimmedFabric]);
    }
  };

  const handleUploadAll = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to upload photos.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    
    const results = { success: 0, failed: [] as string[] };
    const totalFiles = filesWithMetadata.length;

    console.log('BulkUpload: Starting bulk upload for user:', user.id, 'Total files:', totalFiles);

    try {
      // Process uploads sequentially to avoid overwhelming the server and RLS issues
      for (let i = 0; i < filesWithMetadata.length; i++) {
        const fileData = filesWithMetadata[i];
        
        try {
          console.log(`BulkUpload: Processing file ${i + 1}/${totalFiles}:`, fileData.file.name);
          
          // Verify user session is still valid before each upload
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          if (sessionError || !session || !session.user) {
            console.error('BulkUpload: Session invalid during upload:', sessionError);
            throw new Error('Session expired. Please sign in again.');
          }

          // Upload file to Supabase Storage with user-specific path
          const fileExt = fileData.file.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
          const filePath = `${user.id}/${fileName}`; // User-specific path for RLS compliance

          console.log(`BulkUpload: Uploading to storage path:`, filePath);
          
          const { error: uploadError } = await supabase.storage
            .from('photos')
            .upload(filePath, fileData.file);

          if (uploadError) {
            console.error(`BulkUpload: Storage upload error for ${fileData.file.name}:`, uploadError);
            throw uploadError;
          }

          // Get public URL
          const { data } = supabase.storage
            .from('photos')
            .getPublicUrl(filePath);

          console.log(`BulkUpload: Got public URL:`, data.publicUrl);

          // Save photo data to database with explicit user_id for RLS compliance
          const photoData = {
            title: fileData.title.trim() || fileData.title,
            description: fileData.description.trim() || null,
            image_url: data.publicUrl,
            fabric: fileData.fabric || 'New Fabric',
            price: fileData.price ? parseFloat(fileData.price) : null,
            stock_status: fileData.stockStatus,
            user_id: user.id, // Explicitly set user_id for RLS
          };

          console.log(`BulkUpload: Inserting photo data:`, { ...photoData, image_url: '[URL]' });

          const { error: dbError } = await supabase
            .from('photos')
            .insert(photoData);

          if (dbError) {
            console.error(`BulkUpload: Database insert error for ${fileData.file.name}:`, dbError);
            throw dbError;
          }

          console.log(`BulkUpload: Successfully uploaded ${fileData.file.name}`);
          results.success++;
          
          // Small delay between uploads to prevent overwhelming the server
          if (i < filesWithMetadata.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        } catch (error: any) {
          console.error(`BulkUpload: Upload error for ${fileData.file.name}:`, error);
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
    } catch (error: any) {
      console.error('BulkUpload: Bulk upload error:', error);
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

  return {
    step,
    setStep,
    currentIndex,
    filesWithMetadata,
    sessionCustomFabrics,
    uploading,
    uploadProgress,
    uploadResults,
    handleUploadAll,
    handleMetadataChange,
    addCustomFabric,
    nextPhoto,
    prevPhoto,
  };
};
