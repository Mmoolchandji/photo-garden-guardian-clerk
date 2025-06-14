interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'webp';
  stripMetadata?: boolean;
}

interface ImageVariant {
  type: 'thumbnail' | 'display' | 'full';
  file: File;
  dimensions: { width: number; height: number };
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
}

interface CompressionResult {
  variants: ImageVariant[];
  totalOriginalSize: number;
  totalCompressedSize: number;
  totalCompressionRatio: number;
}

export class ImageCompressor {
  // WhatsApp-style compression settings
  private static readonly VARIANTS = {
    thumbnail: { maxSize: 300, quality: 0.6 },  // High compression for thumbnails
    display: { maxSize: 800, quality: 0.8 },    // Medium compression for gallery display
    full: { maxSize: 1600, quality: 0.85 }      // Balanced compression for full view
  };

  /**
   * Compress image with WhatsApp-style optimization
   * Resizes to max 1600px, converts to JPEG, strips metadata
   */
  static async compressImage(
    file: File, 
    options: CompressionOptions = {}
  ): Promise<File> {
    const {
      maxWidth = 1600,
      maxHeight = 1600,
      quality = 0.85,
      format = 'jpeg',
      stripMetadata = true
    } = options;

    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            reject(new Error('Canvas context not available'));
            return;
          }

          // Calculate new dimensions (WhatsApp-style resizing)
          const { width: newWidth, height: newHeight } = this.calculateDimensions(
            img.width, 
            img.height, 
            maxWidth, 
            maxHeight
          );

          canvas.width = newWidth;
          canvas.height = newHeight;

          // Draw and compress (strips metadata automatically)
          ctx.drawImage(img, 0, 0, newWidth, newHeight);

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Compression failed'));
                return;
              }

              // Create compressed file with original name
              const compressedFile = new File(
                [blob], 
                this.generateFileName(file.name, format),
                { 
                  type: `image/${format}`,
                  lastModified: Date.now()
                }
              );

              resolve(compressedFile);
            },
            `image/${format}`,
            quality
          );
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Generate multiple variants like WhatsApp (thumbnail, display, full)
   */
  static async generateVariants(file: File): Promise<CompressionResult> {
    const originalSize = file.size;
    const variants: ImageVariant[] = [];

    try {
      // Generate all three variants
      for (const [type, config] of Object.entries(this.VARIANTS)) {
        const compressedFile = await this.compressImage(file, {
          maxWidth: config.maxSize,
          maxHeight: config.maxSize,
          quality: config.quality,
          format: 'jpeg',
          stripMetadata: true
        });

        // Get dimensions of compressed image
        const dimensions = await this.getImageDimensions(compressedFile);
        
        variants.push({
          type: type as 'thumbnail' | 'display' | 'full',
          file: compressedFile,
          dimensions,
          originalSize,
          compressedSize: compressedFile.size,
          compressionRatio: ((originalSize - compressedFile.size) / originalSize) * 100
        });
      }

      const totalCompressedSize = variants.reduce((sum, v) => sum + v.compressedSize, 0);
      const totalCompressionRatio = ((originalSize - totalCompressedSize) / originalSize) * 100;

      return {
        variants,
        totalOriginalSize: originalSize,
        totalCompressedSize,
        totalCompressionRatio
      };
    } catch (error) {
      throw new Error(`Compression failed: ${error.message}`);
    }
  }

  /**
   * Quick compression for immediate preview (WhatsApp-style instant preview)
   */
  static async quickCompress(file: File): Promise<File> {
    return this.compressImage(file, {
      maxWidth: 800,
      maxHeight: 800,
      quality: 0.75,
      format: 'jpeg'
    });
  }

  /**
   * Calculate new dimensions maintaining aspect ratio (WhatsApp algorithm)
   */
  private static calculateDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number
  ): { width: number; height: number } {
    // If image is already smaller, keep original size
    if (originalWidth <= maxWidth && originalHeight <= maxHeight) {
      return { width: originalWidth, height: originalHeight };
    }

    const aspectRatio = originalWidth / originalHeight;

    let newWidth, newHeight;

    if (aspectRatio > 1) {
      // Landscape - limit by width
      newWidth = Math.min(originalWidth, maxWidth);
      newHeight = newWidth / aspectRatio;
    } else {
      // Portrait or square - limit by height
      newHeight = Math.min(originalHeight, maxHeight);
      newWidth = newHeight * aspectRatio;
    }

    return {
      width: Math.round(newWidth),
      height: Math.round(newHeight)
    };
  }

  /**
   * Get image dimensions from file
   */
  private static getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
        URL.revokeObjectURL(img.src);
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(img.src);
        reject(new Error('Failed to load image for dimension calculation'));
      };
      
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Generate filename for compressed image
   */
  private static generateFileName(originalName: string, format: string): string {
    const nameWithoutExt = originalName.split('.').slice(0, -1).join('.');
    const extension = format === 'jpeg' ? 'jpg' : format;
    return `${nameWithoutExt}.${extension}`;
  }

  /**
   * Format file size for display
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  }

  /**
   * Check if browser supports image compression
   */
  static isCompressionSupported(): boolean {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext && canvas.getContext('2d'));
  }
}

export type { CompressionOptions, ImageVariant, CompressionResult };
