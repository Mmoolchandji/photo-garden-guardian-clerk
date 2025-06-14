
import { useState, useRef } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useImageOptimization } from './useImageOptimization';
import { ImageVariant } from '@/utils/imageOptimization';

type UploadStep = 'file-selection' | 'optimizing' | 'metadata';

export const useOptimizedPhotoUpload = (onPhotoUploaded: () => void, onCancel: () => void) => {
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
  const [optimizedVariants, setOptimizedVariants] = useState<ImageVariant[]>([]);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { isOptimizing, progress, optimizeSingleImage } = useImageOptimization();

  const generateTitleFromFilename = (filename: string) => {
    return filename
      .split('.')[0]
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      
      if (selectedFiles.length > 20) {
        toast({
          title: "Too many files selected",
          description: "Please select a maximum of 20 files at once.",
          variant: "destructive",
        });
        return;
      }

      if (selectedFiles.length > 1) {
        setFiles(selectedFiles);
        setShowBulkModal(true);
      } else {
        const selectedFile = selectedFiles[0];
        setFile(selectedFile);
        setStep('optimizing');
        
        try {
          console.log('Starting image optimization for:', selectedFile.name);
          const variants = await optimizeSingleImage(selectedFile);
          setOptimizedVariants(variants);
          
          // Use medium quality for preview
          const mediumVariant = variants.find(v => v.type === 'medium');
          if (mediumVariant) {
            setImagePreview(mediumVariant.url);
          } else {
            setImagePreview(URL.createObjectURL(selectedFile));
          }
          
          setStep('metadata');
        } catch (error) {
          console.error('Image optimization failed:', error);
          toast({
            title: "Optimization failed",
            description: "Failed to optimize image. Using original file.",
            variant: "destructive",
          });
          
          // Fallback to original file
          setImagePreview(URL.createObjectURL(selectedFile));
          setStep('metadata');
        }
      }
    }
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
      console.log('PhotoUpload: Starting optimized upload for user:', user.id);
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session || !session.user) {
        console.error('PhotoUpload: Session invalid during upload:', sessionError);
        throw new Error('Session expired. Please sign in again.');
      }

      // Use optimized medium variant for main image, or fallback to original
      const uploadFile = optimizedVariants.find(v => v.type === 'medium')?.file || file;
      const fileExt = uploadFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      console.log('PhotoUpload: Uploading optimized image to storage path:', filePath);

      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(filePath, uploadFile);

      if (uploadError) {
        console.error('PhotoUpload: Storage upload error:', uploadError);
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('photos')
        .getPublicUrl(filePath);

      const finalTitle = title.trim() || generateTitleFromFilename(file.name);

      const photoData = {
        title: finalTitle,
        description: description.trim() || null,
        image_url: data.publicUrl,
        fabric: fabric,
        price: price ? parseFloat(price) : null,
        stock_status: stockStatus,
        user_id: user.id,
      };

      console.log('PhotoUpload: Inserting photo data:', { ...photoData, image_url: '[URL]' });

      const { error: dbError } = await supabase
        .from('photos')
        .insert(photoData);

      if (dbError) {
        console.error('PhotoUpload: Database insert error:', dbError);
        throw dbError;
      }

      console.log('PhotoUpload: Successfully uploaded optimized photo');

      toast({
        title: "Photo uploaded successfully!",
        description: "Your optimized photo has been added to your gallery.",
      });

      resetForm();
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

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setFabric('New Fabric');
    setPrice('');
    setStockStatus('Available');
    setFile(null);
    setImagePreview('');
    setOptimizedVariants([]);
    setStep('file-selection');
  };

  const handleCancel = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    optimizedVariants.forEach(variant => URL.revokeObjectURL(variant.url));
    setFile(null);
    setFiles([]);
    setImagePreview('');
    setOptimizedVariants([]);
    resetForm();
    setShowBulkModal(false);
    onCancel();
  };

  const handleContinueToMetadata = () => {
    if (!file) return;
    setStep('metadata');
  };

  const handleBackToFileSelection = () => {
    setStep('file-selection');
  };

  const handleBulkUploadComplete = () => {
    setShowBulkModal(false);
    setFiles([]);
    onPhotoUploaded();
  };

  const handleChooseDifferentFiles = () => {
    setShowBulkModal(false);
    setFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return {
    // State
    step,
    title,
    description,
    fabric,
    price,
    stockStatus,
    file,
    files,
    uploading,
    imagePreview,
    showBulkModal,
    fileInputRef,
    user,
    isOptimizing,
    progress,
    optimizedVariants,
    
    // Setters
    setTitle,
    setDescription,
    setFabric,
    setPrice,
    setStockStatus,
    
    // Handlers
    handleFileChange,
    handleUpload,
    handleCancel,
    handleContinueToMetadata,
    handleBackToFileSelection,
    handleBulkUploadComplete,
    handleChooseDifferentFiles,
    generateTitleFromFilename,
  };
};
