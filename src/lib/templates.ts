import type { Screen } from '@/store/dashboard';

export type Template = {
  name: string;
  description: string;
  layout: '3x3' | '2x2' | '3x2' | '4x2' | '2x1';
  screens: Array<Omit<Screen, 'id' | 'refreshNonce'>>;
};

// NOTE: many news homepages send X-Frame-Options: DENY/SAMEORIGIN and will show
// the friendly TileError with "Open in browser". Templates therefore prefer
// YouTube embeds + TradingView widgets which reliably allow iframing.
export const TEMPLATES: Template[] = [
  {
    name: 'Morning News',
    description: 'Top live news streams + markets snapshot',
    layout: '3x3',
    screens: [
      { name: 'DW News Live', url: 'https://www.youtube.com/watch?v=Nq2wYlWFucg', type: 'youtube', live: true, muted: true },
      { name: 'Al Jazeera Live', url: 'https://www.youtube.com/watch?v=gCNeDWCI0vo', type: 'youtube', live: true, muted: true },
      { name: 'Reuters Live', url: 'https://www.youtube.com/watch?v=9Auq9mYxFEE', type: 'youtube', live: true, muted: true },
      { name: 'S&P 500 Chart', url: 'https://www.tradingview.com/widgetembed/?frameElementId=tradingview_spx&symbol=SP%3ASPX&interval=D&theme=dark', type: 'website', muted: true },
      { name: 'Bitcoin Chart', url: 'https://www.tradingview.com/widgetembed/?frameElementId=tradingview_btc&symbol=BITSTAMP%3ABTCUSD&interval=60&theme=dark', type: 'website' },
      { name: 'Weather', url: 'https://open-meteo.com/en/docs', type: 'website' },
      { name: 'BBC News', url: 'https://www.bbc.com/news', type: 'website' },
      { name: 'Hacker News', url: 'https://news.ycombinator.com', type: 'website' },
      { name: 'Wikipedia Current Events', url: 'https://en.wikipedia.org/wiki/Portal:Current_events', type: 'website' },
    ],
  },
  {
    name: 'Crypto Monitor',
    description: 'BTC/ETH + fear-greed + live talk',
    layout: '3x2',
    screens: [
      { name: 'BTC / USD', url: 'https://www.tradingview.com/widgetembed/?frameElementId=tv_btc&symbol=BITSTAMP%3ABTCUSD&interval=15&theme=dark', type: 'website', muted: true },
      { name: 'ETH / USD', url: 'https://www.tradingview.com/widgetembed/?frameElementId=tv_eth&symbol=BITSTAMP%3AETHUSD&interval=15&theme=dark', type: 'website' },
      { name: 'Total Crypto Mkt', url: 'https://www.tradingview.com/widgetembed/?frameElementId=tv_tot&symbol=CRYPTO%3ATOTAL&interval=60&theme=dark', type: 'website' },
      { name: 'CoinDesk', url: 'https://www.coindesk.com', type: 'website' },
      { name: 'CoinGecko', url: 'https://www.coingecko.com', type: 'website' },
      { name: 'Crypto Live Talk', url: 'https://www.youtube.com/watch?v=9Auq9mYxFEE', type: 'youtube', live: true, muted: true },
    ],
  },
  {
    name: 'Stock Market',
    description: 'Indices, forex + business live',
    layout: '3x2',
    screens: [
      { name: 'S&P 500', url: 'https://www.tradingview.com/widgetembed/?frameElementId=tv_spx&symbol=SP%3ASPX&interval=D&theme=dark', type: 'website' },
      { name: 'Nasdaq 100', url: 'https://www.tradingview.com/widgetembed/?frameElementId=tv_ndx&symbol=NASDAQ%3AQQQ&interval=D&theme=dark', type: 'website' },
      { name: 'Gold', url: 'https://www.tradingview.com/widgetembed/?frameElementId=tv_gold&symbol=OANDA%3AXAUUSD&interval=60&theme=dark', type: 'website' },
      { name: 'EUR/USD', url: 'https://www.tradingview.com/widgetembed/?frameElementId=tv_eurusd&symbol=OANDA%3AEURUSD&interval=60&theme=dark', type: 'website' },
      { name: 'Bloomberg Markets', url: 'https://www.youtube.com/watch?v=dp8PhLsUcFE', type: 'youtube', live: true, muted: true },
      { name: 'CNBC', url: 'https://www.cnbc.com', type: 'website' },
    ],
  },
  {
    name: 'Tech News',
    description: 'Dev news + product launches',
    layout: '2x2',
    screens: [
      { name: 'Hacker News', url: 'https://news.ycombinator.com', type: 'website' },
      { name: 'GitHub Trending', url: 'https://github.com/trending', type: 'website' },
      { name: 'Product Hunt', url: 'https://www.producthunt.com', type: 'website' },
      { name: 'Stack Overflow', url: 'https://stackoverflow.com/questions', type: 'website' },
    ],
  },
  {
    name: 'World News Wall',
    description: '9-way global coverage',
    layout: '3x3',
    screens: [
      { name: 'DW Live', url: 'https://www.youtube.com/watch?v=Nq2wYlWFucg', type: 'youtube', live: true, muted: true },
      { name: 'Al Jazeera', url: 'https://www.youtube.com/watch?v=gCNeDWCI0vo', type: 'youtube', live: true, muted: true },
      { name: 'France 24', url: 'https://www.youtube.com/watch?v=Wx_2SVm9JhQ', type: 'youtube', live: true, muted: true },
      { name: 'BBC', url: 'https://www.bbc.com/news', type: 'website' },
      { name: 'Reuters', url: 'https://www.reuters.com', type: 'website' },
      { name: 'AP News', url: 'https://apnews.com', type: 'website' },
      { name: 'Al Jazeera Web', url: 'https://www.aljazeera.com', type: 'website' },
      { name: 'DW Web', url: 'https://www.dw.com/en/top-stories/s-9097', type: 'website' },
      { name: 'Ground News', url: 'https://ground.news', type: 'website' },
    ],
  },
  {
    name: 'Focus Duo',
    description: 'Minimal 2-up for laptops',
    layout: '2x1',
    screens: [
      { name: 'Lo-fi Focus', url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk', type: 'youtube', live: true, muted: true },
      { name: 'BTC Chart', url: 'https://www.tradingview.com/widgetembed/?frameElementId=tv_focus&symbol=BITSTAMP%3ABTCUSD&interval=15&theme=dark', type: 'website' },
    ],
  },
];
