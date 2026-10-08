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
