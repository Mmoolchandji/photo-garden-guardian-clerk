
import { ShareablePhoto } from './types';
import { shareMultipleViaWebShareAPI } from './webShareAPI';
import { shareMultipleViaWhatsAppURL } from './whatsappURL';
import { formatIndividualPhotoMessage } from './messageFormatting';
import { toast } from '@/hooks/use-toast';

export interface BatchShareOptions {
  batchSize: number;
  delayBetweenBatches: number;
  includePartLabels: boolean;
}

const DEFAULT_BATCH_OPTIONS: BatchShareOptions = {
  batchSize: 10,
  delayBetweenBatches: 2000, // 2 seconds between batches
  includePartLabels: false, // Changed to false for individual messages
};

// Split photos into batches for sharing
export const createPhotoBatches = (photos: ShareablePhoto[], batchSize: number): ShareablePhoto[][] => {
  const batches: ShareablePhoto[][] = [];
  for (let i = 0; i < photos.length; i += batchSize) {
    batches.push(photos.slice(i, i + batchSize));
  }
  return batches;
};

// Enhanced message formatting for batched sharing - now individual messages
export const formatBatchedMessage = (photos: ShareablePhoto[], batchIndex: number, totalBatches: number): string => {
  // For batched sharing, we'll still send individual messages
  // This function is kept for compatibility but won't be used for individual photo messages
  let message = `✨ Saree Collection - Part ${batchIndex + 1} of ${totalBatches}\n\n`;
  
  photos.forEach((photo, index) => {
    const globalIndex = (batchIndex * photos.length) + index + 1;
    message += `${globalIndex}. *${photo.title}*`;
    if (photo.price) {
      message += ` - ₹${photo.price.toLocaleString('en-IN')}`;
    }
    message += '\n';
  });
  
  message += `\n📸 More varieties in the next parts!`;
  
  return message;
};

// Create a promise-based user confirmation dialog
const createBatchConfirmationDialog = (batchNumber: number, totalBatches: number, batchSize: number): Promise<boolean> => {
  return new Promise((resolve) => {
    // Create modal dialog for batch confirmation
    const dialog = document.createElement('div');
    dialog.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    dialog.innerHTML = `
      <div class="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
            <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-4.126-.98L3 20l1.98-5.874A8.955 8.955 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z"></path>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900">Ready for Batch ${batchNumber}</h3>
        </div>
        <p class="text-gray-600 mb-2">
          Each photo will be shared individually with its own price.
        </p>
        <p class="text-sm text-gray-500 mb-6">
          Sharing batch ${batchNumber} of ${totalBatches} (${batchSize} photos with individual messages)
        </p>
        <div class="flex gap-3">
          <button id="batch-continue" class="flex-1 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors">
            Share Batch ${batchNumber}
          </button>
          <button id="batch-cancel" class="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors">
            Cancel
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(dialog);
    
    const continueBtn = dialog.querySelector('#batch-continue');
    const cancelBtn = dialog.querySelector('#batch-cancel');
    
    const cleanup = () => {
      document.body.removeChild(dialog);
    };
    
    continueBtn?.addEventListener('click', () => {
      cleanup();
      resolve(true);
    });
    
    cancelBtn?.addEventListener('click', () => {
      cleanup();
      resolve(false);
    });
    
    // Close on backdrop click
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) {
        cleanup();
        resolve(false);
      }
    });
  });
};

// Improved batched sharing function with individual messages
export const shareBatchedToWhatsApp = async (
  photos: ShareablePhoto[], 
  shareAsFiles: boolean = true,
  options: Partial<BatchShareOptions> = {}
): Promise<boolean> => {
  const config = { ...DEFAULT_BATCH_OPTIONS, ...options };
  const batches = createPhotoBatches(photos, config.batchSize);
  
  console.log(`Starting batched share with individual messages: ${batches.length} batches of up to ${config.batchSize} photos each`);
  
  // Check if Web Share API supports files
  const supportsFileSharing = shareAsFiles && navigator.canShare && (() => {
    try {
      const testFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      return navigator.canShare({ files: [testFile] });
    } catch {
      return false;
    }
  })();
  
  if (!supportsFileSharing && shareAsFiles) {
    toast({
      title: "File sharing not supported",
      description: "Your device doesn't support file sharing. Using individual link sharing instead.",
      variant: "destructive",
    });
    
    // Fallback to URL sharing for all photos individually
    return await shareMultipleViaWhatsAppURL(photos);
  }
  
  try {
    let successCount = 0;
    
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      const batchNumber = i + 1;
      
      // For batches after the first one, ask for user confirmation
      if (i > 0) {
        const shouldContinue = await createBatchConfirmationDialog(
          batchNumber, 
          batches.length, 
          batch.length
        );
        
        if (!shouldContinue) {
          toast({
            title: "Batched sharing cancelled",
            description: `Shared ${successCount} of ${batches.length} batches successfully.`,
          });
          return successCount > 0;
        }
      } else {
        // Show initial notification for first batch
        toast({
          title: `Starting batch sharing`,
          description: `Each photo will be shared individually with its price (${batches.length} batches)`,
        });
      }
      
      let batchSuccess = false;
      
      // Always try Web Share API first for file sharing (individual messages)
      if (shareAsFiles && supportsFileSharing) {
        console.log(`Attempting Web Share API for batch ${batchNumber} with individual messages`);
        batchSuccess = await shareMultipleViaWebShareAPI(batch);
        
        if (batchSuccess) {
          console.log(`Batch ${batchNumber} shared successfully via Web Share API (individual messages)`);
        } else {
          console.log(`Web Share API failed for batch ${batchNumber}, trying URL fallback`);
        }
      }
      
      // If Web Share API failed, try URL sharing as fallback (also individual messages)
      if (!batchSuccess) {
        console.log(`Using individual URL sharing for batch ${batchNumber}`);
        batchSuccess = await shareMultipleViaWhatsAppURL(batch);
      }
      
      if (batchSuccess) {
        successCount++;
        
        // Show success for this batch
        toast({
          title: `Batch ${batchNumber} shared! 🎉`,
          description: `${batch.length} photos shared individually with their prices${i < batches.length - 1 ? '. Ready for next batch?' : ''}`,
        });
      } else {
        toast({
          title: `Batch ${batchNumber} failed`,
          description: `Unable to share batch ${batchNumber}. Please try again.`,
          variant: "destructive",
        });
        break;
      }
    }
    
    // Final summary
    if (successCount === batches.length) {
      toast({
        title: "All batches completed! 🎉",
        description: `Successfully shared all ${photos.length} photos individually with their prices`,
      });
      return true;
    } else {
      toast({
        title: "Partial completion",
        description: `${successCount} of ${batches.length} batches shared successfully`,
        variant: successCount > 0 ? "default" : "destructive",
      });
      return successCount > 0;
    }
    
  } catch (error) {
    console.error('Batched sharing error:', error);
    toast({
      title: "Batched sharing failed",
      description: "Unable to complete batched sharing. Please try a different method.",
      variant: "destructive",
    });
    return false;
  }
};
