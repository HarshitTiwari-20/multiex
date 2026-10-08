export function isTradingViewWidget(url: string): boolean {
  return /tradingview\.com\/widgetembed/i.test(url);
}

export function getTradingViewSymbol(url: string): string {
  try {
    const u = new URL(url);
    const s = u.searchParams.get('symbol') ?? '';
    return decodeURIComponent(s);
  } catch {
    return '';
  }
}

export function shortSymbol(full: string): string {
  if (!full) return '';
  const parts = full.split(':');
  return (parts.length > 1 ? parts[parts.length - 1] : full).toUpperCase();
}

/** Normalize user input like "aapl", "NSE:RELIANCE", "BTCUSD" into a widget symbol param. */
export function normalizeSymbolInput(input: string): string | null {
  const t = input.trim().toUpperCase().replace(/\s+/g, '');
  if (!t) return null;
  if (!/^[A-Z0-9:.\-=_+]+$/.test(t)) return null;
  // bare crypto pairs like BTCUSD -> BITSTAMP:BTCUSD is nicer, but TradingView
  // resolves bare "BTCUSD" fine, so keep user input as-is unless exchange given.
  return t;
}

export function withTradingViewSymbol(url: string, symbol: string): string {
  try {
    const u = new URL(url);
    u.searchParams.set('symbol', symbol);
    return u.toString();
  } catch {
    return url;
  }
}

export const POPULAR_SYMBOLS = [
  { label: 'S&P 500', symbol: 'SP:SPX' },
  { label: 'Nasdaq 100', symbol: 'NASDAQ:QQQ' },
  { label: 'AAPL', symbol: 'NASDAQ:AAPL' },
  { label: 'NVDA', symbol: 'NASDAQ:NVDA' },
  { label: 'TSLA', symbol: 'NASDAQ:TSLA' },
  { label: 'BTC', symbol: 'BITSTAMP:BTCUSD' },
  { label: 'ETH', symbol: 'BITSTAMP:ETHUSD' },
  { label: 'Gold', symbol: 'OANDA:XAUUSD' },
  { label: 'EUR/USD', symbol: 'OANDA:EURUSD' },
  { label: 'Nifty 50', symbol: 'OANDA:IN50USD' },
  { label: 'Reliance', symbol: 'NSE:RELIANCE' },
  { label: 'TCS', symbol: 'NSE:TCS' },
];

export type SymbolHit = {
  symbol: string; // full "EXCHANGE:CODE"
  label: string; // short code
  description: string;
  exchange: string;
  type: string;
};

// Offline fallback catalogue (also used to rank local matches)
const CATALOGUE: SymbolHit[] = [
  ...POPULAR_SYMBOLS.map((p) => ({ symbol: p.symbol, label: p.label, description: p.label, exchange: p.symbol.split(':')[0] ?? '', type: '' })),
  { symbol: 'NASDAQ:MSFT', label: 'MSFT', description: 'Microsoft', exchange: 'NASDAQ', type: 'stock' },
  { symbol: 'NASDAQ:GOOGL', label: 'GOOGL', description: 'Alphabet', exchange: 'NASDAQ', type: 'stock' },
  { symbol: 'NASDAQ:AMZN', label: 'AMZN', description: 'Amazon', exchange: 'NASDAQ', type: 'stock' },
  { symbol: 'NASDAQ:META', label: 'META', description: 'Meta Platforms', exchange: 'NASDAQ', type: 'stock' },
  { symbol: 'NYSE:JPM', label: 'JPM', description: 'JPMorgan Chase', exchange: 'NYSE', type: 'stock' },
  { symbol: 'BITSTAMP:BTCUSD', label: 'BTC', description: 'Bitcoin / U.S. Dollar', exchange: 'BITSTAMP', type: 'crypto' },
  { symbol: 'BINANCE:BTCUSDT', label: 'BTCUSDT', description: 'Bitcoin / Tether', exchange: 'BINANCE', type: 'crypto' },
  { symbol: 'BITSTAMP:ETHUSD', label: 'ETH', description: 'Ethereum / U.S. Dollar', exchange: 'BITSTAMP', type: 'crypto' },
  { symbol: 'BINANCE:ETHUSDT', label: 'ETHUSDT', description: 'Ethereum / Tether', exchange: 'BINANCE', type: 'crypto' },
  { symbol: 'BINANCE:SOLUSDT', label: 'SOL', description: 'Solana / Tether', exchange: 'BINANCE', type: 'crypto' },
  { symbol: 'BINANCE:DOGEUSDT', label: 'DOGE', description: 'Dogecoin / Tether', exchange: 'BINANCE', type: 'crypto' },
  { symbol: 'BINANCE:XRPUSDT', label: 'XRP', description: 'Ripple / Tether', exchange: 'BINANCE', type: 'crypto' },
  { symbol: 'OANDA:XAUUSD', label: 'GOLD', description: 'Gold / U.S. Dollar', exchange: 'OANDA', type: 'forex' },
  { symbol: 'OANDA:EURUSD', label: 'EUR/USD', description: 'Euro / U.S. Dollar', exchange: 'OANDA', type: 'forex' },
  { symbol: 'OANDA:GBPUSD', label: 'GBP/USD', description: 'Pound / U.S. Dollar', exchange: 'OANDA', type: 'forex' },
  { symbol: 'OANDA:USDJPY', label: 'USD/JPY', description: 'U.S. Dollar / Yen', exchange: 'OANDA', type: 'forex' },
  { symbol: 'OANDA:USDINR', label: 'USD/INR', description: 'U.S. Dollar / Rupee', exchange: 'OANDA', type: 'forex' },
  { symbol: 'NSE:RELIANCE', label: 'RELIANCE', description: 'Reliance Industries', exchange: 'NSE', type: 'stock' },
  { symbol: 'NSE:TCS', label: 'TCS', description: 'Tata Consultancy Services', exchange: 'NSE', type: 'stock' },
  { symbol: 'NSE:INFY', label: 'INFY', description: 'Infosys', exchange: 'NSE', type: 'stock' },
  { symbol: 'NSE:HDFCBANK', label: 'HDFCBANK', description: 'HDFC Bank', exchange: 'NSE', type: 'stock' },
  { symbol: 'NSE:TATAMOTORS', label: 'TATAMOTORS', description: 'Tata Motors', exchange: 'NSE', type: 'stock' },
  { symbol: 'NSE:SBIN', label: 'SBIN', description: 'State Bank of India', exchange: 'NSE', type: 'stock' },
  { symbol: 'SP:SPX', label: 'SPX', description: 'S&P 500 Index', exchange: 'SP', type: 'index' },
  { symbol: 'NASDAQ:QQQ', label: 'QQQ', description: 'Nasdaq 100 ETF', exchange: 'NASDAQ', type: 'index' },
  { symbol: 'DJ:DJI', label: 'DJI', description: 'Dow Jones Industrial', exchange: 'DJ', type: 'index' },
  { symbol: 'TVC:US10Y', label: 'US10Y', description: 'US 10Y Bond Yield', exchange: 'TVC', type: 'index' },
  { symbol: 'TVC:UKOIL', label: 'BRENT', description: 'Brent Crude Oil', exchange: 'TVC', type: 'index' },
];

function localSearch(query: string, limit = 8): SymbolHit[] {
  const q = query.trim().toUpperCase();
  if (!q) return [];
  const starts: SymbolHit[] = [];
  const contains: SymbolHit[] = [];
  for (const c of CATALOGUE) {
    const hay = `${c.symbol} ${c.label} ${c.description}`.toUpperCase();
    if (c.label.toUpperCase().startsWith(q) || c.symbol.toUpperCase().endsWith(':' + q) || c.symbol.toUpperCase().startsWith(q)) starts.push(c);
    else if (hay.includes(q)) contains.push(c);
    if (starts.length >= limit) break;
  }
  const seen = new Set<string>();
  return [...starts, ...contains].filter((h) => (seen.has(h.symbol) ? false : (seen.add(h.symbol), true))).slice(0, limit);
}

type TVRaw = { symbol?: string; full_name?: string; description?: string; exchange?: string; ticker?: string; type?: string };

/** Live TradingView symbol search (type "btc" → all BTC contracts). Falls back to offline list. */
export async function searchSymbols(query: string, signal?: AbortSignal, limit = 8): Promise<{ hits: SymbolHit[]; live: boolean }> {
  const q = query.trim();
  if (!q) return { hits: [], live: false };
  try {
    const url = `https://symbol-search.tradingview.com/symbol_search/?text=${encodeURIComponent(q)}&hl=1&exchange=&lang=en&type=&domain=production`;
    const res = await fetch(url, { signal });
    if (!res.ok) throw new Error(`TV search ${res.status}`);
    const raw = (await res.json()) as TVRaw[];
    const hits: SymbolHit[] = (Array.isArray(raw) ? raw : []).slice(0, limit).map((r) => {
      const full = r.full_name || r.symbol || '';
      const exch = r.exchange || (full.includes(':') ? full.split(':')[0] : '');
      const code = full.includes(':') ? full.split(':').slice(1).join(':') : full;
      return { symbol: full, label: code || full, description: r.description || full, exchange: exch, type: r.type || '' };
    }).filter((h) => h.symbol);
    if (hits.length) return { hits, live: true };
    return { hits: localSearch(q, limit), live: false };
  } catch (e) {
    if ((e as Error)?.name === 'AbortError') return { hits: [], live: false };
    return { hits: localSearch(q, limit), live: false };
  }
}
