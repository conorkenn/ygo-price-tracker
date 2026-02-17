export interface WatchItem {
    card: string;
    maxPrice: number;
}
export interface Config {
    watchlist: WatchItem[];
    checkInterval: string;
}
export declare function loadConfig(): Config;
export declare function saveConfig(config: Config): void;
export declare function addToWatchlist(card: string, maxPrice: number): void;
export declare function removeFromWatchlist(card: string): void;
export declare function listWatchlist(): void;
//# sourceMappingURL=config.d.ts.map