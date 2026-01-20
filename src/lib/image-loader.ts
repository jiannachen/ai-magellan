// Custom image loader for Cloudflare Pages
// Uses Cloudflare Image Resizing when available, falls back to original URL

interface ImageLoaderProps {
  src: string;
  width: number;
  quality?: number;
}

export default function cloudflareImageLoader({
  src,
  width,
  quality = 75,
}: ImageLoaderProps): string {
  // If src is already an absolute URL, use Cloudflare Image Resizing
  if (src.startsWith('http://') || src.startsWith('https://')) {
    // For external images, we can use Cloudflare's image resizing proxy
    // Format: /cdn-cgi/image/width=<width>,quality=<quality>,format=auto/<url>
    const params = [
      `width=${width}`,
      `quality=${quality}`,
      'format=auto',
      'fit=scale-down',
    ].join(',');

    // Use Cloudflare Image Resizing (requires Cloudflare Pro plan or higher)
    // If not available, fall back to original URL
    if (process.env.CLOUDFLARE_IMAGE_RESIZING === 'true') {
      return `/cdn-cgi/image/${params}/${src}`;
    }

    // Fallback: return original URL (no optimization)
    return src;
  }

  // For local images (starting with /), serve directly
  // These should be optimized at build time or stored in R2
  if (src.startsWith('/')) {
    // If using Cloudflare Image Resizing for local images
    if (process.env.CLOUDFLARE_IMAGE_RESIZING === 'true') {
      const params = [
        `width=${width}`,
        `quality=${quality}`,
        'format=auto',
        'fit=scale-down',
      ].join(',');
      return `/cdn-cgi/image/${params}${src}`;
    }

    // Fallback: return original path
    return src;
  }

  // Default: return as-is
  return src;
}
