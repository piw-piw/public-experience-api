import type { MaterialLeaderboardItemSchema } from "@/lib/schemas/Oaklands/MaterialLeaderboardItem";
import type { ShopItemchema } from "../schemas/Oaklands/ShopItem";
import type {
    MaterialStockMarket,
    RockVariantRNG,
    StoresItems,
    TranslationKeys,
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
        { currencies: string[]; leaderboards: Record<string, MaterialLeaderboardItemSchema[]>; }
    ];
    store_items: StoresItems;
    ship_location: [number, number, number];
    classic_shop: [number, ShopItemchema[]];
    last_update_epoch: number;
    translation_strings: TranslationKeys;
}