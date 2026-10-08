'use client';

import { forwardRef, useEffect, useRef, useState } from 'react';
import { Search, Check, Loader2, TrendingUp } from 'lucide-react';
import { searchSymbols, POPULAR_SYMBOLS, type SymbolHit } from '@/lib/tradingview';

type Props = {
  value: string;
  onChange: (v: string) => void;
  /** full "EXCHANGE:CODE" picked from suggestions, chips, or Enter */
  onPick: (symbol: string) => void;
  onEscape?: () => void;
  currentSymbol: string;
  error?: string | null;
  autoFocus?: boolean;
  placeholder?: string;
  showPopular?: boolean;
};

export const SymbolSearchBox = forwardRef<HTMLInputElement, Props>(function SymbolSearchBox(
  { value, onChange, onPick, onEscape, currentSymbol, error, autoFocus, placeholder, showPopular = true },
  ref
) {
  const [hits, setHits] = useState<SymbolHit[]>([]);
  const [live, setLive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hl, setHl] = useState(0);
  const [open, setOpen] = useState(true);
  const abort = useRef<AbortController | null>(null);

  // debounced live search — type "btc" → all BTC contracts
  useEffect(() => {
    abort.current?.abort();
    const q = value.trim();
    if (!q) { setHits([]); setLoading(false); setHl(0); return; }
    setLoading(true);
    const t = setTimeout(async () => {
      const ctrl = new AbortController();
      abort.current = ctrl;
      const r = await searchSymbols(q, ctrl.signal, 8);
      setHits(r.hits);
      setLive(r.live);
      setLoading(false);
      setHl(0);
    }, 220);
    return () => { clearTimeout(t); abort.current?.abort(); };
  }, [value]);

  useEffect(() => () => abort.current?.abort(), []);

  const pick = (symbol: string) => {
    setOpen(false);
    onPick(symbol);
    setTimeout(() => setOpen(true), 50);
  };

  return (
    <div>
      <div className="flex items-center gap-1.5">
        <Search className="h-4 w-4 shrink-0 text-muted" />
        <input
          ref={ref}
          autoFocus={autoFocus}
          value={value}
          onChange={(e) => { onChange(e.target.value.toUpperCase()); }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            e.stopPropagation();
            if (e.key === 'ArrowDown' && hits.length) { e.preventDefault(); setHl((h) => (h + 1) % hits.length); }
            else if (e.key === 'ArrowUp' && hits.length) { e.preventDefault(); setHl((h) => (h - 1 + hits.length) % hits.length); }
            else if (e.key === 'Enter') {
              if (open && hits.length && value.trim()) pick(hits[Math.min(hl, hits.length - 1)].symbol);
              else onPick(value);
            }
            else if (e.key === 'Escape') { setOpen(false); onEscape?.(); }
          }}
          placeholder={placeholder ?? 'Search: BTC, AAPL, RELIANCE…'}
          spellCheck={false}
          autoComplete="off"
          className="min-w-0 flex-1 rounded-md border border-border bg-black/50 px-2 py-1 font-mono text-[13px] text-text placeholder:text-muted focus:border-accent focus:outline-none"
          aria-label="Search trading symbol"
          role="combobox"
          aria-expanded={open && (hits.length > 0 || loading)}
        />
        <button
          onClick={() => (open && hits.length && value.trim() ? pick(hits[Math.min(hl, hits.length - 1)].symbol) : onPick(value))}
          className="rounded-md bg-accent px-2.5 py-1 text-[13px] font-semibold text-black hover:brightness-110"
          title="Load symbol (Enter)"
        >
          <Check className="h-4 w-4" />
        </button>
      </div>

      {error
        ? <p className="mt-1 text-[12px] text-red-400">{error}</p>
        : <p className="mt-1 truncate font-mono text-[11px] text-muted">
            Now: {currentSymbol || '—'} · ↑↓ + Enter · Esc closes
            {value.trim() ? (live ? ' · live results' : loading ? ' · searching…' : ' · offline list') : ''}
          </p>}

      {open && value.trim() !== '' && (hits.length > 0 || loading) && (
        <ul className="mt-1.5 max-h-52 overflow-y-auto rounded-lg border border-border bg-black/70" role="listbox">
          {loading && hits.length === 0 && (
            <li className="flex items-center gap-2 px-2.5 py-2 text-[13px] text-muted">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Searching TradingView…
            </li>
          )}
          {hits.map((h, i) => (
            <li key={h.symbol + i} role="option" aria-selected={i === hl}>
              <button
                onClick={() => pick(h.symbol)}
                onMouseEnter={() => setHl(i)}
                className={`flex w-full items-center gap-2 px-2.5 py-1.5 text-left transition ${
                  i === hl ? 'bg-accent/20' : 'hover:bg-white/5'
                }`}
                title={h.symbol}
              >
                <TrendingUp className="h-3.5 w-3.5 shrink-0 text-accent" />
                <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-text">{h.description}</span>
                <span className="shrink-0 font-mono text-[11px] text-muted">{h.symbol}</span>
                {h.type && (
                  <span className="shrink-0 rounded bg-white/10 px-1.5 text-[10px] uppercase text-muted">{h.type}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      {showPopular && (
        <div className="mt-1.5 flex flex-wrap gap-1">
          {POPULAR_SYMBOLS.slice(0, 8).map((p) => (
            <button
              key={p.symbol}
              onClick={() => pick(p.symbol)}
              className={`rounded-full border px-2 py-0.5 font-mono text-[11px] transition ${
                currentSymbol === p.symbol
                  ? 'border-accent bg-accent/20 text-accent'
                  : 'border-border text-muted hover:border-accent/50 hover:text-text'
              }`}
              title={p.symbol}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
});
