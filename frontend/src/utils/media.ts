/**
 * Resolves static media URLs (like uploaded avatars, assignment attachments, videos)
 * to absolute backend URLs so they load reliably across Vite dev server (port 5173),
 * direct backend port (port 5000), or production deployments.
 */
export const getMediaUrl = (url?: string | null): string => {
  if (!url || typeof url !== 'string') return '';

  const trimmed = url.trim();
  if (!trimmed) return '';

  // Already fully qualified or data URL or blob
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }

  // Ensure leading slash
  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;

  // In browser, dynamically resolve backend host
  if (typeof window !== 'undefined' && window.location) {
    const { protocol, hostname } = window.location;
    // Local dev: express backend runs on port 5000
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.')
    ) {
      return `${protocol}//${hostname}:5000${cleanPath}`;
    }
  }

  const backendBase = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '')
    : '';
  return `${backendBase}${cleanPath}`;
};
