
import { useState, useRef } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useImageCompression } from './useImageCompression';

type UploadStep = 'file-selection' | 'metadata';
type UploadMode = 'idle' | 'single' | 'bulk';

export const usePhotoUpload = (onPhotoUploaded: () => void, onCancel: () => void) => {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [uploadMode, setUploadMode] = useState<UploadMode>('idle'); // New state for upload mode
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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
        setUploadMode('bulk'); // Set new upload mode
      } else {
        // Single file - keep existing behavior
        const selectedFile = selectedFiles[0];
        setFile(selectedFile);
        setUploadMode('single'); // Set new upload mode
      }
    }
  };

  const handleCancel = () => {
    setFile(null);
    setFiles([]);
    setUploadMode('idle'); // Reset upload mode
    onCancel();
  };

  const handleBulkUploadComplete = () => {
    setUploadMode('idle'); // Reset upload mode
    setFiles([]);
    onPhotoUploaded();
  };

  const handleChooseDifferentFiles = () => {
    setUploadMode('idle'); // Reset upload mode
    setFiles([]);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return {
    // State
    file,
    files,
    uploadMode, // Return new upload mode
    fileInputRef,
    user,
    
    // Handlers
    handleFileChange,
    handleCancel,
    handleBulkUploadComplete,
    handleChooseDifferentFiles,
  };
};
