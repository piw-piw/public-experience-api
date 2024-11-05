import { z } from '@hono/zod-openapi';

const ShipLocation = z.object({
    reset_time: z.date(),
    current_location: z.string(),
    next_location: z.string()
});

export type ShipLocationSchema = z.infer<typeof ShipLocation>;

export default ShipLocation;