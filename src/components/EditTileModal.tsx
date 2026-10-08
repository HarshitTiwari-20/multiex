'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose } from '@radix-ui/react-dialog';
import { X, Save, Trash2, AlertCircle } from 'lucide-react';
import { useDashboard } from '@/store/dashboard';
import { normalizeUrl, detectType, detectLive, buildYouTubeEmbed, safeHostname } from '@/lib/youtube';
import {
  isTradingViewWidget, getTradingViewSymbol, withTradingViewSymbol,
  normalizeSymbolInput, shortSymbol, POPULAR_SYMBOLS,
} from '@/lib/tradingview';

export function EditTileModal({ id, onClose }: { id: string | null; onClose: () => void }) {
  const { screens, updateScreen, removeScreen } = useDashboard();
  const screen = screens.find((s) => s.id === id) ?? null;

  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState<'youtube' | 'website' | 'custom'>('website');
  const [live, setLive] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [symbol, setSymbol] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (screen) {
      setUrl(screen.url);
      setName(screen.name);
      setType(screen.type);
      setLive(!!screen.live);
      setPinned(!!screen.pinned);
      setSymbol(getTradingViewSymbol(screen.url));
      setError(null);
    }
  }, [screen?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!screen) return null;

  const tvMode = isTradingViewWidget(url) || isTradingViewWidget(screen.url);
  const normalized = normalizeUrl(url);
  const previewSrc = normalized
    ? type === 'youtube' ? buildYouTubeEmbed(normalized) : normalized
    : 'about:blank';

  const save = () => {
    if (!normalized) { setError('Enter a valid http(s) URL.'); return; }
    let finalUrl = normalized;
    let finalName = name.trim();
    if (tvMode) {
      const norm = normalizeSymbolInput(symbol);
      if (!norm) { setError('Enter a TradingView symbol like AAPL, BTCUSD or NSE:RELIANCE.'); return; }
      finalUrl = withTradingViewSymbol(normalized, norm);
      if (!finalName) finalName = shortSymbol(norm);
    }
    if (!finalName) finalName = safeHostname(finalUrl);
    updateScreen(screen.id, {
      name: finalName,
      url: finalUrl,
      type,
      live: live || detectLive(finalUrl, type),
      pinned,
    });
    onClose();
  };

  return (
    <Dialog open={!!id} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[min(620px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-border bg-panel p-6 shadow-2xl">
        <motion.div initial={{ scale: 0.97, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <div className="mb-1 flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="text-lg font-semibold">Edit screen</DialogTitle>
              <DialogDescription className="mt-0.5 text-sm text-muted">
                Rename, replace the URL, or change pinning. Saving reloads the tile.
              </DialogDescription>
            </div>
            <DialogClose asChild>
              <button className="rounded-lg p-1 text-muted hover:bg-white/10 hover:text-text" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </DialogClose>
          </div>

          <div className="mt-4 space-y-4">
            <div>
              <label className="mb-1 block text-sm text-muted" htmlFor="edit-name">Name</label>
              <input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') save(); }}
                className="w-full rounded-lg border border-border bg-black/30 px-3 py-2 text-text focus:border-accent focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-muted" htmlFor="edit-url">URL</label>
              <input
                id="edit-url"
                value={url}
                onChange={(e) => { setUrl(e.target.value); setError(null); }}
                onKeyDown={(e) => { if (e.key === 'Enter') save(); }}
                spellCheck={false}
                className="w-full rounded-lg border border-border bg-black/30 px-3 py-2 text-text focus:border-accent focus:outline-none"
              />
              {error && <p className="mt-1.5 flex items-center gap-1.5 text-[13px] text-red-400"><AlertCircle className="h-4 w-4" />{error}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm text-muted">Type</label>
              <div className="flex gap-2">
                {(['youtube', 'website', 'custom'] as const).map((t) => (
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
              <button
                onClick={() => { if (normalized) setType(detectType(normalized)); }}
                className="mt-1.5 text-xs text-muted underline-offset-2 hover:text-text hover:underline"
              >
                Auto-detect from URL
              </button>
            </div>
            {tvMode && (
              <div>
                <label className="mb-1 block text-sm text-muted" htmlFor="edit-symbol">
                  Chart symbol — type like a TradingView chart
                </label>
                <input
                  id="edit-symbol"
                  value={symbol}
                  onChange={(e) => { setSymbol(e.target.value.toUpperCase()); setError(null); }}
                  onKeyDown={(e) => { if (e.key === 'Enter') save(); }}
                  placeholder="AAPL, BTCUSD, NSE:RELIANCE…"
                  spellCheck={false}
                  className="w-full rounded-lg border border-border bg-black/30 px-3 py-2 font-mono text-text placeholder:text-muted focus:border-accent focus:outline-none"
                />
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {POPULAR_SYMBOLS.map((p) => (
                    <button
                      key={p.symbol}
                      onClick={() => setSymbol(p.symbol)}
                      className="rounded-full border border-border px-2.5 py-0.5 font-mono text-[12px] text-muted transition hover:border-accent/60 hover:text-text"
                      title={p.symbol}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm text-text">
                <input type="checkbox" checked={live} onChange={(e) => setLive(e.target.checked)} className="accent-[#00b4d8]" />
                LIVE badge
              </label>
              <label className="flex items-center gap-2 text-sm text-text">
                <input type="checkbox" checked={pinned} onChange={(e) => setPinned(e.target.checked)} className="accent-[#00b4d8]" />
                Pin position (lock drag)
              </label>
            </div>
            <div>
              <label className="mb-1 block text-sm text-muted">Preview</label>
              <div className="relative aspect-video overflow-hidden rounded-lg border border-border bg-black">
                {previewSrc === 'about:blank'
                  ? <div className="flex h-full items-center justify-center text-sm text-muted">Enter a URL to preview</div>
                  : <iframe key={previewSrc} src={previewSrc} title="edit-preview" className="h-full w-full border-0"
                      sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals" referrerPolicy="no-referrer-when-downgrade" />}
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between gap-2">
            <button
              onClick={() => { if (confirm(`Remove "${screen.name}"?`)) { removeScreen(screen.id); onClose(); } }}
              className="flex items-center gap-1.5 rounded-lg border border-red-500/30 px-4 py-2 text-sm text-red-400 transition hover:bg-red-500/10"
            >
              <Trash2 className="h-4 w-4" /> Remove
            </button>
            <div className="flex gap-2">
              <DialogClose asChild>
                <button className="rounded-lg border border-border px-4 py-2 text-sm text-muted transition hover:bg-white/5 hover:text-text">Cancel</button>
              </DialogClose>
              <button
                onClick={save}
                className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-black hover:brightness-110"
              >
                <Save className="h-4 w-4" /> Save changes
              </button>
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
