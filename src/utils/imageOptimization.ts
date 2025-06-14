
export interface ImageCompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
}

export interface ImageVariant {
  file: File;
  url: string;
  type: 'thumbnail' | 'medium' | 'full';
  width: number;
  height: number;
}

export class ImageOptimizer {
  private static canvas: HTMLCanvasElement | null = null;
  private static ctx: CanvasRenderingContext2D | null = null;

  private static getCanvas(): HTMLCanvasElement {
    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.ctx = this.canvas.getContext('2d');
    }
    return this.canvas;
  }

  static async compressImage(
    file: File,
    options: ImageCompressionOptions = {}
  ): Promise<File> {
    const {
      maxWidth = 1920,
      maxHeight = 1080,
      quality = 0.8,
      format = 'webp'
    } = options;

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = this.getCanvas();
          const ctx = this.ctx!;

          // Calculate new dimensions maintaining aspect ratio
          let { width, height } = this.calculateDimensions(
            img.width,
            img.height,
            maxWidth,
            maxHeight
          );

          canvas.width = width;
          canvas.height = height;

          // Draw and compress
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to compress image'));
                return;
              }

              const compressedFile = new File(
                [blob],
                this.generateFileName(file.name, format),
                { type: blob.type }
              );
              resolve(compressedFile);
            },
            format === 'webp' ? 'image/webp' : `image/${format}`,
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

  static async createImageVariants(file: File): Promise<ImageVariant[]> {
    const variants: ImageVariant[] = [];
    
    // Thumbnail (150x150)
    const thumbnail = await this.compressImage(file, {
      maxWidth: 150,
      maxHeight: 150,
      quality: 0.6,
      format: 'webp'
    });
    
    // Medium (800x600)
    const medium = await this.compressImage(file, {
      maxWidth: 800,
      maxHeight: 600,
      quality: 0.8,
      format: 'webp'
    });
    
    // Full size (1920x1080)
    const full = await this.compressImage(file, {
      maxWidth: 1920,
      maxHeight: 1080,
      quality: 0.9,
      format: 'webp'
    });

    variants.push({
      file: thumbnail,
      url: URL.createObjectURL(thumbnail),
      type: 'thumbnail',
      width: 150,
      height: 150
    });

    variants.push({
      file: medium,
      url: URL.createObjectURL(medium),
      type: 'medium',
      width: 800,
      height: 600
    });

    variants.push({
      file: full,
      url: URL.createObjectURL(full),
      type: 'full',
      width: 1920,
      height: 1080
    });

    return variants;
  }

  private static calculateDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number
  ): { width: number; height: number } {
    let width = originalWidth;
    let height = originalHeight;

    // Scale down if needed
    if (width > maxWidth) {
      height = (height * maxWidth) / width;
      width = maxWidth;
    }

    if (height > maxHeight) {
      width = (width * maxHeight) / height;
      height = maxHeight;
    }

    return { width: Math.round(width), height: Math.round(height) };
  }

  private static generateFileName(originalName: string, format: string): string {
    const nameWithoutExt = originalName.split('.')[0];
    return `${nameWithoutExt}_compressed.${format}`;
  }

  static cleanup(urls: string[]): void {
    urls.forEach(url => URL.revokeObjectURL(url));
  }
}
