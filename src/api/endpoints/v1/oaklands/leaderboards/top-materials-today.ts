import { createRoute } from "@hono/zod-openapi";
import type { MaterialLeaderboardItemSchema } from "@/lib/schemas/Oaklands/MaterialLeaderboardItem";
import MaterialLeaderboard, { MaterialLeaderboardExample } from "@/lib/schemas/Oaklands/MaterialLeaderboard";
import ErrorMessage, { ErrorMessageExample } from "@/lib/schemas/ErrorMessage";
import oaklands from "@/api/routes/oaklands";
import container from "@/lib/container";

const route = createRoute({
    method: "get",
    path: "/leaderboards/top-materials-today",
    tags: ['Oaklands'],
    description: "Get today\'s current material leaderboard. The leaderboard resets daily at 12AM UTC.",
    parameters: [
        { name: 'currencyType', in: 'query', required: true, default: "Cash" }
    ],
    responses: {
        200: {
            content: {
                "application/json": { schema: MaterialLeaderboard, example: MaterialLeaderboardExample }
            },
            description: "OK"
        },
        404: {
            content: {
                "application/json": { schema: ErrorMessage, example: ErrorMessageExample }
            },
            description: "NOT FOUND"   
        },
        500: {
            content: {
                "application/json": { schema: ErrorMessage, example: ErrorMessageExample }
            },
            description: "INTERNAL ERROR"   
        }
    }
});

oaklands.openapi(route, async (res) => {
    return res.json({} as any, 200);
});