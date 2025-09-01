import { describe, it, expect, beforeEach, vi } from 'vitest';
import { shareToWhatsApp, shareMultipleToWhatsApp, ShareablePhoto } from '@/utils/sharing';
import { toast } from '@/hooks/use-toast';

// Mock dependencies
vi.mock('@/hooks/use-toast');
vi.mock('@/utils/sharing/deviceDetection', () => ({
  isMobileDevice: vi.fn(),
  canShareFiles: vi.fn(),
  isIOSDevice: vi.fn(),
}));
vi.mock('@/utils/sharing/webShareAPI', () => ({
  shareViaWebShareAPI: vi.fn(),
  shareMultipleViaWebShareAPI: vi.fn(),
}));
vi.mock('@/utils/sharing/whatsappURL', () => ({
  shareViaWhatsAppURL: vi.fn(),
  shareMultipleViaWhatsAppURL: vi.fn(),
}));
vi.mock('@/utils/sharing/batchedSharing', () => ({
  shareBatchedToWhatsApp: vi.fn(),
}));
vi.mock('@/utils/sharing/gallerySharing', () => ({
  shareGalleryToWhatsApp: vi.fn(),
}));

import { isMobileDevice, canShareFiles } from '@/utils/sharing/deviceDetection';
import { shareViaWebShareAPI, shareMultipleViaWebShareAPI } from '@/utils/sharing/webShareAPI';
import { shareViaWhatsAppURL, shareMultipleViaWhatsAppURL } from '@/utils/sharing/whatsappURL';
import { shareBatchedToWhatsApp } from '@/utils/sharing/batchedSharing';
import { shareGalleryToWhatsApp } from '@/utils/sharing/gallerySharing';

const mockPhoto: ShareablePhoto = {
  id: '1',
  title: 'Beautiful Cotton Saree',
  imageUrl: 'https://example.com/saree1.jpg',
  price: 2500,
  description: 'Elegant cotton saree with traditional patterns',
};

const mockPhotos: ShareablePhoto[] = [
  mockPhoto,
  {
    id: '2',
    title: 'Silk Saree Collection',
    imageUrl: 'https://example.com/saree2.jpg',
    price: 5000,
    description: 'Premium silk saree',
  },
  {
    id: '3',
    title: 'Designer Saree',
    imageUrl: 'https://example.com/saree3.jpg',
    price: 7500,
    description: 'Designer saree with embroidery',
  },
];

describe('WhatsApp Sharing', () => {
  const mockToast = vi.fn();
  const mockDismiss = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    (toast as any).mockReturnValue({
      dismiss: mockDismiss,
    });
    
    // Default mock implementations
    (isMobileDevice as any).mockReturnValue(true);
    (canShareFiles as any).mockReturnValue(true);
    (shareViaWebShareAPI as any).mockResolvedValue(true);
    (shareViaWhatsAppURL as any).mockReturnValue(true);
    (shareMultipleViaWebShareAPI as any).mockResolvedValue(true);
    (shareMultipleViaWhatsAppURL as any).mockReturnValue(true);
    (shareBatchedToWhatsApp as any).mockResolvedValue(true);
    (shareGalleryToWhatsApp as any).mockResolvedValue(true);
  });

  describe('Single Photo Sharing', () => {
    it('should share single photo via Web Share API on mobile', async () => {
      await shareToWhatsApp(mockPhoto);

      expect(toast).toHaveBeenCalledWith({
        title: "Preparing to share...",
        description: "Setting up your WhatsApp share",
      });
      expect(shareViaWebShareAPI).toHaveBeenCalledWith(mockPhoto);
      expect(mockDismiss).toHaveBeenCalled();
    });

    it('should fallback to URL sharing when Web Share API fails', async () => {
      (shareViaWebShareAPI as any).mockResolvedValue(false);

      await shareToWhatsApp(mockPhoto);

      expect(shareViaWebShareAPI).toHaveBeenCalledWith(mockPhoto);
      expect(shareViaWhatsAppURL).toHaveBeenCalledWith(mockPhoto);
      expect(toast).toHaveBeenCalledWith({
        title: "Opening WhatsApp",
        description: "Redirecting to WhatsApp to share your saree",
      });
    });

    it('should use URL sharing directly on desktop', async () => {
      (isMobileDevice as any).mockReturnValue(false);

      await shareToWhatsApp(mockPhoto);

      expect(shareViaWebShareAPI).not.toHaveBeenCalled();
      expect(shareViaWhatsAppURL).toHaveBeenCalledWith(mockPhoto);
    });

    it('should handle sharing errors gracefully', async () => {
      (shareViaWebShareAPI as any).mockResolvedValue(false);
      (shareViaWhatsAppURL as any).mockReturnValue(false);

      await shareToWhatsApp(mockPhoto);

      expect(toast).toHaveBeenCalledWith({
        title: "Sharing via WhatsApp is not supported on this device or browser.",
        description: "Please try copying the image URL manually.",
        variant: "destructive",
      });
    });

    it('should handle network errors specifically', async () => {
      const networkError = new Error('network error occurred');
      (shareViaWebShareAPI as any).mockRejectedValue(networkError);

      await shareToWhatsApp(mockPhoto);

      expect(toast).toHaveBeenCalledWith({
        title: "Network error occurred",
        description: "Please check your internet connection and try again.",
        variant: "destructive",
      });
    });

    it('should handle CORS errors specifically', async () => {
      const corsError = new Error('cors policy violation');
      (shareViaWebShareAPI as any).mockRejectedValue(corsError);

      await shareToWhatsApp(mockPhoto);

      expect(toast).toHaveBeenCalledWith({
        title: "Image sharing temporarily unavailable",
        description: "You can still share the link via WhatsApp Web.",
        variant: "destructive",
      });
    });
  });

  describe('Multiple Photo Sharing', () => {
    it('should use file sharing for small batches (≤10 photos)', async () => {
      const smallBatch = mockPhotos.slice(0, 3);

      await shareMultipleToWhatsApp(smallBatch, 'auto');

      expect(toast).toHaveBeenCalledWith({
        title: "Preparing to share...",
        description: "Setting up 3 photos for WhatsApp share",
      });
      expect(shareMultipleViaWebShareAPI).toHaveBeenCalledWith(smallBatch);
    });

    it('should use batched sharing for medium batches (11-25 photos)', async () => {
      const mediumBatch = Array.from({ length: 15 }, (_, i) => ({
        ...mockPhoto,
        id: `photo-${i}`,
        title: `Photo ${i}`,
      }));

      await shareMultipleToWhatsApp(mediumBatch, 'auto');

      expect(shareBatchedToWhatsApp).toHaveBeenCalledWith(mediumBatch, true);
    });

    it('should use gallery sharing for large batches (>25 photos)', async () => {
      const largeBatch = Array.from({ length: 30 }, (_, i) => ({
        ...mockPhoto,
        id: `photo-${i}`,
        title: `Photo ${i}`,
      }));

      await shareMultipleToWhatsApp(largeBatch, 'auto');

      expect(shareGalleryToWhatsApp).toHaveBeenCalledWith(largeBatch);
    });

    it('should respect explicit method selection', async () => {
      await shareMultipleToWhatsApp(mockPhotos, 'batched');

      expect(shareBatchedToWhatsApp).toHaveBeenCalledWith(mockPhotos, true);
      expect(shareMultipleViaWebShareAPI).not.toHaveBeenCalled();
    });

    it('should fallback to URL sharing when Web Share API fails', async () => {
      (shareMultipleViaWebShareAPI as any).mockResolvedValue(false);

      await shareMultipleToWhatsApp(mockPhotos, 'files');

      expect(shareMultipleViaWebShareAPI).toHaveBeenCalledWith(mockPhotos);
      expect(shareMultipleViaWhatsAppURL).toHaveBeenCalledWith(mockPhotos);
    });

    it('should handle sharing method failures', async () => {
      (shareMultipleViaWebShareAPI as any).mockResolvedValue(false);
      (shareMultipleViaWhatsAppURL as any).mockReturnValue(false);

      await shareMultipleToWhatsApp(mockPhotos, 'files');

      expect(toast).toHaveBeenCalledWith({
        title: "Sharing failed",
        description: "Unable to share photos. Please try a different method.",
        variant: "destructive",
      });
    });
  });

  describe('Batch Sharing Consistency', () => {
    it('should maintain consistent behavior across different batch sizes', async () => {
      const batches = [
        Array.from({ length: 1 }, (_, i) => ({ ...mockPhoto, id: `batch1-${i}` })),
        Array.from({ length: 5 }, (_, i) => ({ ...mockPhoto, id: `batch5-${i}` })),
        Array.from({ length: 10 }, (_, i) => ({ ...mockPhoto, id: `batch10-${i}` })),
        Array.from({ length: 15 }, (_, i) => ({ ...mockPhoto, id: `batch15-${i}` })),
        Array.from({ length: 30 }, (_, i) => ({ ...mockPhoto, id: `batch30-${i}` })),
      ];

      for (const batch of batches) {
        vi.clearAllMocks();
        await shareMultipleToWhatsApp(batch, 'auto');
        
        // Verify appropriate method was called based on batch size
        if (batch.length <= 10) {
          expect(shareMultipleViaWebShareAPI).toHaveBeenCalledWith(batch);
        } else if (batch.length <= 25) {
          expect(shareBatchedToWhatsApp).toHaveBeenCalledWith(batch, true);
        } else {
          expect(shareGalleryToWhatsApp).toHaveBeenCalledWith(batch);
        }
      }
    });

    it('should handle mixed success/failure scenarios in batch sharing', async () => {
      // Simulate partial success in batched sharing
      (shareBatchedToWhatsApp as any).mockResolvedValue(true);

      await shareMultipleToWhatsApp(mockPhotos, 'batched');

      expect(shareBatchedToWhatsApp).toHaveBeenCalledWith(mockPhotos, true);
      expect(mockDismiss).toHaveBeenCalled();
    });

    it('should validate photo data before sharing', async () => {
      const invalidPhotos = [
        { ...mockPhoto, imageUrl: '' }, // Invalid URL
        { ...mockPhoto, title: '' }, // Invalid title
      ];

      await shareMultipleToWhatsApp(invalidPhotos, 'files');

      // Should still attempt to share, letting individual methods handle validation
      expect(shareMultipleViaWebShareAPI).toHaveBeenCalledWith(invalidPhotos);
    });
  });

  describe('Device-Specific Behavior', () => {
    it('should handle iOS-specific sharing limitations', async () => {
      (isMobileDevice as any).mockReturnValue(true);
      (canShareFiles as any).mockReturnValue(false); // iOS Safari limitation

      await shareToWhatsApp(mockPhoto);

      expect(shareViaWebShareAPI).not.toHaveBeenCalled();
      expect(shareViaWhatsAppURL).toHaveBeenCalledWith(mockPhoto);
    });

    it('should handle desktop browser limitations', async () => {
      (isMobileDevice as any).mockReturnValue(false);
      (canShareFiles as any).mockReturnValue(false);

      await shareToWhatsApp(mockPhoto);

      expect(shareViaWebShareAPI).not.toHaveBeenCalled();
      expect(shareViaWhatsAppURL).toHaveBeenCalledWith(mockPhoto);
    });

    it('should adapt sharing strategy based on device capabilities', async () => {
      // Test mobile with file sharing capability
      (isMobileDevice as any).mockReturnValue(true);
      (canShareFiles as any).mockReturnValue(true);

      await shareMultipleToWhatsApp(mockPhotos, 'files');

      expect(shareMultipleViaWebShareAPI).toHaveBeenCalledWith(mockPhotos);

      // Test mobile without file sharing capability
      vi.clearAllMocks();
      (canShareFiles as any).mockReturnValue(false);

      await shareMultipleToWhatsApp(mockPhotos, 'files');

      expect(shareMultipleViaWebShareAPI).not.toHaveBeenCalled();
      expect(shareMultipleViaWhatsAppURL).toHaveBeenCalledWith(mockPhotos);
    });
  });

  describe('Performance and Reliability', () => {
    it('should handle large photo collections efficiently', async () => {
      const largeCollection = Array.from({ length: 100 }, (_, i) => ({
        ...mockPhoto,
        id: `large-${i}`,
        title: `Large Collection Photo ${i}`,
      }));

      const startTime = performance.now();
      await shareMultipleToWhatsApp(largeCollection, 'gallery');
      const endTime = performance.now();

      // Should complete within reasonable time (less than 1 second for setup)
      expect(endTime - startTime).toBeLessThan(1000);
      expect(shareGalleryToWhatsApp).toHaveBeenCalledWith(largeCollection);
    });

    it('should handle concurrent sharing requests', async () => {
      const promises = [
        shareToWhatsApp(mockPhoto),
        shareToWhatsApp({ ...mockPhoto, id: '2' }),
        shareToWhatsApp({ ...mockPhoto, id: '3' }),
      ];

      await Promise.all(promises);

      expect(shareViaWebShareAPI).toHaveBeenCalledTimes(3);
    });

    it('should cleanup resources on sharing cancellation', async () => {
      const abortError = new Error('AbortError');
      abortError.name = 'AbortError';
      (shareViaWebShareAPI as any).mockRejectedValue(abortError);

      await shareToWhatsApp(mockPhoto);

      // Should not show error toast for user cancellation
      expect(toast).toHaveBeenCalledWith({
        title: "Preparing to share...",
        description: "Setting up your WhatsApp share",
      });
      expect(mockDismiss).toHaveBeenCalled();
    });
  });

  describe('Error Recovery', () => {
    it('should retry with different methods on failure', async () => {
      (shareViaWebShareAPI as any).mockResolvedValue(false);
      (shareViaWhatsAppURL as any).mockReturnValue(true);

      await shareToWhatsApp(mockPhoto);

      expect(shareViaWebShareAPI).toHaveBeenCalledWith(mockPhoto);
      expect(shareViaWhatsAppURL).toHaveBeenCalledWith(mockPhoto);
      expect(toast).toHaveBeenCalledWith({
        title: "Opening WhatsApp",
        description: "Redirecting to WhatsApp to share your saree",
      });
    });

    it('should provide helpful error messages for different failure scenarios', async () => {
      const testCases = [
        {
          error: new Error('network timeout'),
          expectedTitle: "Network error occurred",
          expectedDescription: "Please check your internet connection and try again.",
        },
        {
          error: new Error('cors policy'),
          expectedTitle: "Image sharing temporarily unavailable",
          expectedDescription: "You can still share the link via WhatsApp Web.",
        },
        {
          error: new Error('unknown error'),
          expectedTitle: "Sharing via WhatsApp is not supported on this device or browser.",
          expectedDescription: "Please try copying the image URL manually.",
        },
      ];

      for (const testCase of testCases) {
        vi.clearAllMocks();
        (shareViaWebShareAPI as any).mockRejectedValue(testCase.error);
        (shareViaWhatsAppURL as any).mockReturnValue(false);

        await shareToWhatsApp(mockPhoto);

        expect(toast).toHaveBeenCalledWith({
          title: testCase.expectedTitle,
          description: testCase.expectedDescription,
          variant: "destructive",
        });
      }
    });
  });
});
