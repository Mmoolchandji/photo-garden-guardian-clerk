
// Supabase image optimization helper
export type OptimizeOptions = {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'origin' | 'webp' | 'jpeg';
  resize?: 'cover' | 'contain' | 'fill';
};

const SUPABASE_RENDER_SEGMENT = '/storage/v1/render/image/public/';
const SUPABASE_OBJECT_SEGMENT = '/storage/v1/object/public/';

export function getOptimizedImageUrl(url: string, opts: OptimizeOptions = {}): string {
  if (!url) return url;
  const { width, height, quality = 80, format, resize = 'contain' } = opts;
  try {
    const u = new URL(url);

    // Only handle Supabase storage URLs
    if (!u.pathname.includes(SUPABASE_OBJECT_SEGMENT) && !u.pathname.includes(SUPABASE_RENDER_SEGMENT)) {
      return url;
    }

    // Normalize to render path
    if (u.pathname.includes(SUPABASE_OBJECT_SEGMENT)) {
      u.pathname = u.pathname.replace(SUPABASE_OBJECT_SEGMENT, SUPABASE_RENDER_SEGMENT);
    }

    // Apply optimization params
    const params = u.searchParams;
    if (width) params.set('width', String(width));
    if (height) params.set('height', String(height));
    if (quality) params.set('quality', String(quality));
    if (format && format !== 'origin') params.set('format', format);
    if (resize) params.set('resize', resize);

    return u.toString();
  } catch {
    return url;
  }
}

export default getOptimizedImageUrl;
