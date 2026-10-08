'use client';

import { useState } from 'react';
import {
  Plus, LayoutDashboard, FolderOpen, Settings,
  Maximize, RotateCcw, VolumeX, Trash2, Save, Search, Check,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useDashboard } from '@/store/dashboard';

type HeaderProps = {
  onAdd: () => void;
  onLayout: () => void;
  onSaved: () => void;
  onSettings: () => void;
  onFullscreen: () => void;
  onCommand: () => void;
};

function IconBtn({ label, title, onClick, children }: { label: string; title: string; onClick?: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={title}
      className="rounded-lg p-1.5 text-muted transition-colors hover:bg-white/10 hover:text-text"
    >
      {children}
    </button>
  );
}

export function Header({ onAdd, onLayout, onSaved, onSettings, onFullscreen, onCommand }: HeaderProps) {
  const {
    dashboardName, setDashboardName, layout, screens,
    refreshAll, setAudioSolo, activeAudioId, clearAll, saveDashboard,
  } = useDashboard();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(dashboardName);
  const [savedFlash, setSavedFlash] = useState(false);

  const commitName = () => {
    setDashboardName(draft.trim() || 'Untitled');
    setEditing(false);
  };

  const quickSave = () => {
    saveDashboard(dashboardName || 'Untitled');
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1200);
  };

  return (
    <motion.header
      initial={{ y: -56, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed inset-x-0 top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-bg/85 px-4 backdrop-blur"
      role="banner"
    >
      <div className="flex shrink-0 items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/20">
          <LayoutDashboard className="h-5 w-5 text-accent" />
        </div>
        <span className="text-[17px] font-semibold tracking-tight">MultiView</span>
      </div>

      <div className="flex min-w-0 flex-1 items-center gap-2">
        {editing ? (
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitName}
            onKeyDown={(e) => { if (e.key === 'Enter') commitName(); if (e.key === 'Escape') setEditing(false); }}
            className="w-56 rounded-md border border-accent bg-black/40 px-2 py-1 text-sm text-text outline-none"
          />
        ) : (
          <button
            onClick={() => { setDraft(dashboardName); setEditing(true); }}
            className="truncate rounded px-1 text-left text-sm font-medium text-text hover:bg-white/5"
            title="Rename dashboard"
          >
            {dashboardName}
          </button>
        )}
        <span className="hidden shrink-0 rounded-full border border-border px-2 py-0.5 text-[11px] text-muted sm:inline">
          {layout} · {screens.length} screen{screens.length === 1 ? '' : 's'}
        </span>
        {activeAudioId && (
          <span className="hidden shrink-0 rounded-full bg-accent/15 px-2 py-0.5 text-[11px] font-medium text-accent md:inline">
            AUDIO SOLO
          </span>
        )}
      </div>

      <button
        onClick={onCommand}
        className="hidden min-w-0 flex-1 max-w-xs items-center gap-2 rounded-lg border border-border bg-black/30 px-3 py-1.5 text-sm text-muted transition-colors hover:border-accent/50 hover:text-text lg:flex"
        title="Search / command (Ctrl+K)"
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="truncate">Search screens, layouts, actions…</span>
        <kbd className="ml-auto shrink-0 rounded border border-border px-1.5 text-[11px]">⌘K</kbd>
      </button>

      <div className="flex shrink-0 items-center gap-0.5">
        <IconBtn label="Add screen" title="Add screen (Ctrl/⌘+K)" onClick={onAdd}><Plus className="h-4 w-4" /></IconBtn>
        <IconBtn label="Change layout" title="Layout" onClick={onLayout}><LayoutDashboard className="h-4 w-4" /></IconBtn>
        <IconBtn label="Saved dashboards" title="Saved dashboards" onClick={onSaved}><FolderOpen className="h-4 w-4" /></IconBtn>
        <IconBtn label="Refresh all" title="Refresh all tiles" onClick={refreshAll}><RotateCcw className="h-4 w-4" /></IconBtn>
        <IconBtn label="Mute all" title="Mute all audio" onClick={() => setAudioSolo(null)}><VolumeX className="h-4 w-4" /></IconBtn>
        <IconBtn label="Save dashboard" title="Save current dashboard" onClick={quickSave}>
          {savedFlash ? <Check className="h-4 w-4 text-green-400" /> : <Save className="h-4 w-4" />}
        </IconBtn>
        <IconBtn label="Clear all" title="Remove all screens" onClick={() => { if (screens.length && confirm(`Remove all ${screens.length} screens?`)) clearAll(); }}>
          <Trash2 className="h-4 w-4" />
        </IconBtn>
        <IconBtn label="Settings" title="Settings" onClick={onSettings}><Settings className="h-4 w-4" /></IconBtn>
        <IconBtn label="Fullscreen" title="Fullscreen app" onClick={onFullscreen}><Maximize className="h-4 w-4" /></IconBtn>
      </div>
    </motion.header>
  );
}
