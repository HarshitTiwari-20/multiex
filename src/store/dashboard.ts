import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ScreenType = 'youtube' | 'website' | 'custom';

export type Screen = {
  id: string;
  name: string;
  url: string;
  type: ScreenType;
  live?: boolean;
  muted?: boolean;
  pinned?: boolean;
  refreshNonce?: number;
};

export type LayoutKey =
  | '1x1' | '2x1' | '2x2' | '3x2' | '3x3' | '4x2' | '4x3' | '4x4' | 'custom';

export type SavedDashboard = {
  name: string;
  screens: Screen[];
  layout: LayoutKey;
  updatedAt: number;
};

export type DashboardSettings = {
  gap: number; // px
  radius: number; // px
  compact: boolean;
  showHeaders: boolean; // if false, headers only on hover (default true = hover only anyway); true = always show
  autoRefreshSec: number; // 0 = off
  accent: string;
};

function uid() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    try { return crypto.randomUUID(); } catch { /* fallthrough */ }
  }
  return `scr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

function dimsFor(layout: LayoutKey): { c: number; r: number } {
  if (layout === 'custom') return { c: 3, r: 3 };
  const parts = layout.split('x').map(Number);
  if (parts.length !== 2 || parts.some(Number.isNaN)) return { c: 3, r: 3 };
  return { c: parts[0], r: parts[1] };
}

interface State {
  dashboardName: string;
  screens: Screen[];
  layout: LayoutKey;
  columnCount: number;
  rowCount: number;
  focusedId: string | null;
  activeAudioId: string | null;
  settings: DashboardSettings;
  savedDashboards: SavedDashboard[];

  setDashboardName: (n: string) => void;
  addScreen: (s: Omit<Screen, 'id' | 'refreshNonce'> & { id?: string }) => string;
  addScreens: (list: Array<Omit<Screen, 'id' | 'refreshNonce'> & { id?: string }>) => void;
  removeScreen: (id: string) => void;
  clearAll: () => void;
  updateScreen: (id: string, patch: Partial<Screen>) => void;
  duplicateScreen: (id: string) => void;
  swapScreens: (aId: string, bId: string) => void;
  moveScreen: (id: string, dir: -1 | 1) => void;
  refreshScreen: (id: string) => void;
  refreshAll: () => void;
  setFocused: (id: string | null) => void;
  setAudioSolo: (id: string | null) => void;
  setLayout: (l: LayoutKey) => void;
  setSettings: (patch: Partial<DashboardSettings>) => void;

  saveDashboard: (name: string) => void;
  loadDashboard: (name: string) => void;
  deleteDashboard: (name: string) => void;
  renameDashboard: (oldName: string, newName: string) => void;
  duplicateDashboard: (name: string) => void;
}

export const useDashboard = create<State>()(
  persist(
    (set, get) => ({
      dashboardName: 'Morning News',
      screens: [],
      layout: '3x3',
      columnCount: 3,
      rowCount: 3,
      focusedId: null,
      activeAudioId: null,
      settings: {
        gap: 16,
        radius: 16,
        compact: false,
        showHeaders: false,
        autoRefreshSec: 0,
        accent: '#00b4d8',
      },
      savedDashboards: [],

      setDashboardName: (n) => set({ dashboardName: n }),

      addScreen: (s) => {
        const id = s.id ?? uid();
        set({ screens: [...get().screens, { ...s, id, refreshNonce: 0 }] });
        set({ focusedId: id });
        return id;
      },

      addScreens: (list) => {
        const mapped = list.map((s) => ({ ...s, id: s.id ?? uid(), refreshNonce: 0 }));
        set({ screens: [...get().screens, ...mapped] });
        if (mapped.length) set({ focusedId: mapped[mapped.length - 1].id });
      },

      removeScreen: (id) =>
        set((st) => ({
          screens: st.screens.filter((x) => x.id !== id),
          focusedId: st.focusedId === id ? null : st.focusedId,
          activeAudioId: st.activeAudioId === id ? null : st.activeAudioId,
        })),

      clearAll: () => set({ screens: [], focusedId: null, activeAudioId: null }),

      updateScreen: (id, patch) =>
        set({ screens: get().screens.map((x) => (x.id === id ? { ...x, ...patch } : x)) }),

      duplicateScreen: (id) => {
        const src = get().screens.find((x) => x.id === id);
        if (!src) return;
        const copy: Screen = { ...src, id: uid(), name: `${src.name} (copy)`, refreshNonce: 0 };
        const idx = get().screens.findIndex((x) => x.id === id);
        const next = [...get().screens];
        next.splice(idx + 1, 0, copy);
        set({ screens: next, focusedId: copy.id });
      },

      swapScreens: (aId, bId) => {
        const arr = [...get().screens];
        const ai = arr.findIndex((x) => x.id === aId);
        const bi = arr.findIndex((x) => x.id === bId);
        if (ai < 0 || bi < 0) return;
        [arr[ai], arr[bi]] = [arr[bi], arr[ai]];
        set({ screens: arr });
      },

      moveScreen: (id, dir) => {
        const arr = [...get().screens];
        const i = arr.findIndex((x) => x.id === id);
        const j = i + dir;
        if (i < 0 || j < 0 || j >= arr.length) return;
        [arr[i], arr[j]] = [arr[j], arr[i]];
        set({ screens: arr });
      },

      refreshScreen: (id) =>
        set({
          screens: get().screens.map((x) =>
            x.id === id ? { ...x, refreshNonce: (x.refreshNonce ?? 0) + 1 } : x
          ),
        }),

      refreshAll: () =>
        set({
          screens: get().screens.map((x) => ({ ...x, refreshNonce: (x.refreshNonce ?? 0) + 1 })),
        }),

      setFocused: (id) => set({ focusedId: id }),

      setAudioSolo: (id) => {
        set({ activeAudioId: id });
        // mute all except solo
        const solo = id;
        set({
          screens: get().screens.map((x) => ({ ...x, muted: solo ? x.id !== solo : x.muted })),
        });
      },

      setLayout: (l) => {
        const { c, r } = dimsFor(l);
        set({ layout: l, columnCount: c, rowCount: r });
      },

      setSettings: (patch) => set({ settings: { ...get().settings, ...patch } }),

      saveDashboard: (name) => {
        const clean = name.trim() || get().dashboardName || 'Untitled';
        set({
          dashboardName: clean,
          savedDashboards: [
            ...get().savedDashboards.filter((d) => d.name !== clean),
            { name: clean, screens: get().screens, layout: get().layout, updatedAt: Date.now() },
          ],
        });
      },

      loadDashboard: (name) => {
        const d = get().savedDashboards.find((x) => x.name === name);
        if (!d) return;
        const { c, r } = dimsFor(d.layout);
        set({
          dashboardName: d.name,
          screens: d.screens,
          layout: d.layout,
          columnCount: c,
          rowCount: r,
          focusedId: null,
          activeAudioId: null,
        });
      },

      deleteDashboard: (name) =>
        set({ savedDashboards: get().savedDashboards.filter((d) => d.name !== name) }),

      renameDashboard: (oldName, newName) => {
        const clean = newName.trim();
        if (!clean || clean === oldName) return;
        set({
          savedDashboards: get().savedDashboards.map((d) =>
            d.name === oldName ? { ...d, name: clean, updatedAt: Date.now() } : d
          ),
        });
      },

      duplicateDashboard: (name) => {
        const d = get().savedDashboards.find((x) => x.name === name);
        if (!d) return;
        let copyName = `${name} (copy)`;
        let n = 2;
        const names = new Set(get().savedDashboards.map((x) => x.name));
        while (names.has(copyName)) copyName = `${name} (copy ${n++})`;
        set({
          savedDashboards: [
            ...get().savedDashboards,
            { ...d, name: copyName, updatedAt: Date.now() },
          ],
        });
      },
    }),
    {
      name: 'multiview-dashboard-v2',
      partialize: (s) => ({
        dashboardName: s.dashboardName,
        screens: s.screens,
        layout: s.layout,
        columnCount: s.columnCount,
        rowCount: s.rowCount,
        settings: s.settings,
        savedDashboards: s.savedDashboards,
      }) as State,
    }
  )
);
