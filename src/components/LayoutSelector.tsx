'use client';

import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogTitle, DialogClose } from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { useDashboard, type LayoutKey } from '@/store/dashboard';

const LAYOUTS: LayoutKey[] = ['1x1', '2x1', '2x2', '3x2', '3x3', '4x2', '4x3', '4x4'];

export function LayoutSelector({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { layout, setLayout, screens } = useDashboard();

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="fixed left-1/2 top-1/2 z-50 max-h-[88vh] w-[min(620px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-border bg-panel p-6 shadow-2xl">
        <motion.div initial={{ scale: 0.97, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <div className="mb-1 flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">Choose layout</DialogTitle>
            <DialogClose asChild>
              <button className="rounded-lg p-1 text-muted hover:bg-white/10 hover:text-text" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </DialogClose>
          </div>
          <p className="mb-4 text-sm text-muted">
            Switching layouts never deletes screens. You have {screens.length} now — empty cells show an “add” slot.
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {LAYOUTS.map((l) => {
              const [c, r] = l.split('x').map(Number);
              const active = layout === l;
              const total = c * r;
              const filled = Math.min(screens.length, total);
              return (
                <button
                  key={l}
                  onClick={() => { setLayout(l); onClose(); }}
                  className={`flex flex-col rounded-xl border-2 p-2 transition ${
                    active ? 'border-accent bg-accent/10' : 'border-border hover:border-accent/50 hover:bg-white/[0.02]'
                  }`}
                  aria-pressed={active}
                  title={`${l} grid — ${total} slots`}
                >
                  <div
                    className="grid w-full flex-1 gap-[3px]"
                    style={{
                      gridTemplateColumns: `repeat(${c},1fr)`,
                      gridTemplateRows: `repeat(${r},1fr)`,
                      aspectRatio: `${c} / ${r}`,
                      minHeight: 84,
                    }}
                  >
                    {[...Array(total)].map((_, i) => (
                      <div
                        key={i}
                        className={`min-h-[10px] rounded-[3px] ${i < filled ? (active ? 'bg-accent/60' : 'bg-accent/30') : (active ? 'bg-white/15' : 'bg-white/10')}`}
                      />
                    ))}
                  </div>
                  <div className="mt-1.5 text-center text-xs font-semibold text-text">{l}</div>
                  <div className="text-center text-[11px] text-muted">{total} slots</div>
                </button>
              );
            })}
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
