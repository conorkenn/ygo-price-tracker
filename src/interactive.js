const inquirer = require('inquirer');
const { loadConfig, saveConfig, addToWatchlist, removeFromWatchlist } = require('./config');
const { loadPrices, showPriceHistory, listPrices } = require('./prices');
const { checkPrices } = require('./check');
const { searchWithPrices, formatCardForDisplay, formatCardDetail } = require('./ygo-api');

async function showMainMenu() {
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: '🎯 YGO Price Tracker',
      loop: false,
      choices: [
        '🔍 Search Cards',
        '📋 View Watchlist',
        '➕ Add Card to Watchlist',
        '➖ Remove Card from Watchlist',
        '🔍 Check Prices Now',
        '💰 View Price History',
        '📊 View All Prices',
        '🚪 Exit'
      ]
    }
  ]);
  
  switch (action) {
    case '🔍 Search Cards':
      await searchCards();
      break;
    case '📋 View Watchlist':
      await viewWatchlist();
      break;
    case '➕ Add Card to Watchlist':
      await addCard();
      break;
    case '➖ Remove Card from Watchlist':
      await removeCard();
      break;
    case '🔍 Check Prices Now':
      await checkPricesNow();
      break;
    case '💰 View Price History':
      await viewHistory();
      break;
    case '📊 View All Prices':
      viewAllPrices();
      break;
    case '🚪 Exit':
      console.log('\n👋 Bye!\n');
      process.exit(0);
  }
}

async function searchCards() {
  console.log('\n🔍 Search Cards\n');
  
  const { query } = await inquirer.prompt([
    {
      type: 'input',
      name: 'query',
      message: 'Card name:',
      validate: input => input.trim().length > 0 || 'Please enter a card name'
    }
  ]);
  
  console.log('\n🔍 Searching...\n');
  
  const results = await searchWithPrices(query.trim());
  
  if (results.length === 0) {
    console.log('No cards found.\n');
    await backToMenu();
    return;
  }
  
  // Format results for display
  const choices = results.map((result, i) => ({
    name: formatCardForDisplay(result, i),
    value: i
  }));
  choices.push({ name: '← Go Back', value: -1 });
  
  const { index } = await inquirer.prompt([
    {
      type: 'list',
      name: 'index',
      message: 'Select a card:',
      choices,
      loop: false
    }
  ]);
  
  if (index === -1) {
    await showMainMenu();
    return;
  }
  
  const selected = results[index];
  
  // Show card details
  console.log('\n' + formatCardDetail(selected));
  
  // Ask to add to watchlist
  const { addToWatchlist: shouldAdd } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'addToWatchlist',
      message: 'Add to watchlist?',
      default: true
    }
  ]);
  
  if (shouldAdd) {
    const { maxPrice } = await inquirer.prompt([
      {
        type: 'number',
        name: 'maxPrice',
        message: 'Max price to pay ($):',
        default: 100
      }
    ]);
    
    addToWatchlist(selected.card.name, maxPrice);
    console.log(`\n✅ Added "${selected.card.name}" to watchlist!`);
  }
  
  await backToMenu();
}

async function viewWatchlist() {
  const config = loadConfig();
  
  console.log('\n📋 Your Watchlist\n');
  if (config.watchlist.length === 0) {
    console.log('No cards in your watchlist yet!\n');
  } else {
    config.watchlist.forEach((item, i) => {
      console.log(`  ${i + 1}. ${item.card} - $${item.maxPrice}`);
    });
    console.log('');
  }
  
  await backToMenu();
}

async function addCard() {
  console.log('\n➕ Add Card to Watchlist\n');
  
  const { cardName } = await inquirer.prompt([
    {
      type: 'input',
      name: 'cardName',
      message: 'Card name:',
      validate: input => input.trim().length > 0 || 'Please enter a card name'
    }
  ]);
  
  const { maxPrice } = await inquirer.prompt([
    {
      type: 'number',
      name: 'maxPrice',
      message: 'Max price ($):',
      default: 100
    }
  ]);
  
  addToWatchlist(cardName.trim(), maxPrice);
  console.log('\n✅ Card added successfully!\n');
  
  await backToMenu();
}

async function removeCard() {
  const config = loadConfig();
  
  if (config.watchlist.length === 0) {
    console.log('\n➖ Remove Card\n');
    console.log('No cards to remove!\n');
    await backToMenu();
    return;
  }
  
  const choices = config.watchlist.map((item, i) => ({
    name: `${item.card} - $${item.maxPrice}`,
    value: i
  }));
  choices.push({ name: '← Go Back', value: -1 });
  
  const { index } = await inquirer.prompt([
    {
      type: 'list',
      name: 'index',
      message: 'Select card to remove:',
      choices,
      loop: false
    }
  ]);
  
  if (index === -1) {
    await showMainMenu();
    return;
  }
  
  const removed = config.watchlist[index];
  removeFromWatchlist(removed.card);
  console.log('\n✅ Card removed successfully!\n');
  
  await backToMenu();
}

async function checkPricesNow() {
  console.log('\n🔍 Checking Prices...\n');
  await checkPrices();
  await backToMenu();
}

async function viewHistory() {
  const config = loadConfig();
  
  if (config.watchlist.length === 0) {
    console.log('\n💰 View Price History\n');
    console.log('No cards in your watchlist!\n');
    await backToMenu();
    return;
  }
  
  const choices = config.watchlist.map(item => ({
    name: item.card,
    value: item.card
  }));
  choices.push({ name: '← Go Back', value: '' });
  
  const { cardName } = await inquirer.prompt([
    {
      type: 'list',
      name: 'cardName',
      message: 'Select card:',
      choices,
      loop: false
    }
  ]);
  
  if (!cardName) {
    await showMainMenu();
    return;
  }
  
  showPriceHistory(cardName);
  await backToMenu();
}

function viewAllPrices() {
  listPrices();
}

async function backToMenu() {
  await inquirer.prompt([
    {
      type: 'list',
      name: 'back',
      message: '',
      choices: ['← Back to Menu'],
      loop: false
    }
  ]);
  
  await showMainMenu();
}

async function startInteractive() {
  console.clear();
  console.log('\n🎯 YGO Price Tracker\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  await showMainMenu();
}

module.exports = { startInteractive };

// Run if called directly
if (require.main === module) {
  startInteractive().catch(console.error);
}
