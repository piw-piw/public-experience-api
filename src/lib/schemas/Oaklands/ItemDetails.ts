import { z } from '@hono/zod-openapi';

const ItemDetails = z.object({
    identifier: z.string(),
    name: z.string(),
    description: z.string(),
    store: z.object({
        currency: z.string(),
        price: z.number(),
        type: z.string(),
    }).optional(),
    item: z.record(z.string(), z.any()).optional(),
    gift: z.object({
        unbox_epoch: z.number()
    }).optional(),
});

export type ItemDetailsSchema = z.infer<typeof ItemDetails>;

export default ItemDetails;