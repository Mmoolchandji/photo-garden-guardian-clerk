
import { ShareablePhoto } from './types';
import { shareMultipleViaWebShareAPI } from './webShareAPI';
import { shareMultipleViaWhatsAppURL } from './whatsappURL';
import { toast } from '@/hooks/use-toast';

export interface BatchShareOptions {
  batchSize: number;
  delayBetweenBatches: number;
  includePartLabels: boolean;
}

const DEFAULT_BATCH_OPTIONS: BatchShareOptions = {
  batchSize: 10,
  delayBetweenBatches: 2000, // 2 seconds between batches
  includePartLabels: true,
};

// Split photos into batches for sharing
export const createPhotoBatches = (photos: ShareablePhoto[], batchSize: number): ShareablePhoto[][] => {
  const batches: ShareablePhoto[][] = [];
  for (let i = 0; i < photos.length; i += batchSize) {
    batches.push(photos.slice(i, i + batchSize));
  }
  return batches;
};

// Enhanced message formatting for batched sharing
export const formatBatchedMessage = (photos: ShareablePhoto[], batchIndex: number, totalBatches: number): string => {
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

// Main batched sharing function
export const shareBatchedToWhatsApp = async (
  photos: ShareablePhoto[], 
  shareAsFiles: boolean = true,
  options: Partial<BatchShareOptions> = {}
): Promise<boolean> => {
  const config = { ...DEFAULT_BATCH_OPTIONS, ...options };
  const batches = createPhotoBatches(photos, config.batchSize);
  
  console.log(`Starting batched share: ${batches.length} batches of up to ${config.batchSize} photos each`);
  
  try {
    let successCount = 0;
    
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      const batchNumber = i + 1;
      
      // Show progress
      toast({
        title: `Preparing batch ${batchNumber} of ${batches.length}`,
        description: `${batch.length} photos in this batch`,
      });
      
      let batchSuccess = false;
      
      if (shareAsFiles) {
        // Try Web Share API first for files
        batchSuccess = await shareMultipleViaWebShareAPI(batch);
      }
      
      if (!batchSuccess) {
        // Fallback to URL sharing with batch-specific message
        const batchMessage = config.includePartLabels 
          ? formatBatchedMessage(batch, i, batches.length)
          : undefined;
        
        batchSuccess = shareMultipleViaWhatsAppURL(batch, batchMessage);
      }
      
      if (batchSuccess) {
        successCount++;
        
        // Show success for this batch
        toast({
          title: `Batch ${batchNumber} shared successfully`,
          description: `${batch.length} photos shared to WhatsApp`,
        });
        
        // Wait before next batch (except for the last one)
        if (i < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, config.delayBetweenBatches));
        }
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
        title: "All batches shared successfully! 🎉",
        description: `${photos.length} photos shared in ${batches.length} parts to WhatsApp`,
      });
      return true;
    } else {
      toast({
        title: "Partial success",
        description: `${successCount} of ${batches.length} batches shared successfully`,
        variant: "destructive",
      });
      return false;
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
