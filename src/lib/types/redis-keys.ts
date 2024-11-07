import type { MaterialLeaderboardItemSchema } from "@/lib/schemas/Oaklands/MaterialLeaderboardItem";
import type {
    MaterialStockMarket,
    RockVariantRNG,
    StoresItems,
    StoreItem,
    TranslationKeys,
    Newsletters
} from "@/lib/types/experience";

export interface RedisKeys {
    material_stock_market: [
        /** The time that the stock market will reset, in epoch. */
        number,
        MaterialStockMarket
    ];
    current_rock_rng: RockVariantRNG;
    material_leaderboard: [
        number,
        number,
        string[],
        Record<string, MaterialLeaderboardItemSchema[]>
    ];
    store_items: StoresItems;
    ship_location: [number, number, number];
    classic_shop: [number, StoreItem[]];
    last_update_epoch: number;
    translation_strings: TranslationKeys;
    news_letters: Newsletters;
}