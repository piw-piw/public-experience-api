import path from 'path';
import { existsSync, readFileSync } from 'fs';
import { LuauExecutionApi } from "openblox/cloud";
import { pollMethod } from "openblox/helpers";
import type { MaterialStockMarket, RockVariantRNG } from '@/lib/types/experience';
import { OaklandsPlaceIDs, UniverseIDs } from '@/lib/types/enums';
import container from "@/lib/container";

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
 * @returns {Promise<{ version: number; results: Data[] } | null>}
 */
async function _executeLuau<Data extends Object>(script: string, info: { universeId: number, placeId: number, version?: number }): Promise<{ version: number; results: Data[] } | null> {
    try {
        const { data: { universeId, placeId, version, sessionId, taskId } } = await LuauExecutionApi.executeLuau({
            ...info, script
        });
        
        const { data: executedTask } = await pollMethod(
            LuauExecutionApi.luauExecutionTask<Data[]>({ universeId, placeId, version, sessionId, taskId }),
            async ({ data }, stopPolling) => {
                if (data.state === "FAILED") throw new Error(data.error.message);
                if (data.state === "COMPLETE") stopPolling();
            },
            // async ({ data }, stopPolling) => data.state === "COMPLETE" && stopPolling(),
        );

        if (typeof executedTask.output !== 'object') {
            throw new Error('Unexpected return type');
        }
    
        if (executedTask.output === null) {
            throw new Error('Unexpected return type');
        }
    
        return { version, results: executedTask.output.results };
    }
    catch (err: any) {
        container.logger(`LuaU execution failed with error: ${err.message}`);

        return null;
    }
}

/**
 * Get the current Oaklands material stock market.
 * @returns {Promise<MaterialStockMarket>}
 */
export async function getMaterialStockMarket(): Promise<MaterialStockMarket> {
    container.logger('Fetching the current material stock market.');

    const script = _readLuaFile('stock-market.luau');

    const result = await _executeLuau<MaterialStockMarket>(script, { universeId: UniverseIDs.Oaklands, placeId: OaklandsPlaceIDs.Production });
    if (!result) return await new Promise<MaterialStockMarket>((res) => setTimeout(async () => res(await getMaterialStockMarket()), 1000 * 60));

    return result.results[0];
}

/**
 * Get the current items in the classic shop.
 * @returns {Promise<string[]>}
 */
export async function getCurrentClassicShop(): Promise<string[]> {
    container.logger('Fetching the current classic shop.');

    const script = _readLuaFile('classic-shop.luau');

    const result = await _executeLuau<string[]>(script, { universeId: UniverseIDs.Oaklands, placeId: OaklandsPlaceIDs.Production });
    if (!result) return await new Promise<string[]>((res) => setTimeout(async () => res(await getCurrentClassicShop()), 1000 * 60));

    return result.results[0];
}

/**
 * Get the current rock rng list.
 * @returns {Promise<RockVariantRNG>}
 */
export async function getCurrentRockRNG(): Promise<RockVariantRNG> {
    container.logger('Fetching the current ore rarity list.');

    const script = _readLuaFile('ore-rarity.luau');

    const result = await _executeLuau<RockVariantRNG>(script, { universeId: UniverseIDs.Oaklands, placeId: OaklandsPlaceIDs.Production });
    if (!result) return await new Promise<any>((res) => setTimeout(async () => res(await getCurrentClassicShop()), 1000 * 60));

    return result.results[0];
}