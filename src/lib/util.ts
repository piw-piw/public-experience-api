import path from 'path';
import { existsSync, readdirSync, readFileSync } from 'fs';
import { LuauExecutionApi } from "openblox/cloud";
import { pollMethod } from 'openblox/helpers';
import type { MaterialStockMarket } from '@/lib/types/experience';
import type { MaterialLeaderboardItemSchema } from '@/lib/schemas/Oaklands/MaterialLeaderboardItem';
import { OaklandsPlaceIDs, UniverseIDs } from '@/lib/types/enums';
import container from '@/setup/container';

/**
 * Read the contents of a Lua/Luau file.
 * @param fileName The file to read.
 * @returns {string}
 */
function _readLuaFile(fileName: string): string {
    if (!fileName.endsWith('.lua') && !fileName.endsWith('.luau')) {
        throw new Error('The provided file is not a valid lua / luau file.');
    }


    const filePath = path.join(process.cwd(), '/src/lib/luau-execution', fileName);
    if (!existsSync(filePath)) {
        throw new Error('The provided file does not exist in /src/lib/luau-execution.');
    }
        
    const code = readFileSync(filePath, { encoding: 'utf-8' });

    return code;
}

/**
 * Execute Luau.
 * @param script The script to run.
 * @param info The info to include with the task.
 * @returns {Promise<Data[] | null>}
 */
async function _executeLuau<Data extends Object>(script: string, info: { universeId: number, placeId: number, version?: number }): Promise<Data[] | null> {
    try {
        const { data: { universeId, placeId, version, sessionId, taskId } } = await LuauExecutionApi.executeLuau({
            ...info, script
        });
        
        const { data: executedTask } = await pollMethod(
            LuauExecutionApi.luauExecutionTask<Data[]>({ universeId, placeId, version, sessionId, taskId }),
            async ({ data }, stopPolling) => data.state === "COMPLETE" && stopPolling(),
        );

        if (typeof executedTask.output !== 'object') {
            throw new Error('Unexpected return type');
        }
    
        if (executedTask.output === null) {
            throw new Error('Unexpected return type');
        }
    
        return executedTask.output.results;
    } catch (e) {
        return null;
    }
}

/**
 * Get all paths for a certain extension in a directory.
 * @param dir The directory that you want to get files for.
 * @param filterPath The files that you want to get based on extenion
 * @param paths A list of current paths.
 * @returns {string[]}
 */
export function getFilePaths(dir: string, filterPath: string = '.ts', paths: string[] = []): string[] {
    const files = readdirSync(dir, { withFileTypes: true });

    for (const file of files) {
        const filePath = path.join(dir, file.name);

        if (file.isDirectory()) {
            getFilePaths(filePath, filterPath, paths);
            continue;
        }

        paths.push(filePath);
    }

    return paths.filter((p) => p.endsWith(filterPath));
}

/**
 * Get the current Oaklands material stock market.
 * @returns {Promise<MaterialStockMarket>}
 */
export async function getMaterialStockMarket(): Promise<MaterialStockMarket> {
    const script = _readLuaFile('stock-market.luau');

    const result = await _executeLuau<MaterialStockMarket>(script, { universeId: UniverseIDs.Oaklands, placeId: OaklandsPlaceIDs.Staging });
    if (!result) return await new Promise<MaterialStockMarket>((res) => setTimeout(async () => res(await getMaterialStockMarket()), 1000 * 60));

    return result[0];
}

/**
 * Get the current items in the classic shop.
 * @returns {Promise<string[]>}
 */
export async function getCurrentClassicShop(): Promise<string[]> {
    const script = _readLuaFile('classic-shop.luau');

    const result = await _executeLuau<string[]>(script, { universeId: UniverseIDs.Oaklands, placeId: OaklandsPlaceIDs.Production });
    if (!result) return await new Promise<string[]>((res) => setTimeout(async () => res(await getCurrentClassicShop()), 1000 * 60));

    return result[0];
}

export async function getMaterialLeaderboards() {
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
            value: cash_amount
        }));
    }

    client.release();

    return {
        currencies,
        leaderboards
    };
}

/**
 * Fetch the current material leaderboard.
 * @returns {Promise<Record<string, Record<string, MaterialLeaderboardItemSchema>>>}
 */
export async function getMaterialLeaderboard(): Promise<Record<string, Record<string, MaterialLeaderboardItemSchema>>> {
    const client = await container.database.connect();

    await client.query('BEGIN READ ONLY;');

    const { rows } = await client.query<{ position: number; material_type: string; cash_amount: number; currency_type: string }>(
        `SELECT
            CAST(ROW_NUMBER() OVER (PARTITION BY currency_type ORDER BY cash_amount DESC) AS INT) as position,
            *
        FROM oaklands_daily_materials_sold_current
        GROUP BY material_type, currency_type
        ORDER BY cash_amount DESC;`
    );

    const leaderboards: Record<string, Record<string, MaterialLeaderboardItemSchema>> = {};

    for (const { position, material_type, cash_amount, currency_type } of rows) {
        const key = material_type.split(/(?=[A-Z])/).map((l) => l.toLowerCase()).join('_');
        const name = material_type.split(/(?=[A-Z])/).join(' ');

        const currency = currency_type.toLowerCase();

        if (!leaderboards[currency]) {
            leaderboards[currency] = {};
        }

        leaderboards[currency][key] = { position, name, value: Number(cash_amount) };
    }

    await client.query('COMMIT;');
    client.release();

    return leaderboards;
}