import { z } from '@hono/zod-openapi';

const StockMarketMaterialValue = z.object({
    type: z.string(),
    base_value: z.number(),
    current_value: z.number()
});

const StockMarketMaterial = z.object({
    name: z.string(),
    currency_type: z.string().optional(),
    last_difference: z.number(),
    current_difference: z.number(),
    values: z.array(StockMarketMaterialValue)
});

export type StockMarketMaterialSchema = z.infer<typeof StockMarketMaterial>;

export const StockMarketMaterialExample: StockMarketMaterialSchema = {
    name: "Hallow",
    currency_type: "Candy2024",
    last_difference: 0.8,
    current_difference: 0.81,
    values: [
        { type: "raw", base_value: 12, current_value: 9.72 },
        { type: "milled", base_value: 32, current_value: 25.92 },
        { type: "planked", base_value: 40, current_value: 32.4 }
    ]
};

export default StockMarketMaterial;