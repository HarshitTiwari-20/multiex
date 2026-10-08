'use client';

import { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@radix-ui/react-dialog';
import { Search, Plus, LayoutDashboard, RefreshCw, VolumeX, Trash2, FolderOpen } from 'lucide-react';
import { useDashboard } from '@/store/dashboard';
import { TEMPLATES } from '@/lib/templates';

type Props = {
  open: boolean;
  onClose: () => void;
  onAdd: () => void;
  onLayout: () => void;
  onSaved: () => void;
  onFullscreen: () => void;
};

export function CommandPalette({ open, onClose, onAdd, onLayout, onSaved, onFullscreen }: Props) {
  const { screens, setFocused, setLayout, refreshAll, setAudioSolo, clearAll, loadDashboard, addScreens, setDashboardName, savedDashboards } = useDashboard();
  const [q, setQ] = useState('');

  useEffect(() => { if (!open) setQ(''); }, [open ]);

  const screenHits = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return screens.slice(0, 5);
    return screens.filter((s) => `${s.name} ${s.url}`.toLowerCase().includes(t)).slice(0, 6);
  }, [q, screens]);

  const templateHits = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return TEMPLATES.slice(0, 3);
    return TEMPLATES.filter((x) => `${x.name} ${x.description}`.toLowerCase().includes(t)).slice(0, 3);
  }, [q]);

  const run = (fn: () => void) => { fn(); onClose(); };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="fixed left-1/2 top-[14vh] z-50 w-[min(620px,calc(100vw-2rem))] -translate-x-1/2 overflow-hidden rounded-2xl border border-border bg-panel shadow-2xl">
        <DialogTitle className="sr-only">Command palette</DialogTitle>
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <Search className="h-4 w-4 shrink-0 text-muted" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Type a command, screen, or template…"
            className="w-full bg-transparent text-sm text-text placeholder:text-muted focus:outline-none"
          />
          <kbd className="rounded border border-border px-1.5 text-[11px] text-muted">esc</kbd>
        </div>
        <div className="max-h-[50vh] overflow-y-auto p-2">
          <p className="px-2 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-muted">Actions</p>
          {[
            { icon: <Plus className="h-4 w-4" />, label: 'Add screen', fn: onAdd },
            { icon: <LayoutDashboard className="h-4 w-4" />, label: 'Change layout', fn: onLayout },
            { icon: <FolderOpen className="h-4 w-4" />, label: 'Saved dashboards', fn: onSaved },
            { icon: <RefreshCw className="h-4 w-4" />, label: 'Refresh all tiles', fn: refreshAll },
            { icon: <VolumeX className="h-4 w-4" />, label: 'Mute all', fn: () => setAudioSolo(null) },
            { icon: <Trash2 className="h-4 w-4" />, label: 'Remove all screens', fn: () => { if (confirm('Remove all screens?')) clearAll(); } },
          ].map((a) => (
            <button key={a.label} onClick={() => run(a.fn)} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-text hover:bg-white/5">
              <span className="text-muted">{a.icon}</span>{a.label}
            </button>
          ))}

          {!!screenHits.length && (
            <>
              <p className="px-2 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wide text-muted">Screens</p>
              {screenHits.map((s) => (
                <button key={s.id} onClick={() => run(() => { setFocused(s.id); onFullscreen(); })} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm hover:bg-white/5">
                  <span className="min-w-0 flex-1 truncate text-text">{s.name}</span>
                  <span className="max-w-[220px] truncate text-xs text-muted">{s.url}</span>
                </button>
              ))}
            </>
          )}

          {!!templateHits.length && (
            <>
              <p className="px-2 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wide text-muted">Templates</p>
              {templateHits.map((t) => (
                <button
                  key={t.name}
                  onClick={() => run(() => { setDashboardName(t.name); setLayout(t.layout); addScreens(t.screens.map((s) => ({ ...s }))); })}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm hover:bg-white/5"
                >
                  <span className="min-w-0 flex-1 truncate text-text">{t.name}</span>
                  <span className="text-xs text-muted">{t.screens.length} · {t.layout}</span>
                </button>
              ))}
            </>
          )}

          {!!savedDashboards.length && (
            <>
              <p className="px-2 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wide text-muted">Saved</p>
              {savedDashboards.filter((d) => !q || d.name.toLowerCase().includes(q.toLowerCase())).slice(0, 4).map((d) => (
                <button key={d.name} onClick={() => run(() => loadDashboard(d.name))} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm hover:bg-white/5">
                  <span className="min-w-0 flex-1 truncate text-text">{d.name}</span>
                  <span className="text-xs text-muted">{d.screens.length} screens</span>
                </button>
              ))}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
