'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogTitle, DialogClose } from '@radix-ui/react-dialog';
import { X, FolderOpen, Copy, Pencil, Trash2, LayoutDashboard, Save } from 'lucide-react';
import { useDashboard } from '@/store/dashboard';

export function SavedDashboardsPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const {
    savedDashboards, loadDashboard, deleteDashboard,
    renameDashboard, duplicateDashboard, saveDashboard, dashboardName, screens, layout,
  } = useDashboard();
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [saveName, setSaveName] = useState('');

  const commitRename = (oldName: string) => {
    renameDashboard(oldName, draft);
    setEditing(null);
  };

  const quickSave = () => {
    const n = (saveName || dashboardName || 'Untitled').trim();
    if (!n) return;
    saveDashboard(n);
    setSaveName('');
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="fixed left-1/2 top-1/2 z-50 max-h-[86vh] w-[min(860px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-border bg-panel p-6 shadow-2xl">
        <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <div className="mb-1 flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">Saved dashboards</DialogTitle>
            <DialogClose asChild>
              <button className="rounded-lg p-1 text-muted hover:bg-white/10 hover:text-text" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </DialogClose>
          </div>

          <div className="mt-3 flex flex-col gap-2 rounded-xl border border-border bg-black/25 p-3 sm:flex-row">
            <input
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') quickSave(); }}
              placeholder={`Save current: ${dashboardName} (${screens.length} screens · ${layout})`}
              className="flex-1 rounded-lg border border-border bg-black/30 px-3 py-2 text-sm text-text placeholder:text-muted focus:border-accent focus:outline-none"
            />
            <button
              onClick={quickSave}
              className="flex items-center justify-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-black hover:brightness-110"
            >
              <Save className="h-4 w-4" /> Save
            </button>
          </div>

          {savedDashboards.length === 0 ? (
            <div className="mt-8 text-center text-muted">
              <LayoutDashboard className="mx-auto mb-3 h-12 w-12 opacity-30" />
              <p className="text-sm">No saved dashboards yet. Save the current wall above to reuse it later.</p>
            </div>
          ) : (
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[...savedDashboards].sort((a, b) => b.updatedAt - a.updatedAt).map((d) => (
                <div key={d.name} className="flex flex-col rounded-xl border border-border bg-black/25 p-4">
                  <div className="flex items-start justify-between gap-2">
                    {editing === d.name ? (
                      <input
                        autoFocus
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        onBlur={() => commitRename(d.name)}
                        onKeyDown={(e) => { if (e.key === 'Enter') commitRename(d.name); if (e.key === 'Escape') setEditing(null); }}
                        className="min-w-0 flex-1 rounded border border-accent bg-black/40 px-2 py-1 text-sm text-text outline-none"
                      />
                    ) : (
                      <h3 className="min-w-0 flex-1 truncate font-medium">{d.name}</h3>
                    )}
                    <div className="flex shrink-0 items-center">
                      <button onClick={() => { setEditing(d.name); setDraft(d.name); }} className="rounded p-1 text-muted hover:bg-white/10 hover:text-text" title="Rename"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => duplicateDashboard(d.name)} className="rounded p-1 text-muted hover:bg-white/10 hover:text-text" title="Duplicate"><Copy className="h-4 w-4" /></button>
                      <button onClick={() => { if (confirm(`Delete "${d.name}"?`)) deleteDashboard(d.name); }} className="rounded p-1 text-red-400 hover:bg-red-400/10" title="Delete"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                  <p className="mt-1 text-[13px] text-muted">
                    {d.screens.length} screens · {d.layout} · {new Date(d.updatedAt).toLocaleDateString()}
                  </p>
                  <div className="relative mt-2 aspect-video overflow-hidden rounded-lg border border-border/60 bg-black/40">
                    <div className="absolute inset-0 grid gap-0.5 p-1" style={{
                      gridTemplateColumns: `repeat(${d.layout.split('x')[0]},1fr)`,
                      gridTemplateRows: `repeat(${d.layout.split('x')[1]},1fr)`,
                    }}>
                      {d.screens.slice(0, 16).map((s) => (
                        <div key={s.id} className="rounded bg-white/10" title={s.name} />
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => { loadDashboard(d.name); onClose(); }}
                    className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-accent/15 px-3 py-1.5 text-sm font-medium text-accent transition hover:bg-accent/25"
                  >
                    <FolderOpen className="h-4 w-4" /> Open
                  </button>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
