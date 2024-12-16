import type { MaterialLeaderboardItemSchema } from "@/lib/schemas/Oaklands/MaterialLeaderboardItem";
import type {
    MaterialStockMarket,
    RockVariantRNG,
    StoresItems,
    TranslationKeys,
    Newsletters,
    ItemInformation,
    ChangelogEntry
} from "@/lib/types/experience";

export interface RedisKeys {
    /**
     * The current material stock market.
     * 0 = Reset time in an epoch.
     * 1 = The current stock market data.
     */
    material_stock_market: [ number, MaterialStockMarket ];
    /** The current rock rng values. */
    current_rock_rng: RockVariantRNG;
    /**
     * The last cached material leaderboard.
     * 0 = Reset time in an epoch.
     * 1 = Last cache time in an epoch.
     * 2 = A list of currencies.
     * 3 = The material leaderboard data.
    */
    material_leaderboard: [ number, number, string[], Record<string, MaterialLeaderboardItemSchema[]> ];
    /** All of the current store items (minus classic shop and removed stores) in Oaklands. */
    store_items: StoresItems;
    /**
     * The current ship location.
     * 0 = Reset time in an epoch.
     * 1 = The current position location number (0, 1, 2, 3, ...)
     * 2 = The next position location number (0, 1, 2, 3, ...)
     */
    ship_location: [number, number, number];
    /**
     * The current classic shop.
     * 0 = Reset time in an epoch.
     * 1 = The current store items.
     */
    classic_shop: [number, string[]];
    /** The last time Oaklands was updated as an epoch. */
    last_update_epoch: number;
    /** All of the current translation strings. */
    translation_strings: TranslationKeys;
    /** ALl of the available newsletters. */
    news_letters: Newsletters;
    /** All of the items in Oaklands */
    item_details: ItemInformation;
    /** The current changelogs.
     * 0 = Latest version.
     * 1 = All of the versions.
    */
    changelog: [ string, Record<string, Omit<ChangelogEntry, '_id'>> ];
}