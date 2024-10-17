import { z } from '@hono/zod-openapi';
import MaterialLeaderboardItem from '@/lib/schemas/Oaklands/MaterialLeaderboardItem';

const MaterialLeaderboard = z.object({
    last_update: z.date(),
    reset_time: z.date(),
    leaderboards: z.record(z.record(MaterialLeaderboardItem))
});

export type MaterialLeaderboardSchema = z.infer<typeof MaterialLeaderboard>;

export const MaterialLeaderboardExample: MaterialLeaderboardSchema = {
    reset_time: new Date("2024-10-18T00:00:00.000Z"),
    last_update: new Date("2024-10-17T12:35:00.051Z"),
    leaderboards: {
        cash: {
            lumite: {
                position: 1,
                name: "Lumite",
                value: 37000983
            },
            magma_tree: {
                position: 2,
                name: "Magma Tree",
                value: 13439915
            },
            electrified_tree: {
                position: 3,
                name: "Electrified Tree",
                value: 6056093
            },
            plek: {
                position: 4,
                name: "Plek",
                value: 5957825
            },
            uranium: {
                position: 5,
                name: "Uranium",
                value: 4894777
            }
        }
    }
}

export default MaterialLeaderboard;