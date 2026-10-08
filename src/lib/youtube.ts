export function extractYouTubeId(url: string): string | null {
  const m = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?[^#]*v=|embed\/|v\/|shorts\/|live\/))([\w-]{11})/
  );
  return m?.[1] ?? null;
}

export function isYouTubeUrl(url: string): boolean {
  return /youtu\.be\/|youtube\.com\//i.test(url);
}

export function detectType(url: string): 'youtube' | 'website' | 'custom' {
  if (isYouTubeUrl(url)) return 'youtube';
  try {
    const u = new URL(url);
    if (!/^https?:$/.test(u.protocol)) return 'custom';
  } catch {
    return 'custom';
  }
  return 'website';
}

export function detectLive(url: string, type: string): boolean {
  if (type === 'youtube') {
    // /live/ URLs or watch with live param are very likely live
    return /\/live\/|[\?&]live/i.test(url);
  }
  return false;
}

export function buildYouTubeEmbed(url: string, opts?: { autoplay?: boolean; muted?: boolean }): string {
  const id = extractYouTubeId(url.trim());
  if (!id) return 'about:blank';
  const params = new URLSearchParams({
    enablejsapi: '1',
    origin: '*',
    rel: '0',
    modestbranding: '1',
    playsinline: '1',
  });
  if (opts?.autoplay) params.set('autoplay', '1');
  if (opts?.muted !== false) params.set('mute', '1');
  return `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`;
}

export function safeHostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url.slice(0, 32) || 'Custom';
  }
}

export function normalizeUrl(input: string): string | null {
  const t = input.trim();
  if (!t) return null;
  if (/^https?:\/\//i.test(t)) {
    try {
      // throws on invalid
      new URL(t);
      return t;
    } catch {
      return null;
    }
  }
  // bare domain or youtube id
  if (/^[\w-]{11}$/.test(t)) return `https://www.youtube.com/watch?v=${t}`;
  try {
    const withProto = `https://${t}`;
    new URL(withProto);
    return withProto;
  } catch {
    return null;
  }
}

export function faviconFor(url: string): string {
  try {
    const host = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${host}&sz=64`;
  } catch {
    return '';
  }
}
