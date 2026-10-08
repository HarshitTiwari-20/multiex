'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Volume2, VolumeX, Play, Pause, RotateCcw, ExternalLink } from 'lucide-react';
import { buildYouTubeEmbed } from '@/lib/youtube';
import { useDashboard, type Screen } from '@/store/dashboard';

export function FullscreenView({ screen, onExit }: { screen: Screen; onExit: () => void }) {
  const { updateScreen, setAudioSolo, refreshScreen } = useDashboard();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [playing, setPlaying] = useState(false);

  const src = useMemo(() => {
    const base = screen.type === 'youtube' ? buildYouTubeEmbed(screen.url) : screen.url;
    return screen.refreshNonce ? `${base}${base.includes('?') ? '&' : '?'}mv=${screen.refreshNonce}` : base;
  }, [screen.url, screen.type, screen.refreshNonce]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onExit(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onExit]);

  const sendYT = useCallback((func: string) => {
    iframeRef.current?.contentWindow?.postMessage(JSON.stringify({ event: 'command', func, args: [] }), '*');
  }, []);

  const muted = screen.muted ?? true;
  const toggleMute = () => {
    const next = !muted;
    updateScreen(screen.id, { muted: next });
    if (screen.type === 'youtube') sendYT(next ? 'mute' : 'unMute');
    if (!next) setAudioSolo(screen.id);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex flex-col bg-bg">
      <div className="flex h-12 shrink-0 items-center gap-2 border-b border-border bg-black/40 px-3">
        <button onClick={onExit} className="rounded-lg p-1.5 text-muted hover:bg-white/10 hover:text-text" aria-label="Back to grid" title="Back (Esc)">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h2 className="min-w-0 flex-1 truncate font-medium">{screen.name}</h2>
        <span className="hidden text-xs text-muted sm:inline">{screen.url}</span>
        <div className="flex items-center gap-1">
          {screen.type === 'youtube' && (
            <>
              <button onClick={toggleMute} className="rounded-lg p-1.5 text-muted hover:bg-white/10 hover:text-text" title={muted ? 'Unmute' : 'Mute'}>
                {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>
              <button
                onClick={() => { setPlaying((p) => !p); sendYT(playing ? 'pauseVideo' : 'playVideo'); }}
                className="rounded-lg p-1.5 text-muted hover:bg-white/10 hover:text-text" title="Play/Pause"
              >
                {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </button>
            </>
          )}
          <button onClick={() => refreshScreen(screen.id)} className="rounded-lg p-1.5 text-muted hover:bg-white/10 hover:text-text" title="Refresh">
            <RotateCcw className="h-4 w-4" />
          </button>
          <a href={screen.url} target="_blank" rel="noopener noreferrer" className="rounded-lg p-1.5 text-muted hover:bg-white/10 hover:text-text" title="Open in browser">
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
      <iframe
        ref={iframeRef}
        key={src}
        src={src}
        title={screen.name}
        className="h-full w-full flex-1 border-0 bg-black"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation allow-modals allow-downloads"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </motion.div>
  );
}
