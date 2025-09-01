import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePhotoUpload } from '@/hooks/usePhotoUpload';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

// Mock dependencies
vi.mock('@/contexts/AuthContext');
vi.mock('@/components/ui/use-toast');
vi.mock('@/hooks/useImageCompression', () => ({
  useImageCompression: () => ({
    compressImage: vi.fn().mockResolvedValue(new File(['compressed'], 'compressed.jpg')),
  }),
}));

const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
};

describe('usePhotoUpload CREATE Operations', () => {
  const mockOnPhotoUploaded = vi.fn();
  const mockOnCancel = vi.fn();
  const mockToast = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    (useAuth as any).mockReturnValue({
      user: mockUser,
    });
    
    (useToast as any).mockReturnValue({
      toast: mockToast,
    });
  });

  describe('File Selection', () => {
    it('should handle single file selection', () => {
      const { result } = renderHook(() => 
        usePhotoUpload(mockOnPhotoUploaded, mockOnCancel)
      );

      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const mockEvent = {
        target: {
          files: [mockFile],
        },
      } as any;

      act(() => {
        result.current.handleFileChange(mockEvent);
      });

      expect(result.current.file).toBe(mockFile);
      expect(result.current.uploadMode).toBe('single');
      expect(result.current.files).toEqual([]);
    });

    it('should handle multiple file selection for bulk upload', () => {
      const { result } = renderHook(() => 
        usePhotoUpload(mockOnPhotoUploaded, mockOnCancel)
      );

      const mockFiles = [
        new File(['test1'], 'test1.jpg', { type: 'image/jpeg' }),
        new File(['test2'], 'test2.jpg', { type: 'image/jpeg' }),
        new File(['test3'], 'test3.jpg', { type: 'image/jpeg' }),
      ];
      
      const mockEvent = {
        target: {
          files: mockFiles,
        },
      } as any;

      act(() => {
        result.current.handleFileChange(mockEvent);
      });

      expect(result.current.files).toEqual(mockFiles);
      expect(result.current.uploadMode).toBe('bulk');
      expect(result.current.file).toBe(null);
    });

    it('should reject more than 20 files', () => {
      const { result } = renderHook(() => 
        usePhotoUpload(mockOnPhotoUploaded, mockOnCancel)
      );

      // Create 21 mock files
      const mockFiles = Array.from({ length: 21 }, (_, i) => 
        new File([`test${i}`], `test${i}.jpg`, { type: 'image/jpeg' })
      );
      
      const mockEvent = {
        target: {
          files: mockFiles,
        },
      } as any;

      act(() => {
        result.current.handleFileChange(mockEvent);
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: "Too many files selected",
        description: "Please select a maximum of 20 files at once.",
        variant: "destructive",
      });

      expect(result.current.files).toEqual([]);
      expect(result.current.uploadMode).toBe('idle');
    });

    it('should handle empty file selection', () => {
      const { result } = renderHook(() => 
        usePhotoUpload(mockOnPhotoUploaded, mockOnCancel)
      );

      const mockEvent = {
        target: {
          files: [],
        },
      } as any;

      act(() => {
        result.current.handleFileChange(mockEvent);
      });

      expect(result.current.file).toBe(null);
      expect(result.current.files).toEqual([]);
      expect(result.current.uploadMode).toBe('idle');
    });
  });

  describe('Upload Mode Management', () => {
    it('should start in idle mode', () => {
      const { result } = renderHook(() => 
        usePhotoUpload(mockOnPhotoUploaded, mockOnCancel)
      );

      expect(result.current.uploadMode).toBe('idle');
    });

    it('should switch to single mode for single file', () => {
      const { result } = renderHook(() => 
        usePhotoUpload(mockOnPhotoUploaded, mockOnCancel)
      );

      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const mockEvent = {
        target: { files: [mockFile] },
      } as any;

      act(() => {
        result.current.handleFileChange(mockEvent);
      });

      expect(result.current.uploadMode).toBe('single');
    });

    it('should switch to bulk mode for multiple files', () => {
      const { result } = renderHook(() => 
        usePhotoUpload(mockOnPhotoUploaded, mockOnCancel)
      );

      const mockFiles = [
        new File(['test1'], 'test1.jpg', { type: 'image/jpeg' }),
        new File(['test2'], 'test2.jpg', { type: 'image/jpeg' }),
      ];
      
      const mockEvent = {
        target: { files: mockFiles },
      } as any;

      act(() => {
        result.current.handleFileChange(mockEvent);
      });

      expect(result.current.uploadMode).toBe('bulk');
    });
  });

  describe('Upload Cancellation', () => {
    it('should reset state when cancelled', () => {
      const { result } = renderHook(() => 
        usePhotoUpload(mockOnPhotoUploaded, mockOnCancel)
      );

      // Set up some state first
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const mockEvent = {
        target: { files: [mockFile] },
      } as any;

      act(() => {
        result.current.handleFileChange(mockEvent);
      });

      expect(result.current.file).toBe(mockFile);
      expect(result.current.uploadMode).toBe('single');

      // Cancel
      act(() => {
        result.current.handleCancel();
      });

      expect(result.current.file).toBe(null);
      expect(result.current.files).toEqual([]);
      expect(result.current.uploadMode).toBe('idle');
      expect(mockOnCancel).toHaveBeenCalled();
    });
  });

  describe('Bulk Upload Completion', () => {
    it('should reset state when bulk upload completes', () => {
      const { result } = renderHook(() => 
        usePhotoUpload(mockOnPhotoUploaded, mockOnCancel)
      );

      // Set up bulk upload state
      const mockFiles = [
        new File(['test1'], 'test1.jpg', { type: 'image/jpeg' }),
        new File(['test2'], 'test2.jpg', { type: 'image/jpeg' }),
      ];
      
      const mockEvent = {
        target: { files: mockFiles },
      } as any;

      act(() => {
        result.current.handleFileChange(mockEvent);
      });

      expect(result.current.files).toEqual(mockFiles);
      expect(result.current.uploadMode).toBe('bulk');

      // Complete bulk upload
      act(() => {
        result.current.handleBulkUploadComplete();
      });

      expect(result.current.files).toEqual([]);
      expect(result.current.uploadMode).toBe('idle');
      expect(mockOnPhotoUploaded).toHaveBeenCalled();
    });
  });

  describe('File Selection Reset', () => {
    it('should reset file selection when choosing different files', () => {
      const mockFileInputRef = { current: { value: 'test.jpg' } };
      
      const { result } = renderHook(() => 
        usePhotoUpload(mockOnPhotoUploaded, mockOnCancel)
      );

      // Mock the file input ref
      result.current.fileInputRef.current = mockFileInputRef.current as any;

      // Set up some files first
      const mockFiles = [
        new File(['test1'], 'test1.jpg', { type: 'image/jpeg' }),
        new File(['test2'], 'test2.jpg', { type: 'image/jpeg' }),
      ];
      
      const mockEvent = {
        target: { files: mockFiles },
      } as any;

      act(() => {
        result.current.handleFileChange(mockEvent);
      });

      expect(result.current.files).toEqual(mockFiles);
      expect(result.current.uploadMode).toBe('bulk');

      // Choose different files
      act(() => {
        result.current.handleChooseDifferentFiles();
      });

      expect(result.current.files).toEqual([]);
      expect(result.current.uploadMode).toBe('idle');
      expect(mockFileInputRef.current.value).toBe('');
    });
  });

  describe('File Type Validation', () => {
    it('should accept valid image file types', () => {
      const { result } = renderHook(() => 
        usePhotoUpload(mockOnPhotoUploaded, mockOnCancel)
      );

      const validImageTypes = [
        'image/jpeg',
        'image/jpg', 
        'image/png',
        'image/gif',
        'image/webp',
      ];

      validImageTypes.forEach((type, index) => {
        const mockFile = new File(['test'], `test${index}.jpg`, { type });
        const mockEvent = {
          target: { files: [mockFile] },
        } as any;

        act(() => {
          result.current.handleFileChange(mockEvent);
        });

        expect(result.current.file).toBe(mockFile);
        expect(result.current.uploadMode).toBe('single');

        // Reset for next iteration
        act(() => {
          result.current.handleCancel();
        });
      });
    });
  });

  describe('User Authentication', () => {
    it('should provide user information', () => {
      const { result } = renderHook(() => 
        usePhotoUpload(mockOnPhotoUploaded, mockOnCancel)
      );

      expect(result.current.user).toBe(mockUser);
    });

    it('should handle unauthenticated user', () => {
      (useAuth as any).mockReturnValue({
        user: null,
      });

      const { result } = renderHook(() => 
        usePhotoUpload(mockOnPhotoUploaded, mockOnCancel)
      );

      expect(result.current.user).toBe(null);
    });
  });
});
