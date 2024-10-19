import { z } from '@hono/zod-openapi';
import MaterialLeaderboardItem from '@/lib/schemas/Oaklands/MaterialLeaderboardItem';

const MaterialLeaderboard = z.object({
    last_update: z.date(),
    reset_time: z.date(),
    currency_types: z.array(z.string()),
    leaderboard: z.array(MaterialLeaderboardItem)
});

export type MaterialLeaderboardSchema = z.infer<typeof MaterialLeaderboard>;

export const MaterialLeaderboardExample: MaterialLeaderboardSchema = {
    reset_time: new Date("2024-10-18T00:00:00.000Z"),
    last_update: new Date("2024-10-17T12:35:00.051Z"),
    currency_types: ["Cash", "Candy2024"],
    leaderboard: [
        {
            position: 1,
            name: "Lumite",
            value: 37000983
        },
        {
            position: 2,
            name: "Magma Tree",
            value: 13439915
        },
        {
            position: 3,
            name: "Electrified Tree",
            value: 6056093
        },
        {
            position: 4,
            name: "Plek",
            value: 5957825
        },
        {
            position: 5,
            name: "Uranium",
            value: 4894777
        }
    ]
}

export default MaterialLeaderboard;