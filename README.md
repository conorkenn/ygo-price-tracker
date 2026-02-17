# YGO Price Tracker

Track Yu-Gi-Oh! card prices on eBay and get Discord alerts when prices drop!

## Setup

```bash
npm install
npm run build
```

## Configuration

Edit `config.json` to add cards to your watchlist:

```json
{
  "watchlist": [
    { "card": "Dark Magician Girl", "maxPrice": 100 },
    { "card": "Blue-Eyes White Dragon", "maxPrice": 150 }
  ],
  "checkInterval": "6h"
}
```

## Usage

### Check prices
```bash
npm run check
```

### Manage watchlist
```bash
npm run config:add "Card Name" 100
npm run config:remove "Card Name"
npm run config:list
```

### View price history
```bash
npm run prices:list
```

## Discord Alerts

Set the Discord webhook URL:
```bash
export DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/..."
```

## Cron Job

Add to crontab to run automatically:
```bash
0 */6 * * * cd /path/to/ygo-price-tracker && npm run check
```

## eBay API (Coming Soon)

Currently uses mock data. When eBay API keys are ready:
1. Sign up at developers.ebay.com
2. Get your API credentials
3. Replace `src/ebay.ts` with real API calls
