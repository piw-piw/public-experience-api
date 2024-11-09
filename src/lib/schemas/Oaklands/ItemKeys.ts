import { z } from '@hono/zod-openapi';

const ItemKeys = z.object({
    keys: z.string().array()
});

export type ItemKeysSchema = z.infer<typeof ItemKeys>;

export default ItemKeys;