import * as fs from 'fs';
import * as path from 'path';

export interface WatchItem {
  card: string;
  maxPrice: number;
}

export interface Config {
  watchlist: WatchItem[];
  checkInterval: string;
}

const CONFIG_PATH = path.join(__dirname, '..', 'config.json');

export function loadConfig(): Config {
  const data = fs.readFileSync(CONFIG_PATH, 'utf-8');
  return JSON.parse(data);
}

export function saveConfig(config: Config): void {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}

export function addToWatchlist(card: string, maxPrice: number): void {
  const config = loadConfig();
  config.watchlist.push({ card, maxPrice });
  saveConfig(config);
  console.log(`Added "${card}" with max price $${maxPrice}`);
}

export function removeFromWatchlist(card: string): void {
  const config = loadConfig();
  const index = config.watchlist.findIndex((item) => 
    item.card.toLowerCase() === card.toLowerCase()
  );
  if (index === -1) {
    console.log(`"${card}" not found in watchlist`);
    return;
  }
  const removed = config.watchlist.splice(index, 1)[0];
  saveConfig(config);
  console.log(`Removed "${removed.card}" from watchlist`);
}

export function listWatchlist(): void {
  const config = loadConfig();
  console.log('\n📋 Watchlist:');
  config.watchlist.forEach((item, i) => {
    console.log(`  ${i + 1}. ${item.card} - Max: $${item.maxPrice}`);
  });
  console.log('');
}

// CLI
const args = process.argv.slice(2);
if (args[0] === 'add' && args[1]) {
  addToWatchlist(args[1], parseFloat(args[2]) || 100);
} else if (args[0] === 'remove' && args[1]) {
  removeFromWatchlist(args[1]);
} else if (args[0] === 'list') {
  listWatchlist();
}
