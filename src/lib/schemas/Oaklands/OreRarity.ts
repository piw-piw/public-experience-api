import { z } from '@hono/zod-openapi';

const OreRarity = z.record(z.record(z.record(z.number())));

export type OreRaritySchema = z.infer<typeof OreRarity>;

export default OreRarity;