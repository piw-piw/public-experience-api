import { z } from '@hono/zod-openapi';

const MonthlyCashEarnedLeaderboardPlayer = z.object({
    position: z.number(),
    user_id: z.string(),
    cash_amount: z.number()
});

export type MonthlyCashEarnedLeaderboardPlayerSchema = z.infer<typeof MonthlyCashEarnedLeaderboardPlayer>;

export default MonthlyCashEarnedLeaderboardPlayer;