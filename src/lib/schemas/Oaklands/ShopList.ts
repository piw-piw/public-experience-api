import { z } from '@hono/zod-openapi';

const ShopList = z.object({
    stores: z.array(z.string())
});

export type ShopListSchema = z.infer<typeof ShopList>;

export default ShopList;