import { z } from '@hono/zod-openapi';
import ShopItem from '@/lib/schemas/Oaklands/ShopItem';

const Shop = z.object({
    reset_time: z.date().optional(),
    shop_items: z.array(ShopItem)
});

export type ShopSchema = z.infer<typeof Shop>;

export const ShopExample: ShopSchema = {
    reset_time: new Date("2024-10-02T16:00:00.000Z"),
    shop_items: [
        {
            name: "Team Flag",
            currency: "Cash",
            price: 3000,
            type: "Gift",
            identifier: "TeamFlag",
            image: null,
            description: ""
        }
    ]
};

export default Shop;