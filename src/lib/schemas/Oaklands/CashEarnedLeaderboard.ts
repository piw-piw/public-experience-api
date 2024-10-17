import { z } from '@hono/zod-openapi';
import MonthlyCashEarnedLeaderboardPlayer from '@/lib/schemas/Oaklands/CashEarnedLeaderboardPlayer';

const MonthlyCashEarnedLeaderboard = z.object({
    next_page_cursor: z.nullable(z.string()),
    players: z.array(MonthlyCashEarnedLeaderboardPlayer)
});

export type MonthlyCashEarnedLeaderboardSchema = z.infer<typeof MonthlyCashEarnedLeaderboard>;

export default MonthlyCashEarnedLeaderboard;