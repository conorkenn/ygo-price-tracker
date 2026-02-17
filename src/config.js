"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadConfig = loadConfig;
exports.saveConfig = saveConfig;
exports.addToWatchlist = addToWatchlist;
exports.removeFromWatchlist = removeFromWatchlist;
exports.listWatchlist = listWatchlist;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const CONFIG_PATH = path.join(__dirname, '..', 'config.json');
function loadConfig() {
    const data = fs.readFileSync(CONFIG_PATH, 'utf-8');
    return JSON.parse(data);
}
function saveConfig(config) {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}
function addToWatchlist(card, maxPrice) {
    const config = loadConfig();
    config.watchlist.push({ card, maxPrice });
    saveConfig(config);
    console.log(`Added "${card}" with max price $${maxPrice}`);
}
function removeFromWatchlist(card) {
    const config = loadConfig();
    const index = config.watchlist.findIndex((item) => item.card.toLowerCase() === card.toLowerCase());
    if (index === -1) {
        console.log(`"${card}" not found in watchlist`);
        return;
    }
    const removed = config.watchlist.splice(index, 1)[0];
    saveConfig(config);
    console.log(`Removed "${removed.card}" from watchlist`);
}
function listWatchlist() {
    const config = loadConfig();
    console.log('\n📋 Watchlist:');
    config.watchlist.forEach((item, i) => {
        console.log(`  ${i + 1}. ${item.card} - Max: $${item.maxPrice}`);
    });
    console.log('');
}
// CLI
const args = process.argv.slice(2);
if (args[0] === 'add' && args[1]) {
    addToWatchlist(args[1], parseFloat(args[2]) || 100);
}
else if (args[0] === 'remove' && args[1]) {
    removeFromWatchlist(args[1]);
}
else if (args[0] === 'list') {
    listWatchlist();
}
//# sourceMappingURL=config.js.map