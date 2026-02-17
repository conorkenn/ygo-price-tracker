import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';

export interface WatchItem {
  card: string;
  maxPrice: number;
}

export interface Config {
  watchlist: WatchItem[];
  checkInterval: string;
}

const CONFIG_PATH = path.join(__dirname, '..', 'config.json');

export function loadConfig(filePath?: string): Config {
  const targetPath = filePath || CONFIG_PATH;
  if (!fs.existsSync(targetPath)) {
    return { watchlist: [], checkInterval: '6h' };
  }
  const data = fs.readFileSync(targetPath, 'utf-8');
  return JSON.parse(data);
}

export function saveConfig(config: Config, filePath?: string): void {
  const targetPath = filePath || CONFIG_PATH;
  fs.writeFileSync(targetPath, JSON.stringify(config, null, 2));
}

export function addToWatchlist(card: string, maxPrice: number, filePath?: string): void {
  const config = loadConfig(filePath);
  config.watchlist.push({ card, maxPrice });
  saveConfig(config, filePath);
  console.log(chalk.green(`✓ Added "${card}" with max price $${maxPrice}`));
}

export function removeFromWatchlist(card: string, filePath?: string): void {
  const config = loadConfig(filePath);
  const index = config.watchlist.findIndex((item) => 
    item.card.toLowerCase() === card.toLowerCase()
  );
  if (index === -1) {
    console.log(chalk.red(`✗ "${card}" not found in watchlist`));
    return;
  }
  const removed = config.watchlist.splice(index, 1)[0];
  saveConfig(config, filePath);
  console.log(chalk.green(`✓ Removed "${removed.card}" from watchlist`));
}

export function listWatchlist(filePath?: string): void {
  const config = loadConfig(filePath);
  
  console.log(chalk.cyan('\n📋 ') + chalk.bold('Your Watchlist'));
  console.log(chalk.gray('─'.repeat(40)));
  
  if (config.watchlist.length === 0) {
    console.log(chalk.yellow('  No cards in watchlist. Add some with:'));
    console.log(chalk.gray('  npm run config:add "Card Name" 100\n'));
    return;
  }
  
  config.watchlist.forEach((item, i) => {
    const number = chalk.white(String(i + 1).padStart(2, ' '));
    const card = chalk.white(item.card);
    const price = chalk.yellow(`$${item.maxPrice}`);
    console.log(`  ${number}. ${card} → ${price}`);
  });
  
  console.log(chalk.gray('─'.repeat(40)) + '\n');
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
