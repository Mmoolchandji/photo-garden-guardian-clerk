import { useState, useRef } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

type UploadStep = 'file-selection' | 'metadata';

export const usePhotoUpload = (onPhotoUploaded: () => void, onCancel: () => void) => {
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

  const generateTitleFromFilename = (filename: string) => {
    return filename
      .split('.')[0] // Remove extension
      .replace(/[-_]/g, ' ') // Replace hyphens and underscores with spaces
      .replace(/\b\w/g, l => l.toUpperCase()); // Capitalize first letter of each word
  };

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
    // Reset file input
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
