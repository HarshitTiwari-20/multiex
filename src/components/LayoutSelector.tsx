'use client';

import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogTitle, DialogClose } from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { useDashboard, type LayoutKey } from '@/store/dashboard';

const LAYOUTS: LayoutKey[] = ['1x1', '2x1', '2x2', '3x2', '3x3', '4x2', '4x3', '4x4'];

export function LayoutSelector({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { layout, setLayout } = useDashboard();

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="fixed left-1/2 top-1/2 z-50 w-[min(480px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-panel p-6 shadow-2xl">
        <motion.div initial={{ scale: 0.97, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <div className="mb-4 flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">Choose layout</DialogTitle>
            <DialogClose asChild>
              <button className="rounded-lg p-1 text-muted hover:bg-white/10 hover:text-text" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </DialogClose>
          </div>
          <p className="mb-4 text-sm text-muted">Switching layouts never deletes your screens.</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {LAYOUTS.map((l) => {
              const [c, r] = l.split('x').map(Number);
              const active = layout === l;
              return (
                <button
                  key={l}
                  onClick={() => { setLayout(l); onClose(); }}
                  className={`relative aspect-square rounded-xl border-2 p-2 transition ${
                    active ? 'border-accent bg-accent/10' : 'border-border hover:border-accent/50 hover:bg-white/[0.02]'
                  }`}
                  aria-pressed={active}
                  title={`${l} grid`}
                >
                  <div className="grid h-full w-full gap-1" style={{ gridTemplateColumns: `repeat(${c},1fr)`, gridTemplateRows: `repeat(${r},1fr)` }}>
                    {[...Array(c * r)].map((_, i) => (
                      <div key={i} className={`rounded ${active ? 'bg-accent/40' : 'bg-white/10'}`} />
                    ))}
                  </div>
                  <div className="mt-1 text-center text-xs font-semibold text-text">{l}</div>
                </button>
              );
            })}
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
