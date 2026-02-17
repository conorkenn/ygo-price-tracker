const fs = require('fs');
const path = require('path');
const { loadPrices, savePrices, updatePrice, getCurrentPrice } = require('../src/prices');

const TEST_PRICES = path.join(__dirname, 'test-prices.json');

describe('Prices Module', () => {
  beforeAll(() => {
    // Create test prices file
    const initialData = {
      'Dark Magician Girl': {
        current: 85,
        history: [
          { date: '2026-02-17', price: 85, listings: 10 }
        ]
      }
    };
    fs.writeFileSync(TEST_PRICES, JSON.stringify(initialData, null, 2));
  });

  afterAll(() => {
    // Cleanup
    if (fs.existsSync(TEST_PRICES)) {
      fs.unlinkSync(TEST_PRICES);
    }
  });

  test('should load prices correctly', () => {
    const prices = loadPrices(TEST_PRICES);
    expect(prices['Dark Magician Girl'].current).toBe(85);
    expect(prices['Dark Magician Girl'].history).toHaveLength(1);
  });

  test('should update price correctly', () => {
    updatePrice('Dark Magician Girl', 80, 8, TEST_PRICES);
    const prices = loadPrices(TEST_PRICES);
    expect(prices['Dark Magician Girl'].current).toBe(80);
    expect(prices['Dark Magician Girl'].history).toHaveLength(2);
  });

  test('should get current price', () => {
    const price = getCurrentPrice('Dark Magician Girl', TEST_PRICES);
    expect(price).toBe(80);
  });

  test('should return null for unknown card', () => {
    const price = getCurrentPrice('Unknown Card', TEST_PRICES);
    expect(price).toBeNull();
  });
});
