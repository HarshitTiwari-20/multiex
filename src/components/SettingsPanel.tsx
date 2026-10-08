'use client';

import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogTitle, DialogClose } from '@radix-ui/react-dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@radix-ui/react-tabs';
import { X } from 'lucide-react';
import { useDashboard } from '@/store/dashboard';

const ACCENTS = ['#00b4d8', '#3b82f6', '#22c55e', '#a855f7', '#f59e0b', '#ef4444', '#e879f9'];

export function SettingsPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { settings, setSettings } = useDashboard();

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="fixed left-1/2 top-1/2 z-50 w-[min(460px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-panel p-6 shadow-2xl">
        <motion.div initial={{ scale: 0.97, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <div className="mb-2 flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">Settings</DialogTitle>
            <DialogClose asChild>
              <button className="rounded-lg p-1 text-muted hover:bg-white/10 hover:text-text" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </DialogClose>
          </div>

          <Tabs defaultValue="general">
            <TabsList className="mb-4 grid w-full grid-cols-3 rounded-lg bg-black/30 p-1">
              <TabsTrigger value="general" className="rounded-md px-2 py-1.5 text-sm data-[state=active]:bg-white/10 data-[state=active]:text-text">General</TabsTrigger>
              <TabsTrigger value="appearance" className="rounded-md px-2 py-1.5 text-sm data-[state=active]:bg-white/10 data-[state=active]:text-text">Appearance</TabsTrigger>
              <TabsTrigger value="shortcuts" className="rounded-md px-2 py-1.5 text-sm data-[state=active]:bg-white/10 data-[state=active]:text-text">Shortcuts</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
              <div>
                <label className="mb-1 block text-sm text-muted">Tile spacing ({settings.gap}px)</label>
                <input type="range" min={0} max={32} step={2} value={settings.gap}
                  onChange={(e) => setSettings({ gap: Number(e.target.value) })}
                  className="w-full accent-[#00b4d8]" />
              </div>
              <div>
                <label className="mb-1 block text-sm text-muted">Auto-refresh idle tiles</label>
                <select
                  value={settings.autoRefreshSec}
                  onChange={(e) => setSettings({ autoRefreshSec: Number(e.target.value) })}
                  className="w-full rounded-lg border border-border bg-black/30 px-3 py-2 text-sm text-text focus:border-accent focus:outline-none"
                >
                  <option value={0}>Off</option>
                  <option value={60}>Every 1 min</option>
                  <option value={300}>Every 5 min</option>
                  <option value={900}>Every 15 min</option>
                  <option value={1800}>Every 30 min</option>
                </select>
              </div>
              <label className="flex items-center gap-2 text-sm text-text">
                <input type="checkbox" checked={settings.compact} onChange={(e) => setSettings({ compact: e.target.checked })} className="accent-[#00b4d8]" />
                Compact row height
              </label>
              <p className="text-xs text-muted">Dashboard state auto-saves locally on every change.</p>
            </TabsContent>

            <TabsContent value="appearance" className="space-y-4">
              <div>
                <label className="mb-1 block text-sm text-muted">Corner radius ({settings.radius}px)</label>
                <input type="range" min={0} max={28} step={2} value={settings.radius}
                  onChange={(e) => setSettings({ radius: Number(e.target.value) })}
                  className="w-full accent-[#00b4d8]" />
              </div>
              <label className="flex items-center gap-2 text-sm text-text">
                <input type="checkbox" checked={settings.showHeaders} onChange={(e) => setSettings({ showHeaders: e.target.checked })} className="accent-[#00b4d8]" />
                Always show tile headers (otherwise hover to reveal)
              </label>
              <div>
                <label className="mb-2 block text-sm text-muted">Accent color</label>
                <div className="flex gap-2">
                  {ACCENTS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setSettings({ accent: c })}
                      className={`h-8 w-8 rounded-full border-2 ${settings.accent === c ? 'border-white' : 'border-transparent'}`}
                      style={{ background: c }}
                      aria-label={`Accent ${c}`}
                      title={c}
                    />
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="shortcuts" className="space-y-2 text-sm">
              {[
                ['Ctrl/⌘ + K', 'Command / add screen'],
                ['N', 'New screen'],
                ['F', 'Fullscreen focused tile'],
                ['R', 'Refresh focused tile'],
                ['M', 'Mute all'],
                ['Del', 'Remove focused tile'],
                ['Esc', 'Exit fullscreen / blur input'],
              ].map(([k, label]) => (
                <div key={k} className="flex items-center justify-between text-muted">
                  <kbd className="rounded border border-border bg-black/40 px-1.5 py-0.5 font-mono text-[12px] text-text">{k}</kbd>
                  <span>{label}</span>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
