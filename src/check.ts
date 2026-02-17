import { loadConfig, Config } from './config';
import { loadPrices, savePrices, updatePrice, PriceHistory } from './prices';
import { searchEbay, filterPsa10Only, getLowestPriceListing, EbaySearchResult, EbayListing } from './ebay';

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
  
  console.log('🔍 Checking prices...\n');
  
  for (const item of config.watchlist) {
    console.log(`Checking: ${item.card} (threshold: $${item.maxPrice})`);
    
    try {
      const result = await searchEbay(item.card);
      const filtered = filterPsa10Only(result);
      const lowest = getLowestPriceListing(filtered);
      
      if (!lowest) {
        console.log(`  No listings found for ${item.card}`);
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
        
        console.log(`  🎯 DEAL FOUND: $${lowest.price} (was $${previousPrice})`);
      } else {
        console.log(`  Price: $${lowest.price} (threshold: $${item.maxPrice})`);
      }
    } catch (error) {
      console.log(`  Error checking ${item.card}:`, error);
    }
    
    console.log('');
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
    console.log('\n📣 DEALS FOUND:\n');
    alerts.forEach(alert => {
      console.log(formatAlert(alert));
      console.log('\n' + '='.repeat(50) + '\n');
    });
  } else {
    console.log('No deals found today. Keep watching! 👀');
  }
}

// CLI
main().catch(console.error);
