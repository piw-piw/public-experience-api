import { type MonthlyCashEarnedLeaderboardSchema } from "@/lib/schemas/Oaklands/CashEarnedLeaderboard";
import type { MaterialLeaderboardItemSchema } from "@/lib/schemas/Oaklands/MaterialLeaderboardItem";
import container from "@/lib/container";

/**
 * Decode a cursor.
 * @param cursor The cursor to decode.
 * @param keys The expected keys to be in the cursor.
 * @param matching The key-values that should be matching in the cursor.
 * @returns {{ data: T | null; error: string | null }}
 */
export function cursorDecode<T>(cursor: string, keys: (keyof T)[], matching: Partial<T>): { data: T | null; error: string | null; } {
    const rawData = atob(cursor);

    try {
        const data = JSON.parse(rawData) as T;

        for (const k of keys) {
            if (!data[k])
                throw new Error(`Invalid cursor keys are provided.`);

            if (matching[k] && data[k] !== matching[k])
                throw new Error(`Cursor is not matching.`);
        }

        return { data, error: null };
    }
    catch (e) {
        const error = e as Error;

        return { data: null, error: error.message };
    }
}

/**
 * Create a cursor.
 * @param object The cursor values to encode.
 * @returns {string}
 */
export function cursorCreate<T>(object: T): string {
    return btoa(JSON.stringify(object));
}

/**
 * Get a page from the current monthly user cash earned leaderboard.
 * @param values The values to sort by.
 * @returns {Promise<MonthlyCashEarnedLeaderboardSchema>}
 */
export async function getMonthlyCashEarnedLeaderboardPage(values: { currency_type: string, page: number, limit: number }): Promise<MonthlyCashEarnedLeaderboardSchema> {
    const client = await container.database.connect();
    let nextCursor: string | null = null;

    await client.query('BEGIN READ ONLY;');

    const { rows: columns } = await client.query<{ currency_type: string }>(`SELECT DISTINCT currency_type FROM oaklands_daily_materials_sold_current`);
    const { rows: leaderboard } = await client.query<{ position: number, user_id: string, cash_amount: number }>(
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
        nextCursor = cursorCreate({
            currency_type: values.currency_type,
            page: values.page + 1,
            limit: values.limit
        });
    }

    await client.query('COMMIT;');

    client.release();

    const reset = new Date();
    reset.setUTCMonth(reset.getUTCMonth() + 1, 1);
    reset.setUTCHours(0, 0, 0, 0);

    return {
        reset_time: reset,
        next_page_cursor: nextCursor,
        currency_types: columns.map(({ currency_type }) => currency_type),
        leaderboard: leaderboard.map((r) => ({
            ...r,
            cash_amount: Number(r.cash_amount)
        }))
    };
}

/**
 * Fetches all of the current material leaderboards.
 * @returns {Promise<{ currencies: string[], leaderboards: Record<string, MaterialLeaderboardItemSchema[]>}>}
 */
export async function getMaterialLeaderboards(): Promise<{ currencies: string[]; leaderboards: Record<string, MaterialLeaderboardItemSchema[]>; }> {
    container.logger('Fetching the current ore material leaderboard.');

    const client = await container.database.connect();

    await client.query('BEGIN READ ONLY;');

    const { rows: columns } = await client.query<{ currency_type: string }>(`SELECT DISTINCT currency_type FROM oaklands_daily_materials_sold_current`);
    const currencies = columns.map(({ currency_type }) => currency_type);

    const leaderboards: Record<string, { position: number; name: string; value: number; }[]> = {};

    for (const currency of currencies) {
        const { rows: leaderboard } = await client.query<{ position: number; material_type: string; cash_amount: number; }>(
            `SELECT
                CAST(ROW_NUMBER() OVER (ORDER BY cash_amount DESC) AS INT) as position,
                material_type, cash_amount
            FROM oaklands_daily_materials_sold_current
            WHERE currency_type = $1
            ORDER BY cash_amount DESC;`,
            [currency]
        );

        leaderboards[currency] = leaderboard.map(({ position, material_type, cash_amount }) => ({
            position,
            name: material_type.split(/(?=[A-Z])/).join(' '),
            value: Number(cash_amount)
        }));
    }

    client.release();

    return {
        currencies,
        leaderboards
    };
}