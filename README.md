# YGO Price Tracker ⚠️ ON HOLD

> ⚠️ **Status:** Waiting for eBay API approval. Project currently uses mock data.

Track Yu-Gi-Oh! card prices on eBay and get Discord alerts when prices drop!

## Current Status

| Component | Status |
|-----------|--------|
| Card search | ✅ Working (YGO Pro Deck API) |
| Watchlist management | ✅ Working |
| Price history | ✅ Working |
| Discord alerts | ✅ Code ready |
| **eBay API** | 🔜 Waiting for approval |

## Setup

```bash
npm install
npm run build

# Copy example config and edit with your own watchlist
cp config.example.json config.json
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

**Note:** `config.json` and `prices.json` are gitignored - your watchlist stays private!

## Usage

### Interactive mode
```bash
npm run interactive
```

### Check prices (currently uses mock data)
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

### Card search
```bash
npm run search "Card Name"
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

## eBay API Integration

**Currently on hold** - waiting for eBay API approval.

Once approved:
1. Sign up at developers.ebay.com
2. Get your API credentials
3. Replace `src/ebay.ts` with real API calls

## Features

- 🔍 Card search with spelling correction (finds "harpy" → "harpie")
- 📅 Set year extraction (knows Metal Raiders is 2002!)
- 🎯 Deal detection when prices drop below your threshold
- 📊 Price history tracking
- 🔔 Discord notifications
- 🎨 Pretty CLI output with colors

## Demo

```
🔍 Searching for "harpy lady"...
   📝 Corrected: "harpy lady" → "harpie lady"
Found 10 cards:

1. Cyber Harpie Lady [2009, 2020]
   Type: Effect Monster | Est. Price: $0.19 | Rarities: Ultra Rare

2. Harpie Lady [2002, 2009]
   Type: Normal Monster | Est. Price: $0.02 | Rarities: Common
```

---

*Project paused until eBay API access is granted.*
