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
        400: {
            content: {
                "application/json": { schema: ErrorMessage, example: ErrorMessageExample }
            },
            description: "BAD REQUEST"
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
    const { currencyType } = res.req.query();
    if (!currencyType) return res.json({
        error: "INVALID_CURRENCY_TYPE",
        message: "Please provide a valid currency type."
    }, 400);

    const leaderboard = await container.redis.jsonGet('oaklands:leaderboards:material_leaderboard:leaderboard');
    const resetTime = await container.redis.jsonGet('oaklands:leaderboards:material_leaderboard:reset_time');
    const lastUpdated = await container.redis.jsonGet('oaklands:leaderboards:material_leaderboard:last_updated');
    const currencies = await container.redis.setGet('oaklands:leaderboards:material_leaderboard:currencies');

    if (!leaderboard || !resetTime || !lastUpdated || !currencies)
        return res.json({
            error: "INTERNAL_ERROR",
            message: "The leaderboard is currently not cached."
        }, 500);

    if (!currencies.includes(currencyType))
        return res.json({
            error: "NOT_FOUND",
            message: "The currency type provided is not valid."
        }, 404);

    return res.json({
        reset_time: new Date(resetTime),
        last_update: new Date(lastUpdated),
        currency_types: currencies,
        leaderboard: leaderboard[currencyType]
    }, 200);
});