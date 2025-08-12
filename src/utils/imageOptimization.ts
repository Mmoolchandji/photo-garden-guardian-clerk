
// Supabase image optimization helper
export type OptimizeOptions = {
  width?: number;
  quality?: number;
  format?: 'origin' | 'webp' | 'jpeg';
};

const SUPABASE_RENDER_SEGMENT = '/storage/v1/render/image/public/';
const SUPABASE_OBJECT_SEGMENT = '/storage/v1/object/public/';

export function getOptimizedImageUrl(url: string, opts: OptimizeOptions = {}): string {
  if (!url) return url;
  const { width = 800, quality = 80, format } = opts;
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
    if (quality) params.set('quality', String(quality));
    if (format && format !== 'origin') params.set('format', format);

    return u.toString();
  } catch {
    return url;
  }
}

export default getOptimizedImageUrl;
