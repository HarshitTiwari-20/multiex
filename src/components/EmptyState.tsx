'use client';

import { motion } from 'framer-motion';
import { MonitorPlay, Plus, LayoutTemplate } from 'lucide-react';
import { TEMPLATES } from '@/lib/templates';
import { useDashboard } from '@/store/dashboard';

export function EmptyState({ onAddFirst }: { onAddFirst: () => void }) {
  const { addScreens, setLayout, setDashboardName } = useDashboard();

  const loadTemplate = (idx: number) => {
    const t = TEMPLATES[idx];
    if (!t) return;
    setDashboardName(t.name);
    setLayout(t.layout);
    addScreens(t.screens.map((s) => ({ ...s })));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-6 py-16 text-center"
    >
      <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl border border-border bg-panel">
        <MonitorPlay className="h-10 w-10 text-accent" />
      </div>
      <h1 className="text-3xl font-semibold tracking-tight">Build your live dashboard</h1>
      <p className="mt-2 max-w-md text-muted">
        Combine YouTube live streams, TradingView charts and embed-friendly sites into one control-room wall.
        Many news homepages block embedding — those tiles offer one-click “Open in browser”.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button
          onClick={onAddFirst}
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 font-medium text-black transition hover:brightness-110"
        >
          <Plus className="h-5 w-5" /> Add your first screen
        </button>
        <button
          onClick={() => loadTemplate(0)}
          className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 text-text transition hover:border-accent/60 hover:bg-white/5"
        >
          <LayoutTemplate className="h-5 w-5" /> Start from Morning News
        </button>
      </div>

      <div className="mt-10 grid w-full gap-3 text-left sm:grid-cols-2 lg:grid-cols-3">
        {TEMPLATES.map((t, i) => (
          <button
            key={t.name}
            onClick={() => loadTemplate(i)}
            className="group rounded-2xl border border-border bg-panel p-4 text-left transition hover:border-accent/60 hover:bg-white/[0.03]"
          >
            <div className="text-[15px] font-semibold text-text">{t.name}</div>
            <div className="mt-0.5 text-[13px] text-muted">{t.description}</div>
            <div className="mt-2 text-[12px] font-medium text-accent opacity-0 transition group-hover:opacity-100">
              Load {t.screens.length} screens · {t.layout} →
            </div>
          </button>
        ))}
      </div>
    </motion.div>
  );
}
