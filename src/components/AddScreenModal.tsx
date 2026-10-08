'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose,
} from '@radix-ui/react-dialog';
import { Check, AlertCircle, X } from 'lucide-react';
import { useDashboard } from '@/store/dashboard';
import { buildYouTubeEmbed, detectLive, detectType, normalizeUrl, safeHostname } from '@/lib/youtube';

const PRESETS = [
  { name: 'DW News Live', url: 'https://www.youtube.com/watch?v=Nq2wYlWFucg' },
  { name: 'Al Jazeera Live', url: 'https://www.youtube.com/watch?v=gCNeDWCI0vo' },
  { name: 'BTC Chart', url: 'https://www.tradingview.com/widgetembed/?frameElementId=tv_btc&symbol=BITSTAMP%3ABTCUSD&interval=15&theme=dark' },
  { name: 'S&P 500', url: 'https://www.tradingview.com/widgetembed/?frameElementId=tv_spx&symbol=SP%3ASPX&interval=D&theme=dark' },
  { name: 'Hacker News', url: 'https://news.ycombinator.com' },
  { name: 'BBC News', url: 'https://www.bbc.com/news' },
  { name: 'Reuters', url: 'https://www.reuters.com' },
];

export function AddScreenModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addScreen } = useDashboard();
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState<'youtube' | 'website' | 'custom' | 'auto'>('auto');
  const [error, setError] = useState<string | null>(null);

  const normalized = useMemo(() => normalizeUrl(url), [url]);
  const effectiveType = useMemo(
    () => (type === 'auto' ? (normalized ? detectType(normalized) : 'website') : type),
    [type, normalized]
  );
  const previewSrc = useMemo(() => {
    if (!normalized) return 'about:blank';
    return effectiveType === 'youtube' ? buildYouTubeEmbed(normalized) : normalized;
  }, [normalized, effectiveType]);

  useEffect(() => {
    if (!open) { setUrl(''); setName(''); setType('auto'); setError(null); }
  }, [open ]);

  // auto-suggest type + name as user types
  useEffect(() => {
    if (normalized && type === 'auto' && !name) {
      // don't overwrite typed name; only placeholder handles it
    }
  }, [normalized, type, name]);

  const handleAdd = () => {
    if (!normalized) { setError('Enter a valid http(s) URL, bare domain, or YouTube video ID.'); return; }
    if (effectiveType === 'youtube' && previewSrc === 'about:blank') {
      setError('That YouTube URL has no valid 11-character video ID.');
      return;
    }
    addScreen({
      name: name.trim() || safeHostname(normalized),
      url: normalized,
      type: effectiveType,
      live: detectLive(normalized, effectiveType),
      muted: true,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[min(680px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-border bg-panel p-6 shadow-2xl">
        <motion.div initial={{ scale: 0.97, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <div className="mb-1 flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="text-xl font-semibold">Add a screen</DialogTitle>
              <DialogDescription className="mt-1 text-sm text-muted">
                Paste a YouTube or website URL. Type is auto-detected; many news sites block embedding and will show an “Open in browser” card.
              </DialogDescription>
            </div>
            <DialogClose asChild>
              <button className="rounded-lg p-1 text-muted hover:bg-white/10 hover:text-text" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </DialogClose>
          </div>

          <div className="mt-5 space-y-4">
            <div>
              <label className="mb-1 block text-sm text-muted" htmlFor="mv-url">URL</label>
              <input
                id="mv-url"
                autoFocus
                value={url}
                onChange={(e) => { setUrl(e.target.value); setError(null); }}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
                placeholder="Paste a YouTube URL or website URL…"
                spellCheck={false}
                className="w-full rounded-lg border border-border bg-black/30 px-3 py-2 text-text placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
              />
              {error ? (
                <p className="mt-1.5 flex items-center gap-1.5 text-[13px] text-red-400"><AlertCircle className="h-4 w-4" />{error}</p>
              ) : normalized ? (
                <p className="mt-1.5 text-[13px] text-muted">
                  Detected: <span className="font-medium text-text">{effectiveType}</span> · {safeHostname(normalized)}
                  {effectiveType === 'youtube' && previewSrc === 'about:blank' && ' · invalid video id'}
                </p>
              ) : null}
            </div>

            <div>
              <label className="mb-1 block text-sm text-muted" htmlFor="mv-name">Screen name (optional)</label>
              <input
                id="mv-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
                placeholder={normalized ? safeHostname(normalized) : 'Optional screen name'}
                className="w-full rounded-lg border border-border bg-black/30 px-3 py-2 text-text placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-muted">Type</label>
              <div className="flex gap-2">
                {(['auto', 'youtube', 'website', 'custom'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setType(t)}
                    className={`flex-1 rounded-lg py-2 text-sm font-medium capitalize transition ${
                      type === t ? 'border border-accent bg-accent/20 text-accent' : 'border border-border bg-black/20 text-muted hover:text-text'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm text-muted">Popular sources</label>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((p) => (
                  <button
                    key={p.name}
                    onClick={() => { setUrl(p.url); setName(p.name); setType('auto'); setError(null); }}
                    className="rounded-lg border border-border bg-black/20 px-3 py-1.5 text-sm text-muted transition hover:border-accent/60 hover:text-text"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm text-muted">Preview</label>
              <div className="relative aspect-video overflow-hidden rounded-lg border border-border bg-black">
                {previewSrc === 'about:blank' ? (
                  <div className="flex h-full items-center justify-center text-sm text-muted">Enter a URL to preview</div>
                ) : (
                  <iframe
                    key={previewSrc}
                    src={previewSrc}
                    title="preview"
                    className="h-full w-full border-0"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <DialogClose asChild>
              <button className="rounded-lg border border-border px-4 py-2 text-muted transition hover:bg-white/5 hover:text-text">Cancel</button>
            </DialogClose>
            <button
              onClick={handleAdd}
              disabled={!normalized}
              className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 font-medium text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Check className="h-4 w-4" /> Add screen
            </button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}

