'use client';

import { useCallback, useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { Grid } from '@/components/Grid';
import { AddScreenModal } from '@/components/AddScreenModal';
import { LayoutSelector } from '@/components/LayoutSelector';
import { SavedDashboardsPanel } from '@/components/SavedDashboardsPanel';
import { SettingsPanel } from '@/components/SettingsPanel';
import { FullscreenView } from '@/components/FullscreenView';
import { EmptyState } from '@/components/EmptyState';
import { KeyboardShortcuts } from '@/components/KeyboardShortcuts';
import { CommandPalette } from '@/components/CommandPalette';
import { useDashboard } from '@/store/dashboard';

export default function Dashboard() {
  const {
    screens, focusedId, setFocused, removeScreen, refreshScreen,
    refreshAll, setAudioSolo, settings,
  } = useDashboard();
  const [fullscreenId, setFullscreenId] = useState<string | null>(null);
  const [modals, setModals] = useState<{ add?: boolean; layout?: boolean; saved?: boolean; settings?: boolean; cmd?: boolean }>({});

  // accent css var
  useEffect(() => {
    document.documentElement.style.setProperty('--accent', settings.accent);
  }, [settings.accent]);

  // auto-refresh
  useEffect(() => {
    if (!settings.autoRefreshSec || screens.length === 0) return;
    const t = setInterval(() => refreshAll(), settings.autoRefreshSec * 1000);
    return () => clearInterval(t);
  }, [settings.autoRefreshSec, screens.length, refreshAll]);

  const open = useCallback((k: keyof typeof modals) => setModals((m) => ({ ...m, [k]: true })), []);
  const close = useCallback((k: keyof typeof modals) => setModals((m) => ({ ...m, [k]: false })), []);

  const focused = focusedId ?? screens[0]?.id ?? null;
  const handleFullscreen = useCallback(() => {
    if (focused) setFullscreenId(focused);
    else if (screens[0]) setFullscreenId(screens[0].id);
    else {
      // app fullscreen fallback
      document.documentElement.requestFullscreen?.().catch(() => {});
    }
  }, [focused, screens]);

  const handleRefresh = useCallback(() => {
    if (focused) refreshScreen(focused);
    else refreshAll();
  }, [focused, refreshScreen, refreshAll]);

  const handleDelete = useCallback(() => { if (focused) removeScreen(focused); }, [focused, removeScreen]);
  const handleMute = useCallback(() => setAudioSolo(null), [setAudioSolo]);
  const handleExitFS = useCallback(() => {
    setFullscreenId(null);
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
  }, []);

  if (fullscreenId) {
    const scr = screens.find((s) => s.id === fullscreenId);
    if (scr) return <FullscreenView screen={scr} onExit={handleExitFS} />;
  }

  return (
    <div className="relative flex h-screen flex-col bg-bg">
      <Header
        onAdd={() => open('add')}
        onLayout={() => open('layout')}
        onSaved={() => open('saved')}
        onSettings={() => open('settings')}
        onFullscreen={handleFullscreen}
        onCommand={() => open('cmd')}
      />

      <main className="flex-1 overflow-auto px-2 pb-6 pt-16 sm:px-4" onClick={() => setFocused(null)}>
        <div onClick={(e) => e.stopPropagation()} className="h-full">
          {screens.length === 0 ? (
            <EmptyState onAddFirst={() => open('add')} />
          ) : (
            <Grid onFullscreen={(id) => { setFocused(id); setFullscreenId(id); }} />
          )}
        </div>
      </main>

      <AddScreenModal open={!!modals.add} onClose={() => close('add')} />
      <LayoutSelector open={!!modals.layout} onClose={() => close('layout')} />
      <SavedDashboardsPanel open={!!modals.saved} onClose={() => close('saved')} />
      <SettingsPanel open={!!modals.settings} onClose={() => close('settings')} />
      <CommandPalette
        open={!!modals.cmd}
        onClose={() => close('cmd')}
        onAdd={() => open('add')}
        onLayout={() => open('layout')}
        onSaved={() => open('saved')}
        onFullscreen={handleFullscreen}
      />

      <KeyboardShortcuts
        onAdd={() => open('add')}
        onCommand={() => open('cmd')}
        onFullscreen={handleFullscreen}
        onRefresh={handleRefresh}
        onExitFullscreen={handleExitFS}
        onDelete={handleDelete}
        onMute={handleMute}
      />
    </div>
  );
}
