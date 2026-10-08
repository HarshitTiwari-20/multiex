'use client';

import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@radix-ui/react-dropdown-menu';
import {
  GripVertical,
  ExternalLink,
  Maximize,
  RotateCcw,
  X,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Loader2,
  ChevronDown,
  Pin,
  PinOff,
  Copy,
  ArrowLeftRight,
  Pencil,
  Search,
} from 'lucide-react';
import { useDashboard, type Screen } from '@/store/dashboard';
import { TileSkeleton } from './TileSkeleton';
import { TileError } from './TileError';
import { buildYouTubeEmbed } from '@/lib/youtube';
import {
  isTradingViewWidget, getTradingViewSymbol, withTradingViewSymbol,
  normalizeSymbolInput, shortSymbol,
} from '@/lib/tradingview';
import { SymbolSearchBox } from './SymbolSearchBox';

type TileProps = {
  screen: Screen;
  selected: boolean;
  showHeaderAlways: boolean;
  borderRadius: number;
  onFullscreen: (id: string) => void;
  onSelect: (id: string) => void;
  onEdit: (id: string) => void;
};

function TileInner({ screen, selected, showHeaderAlways, borderRadius, onFullscreen, onSelect, onEdit }: TileProps) {
  const {
    removeScreen, updateScreen, duplicateScreen, refreshScreen,
    activeAudioId, setAudioSolo, focusedId,
  } = useDashboard();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [playing, setPlaying] = useState(false);
  const loadTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const src = useMemo(() => {
    const base = screen.type === 'youtube'
      ? buildYouTubeEmbed(screen.url, { muted: screen.muted !== false })
      : screen.url;
    if (screen.refreshNonce) {
      return `${base}${base.includes('?') ? '&' : '?'}mv=${screen.refreshNonce}`;
    }
    return base;
  }, [screen.url, screen.type, screen.muted, screen.refreshNonce]);

  // reset to loading whenever src changes; iframe stays mounted so onLoad fires
  useEffect(() => {
    setStatus('loading');
    if (loadTimer.current) clearTimeout(loadTimer.current);
    loadTimer.current = setTimeout(() => {
      setStatus((s) => (s === 'loading' ? 'error' : s));
    }, 20000);
    return () => { if (loadTimer.current) clearTimeout(loadTimer.current); };
  }, [src]);

  const handleLoad = useCallback(() => {
    if (loadTimer.current) clearTimeout(loadTimer.current);
    // iframe load fires even for X-Frame-Options blocks in some browsers (empty doc).
    // We optimistically mark ready; user can still retry / open externally.
    setStatus('ready');
  }, []);

  const sendYT = useCallback((func: string) => {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: 'command', func, args: [] }), '*'
    );
  }, []);

  const toggleMute = useCallback(() => {
    const next = !(screen.muted ?? true);
    updateScreen(screen.id, { muted: next });
    if (screen.type === 'youtube') sendYT(next ? 'mute' : 'unMute');
    if (!next) setAudioSolo(screen.id);
  }, [screen.muted, screen.id, screen.type, sendYT, setAudioSolo, updateScreen]);

  const togglePlay = useCallback(() => {
    setPlaying((p) => {
      if (screen.type === 'youtube') sendYT(p ? 'pauseVideo' : 'playVideo');
      return !p;
    });
  }, [screen.type, sendYT]);

  const refresh = useCallback(() => refreshScreen(screen.id), [refreshScreen, screen.id]);
  const openExternal = useCallback(() => window.open(screen.url, '_blank', 'noopener,noreferrer'), [screen.url]);

  const tryPiP = useCallback(async () => {
    try {
      const iframe = iframeRef.current as HTMLIFrameElement & { requestPictureInPicture?: () => Promise<void> };
      if (iframe?.requestPictureInPicture) await iframe.requestPictureInPicture();
      else openExternal();
    } catch { openExternal(); }
  }, [openExternal]);

  const isSolo = activeAudioId === screen.id;
  const muted = screen.muted ?? true;

  const isTV = useMemo(() => isTradingViewWidget(screen.url), [screen.url]);
  const currentSymbol = useMemo(() => getTradingViewSymbol(screen.url), [screen.url]);
  const [symDraft, setSymDraft] = useState(currentSymbol);
  const [symError, setSymError] = useState<string | null>(null);
  const [symOpen, setSymOpen] = useState(false);
  const symInputRef = useRef<HTMLInputElement>(null);

  // While a tile is NOT selected the draft mirrors the loaded symbol.
  // Once selected, the box clears so typing starts fresh (appending to
  // "BITSTAMP:BTCUSD" would produce garbage like "BITSTAMP:BTCUSDAAPL").
  useEffect(() => {
    if (!selected) { setSymDraft(currentSymbol); setSymError(null); }
  }, [currentSymbol, selected]);
  // selecting a TV tile opens a fresh, empty symbol box
  useEffect(() => {
    if (isTV && selected) { setSymOpen(true); setSymDraft(''); setSymError(null); }
  }, [isTV, selected]);

  const applySymbol = useCallback((raw: string) => {
    const norm = normalizeSymbolInput(raw);
    if (!norm) { setSymError('Type a symbol like AAPL, BTCUSD or NSE:RELIANCE'); return; }
    const nextUrl = withTradingViewSymbol(screen.url, norm);
    updateScreen(screen.id, { url: nextUrl, name: shortSymbol(norm) || screen.name });
    setSymError(null);
    setSymDraft(''); // keep box fresh for the next symbol
    setSymOpen(false); // hide once the chart starts loading the named stock
    symInputRef.current?.blur();
  }, [screen.url, screen.id, screen.name, updateScreen]);

  // Just-type search: when THIS TradingView tile is selected, printable keys
  // go straight into the symbol box (capture phase beats global shortcuts).
  useEffect(() => {
    if (!isTV || !selected) return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const tag = t?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || t?.isContentEditable) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'Enter') {
        if (symOpen && symDraft.trim()) { e.preventDefault(); e.stopPropagation(); applySymbol(symDraft); }
        return;
      }
      if (e.key === 'Escape') { setSymOpen(false); return; }
      if (e.key === 'Backspace') {
        if (symOpen && symDraft) {
          e.preventDefault(); e.stopPropagation();
          setSymDraft((d) => d.slice(0, -1));
          requestAnimationFrame(() => symInputRef.current?.focus());
        }
        return;
      }
      if (e.key.length === 1 && /[a-zA-Z0-9:.~_-]/.test(e.key)) {
        e.preventDefault(); e.stopPropagation();
        setSymOpen(true);
        setSymError(null);
        setSymDraft((d) => (d + e.key).toUpperCase().slice(0, 30));
        requestAnimationFrame(() => symInputRef.current?.focus());
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [isTV, selected, symOpen, symDraft, applySymbol]);

  return (
    <motion.div
      onClick={() => onSelect(screen.id)}
      className={[
        'group relative flex h-full w-full flex-col overflow-hidden bg-panel transition-shadow',
        selected ? 'ring-2 ring-accent' : 'ring-1 ring-border',
      ].join(' ')}
      style={{ borderRadius }}
      whileHover={{ y: -1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
      layout={false}
    >
      {/* header */}
      <div
        className={[
          'absolute inset-x-0 top-0 z-10 flex items-center gap-1.5 px-2 py-1.5',
          'bg-gradient-to-b from-black/85 to-transparent transition-opacity duration-150',
          showHeaderAlways || selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 hover:opacity-100 focus-within:opacity-100',
        ].join(' ')}
        role="toolbar"
        aria-label={`Controls for ${screen.name}`}
      >
        <span
          className="drag-handle flex shrink-0 cursor-grab touch-none select-none p-1 text-muted hover:text-text active:cursor-grabbing"
          title="Drag to move · drop on another tile to swap"
          aria-label="Drag to reorder"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-4 w-4" />
        </span>

        {screen.live && (
          <span className="flex items-center gap-1 rounded-full bg-red-600/90 px-2 py-0.5 text-[11px] font-semibold text-white">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
            LIVE
          </span>
        )}
        {isSolo && !muted && (
          <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[11px] font-semibold text-accent" title="Audio solo">
            AUDIO
          </span>
        )}
        {screen.pinned && <Pin className="h-3.5 w-3.5 text-accent" aria-label="Pinned" />}

        <div className="min-w-0 flex-1 truncate text-[13px] font-medium text-text" title={screen.name}>
          {screen.name}
        </div>

        <div className="flex shrink-0 items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
          {screen.type === 'youtube' && (
            <>
              <button onClick={toggleMute} className="tile-btn" aria-label={muted ? 'Unmute (solo audio)' : 'Mute'} title={muted ? 'Unmute + solo audio' : 'Mute'}>
                {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>
              <button onClick={togglePlay} className="tile-btn" aria-label={playing ? 'Pause' : 'Play'} title={playing ? 'Pause' : 'Play'}>
                {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </button>
            </>
          )}
          {isTV && (
            <button
              onClick={() => {
                onSelect(screen.id);
                setSymOpen(true);
                setSymDraft('');
                setSymError(null);
                requestAnimationFrame(() => symInputRef.current?.focus());
              }}
              className="tile-btn"
              aria-label="Change symbol"
              title="Change stock / crypto symbol"
            >
              <Search className="h-4 w-4" />
            </button>
          )}
          <button onClick={refresh} disabled={status === 'loading'} className="tile-btn" aria-label="Refresh" title="Refresh (R)">
            {status === 'loading' ? <Loader2 className="h-4 w-4 animate-spin text-accent" /> : <RotateCcw className="h-4 w-4" />}
          </button>
          <button onClick={openExternal} className="tile-btn" aria-label="Open externally" title="Open in browser">
            <ExternalLink className="h-4 w-4" />
          </button>
          <button onClick={() => onFullscreen(screen.id)} className="tile-btn" aria-label="Fullscreen" title="Fullscreen (F)">
            <Maximize className="h-4 w-4" />
          </button>
          <button onClick={() => onEdit(screen.id)} className="tile-btn" aria-label="Edit screen" title="Edit name / URL">
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => { if (confirm(`Remove "${screen.name}"?`)) removeScreen(screen.id); }}
            className="tile-btn tile-btn-danger"
            aria-label="Remove screen"
            title="Remove (Del)"
          >
            <X className="h-4 w-4" />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="tile-btn" aria-label="More options" title="More">
                <ChevronDown className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="bottom" align="end" className="z-50 min-w-[170px] rounded-xl border border-border bg-panel p-1 shadow-xl">
              <DropdownMenuItem onClick={refresh} className="dd-item"><RotateCcw className="h-4 w-4" /> Refresh</DropdownMenuItem>
              {isTV && (
                <DropdownMenuItem onClick={() => { onSelect(screen.id); setSymOpen(true); }} className="dd-item">
                  <Search className="h-4 w-4" /> Change symbol…
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => updateScreen(screen.id, { pinned: !screen.pinned })} className="dd-item">
                {screen.pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />} {screen.pinned ? 'Unpin' : 'Pin position'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => duplicateScreen(screen.id)} className="dd-item"><Copy className="h-4 w-4" /> Duplicate</DropdownMenuItem>
              <DropdownMenuItem onClick={tryPiP} className="dd-item"><ArrowLeftRight className="h-4 w-4" /> Picture-in-picture / popout</DropdownMenuItem>
              <DropdownMenuItem onClick={openExternal} className="dd-item"><ExternalLink className="h-4 w-4" /> Open in browser</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(screen.id)} className="dd-item"><Pencil className="h-4 w-4" /> Edit…</DropdownMenuItem>
              <DropdownMenuSeparator className="my-1 h-px bg-border" />
              <DropdownMenuItem onClick={() => removeScreen(screen.id)} className="dd-item-danger"><X className="h-4 w-4" /> Remove (Del)</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* TradingView symbol search — type "btc" → all BTC contracts, like TV */}
      {isTV && symOpen && (
        <div
          className="absolute inset-x-2 top-11 z-10 rounded-xl border border-border bg-black/85 p-2 shadow-xl backdrop-blur"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <SymbolSearchBox
            ref={symInputRef}
            value={symDraft}
            onChange={(v) => { setSymDraft(v); setSymError(null); }}
            onPick={(symbol) => applySymbol(symbol)}
            onEscape={() => { setSymOpen(false); symInputRef.current?.blur(); }}
            currentSymbol={currentSymbol}
            error={symError}
            autoFocus={selected}
          />
        </div>
      )}

      {/* body — iframe always mounted so load events work */}
      <div className="relative h-full w-full flex-1 bg-black/40">
        {/* First click selects the tile (iframes swallow clicks, so without
            this a chart tile can never become selected). After selecting,
            clicks pass through to the chart. */}
        {!selected && (
          <button
            aria-label={`Select ${screen.name}`}
            title="Click to select — then just type a symbol"
            onClick={(e) => { e.stopPropagation(); onSelect(screen.id); }}
            className="absolute inset-0 z-[5] cursor-pointer bg-transparent"
          />
        )}
        <iframe
          ref={iframeRef}
          key={src}
          src={src}
          title={screen.name}
          onLoad={handleLoad}
          className="h-full w-full border-0 bg-black"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation allow-modals allow-downloads"
          referrerPolicy="no-referrer-when-downgrade"
          loading="lazy"
        />
        {status === 'loading' && (
          <div className="pointer-events-none absolute inset-0">
            <TileSkeleton />
          </div>
        )}
        {status === 'error' && (
          <div className="absolute inset-0 bg-panel">
            <TileError screen={screen} onRetry={refresh} onOpenExternal={openExternal} />
          </div>
        )}
      </div>

      <style jsx>{`
        .tile-btn { @apply rounded-lg bg-black/55 p-1.5 text-muted transition-colors hover:bg-black/80 hover:text-text disabled:opacity-50; }
        .tile-btn-danger { @apply hover:bg-red-500/25 hover:text-red-300; }
        .dd-item { @apply flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-text hover:bg-accent/10 focus:bg-accent/10 focus:outline-none; }
        .dd-item-danger { @apply flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-red-400 hover:bg-red-400/10 focus:bg-red-400/10 focus:outline-none; }
      `}</style>
    </motion.div>
  );
}

export const Tile = memo(TileInner);
