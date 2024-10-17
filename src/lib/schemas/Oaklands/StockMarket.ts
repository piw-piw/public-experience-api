import { z } from '@hono/zod-openapi';
import StockMarketMaterial from '@/lib/schemas/Oaklands/StockMarketMaterial';

const StockMarket = z.object({
    reset_time: z.date(),
    trees: z.record(StockMarketMaterial),
    rocks: z.record(StockMarketMaterial),
    ores: z.record(StockMarketMaterial)
});

export type StockMarketSchema = z.infer<typeof StockMarket>;

export const StockMarketExample: StockMarketSchema = {
    reset_time: new Date("2024-10-02T04:00:00.000Z"),
    trees: {
        raw_petrified_oak: {
            name: "Raw Petrified Oak",
            base_value: 1.75,
            current_value: 1.4525,
            current_difference: 0.83,
            last_difference: 0.8
        }
    },
    rocks: {
        raw_sand_slate: {
            name: "Raw Sand Slate",
            base_value: 10,
            current_value: 9.9,
            current_difference: 0.99,
            last_difference: 0.95
        }
    },
    ores: {
        forged_sand: {
            name: "Forged Sand",
            base_value: 24,
            current_value: 19.20,
            current_difference: 0.8,
            last_difference: 0.92
        }
    }
}

export default StockMarket;