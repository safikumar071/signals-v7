import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL) {
  throw new Error('Missing EXPO_PUBLIC_SUPABASE_URL environment variable');
}

if (!SUPABASE_ANON_KEY) {
  throw new Error('Missing EXPO_PUBLIC_SUPABASE_ANON_KEY environment variable');
}

const customFetch = async (url: string, options: any) => {
  options.headers = {
    ...options.headers,
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  };
  return fetch(url, options);
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
  global: {
    fetch: customFetch, // ensures apikey is injected
  },
});

// Add connection test function
export async function testSupabaseConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase.from('signals').select('count').limit(1);
    return !error;
  } catch (error) {
    console.log('Supabase connection test failed:', error);
    return false;
  }
}

// Database types
export interface Signal {
  id: string;
  pair: string;
  type: 'BUY' | 'SELL';
  entry_price: number;
  current_price?: number;
  take_profit_levels: number[];
  stop_loss: number;
  status: 'active' | 'closed' | 'pending';
  accuracy: number;
  timestamp: string;
  description?: string;
  risk_reward?: string;
  pnl?: number;
  created_at: string;
}

export interface MarketData {
  pair: string;
  price: number;
  change: number;
  change_percent: number;
  high: number;
  low: number;
  volume: string;
}