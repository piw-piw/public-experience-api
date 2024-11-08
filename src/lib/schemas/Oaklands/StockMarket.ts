import { z } from '@hono/zod-openapi';
import StockMarketMaterial from '@/lib/schemas/Oaklands/StockMarketMaterial';

const StockMarket = z.object({
    reset_time: z.date(),
    trees: z.record(StockMarketMaterial).optional(),
    rocks: z.record(StockMarketMaterial).optional(),
    ores: z.record(StockMarketMaterial).optional()
});

export type StockMarketSchema = z.infer<typeof StockMarket>;

export const StockMarketExample: StockMarketSchema = {
    reset_time: new Date("2024-10-02T04:00:00.000Z"),
    trees: {
        hallow: {
            name: "Hallow",
            currency_type: "Candy2024",
            last_difference: 0.8,
            current_difference: 0.81,
            values: [
                { type: "raw", base_value: 12, current_value: 9.72 },
                { type: "milled", base_value: 32, current_value: 25.92 },
                { type: "planked", base_value: 40, current_value: 32.4 }
            ]
        }
    },
    rocks: {
    },
    ores: {
    }
};

export default StockMarket;