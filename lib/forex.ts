// Forex price API integration
export interface ForexPrice {
  pair: string;
  price: number;
  change: number;
  change_percent: number;
  timestamp: string;
}

export interface PipCalculatorResult {
  pipValue: number;
  totalPips: number;
  profit: number;
}

export interface LotSizeResult {
  lotSize: number;
  positionSize: number;
  margin: number;
}

export interface PnLResult {
  profit: number;
  profitPercent: number;
  pips: number;
}

// Cache for forex prices to avoid rate limits
const priceCache = new Map<string, { price: number; timestamp: number }>();
const CACHE_DURATION = 30000; // 30 seconds

export async function getForexPrice(pair: string): Promise<number> {
  const cacheKey = pair.replace('/', '');
  const cached = priceCache.get(cacheKey);

  // Return cached price if still valid
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.price;
  }

  try {
    // Use ExchangeRate.host API (free, no API key required)
    const [base, quote] = pair.split('/');
    const response = await fetch(
      `https://api.exchangerate.host/latest?base=${base}&symbols=${quote}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch forex price');
    }

    const data = await response.json();
    const price = data.rates[quote];

    if (!price) {
      throw new Error('Price not found for pair');
    }

    // Cache the price
    priceCache.set(cacheKey, { price, timestamp: Date.now() });

    return price;
  } catch (error) {
    console.error('Error fetching forex price:', error);

    // Return mock prices for common pairs if API fails
    const mockPrices: Record<string, number> = {
      'XAUUSD': 2345.67,
      'XAGUSD': 29.45,
      'EURUSD': 1.0867,
      'GBPUSD': 1.2634,
      'USDJPY': 149.67,
      'AUDUSD': 0.6542,
    };

    return mockPrices[cacheKey] || 1.0;
  }
}

export function calculatePipValue(
  pair: string,
  lotSize: number,
  accountCurrency: string = 'USD'
): number {
  // Standard pip values for major pairs
  const pipValues: Record<string, number> = {
    'EURUSD': 10,
    'GBPUSD': 10,
    'AUDUSD': 10,
    'NZDUSD': 10,
    'USDCAD': 10,
    'USDCHF': 10,
    'USDJPY': 10,
    'XAUUSD': 10,
    'XAGUSD': 50,
  };

  const basePipValue = pipValues[pair.replace('/', '')] || 10;
  return basePipValue * lotSize;
}

export function calculatePips(
  pair: string,
  entryPrice: number,
  exitPrice: number,
  type: 'BUY' | 'SELL'
): PipCalculatorResult {
  const pairKey = pair.replace('/', '');

  // Determine pip size based on pair
  let pipSize = 0.0001; // 4-decimal pairs
  if (pairKey.includes('JPY')) {
    pipSize = 0.01; // 2-decimal pairs
  } else if (pairKey.includes('XAU') || pairKey.includes('XAG')) {
    pipSize = 0.01; // Gold/Silver
  }

  let priceDiff = type === 'BUY' ? exitPrice - entryPrice : entryPrice - exitPrice;
  const totalPips = priceDiff / pipSize;

  return {
    pipValue: pipSize,
    totalPips: Math.round(totalPips * 10) / 10,
    profit: priceDiff,
  };
}

export function calculateLotSize(
  accountBalance: number,
  riskPercent: number,
  stopLossPips: number,
  pipValue: number
): LotSizeResult {
  const riskAmount = (accountBalance * riskPercent) / 100;
  const lotSize = riskAmount / (stopLossPips * pipValue);

  return {
    lotSize: Math.round(lotSize * 100) / 100,
    positionSize: lotSize * 100000, // Standard lot size
    margin: riskAmount,
  };
}

export function calculatePnL(
  pair: string,
  lotSize: number,
  entryPrice: number,
  exitPrice: number,
  type: 'BUY' | 'SELL'
): PnLResult {
  const pipResult = calculatePips(pair, entryPrice, exitPrice, type);
  const pipValue = calculatePipValue(pair, lotSize);
  const profit = pipResult.totalPips * pipValue;
  const profitPercent = (profit / (entryPrice * lotSize * 100000)) * 100;

  return {
    profit: Math.round(profit * 100) / 100,
    profitPercent: Math.round(profitPercent * 100) / 100,
    pips: pipResult.totalPips,
  };
}

export const SUPPORTED_PAIRS = [
  'XAU/USD',
  'XAG/USD',
  'EUR/USD',
  'GBP/USD',
  'USD/JPY',
  'USD/CAD',
  'USD/CHF',
  'AUD/USD',
  'NZD/USD',
  'EUR/GBP',
  'EUR/JPY',
  'GBP/JPY',
];

export const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
];