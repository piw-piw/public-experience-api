import { z } from '@hono/zod-openapi';

const ShopItem = z.object({
    name: z.string(),
    currency: z.string(),
    price: z.number(),
    type: z.string(),
    identifier: z.string(),
    image: z.nullable(z.string()).optional(),
    description: z.string(),
});

export type ShopItemSchema = z.infer<typeof ShopItem>;

export default ShopItem;