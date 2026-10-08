'use client';

import { useMemo } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { Plus } from 'lucide-react';
import { Tile } from './Tile';
import { useDashboard } from '@/store/dashboard';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const RGL = WidthProvider(Responsive);

function buildLayout(ids: string[], pinned: Set<string>, cols: number) {
  return ids.map((id, i) => ({
    i: id,
    x: i % cols,
    y: Math.floor(i / cols),
    w: 1,
    h: 1,
    minW: 1,
    minH: 1,
    static: pinned.has(id),
  }));
}

export function Grid({
  onFullscreen, onEdit, onAdd,
}: {
  onFullscreen: (id: string) => void;
  onEdit: (id: string) => void;
  onAdd: () => void;
}) {
  const {
    screens, layout, columnCount, rowCount, focusedId, setFocused,
    swapScreens, settings,
  } = useDashboard();

  const cols = { lg: columnCount, md: columnCount, sm: columnCount >= 3 ? 2 : columnCount, xs: 1 };
  // 4-column walls need shorter rows so 4x4 fits on screen instead of a 5kpx scroll
  const rowHeight = columnCount >= 4
    ? (settings.compact ? 175 : 225)
    : (settings.compact ? 250 : 310);

  const pinned = useMemo(() => new Set(screens.filter((s) => s.pinned).map((s) => s.id)), [screens]);

  const layouts = useMemo(() => {
    const ids = screens.map((s) => s.id);
    return {
      lg: buildLayout(ids, pinned, cols.lg),
      md: buildLayout(ids, pinned, cols.md),
      sm: buildLayout(ids, pinned, cols.sm),
      xs: buildLayout(ids, pinned, cols.xs),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screens, pinned, columnCount]);

  // Fill empty cells of a fixed grid (e.g. 4x4 with 10 screens → 6 "+" slots)
  const capacity = layout === 'custom' ? 0 : columnCount * rowCount;
  const placeholders = capacity > screens.length ? capacity - screens.length : 0;
  const cappedPlaceholders = Math.min(placeholders, 16);

  return (
    <div className="mv-grid" style={{ ['--mv-gap' as string]: `${settings.gap}px` }}>
      <div className="mb-2 flex items-center justify-between px-1 text-xs text-muted">
        <span>{layout} · {screens.length}{capacity ? ` / ${capacity}` : ''} tiles</span>
        {capacity > 0 && screens.length > capacity && (
          <span className="text-amber-400/90">{screens.length - capacity} extra below — switch to a bigger layout or remove some</span>
        )}
      </div>
      <RGL
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 0 }}
        cols={cols}
        rowHeight={rowHeight}
        margin={[settings.gap, settings.gap]}
        containerPadding={[settings.gap, settings.gap]}
        draggableHandle=".drag-handle"
        isDraggable
        isResizable
        resizeHandles={['se', 'sw', 'ne', 'nw', 'e', 'w', 's', 'n']}
        compactType="vertical"
        preventCollision={false}
        useCSSTransforms
        onDrop={(l, item) => {
          const over = l.find((x) => x.i !== item.i && x.x === item.x && x.y === item.y);
          if (over) swapScreens(item.i, over.i);
        }}
        isDroppable
      >
        {screens.map((scr) => (
          <div key={scr.id} className="mv-tile-wrap">
            <Tile
              screen={scr}
              selected={focusedId === scr.id}
              showHeaderAlways={settings.showHeaders}
              borderRadius={settings.radius}
              onFullscreen={onFullscreen}
              onSelect={setFocused}
              onEdit={onEdit}
            />
          </div>
        ))}
        {Array.from({ length: cappedPlaceholders }).map((_, i) => (
          <div key={`__empty_${i}`} className="mv-tile-wrap">
            <button
              onClick={onAdd}
              className="flex h-full w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-white/[0.02] text-muted transition hover:border-accent/60 hover:text-text"
              style={{ borderRadius: settings.radius, minHeight: rowHeight }}
              title="Add screen to this slot"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-border">
                <Plus className="h-5 w-5" />
              </span>
              <span className="text-[13px] font-medium">Empty slot — add screen</span>
            </button>
          </div>
        ))}
      </RGL>

      <style jsx global>{`
        .mv-grid .react-grid-layout { min-height: 240px; }
        .mv-tile-wrap { overflow: visible; }
        .mv-grid .react-grid-item { transition: box-shadow 150ms ease; }
        .mv-grid .react-grid-item.react-grid-placeholder {
          background: rgba(0, 180, 216, 0.25) !important;
          border: 1px dashed var(--accent, #00b4d8);
          border-radius: 12px;
          opacity: 1 !important;
        }
        /* corner + edge resize handles: hidden until hover/selected, big hit area */
        .mv-grid .react-grid-item > .react-resizable-handle {
          position: absolute;
          z-index: 6;
          opacity: 0;
          transition: opacity 150ms ease;
        }
        .mv-grid .react-grid-item:hover > .react-resizable-handle,
        .mv-grid .react-grid-item.resizing > .react-resizable-handle { opacity: 1; }
        .mv-grid .react-grid-item > .react-resizable-handle-se,
        .mv-grid .react-grid-item > .react-resizable-handle-sw,
        .mv-grid .react-grid-item > .react-resizable-handle-ne,
        .mv-grid .react-grid-item > .react-resizable-handle-nw {
          width: 22px; height: 22px;
        }
        .mv-grid .react-grid-item > .react-resizable-handle-se { bottom: 3px; right: 3px; cursor: se-resize; }
        .mv-grid .react-grid-item > .react-resizable-handle-sw { bottom: 3px; left: 3px; cursor: sw-resize; }
        .mv-grid .react-grid-item > .react-resizable-handle-ne { top: 3px; right: 3px; cursor: ne-resize; }
        .mv-grid .react-grid-item > .react-resizable-handle-nw { top: 3px; left: 3px; cursor: nw-resize; }
        .mv-grid .react-grid-item > .react-resizable-handle-se::after,
        .mv-grid .react-grid-item > .react-resizable-handle-sw::after,
        .mv-grid .react-grid-item > .react-resizable-handle-ne::after,
        .mv-grid .react-grid-item > .react-resizable-handle-nw::after {
          content: ""; position: absolute; width: 10px; height: 10px;
          border: 0 solid #888; border-radius: 2px;
          background: rgba(255,255,255,0.14);
        }
        .mv-grid .react-grid-item > .react-resizable-handle-se::after { right: 2px; bottom: 2px; border-right-width: 2.5px; border-bottom-width: 2.5px; border-color: var(--accent, #00b4d8); }
        .mv-grid .react-grid-item > .react-resizable-handle-sw::after { left: 2px; bottom: 2px; border-left-width: 2.5px; border-bottom-width: 2.5px; }
        .mv-grid .react-grid-item > .react-resizable-handle-ne::after { right: 2px; top: 2px; border-right-width: 2.5px; border-top-width: 2.5px; }
        .mv-grid .react-grid-item > .react-resizable-handle-nw::after { left: 2px; top: 2px; border-left-width: 2.5px; border-top-width: 2.5px; }
        .mv-grid .react-grid-item > .react-resizable-handle-e,
        .mv-grid .react-grid-item > .react-resizable-handle-w { top: 12px; bottom: 12px; width: 10px; cursor: ew-resize; }
        .mv-grid .react-grid-item > .react-resizable-handle-e { right: -2px; }
        .mv-grid .react-grid-item > .react-resizable-handle-w { left: -2px; }
        .mv-grid .react-grid-item > .react-resizable-handle-n,
        .mv-grid .react-grid-item > .react-resizable-handle-s { left: 12px; right: 12px; height: 10px; cursor: ns-resize; }
        .mv-grid .react-grid-item > .react-resizable-handle-n { top: -2px; }
        .mv-grid .react-grid-item > .react-resizable-handle-s { bottom: -2px; }
        .mv-grid .react-grid-item.resizing { opacity: 0.92; }
      `}</style>
    </div>
  );
}
