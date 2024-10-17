import { createRoute } from "@hono/zod-openapi";
import type { MaterialLeaderboardItemSchema } from "@/lib/schemas/Oaklands/MaterialLeaderboardItem";
import MaterialLeaderboard, { MaterialLeaderboardExample } from "@/lib/schemas/Oaklands/MaterialLeaderboard";
import ErrorMessage from "@/lib/schemas/ErrorMessage";
import oaklands from "@/api/routes/oaklands";
import container from "@/setup/container";

const route = createRoute({
    method: "get",
    path: "/leaderboards/top-materials-today",
    tags: ['Oaklands'],
    description: "Get today\'s current material leaderboard. The leaderboard resets daily at 12AM UTC.",
    responses: {
        200: {
            content: {
                "application/json": { schema: MaterialLeaderboard, example: MaterialLeaderboardExample }
            },
            description: "OK"
        },
        500: {
            content: {
                "application/json": { schema: ErrorMessage }
            },
            description: "INTERNAL ERROR"   
        }
    }
});

oaklands.openapi(route, async (res) => {
    if (!(await container.redis.exists('material_leaderboard'))) {
        return res.json({
            error: "INTERNAL_ERROR",
            message: "The contents for the shop are currently not cached."
        }, 500);
    }

    const [ reset_time, last_update, leaderboards ]: [number, number, Record<string, Record<string, MaterialLeaderboardItemSchema>>] = JSON.parse((await container.redis.get('material_leaderboard'))!)

    return res.json({
        reset_time: new Date(reset_time),
        last_update: new Date(last_update),
        leaderboards: leaderboards
    }, 200);
});