// Mock eBay API - simulates eBay responses for testing
// Replace with real eBay API calls when keys arrive

export interface EbayListing {
  title: string;
  price: number;
  url: string;
  seller: string;
  authenticityGuarantee: boolean;
}

export interface EbaySearchResult {
  card: string;
  listings: EbayListing[];
  totalListings: number;
  averagePrice: number;
}

const MOCK_DB: { [card: string]: EbayListing[] } = {
  'dark magician girl': [
    { title: 'Dark Magician Girl Maximum Gold PSA 10', price: 120, url: 'https://ebay.com/1', seller: 'PSA', authenticityGuarantee: true },
    { title: 'Dark Magician Girl RA03 PSA 10', price: 56, url: 'https://ebay.com/2', seller: 'CardShop', authenticityGuarantee: true },
    { title: 'Dark Magician Girl Speed Duel PSA 10', price: 35, url: 'https://ebay.com/3', seller: 'GradedCards', authenticityGuarantee: true },
    { title: 'Dark Magician Girl 2021 JP Promo PSA 10', price: 85, url: 'https://ebay.com/4', seller: 'JapanCardShop', authenticityGuarantee: false },
  ],
  'blue-eyes white dragon': [
    { title: 'Blue-Eyes White Dragon LOB PSA 10', price: 250, url: 'https://ebay.com/5', seller: 'RareCards', authenticityGuarantee: true },
    { title: 'Blue-Eyes White Dragon PSA 9', price: 150, url: 'https://ebay.com/6', seller: 'CardShop', authenticityGuarantee: true },
  ],
};

export async function searchEbay(cardName: string): Promise<EbaySearchResult> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const listings = MOCK_DB[cardName.toLowerCase()] || [
    { title: `${cardName} PSA 10`, price: 75, url: 'https://ebay.com/test', seller: 'TestSeller', authenticityGuarantee: true },
  ];
  
  const totalListings = listings.length;
  const averagePrice = listings.reduce((sum, l) => sum + l.price, 0) / totalListings;
  
  return {
    card: cardName,
    listings,
    totalListings,
    averagePrice,
  };
}

export function getLowestPriceListing(result: EbaySearchResult): EbayListing | null {
  if (result.listings.length === 0) return null;
  return result.listings.reduce((lowest, current) => 
    current.price < lowest.price ? current : lowest
  );
}

export function filterPsa10Only(result: EbaySearchResult): EbaySearchResult {
  return {
    ...result,
    listings: result.listings.filter(l => 
      l.title.includes('PSA 10') || l.authenticityGuarantee
    ),
  };
}
