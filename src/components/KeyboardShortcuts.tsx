'use client';

import { useEffect } from 'react';

type Props = {
  onAdd: () => void;
  onCommand: () => void;
  onFullscreen: () => void;
  onRefresh: () => void;
  onExitFullscreen: () => void;
  onDelete: () => void;
  onMute: () => void;
};

function isTypingTarget(e: KeyboardEvent): boolean {
  const t = e.target as HTMLElement | null;
  if (!t) return false;
  const tag = t.tagName?.toLowerCase();
  return tag === 'input' || tag === 'textarea' || tag === 'select' || t.isContentEditable;
}

export function KeyboardShortcuts({ onAdd, onCommand, onFullscreen, onRefresh, onExitFullscreen, onDelete, onMute }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        (isTypingTarget(e) ? onAdd : onCommand)();
        return;
      }
      if (isTypingTarget(e)) {
        if (e.key === 'Escape') (e.target as HTMLElement).blur();
        return;
      }
      if (e.key === 'Escape') { onExitFullscreen(); return; }
      const k = e.key.toLowerCase();
      // NOTE: Backspace is intentionally NOT mapped (reserved for symbol typing).
      // When a TradingView tile is selected it captures letter keys in the
      // capture phase + stopPropagation, so F/R/M/N below won't fire mid-typing.
      if (k === 'f') onFullscreen();
      else if (k === 'r') onRefresh();
      else if (k === 'm') onMute();
      else if (k === 'delete') onDelete();
      else if (k === 'n' && !e.metaKey && !e.ctrlKey) onAdd();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onAdd, onCommand, onFullscreen, onRefresh, onExitFullscreen, onDelete, onMute]);

  return null;
}
