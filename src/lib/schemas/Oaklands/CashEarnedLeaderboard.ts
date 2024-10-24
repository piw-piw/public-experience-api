import { z } from '@hono/zod-openapi';
import MonthlyCashEarnedLeaderboardPlayer from '@/lib/schemas/Oaklands/CashEarnedLeaderboardPlayer';

const MonthlyCashEarnedLeaderboard = z.object({
    reset_time: z.date(),
    currency_types: z.array(z.string()),
    previous_page_cursor: z.nullable(z.string()),
    next_page_cursor: z.nullable(z.string()),
    leaderboard: z.array(MonthlyCashEarnedLeaderboardPlayer)
});

export type MonthlyCashEarnedLeaderboardSchema = z.infer<typeof MonthlyCashEarnedLeaderboard>;

export const MonthlyCashEarnedLeaderboardExample: MonthlyCashEarnedLeaderboardSchema = {
    reset_time: new Date("2024-11-01T00:00:00.000Z"),
    currency_types: ["Cash", "Candy2024"],
    previous_page_cursor: null,
    next_page_cursor: null,
    leaderboard: [
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