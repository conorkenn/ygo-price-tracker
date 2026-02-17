import { loadConfig, Config } from './config';
import { loadPrices, savePrices, updatePrice, PriceHistory } from './prices';
import { searchEbay, filterPsa10Only, getLowestPriceListing, EbaySearchResult, EbayListing } from './ebay';
import { sendDiscordAlert } from './discord';
import chalk from 'chalk';
import ora from 'ora';

export interface DealAlert {
  card: string;
  currentPrice: number;
  threshold: number;
  savings: number;
  listing: EbayListing;
  isNewLow: boolean;
}

export async function checkPrices(): Promise<DealAlert[]> {
  const config = loadConfig();
  const prices = loadPrices();
  const alerts: DealAlert[] = [];
  
  console.log(chalk.cyan('\n🔍 ') + chalk.bold('Checking Prices...\n'));
  
  for (const item of config.watchlist) {
    const spinner = ora(`Checking: ${item.card}`).start();
    
    try {
      const result = await searchEbay(item.card);
      const filtered = filterPsa10Only(result);
      const lowest = getLowestPriceListing(filtered);
      
      if (!lowest) {
        spinner.warn(`No listings for ${item.card}`);
        continue;
      }
      
      // Update price history
      updatePrice(item.card, lowest.price, filtered.totalListings);
      
      // Check if it's a deal
      if (lowest.price <= item.maxPrice) {
        const previousPrice = prices[item.card]?.current || lowest.price;
        const isNewLow = lowest.price < previousPrice;
        const savings = previousPrice - lowest.price;
        
        alerts.push({
          card: item.card,
          currentPrice: lowest.price,
          threshold: item.maxPrice,
          savings,
          listing: lowest,
          isNewLow,
        });
        
        spinner.succeed(`${item.card}: $${lowest.price} 🎯 DEAL!`);
      } else {
        spinner.info(`${item.card}: $${lowest.price}`);
      }
    } catch (error) {
      spinner.fail(`Error checking ${item.card}`);
    }
  }
  
  return alerts;
}

export function formatAlert(alert: DealAlert): string {
  const savingsText = alert.isNewLow 
    ? `📉 New low! Saved $${alert.savings.toFixed(2)}`
    : `$${alert.savings.toFixed(2)} under threshold`;
  
  return `
🎯 **PRICE ALERT: ${alert.card}**

**Current Price:** $${alert.currentPrice}
**Your Threshold:** $${alert.threshold}
**Savings:** ${savingsText}

**Listing:**
${alert.listing.title}
- Seller: ${alert.listing.seller}
- ${alert.listing.authenticityGuarantee ? '✅ Authenticity Guarantee' : '⚠️ No Auth Guarantee'}
- [View on eBay](${alert.listing.url})
`.trim();
}

export async function main(): Promise<void> {
  const alerts = await checkPrices();
  
  if (alerts.length > 0) {
    console.log(chalk.cyan('\n📣 ') + chalk.bold('DEALS FOUND!') + '\n');
    
    alerts.forEach(alert => {
      const savings = alert.isNewLow 
        ? chalk.green(`📉 New low! -$${alert.savings.toFixed(2)}`)
        : chalk.yellow(`$${alert.savings.toFixed(2)} under threshold`);
      
      console.log(chalk.white('─'.repeat(50)));
      console.log(chalk.bold(`🎯 ${alert.card}`));
      console.log(`  Price: ${chalk.green(`$${alert.currentPrice}`)} / Threshold: $${alert.threshold}`);
      console.log(`  Savings: ${savings}`);
      console.log(`  ${chalk.cyan('→')} ${alert.listing.title}`);
      console.log(`  Seller: ${alert.listing.seller} ${alert.listing.authenticityGuarantee ? '✅' : '⚠️'}`);
      console.log('');
    });
    
    console.log(chalk.white('─'.repeat(50)));
    
    // Send Discord alerts
    await sendDiscordAlert(alerts);
  } else {
    console.log(chalk.yellow('\n👀 No deals found today. Keep watching!\n'));
  }
}

// CLI
main().catch(console.error);
