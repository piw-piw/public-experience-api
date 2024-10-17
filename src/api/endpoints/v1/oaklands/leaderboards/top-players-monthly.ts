import { rateLimiter } from "hono-rate-limiter";
import { createRoute } from "@hono/zod-openapi";
import MonthlyCashEarnedLeaderboard, { MonthlyCashEarnedLeaderboardExample } from "@/lib/schemas/Oaklands/CashEarnedLeaderboard";
import ErrorMessage, { ErrorMessageExample } from "@/lib/schemas/ErrorMessage";
import oaklands from "@/api/routes/oaklands";
import container from "@/setup/container";
import { every } from "hono/combine";

const route = createRoute({
    method: "get",
    path: "/leaderboards/top-players-monthly",
    tags: ['Oaklands'],
    description: "Get the month\'s current top players. The leaderboard resets the 1st of every month at 12AM UTC.",
    parameters: [
        { name: 'currencyType', in: 'query', required: true, default: "Cash" },
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

function _createCursor(values: { currency_type: string, page: number }) {
    return btoa(JSON.stringify(values));
}

function _decodeCursor(cursor: string) {
    const data = atob(cursor);

    let values: { currency_type: string, page: number } | null;

    try {
        const { currency_type, page } = JSON.parse(data);

        if (!currency_type || !page) {
            values = null
        }
        else {
            values = { currency_type, page };
        }
    }
    catch {
        values = null;
    }

    return values;
}

async function getMonthlyCashEarnedLeaderboardPage(values: { currency_type: string, page: number, limit: number }) {
    const client = await container.database.connect();
    let nextCursor: string | null = null;

    await client.query('BEGIN READ ONLY;');

    const { rows } = await client.query<{ position: number, user_id: string, cash_amount: number }>(
        `SELECT
            CAST(ROW_NUMBER() OVER (ORDER BY cash_amount DESC) AS INT) as position,
            user_id,
            CAST(cash_amount AS BIGINT) as cash_amount
        FROM oaklands_monthly_player_earnings_current
        WHERE
            currency_type = $1
        ORDER BY cash_amount DESC
        OFFSET $2
        LIMIT $3;`,
        [values.currency_type, values.page * values.limit, values.limit]
    );

    const { count } = (await client.query<{ count: number }>(
        `SELECT COUNT(*) as count
        FROM oaklands_monthly_player_earnings_current
        WHERE currency_type = $1;`,
        [values.currency_type]
    )).rows[0];

    if (count > (values.page + 1) * values.limit) {
        nextCursor = _createCursor({ currency_type: values.currency_type, page: values.page + 1 });
    }

    await client.query('COMMIT;');

    client.release();

    const reset = new Date();
    reset.setUTCMonth(reset.getUTCMonth() + 1, 1);
    reset.setUTCHours(0, 0, 0, 0);

    return {
        reset_time: reset,
        next_page_cursor: nextCursor,
        players: rows.map((r) => ({
            ...r,
            cash_amount: Number(r.cash_amount)
        }))
    };
}

oaklands.openapi(route, async (res) => {
    const { currencyType, cursor } = res.req.query();

    if (!currencyType) return res.json({
        error: "INVALID_CURRENCY",
        message: "The provided currency type is invalid."
    }, 400);

    if (cursor) {
        const values = _decodeCursor(cursor);

        if (!values || currencyType !== values.currency_type) return res.json({
            error: "INVALID_CURSOR",
            message: "The provided cursor is invalid."
        }, 400);

        return res.json(await getMonthlyCashEarnedLeaderboardPage({
            currency_type: values.currency_type,
            page: values.page,
            limit: 50
        }), 200);
    }

    return res.json(await getMonthlyCashEarnedLeaderboardPage({
        currency_type: currencyType,
        page: 0,
        limit: 50
    }), 200);
});