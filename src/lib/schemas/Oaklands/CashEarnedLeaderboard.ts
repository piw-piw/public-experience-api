import { z } from '@hono/zod-openapi';
import MonthlyCashEarnedLeaderboardPlayer from '@/lib/schemas/Oaklands/CashEarnedLeaderboardPlayer';

const MonthlyCashEarnedLeaderboard = z.object({
    reset_time: z.date(),
    next_page_cursor: z.nullable(z.string()),
    players: z.array(MonthlyCashEarnedLeaderboardPlayer)
});

export type MonthlyCashEarnedLeaderboardSchema = z.infer<typeof MonthlyCashEarnedLeaderboard>;

const MonthlyCashEarnedLeaderboardExample: MonthlyCashEarnedLeaderboardSchema = {
    reset_time: new Date("2024-11-01T00:00:00.000Z"),
    next_page_cursor: null,
    players: [
        {
            position: 1,
            user_id: "196753422",
            cash_amount: 28025137
        },
        {
            position: 2,
            user_id: "5798867894",
            cash_amount: 13992153
        },
        {
            position: 3,
            user_id: "2801901611",
            cash_amount: 12703303
        },
        {
            position: 4,
            user_id: "4797463377",
            cash_amount: 11341386
        },
        {
            position: 5,
            user_id: "43011191",
            cash_amount: 9777718
        }
    ]
}

export default MonthlyCashEarnedLeaderboard;