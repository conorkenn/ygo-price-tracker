// Card search using YGO Pro Deck API

const YGO_API = 'https://db.ygoprodeck.com/api/v7/cardinfo.php';

// Common misspellings mapping
const SPELLING_CORRECTIONS: { [key: string]: string } = {
  'harpy': 'harpie',
  'harpy lady': 'harpie lady',
  'harpy lady sisters': 'harpie lady sisters',
  'dark magician girl': 'dark magician girl',
  'blue eyes': 'blue-eyes',
  'blue eye': 'blue-eyes',
  'red eyes': 'red-eyes',
  'red eye': 'red-eyes',
  'black dragon': 'black dragon',
  'dark magician': 'dark magician',
  'witch': 'witch',
  // Add more as needed
};

// Year mapping for common set codes
const SET_YEARS: { [key: string]: string } = {
  'LOB': '2002',
  'MRD': '2002',
  'SDK': '2003',
  'SKE': '2003',
  'YSD': '2003',
  'PGD': '2004',
  'DLN': '2004',
  'DDC': '2004',
  'TKN': '2004',
  'TLG': '2005',
  'DR1': '2005',
  'DR2': '2005',
  'DR3': '2005',
  'DR4': '2005',
  'DRS': '2006',
  'FET': '2006',
  'RDS': '2006',
  'STON': '2006',
  'FOTB': '2006',
  'GLD': '2007',
  'CRV': '2007',
  'TSHD': '2007',
  'SOC': '2008',
  'SOI': '2008',
  'SOD': '2008',
  'LOD': '2009',
  'LCJW': '2009',
  'SS01': '2016',
  'SS02': '2017',
  'SS03': '2018',
  'SS04': '2019',
  'SS05': '2019',
  'SS06': '2020',
  'SS07': '2021',
  'SS08': '2022',
  'SS09': '2023',
  'SS10': '2024',
  'MP22': '2022',
  'MP23': '2023',
  'MP24': '2024',
  'RA01': '2022',
  'RA02': '2023',
  'RA03': '2024',
  'RA04': '2024',
  'MVP1': '2016',
  'GFP1': '2022',
  'GFP2': '2023',
  'MAMA': '2022',
  'LART': '2020',
  'LEDD': '2018',
  'LED6': '2022',
  'LDS1': '2019',
  'LDS2': '2020',
  'LDS3': '2021',
  'LDS4': '2022',
  'YGLD': '2023',
  'CT2': '2005',
  'DT': '2008',
  'MFC': '2005',
  'PGLD': '2014',
  'STAX': '2005',
  'YSYR': '2014',
  'SDMY': '2014',
  'YS11': '2011',
  'SDD': '2003',
};

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
  availableSets: { name: string; rarity: string; year: string }[];
  rarities: string[];
}

function correctSpelling(query: string): string {
  const lower = query.toLowerCase().trim();
  
  // Check exact matches
  if (SPELLING_CORRECTIONS[lower]) {
    return SPELLING_CORRECTIONS[lower];
  }
  
  // Check if any key is contained in the query
  for (const [wrong, correct] of Object.entries(SPELLING_CORRECTIONS)) {
    if (lower.includes(wrong)) {
      return lower.replace(wrong, correct);
    }
  }
  
  return query;
}

function extractYearFromSetCode(setCode: string): string {
  // Try to match known set codes
  for (const [code, year] of Object.entries(SET_YEARS)) {
    if (setCode.startsWith(code)) {
      return year;
    }
  }
  
  // Try to extract year from set code format like "MRD-EN008"
  // The first 3 letters usually identify the set
  const match = setCode.match(/^([A-Z]+)-/);
  if (match) {
    const prefix = match[1];
    // Some sets use format like "MP22-EN268" where numbers indicate year
    const yearMatch = prefix.match(/\d{2}/);
    if (yearMatch) {
      const yearNum = parseInt(yearMatch[0]);
      if (yearNum >= 22 && yearNum <= 30) {
        return `20${yearNum}`;
      }
    }
  }
  
  return 'Unknown';
}

export async function searchCards(query: string, num = 10): Promise<YGOCard[]> {
  // Correct spelling first
  const correctedQuery = correctSpelling(query);
  
  if (correctedQuery !== query) {
    console.log(`   📝 Corrected: "${query}" → "${correctedQuery}"`);
  }
  
  try {
    // Use fname for fuzzy search (contains the text)
    const url = `${YGO_API}?fname=${encodeURIComponent(correctedQuery)}&num=${num}&offset=0`;
    const response = await fetch(url);
    
    if (!response.ok) {
      // If fname fails, try exact name search
      const exactUrl = `${YGO_API}?name=${encodeURIComponent(correctedQuery)}&num=${num}&offset=0`;
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

export async function searchWithPrices(query: string): Promise<SearchResult[]> {
  const cards = await searchCards(query, 10);
  
  return cards.map(card => {
    // Get lowest price from card_prices
    const prices = [
      parseFloat(card.card_prices?.[0]?.cardmarket_price || '0'),
      parseFloat(card.card_prices?.[0]?.tcgplayer_price || '0'),
      parseFloat(card.card_prices?.[0]?.ebay_price || '0'),
      parseFloat(card.card_prices?.[0]?.amazon_price || '0'),
      parseFloat(card.card_prices?.[0]?.coolstuffinc_price || '0'),
    ].filter(p => p > 0);
    
    const lowestPrice = prices.length > 0 ? Math.min(...prices) : 0;
    
    // Get unique rarities
    const rarities = [...new Set(
      card.card_sets?.map(s => s.set_rarity).filter(Boolean) || []
    )];
    
    // Get available sets with years
    const availableSets = card.card_sets?.map(s => ({
      name: s.set_name,
      rarity: s.set_rarity,
      year: extractYearFromSetCode(s.set_code)
    })) || [];
    
    return {
      card,
      lowestPrice,
      availableSets,
      rarities
    };
  });
}

export function formatCardForDisplay(result: SearchResult, index: number): string {
  const { card, lowestPrice, rarities, availableSets } = result;
  
  const name = card.name;
  const type = card.type;
  const price = lowestPrice > 0 ? `$${lowestPrice.toFixed(2)}` : 'N/A';
  const rarityList = rarities.length > 0 ? rarities.slice(0, 3).join(', ') : 'Unknown';
  
  // Show years available
  const years = [...new Set(availableSets.map(s => s.year))].filter(y => y !== 'Unknown');
  const yearStr = years.length > 0 ? ` [${years.join(', ')}]` : '';
  
  return `${index + 1}. ${name}${yearStr}
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
  
  // Group sets by year
  const setsByYear = availableSets.reduce((acc, s) => {
    if (!acc[s.year]) acc[s.year] = [];
    acc[s.year].push(s);
    return acc;
  }, {} as { [year: string]: typeof availableSets });
  
  output += `\n📦 Available Sets by Year:\n`;
  const years = Object.keys(setsByYear).sort();
  
  if (years.length === 0) {
    output += `   No set info available\n`;
  } else {
    for (const year of years) {
      output += `\n   📅 ${year}:\n`;
      setsByYear[year].slice(0, 5).forEach(s => {
        output += `      • ${s.name} (${s.rarity})\n`;
      });
      if (setsByYear[year].length > 5) {
        output += `      ... and ${setsByYear[year].length - 5} more\n`;
      }
    }
  }
  
  return output;
}
