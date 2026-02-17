import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';

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

export function loadPrices(filePath?: string): PriceHistory {
  const targetPath = filePath || PRICES_PATH;
  if (!fs.existsSync(targetPath)) {
    return {};
  }
  const data = fs.readFileSync(targetPath, 'utf-8');
  return JSON.parse(data);
}

export function savePrices(prices: PriceHistory, filePath?: string): void {
  const targetPath = filePath || PRICES_PATH;
  fs.writeFileSync(targetPath, JSON.stringify(prices, null, 2));
}

export function updatePrice(card: string, price: number, listings: number, filePath?: string): void {
  const prices = loadPrices(filePath);
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
  
  savePrices(prices, filePath);
}

export function getPriceHistory(card: string, filePath?: string): PriceEntry[] {
  const prices = loadPrices(filePath);
  return prices[card]?.history || [];
}

export function getCurrentPrice(card: string, filePath?: string): number | null {
  const prices = loadPrices(filePath);
  return prices[card]?.current || null;
}

export function listPrices(filePath?: string): void {
  const prices = loadPrices(filePath);
  const cards = Object.entries(prices);
  
  console.log(chalk.cyan('\n💰 ') + chalk.bold('Price History'));
  console.log(chalk.gray('─'.repeat(50)));
  
  if (cards.length === 0) {
    console.log(chalk.yellow('  No price data yet. Run a price check first!\n'));
    return;
  }
  
  cards.forEach(([card, data]) => {
    const cardName = chalk.white(card);
    const current = chalk.green(`$${data.current}`);
    const entries = chalk.gray(`(${data.history.length} entries)`);
    console.log(`  ${cardName}: ${current} ${entries}`);
  });
  
  console.log(chalk.gray('─'.repeat(50)) + '\n');
}

export function showPriceHistory(card: string, filePath?: string): void {
  const prices = loadPrices(filePath);
  const data = prices[card];
  
  console.log(chalk.cyan('\n📜 ') + chalk.bold(`${card} Price History`));
  console.log(chalk.gray('─'.repeat(40)));
  
  if (!data || data.history.length === 0) {
    console.log(chalk.yellow('  No history for this card.\n'));
    return;
  }
  
  data.history.forEach((entry, i) => {
    const date = chalk.gray(entry.date);
    const price = chalk.green(`$${entry.price}`);
    const listings = chalk.cyan(`(${entry.listings} listings)`);
    const arrow = i === 0 ? '→' : ' ';
    console.log(`  ${arrow} ${date}: ${price} ${listings}`);
  });
  
  console.log(chalk.gray('─'.repeat(40)) + '\n');
}

// CLI
const args = process.argv.slice(2);
if (args[0] === 'update' && args[1] && args[2]) {
  updatePrice(args[1], parseFloat(args[2]), parseInt(args[3]) || 1);
} else if (args[0] === 'history' && args[1]) {
  showPriceHistory(args[1]);
} else if (args[0] === 'list') {
  listPrices();
}
