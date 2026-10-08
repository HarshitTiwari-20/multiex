'use client';

import { useMemo } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { Tile } from './Tile';
import { useDashboard } from '@/store/dashboard';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const RGL = WidthProvider(Responsive);

export function Grid({ onFullscreen }: { onFullscreen: (id: string) => void }) {
  const {
    screens, columnCount, focusedId, setFocused,
    swapScreens, settings,
  } = useDashboard();

  const layouts = useMemo(() => {
    const lg = screens.map((s, i) => ({
      i: s.id,
      x: i % columnCount,
      y: Math.floor(i / columnCount),
      w: 1,
      h: 1,
      minW: 1,
      minH: 1,
      static: !!s.pinned,
    }));
    return { lg };
  }, [screens, columnCount]);

  return (
    <div className="mv-grid" style={{ ['--mv-gap' as string]: `${settings.gap}px` }}>
      <RGL
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 0 }}
        cols={{ lg: columnCount, md: Math.min(columnCount, 3), sm: 2, xs: 1 }}
        rowHeight={settings.compact ? 250 : 310}
        margin={[settings.gap, settings.gap]}
        containerPadding={[settings.gap, settings.gap]}
        draggableHandle=".drag-handle"
        isDraggable
        isResizable
        resizeHandles={['se']}
        compactType="vertical"
        preventCollision={false}
        useCSSTransforms
        onDrop={(layout, item) => {
          // drop-to-swap: if dropped onto an occupied cell, swap order
          const over = layout.find((l) => l.i !== item.i && l.x === item.x && l.y === item.y);
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
            />
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
        .mv-grid .react-grid-item > .react-resizable-handle::after {
          border-right: 2px solid #555 !important;
          border-bottom: 2px solid #555 !important;
        }
        .mv-grid .react-grid-item.resizing { opacity: 0.9; }
      `}</style>
    </div>
  );
}
