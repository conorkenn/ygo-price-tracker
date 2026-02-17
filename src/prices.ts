import * as fs from 'fs';
import * as path from 'path';

export interface PriceEntry {
  date: string;
  price: number;
  listings: number;
}

export interface PriceHistory {
  [cardName: string]: {
    current: number;
    history: PriceEntry[];
  };
}

const PRICES_PATH = path.join(__dirname, '..', 'prices.json');

export function loadPrices(): PriceHistory {
  if (!fs.existsSync(PRICES_PATH)) {
    return {};
  }
  const data = fs.readFileSync(PRICES_PATH, 'utf-8');
  return JSON.parse(data);
}

export function savePrices(prices: PriceHistory): void {
  fs.writeFileSync(PRICES_PATH, JSON.stringify(prices, null, 2));
}

export function updatePrice(card: string, price: number, listings: number): void {
  const prices = loadPrices();
  const today = new Date().toISOString().split('T')[0];
  
  if (!prices[card]) {
    prices[card] = { current: price, history: [] };
  }
  
  prices[card].current = price;
  prices[card].history.push({ date: today, price, listings });
  
  // Keep only last 30 entries
  if (prices[card].history.length > 30) {
    prices[card].history = prices[card].history.slice(-30);
  }
  
  savePrices(prices);
  console.log(`Updated ${card}: $${price} (${listings} listings)`);
}

export function getPriceHistory(card: string): PriceEntry[] {
  const prices = loadPrices();
  return prices[card]?.history || [];
}

export function getCurrentPrice(card: string): number | null {
  const prices = loadPrices();
  return prices[card]?.current || null;
}

export function listPrices(): void {
  const prices = loadPrices();
  console.log('\n💰 Price History:');
  for (const [card, data] of Object.entries(prices)) {
    console.log(`  ${card}: $${data.current} (${data.history.length} entries)`);
  }
  console.log('');
}

// CLI
const args = process.argv.slice(2);
if (args[0] === 'update' && args[1] && args[2]) {
  updatePrice(args[1], parseFloat(args[2]), parseInt(args[3]) || 1);
} else if (args[0] === 'history' && args[1]) {
  const history = getPriceHistory(args[1]);
  console.log(`\n📜 ${args[1]} history:`);
  history.forEach(h => console.log(`  ${h.date}: $${h.price} (${h.listings} listings)`));
  console.log('');
} else if (args[0] === 'list') {
  listPrices();
}
