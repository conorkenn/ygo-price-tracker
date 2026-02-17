const fs = require('fs');
const path = require('path');
const { loadConfig, saveConfig } = require('../src/config');

const TEST_CONFIG_1 = path.join(__dirname, 'test-config-1.json');
const TEST_CONFIG_2 = path.join(__dirname, 'test-config-2.json');

describe('Config Module', () => {
  beforeAll(() => {
    // Create fresh test configs before all tests
    const TEST_WATCHLIST_1 = [
      { card: 'Dark Magician Girl', maxPrice: 100 },
      { card: 'Blue-Eyes White Dragon', maxPrice: 150 }
    ];
    fs.writeFileSync(TEST_CONFIG_1, JSON.stringify({ watchlist: TEST_WATCHLIST_1, checkInterval: '6h' }, null, 2));
    
    const TEST_WATCHLIST_2 = [
      { card: 'Dark Magician Girl', maxPrice: 100 },
      { card: 'Blue-Eyes White Dragon', maxPrice: 150 }
    ];
    fs.writeFileSync(TEST_CONFIG_2, JSON.stringify({ watchlist: TEST_WATCHLIST_2, checkInterval: '6h' }, null, 2));
  });

  afterAll(() => {
    // Cleanup
    [TEST_CONFIG_1, TEST_CONFIG_2].forEach(file => {
      if (fs.existsSync(file)) fs.unlinkSync(file);
    });
  });

  test('should load config correctly', () => {
    const config = loadConfig(TEST_CONFIG_1);
    expect(config.watchlist).toHaveLength(2);
    expect(config.watchlist[0].card).toBe('Dark Magician Girl');
    expect(config.watchlist[0].maxPrice).toBe(100);
  });

  test('should save config correctly', () => {
    const newConfig = { 
      watchlist: [
        { card: 'Dark Magician Girl', maxPrice: 100 },
        { card: 'Blue-Eyes White Dragon', maxPrice: 150 },
        { card: 'Red-Eyes Black Dragon', maxPrice: 75 }
      ], 
      checkInterval: '6h' 
    };
    saveConfig(newConfig, TEST_CONFIG_2);
    const loaded = loadConfig(TEST_CONFIG_2);
    expect(loaded.watchlist).toHaveLength(3);
  });
});
