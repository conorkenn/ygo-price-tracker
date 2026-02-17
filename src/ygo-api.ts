// Card search using YGO Pro Deck API

const YGO_API = 'https://db.ygoprodeck.com/api/v7/cardinfo.php';

export interface YGOCard {
  id: number;
  name: string;
  type: string;
  desc: string;
  atk?: number;
  def?: number;
  level?: number;
  race: string;
  attribute?: string;
  card_images: {
    id: number;
    image_url: string;
    image_url_small: string;
  }[];
  card_sets?: {
    set_name: string;
    set_code: string;
    set_rarity: string;
    set_price: string;
  }[];
  card_prices?: {
    cardmarket_price: string;
    tcgplayer_price: string;
    ebay_price: string;
    amazon_price: string;
    coolstuffinc_price: string;
  }[];
  misc_info?: {
    rarities: string[];
  }[];
}

export interface SearchResult {
  card: YGOCard;
  lowestPrice: number;
  availableSets: string[];
  rarities: string[];
}

export async function searchCards(query: string, num = 10): Promise<YGOCard[]> {
  try {
    // Use fname for fuzzy search (contains the text)
    const url = `${YGO_API}?fname=${encodeURIComponent(query)}&num=${num}&offset=0`;
    const response = await fetch(url);
    
    if (!response.ok) {
      // If fname fails, try exact name search
      const exactUrl = `${YGO_API}?name=${encodeURIComponent(query)}&num=${num}&offset=0`;
      const exactResponse = await fetch(exactUrl);
      
      if (!exactResponse.ok) {
        return [];
      }
      
      const exactData = await exactResponse.json();
      return exactData.data || [];
    }
    
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error searching cards:', error);
    return [];
  }
}

export async function getCardById(id: number): Promise<YGOCard | null> {
  try {
    const url = `${YGO_API}?id=${id}&num=1&offset=0`;
    const response = await fetch(url);
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    return data.data?.[0] || null;
  } catch (error) {
    console.error('Error fetching card:', error);
    return null;
  }
}

export async function searchWithPrices(query: string): Promise<SearchResult[]> {
  const cards = await searchCards(query, 10);
  
  return cards.map(card => {
    // Get lowest price from card_prices (current market prices)
    const prices = [
      parseFloat(card.card_prices?.[0]?.cardmarket_price || '0'),
      parseFloat(card.card_prices?.[0]?.tcgplayer_price || '0'),
      parseFloat(card.card_prices?.[0]?.ebay_price || '0'),
      parseFloat(card.card_prices?.[0]?.amazon_price || '0'),
      parseFloat(card.card_prices?.[0]?.coolstuffinc_price || '0'),
    ].filter(p => p > 0);
    
    const lowestPrice = prices.length > 0 ? Math.min(...prices) : 0;
    
    // Get unique rarities from card sets
    const rarities = [...new Set(
      card.card_sets?.map(s => s.set_rarity).filter(Boolean) || []
    )];
    
    // Get available sets
    const availableSets = card.card_sets?.map(s => `${s.set_name} (${s.set_rarity})`) || [];
    
    return {
      card,
      lowestPrice,
      availableSets,
      rarities
    };
  });
}

export function formatCardForDisplay(result: SearchResult, index: number): string {
  const { card, lowestPrice, rarities } = result;
  
  const name = card.name;
  const type = card.type;
  const price = lowestPrice > 0 ? `$${lowestPrice.toFixed(2)}` : 'N/A';
  const rarityList = rarities.length > 0 ? rarities.slice(0, 3).join(', ') : 'Unknown';
  
  return `${index + 1}. ${name}
   Type: ${type} | Est. Price: ${price} | Rarities: ${rarityList}`;
}

export function formatCardDetail(result: SearchResult): string {
  const { card, lowestPrice, rarities, availableSets } = result;
  
  let output = '';
  output += `🃏 ${card.name}\n`;
  output += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  output += `Type: ${card.type}\n`;
  output += `ATK: ${card.atk || 'N/A'} | DEF: ${card.def || 'N/A'}\n`;
  output += `Level: ${card.level || 'N/A'} | Race: ${card.race}\n`;
  output += `Attribute: ${card.attribute || 'N/A'}\n`;
  output += `\n💰 Current Lowest Price: $${lowestPrice.toFixed(2)}\n`;
  output += `\n🏆 Rarities:\n`;
  rarities.forEach(r => output += `   • ${r}\n`);
  output += `\n📦 Available Sets (${availableSets.length}):\n`;
  availableSets.slice(0, 5).forEach(s => output += `   • ${s}\n`);
  if (availableSets.length > 5) {
    output += `   ... and ${availableSets.length - 5} more\n`;
  }
  
  return output;
}

// Get popular cards for browsing
export async function getPopularCards(): Promise<YGOCard[]> {
  try {
    const response = await fetch(`${YGO_API}?num=20&offset=0`);
    
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching popular cards:', error);
    return [];
  }
}
