import { z } from '@hono/zod-openapi';

const StockMarketMaterial = z.object({
    name: z.string(),
    value_type: z.string().optional(),
    base_value: z.number(),
    current_value: z.number(),
    current_difference: z.number(),
    last_difference: z.number()
});

export type StockMarketMaterialSchema = z.infer<typeof StockMarketMaterial>;

export const StockMarketMaterialExample: StockMarketMaterialSchema = {
    name: "Raw Petrified Oak",
    base_value: 1.75,
    current_value: 1.4525,
    current_difference: 0.83,
    last_difference: 0.8
};

export default StockMarketMaterial;