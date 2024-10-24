import { every } from "hono/combine";
import { rateLimiter } from "hono-rate-limiter";
import { createRoute } from "@hono/zod-openapi";
import oaklands from "@/api/routes/oaklands";
import MonthlyCashEarnedLeaderboard, { MonthlyCashEarnedLeaderboardExample } from "@/lib/schemas/Oaklands/CashEarnedLeaderboard";
import ErrorMessage, { ErrorMessageExample } from "@/lib/schemas/ErrorMessage";
import { cursorDecode, getMonthlyCashEarnedLeaderboardPage } from "@/lib/util/querying";

const route = createRoute({
    method: "get",
    path: "/leaderboards/top-players-monthly",
    tags: ['Oaklands'],
    description: "Get the month\'s current top players. The leaderboard resets the 1st of every month at 12AM UTC.",
    parameters: [
        { name: 'currencyType', in: 'query', required: true, default: "Cash" },
        { name: 'limit', in: 'query', required: false },
        { name: 'cursor', in: 'query', required: false }
    ],
    middleware: every(
        rateLimiter({
            limit: 1,
            windowMs: 3 * 1000,
            standardHeaders: "draft-6",
            message: (c) => ({ error: "TOO_MANY_REQUESTS", message: "You are being ratelimited, try again later." }),
            keyGenerator: (c) => "<unique_key>"
        })
    ),
    responses: {
        200: {
            content: {
                "application/json": { schema: MonthlyCashEarnedLeaderboard, example: MonthlyCashEarnedLeaderboardExample }
            },
            description: "OK"
        },
        400: {
            content: {
                "application/json": { schema: ErrorMessage, example: ErrorMessageExample }
            },
            description: "INTERNAL ERROR"   
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
    const { currencyType, limit, cursor } = res.req.query();

    const limitBy = parseInt(limit) || 25;

    if (limitBy % 25 || limitBy > 100) return res.json({
        error: "INVALID_LIMIT",
        message: "Limit can only by increments of 25 (25,50,75,100) and no greater than 100."
    }, 400);

    if (!currencyType) return res.json({
        error: "INVALID_CURRENCY",
        message: "The provided currency type is invalid."
    }, 400);

    if (cursor) {
        const values = cursorDecode<{
            currency_type: string;
            page: number;
            limit: number;
        }>(
            cursor,
            ['currency_type', 'page', 'limit'],
            {
                currency_type: currencyType,
                limit: parseInt(limit)
            }
        );

        if (values.data === null && values.error) return res.json({
            error: "INVALID_CURSOR",
            message: values.error
        }, 400);

        const { data } = values;
        return res.json(await getMonthlyCashEarnedLeaderboardPage({
            currency_type: data!.currency_type,
            page: data!.page,
            limit: limitBy
        }), 200);
    }

    return res.json(await getMonthlyCashEarnedLeaderboardPage({
        currency_type: currencyType,
        page: 0,
        limit: limitBy
    }), 200);
});