import path from 'path';
import { existsSync, readFileSync } from 'fs';
import { LuauExecutionApi } from "openblox/cloud";
import { pollMethod } from "openblox/helpers";
import { HttpError } from 'openblox/http';
import { OaklandsPlaceIDs, UniverseIDs } from '@/lib/types/enums';
import type {
    MaterialStockMarket,
    RockVariantRNG,
    ShipLocation,
    StoreItem,
    StoresItems,
    TranslationKeys,
    Newsletters,
    ItemInformation
} from '@/lib/types/experience';
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
 * Run a polled method.
 * @param info The info to include with the polled task.
 * @returns {Promise<{ version: number; results: Data[] } | null>}
 */
async function _poll<Data extends Object>(info: { universeId: number; placeId: number; version: number; sessionId: string; taskId: string; }): Promise<{ version: number; results: Data[]; } | null> {
    const { universeId, placeId, version, sessionId, taskId } = info;

    try {
        const { data: executedTask } = await pollMethod(
            LuauExecutionApi.luauExecutionTask<Data[]>({ universeId, placeId, version, sessionId, taskId }),
            async ({ data }, stopPolling) => {
                if (data.state === "FAILED") {
                    stopPolling();

                    if (data.error) throw data.error;
                    throw new Error('Unknown error.');
                }
                if (data.state === "COMPLETE")
                    stopPolling();
            },
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
        if (err instanceof HttpError) {
            const { response } = err;

            if (response.statusCode === 429) {
                const reset = parseInt(response.headers.get('x-ratelimit-reset')!);

                container.logger(`Luau execution polling ratelimit was exhausted. Repolling original request in ${reset} seconds.`);
                return await new Promise((r) => setTimeout(async () => r(_poll<Data>(info)), reset * 1000));
            }

            container.logger(`Luau executtion failed due to an HttpError. Status code was ${response.statusCode}.`);
            return await new Promise((r) => setTimeout(async () => r(_poll<Data>(info)), 30 * 1000));
        }

        container.logger(`LuaU execution failed with error: ${err.message}`);
        return null;
    }
}
/**
 * Execute Luau.
 * @param script The script to run.
 * @param info The info to include with the task.
 * @returns {Promise<{ version: number; results: Data[] } | null>}
 */
async function _executeLuau<Data extends Object>(script: string, info: { universeId: number, placeId: number, version?: number }): Promise<{ version: number; results: Data[]; } | null> {
    try {
        const { data: { universeId, placeId, version, sessionId, taskId } } = await LuauExecutionApi.executeLuau({ ...info, script });
        return await _poll<Data>({ universeId, placeId, version, sessionId, taskId });
    }
    catch (err: any) {
        if (err instanceof HttpError) {
            const { response } = err;

            if (response.statusCode === 429) {
                const reset = parseInt(response.headers.get('x-ratelimit-reset')!);

                container.logger(`Luau execution ratelimit was exhausted. Retrying in ${reset} seconds.`);
                return await new Promise((r) => setTimeout(async () => r(_executeLuau<Data>(script, info)), reset * 1000));
            }

            container.logger(`Luau executtion failed due to an HttpError. Status code was ${response.statusCode}.`);
            return await new Promise((r) => setTimeout(async () => r(_executeLuau<Data>(script, info)), 30 * 1000));
        }

        container.logger(`LuaU execution failed with error: ${err.message}`);
        return null;
    }
}

/**
 * Get the current Oaklands material stock market.
 * @returns {Promise<MaterialStockMarket>}
 */
export async function getMaterialStockMarket(): Promise<MaterialStockMarket> {
    const script = _readLuaFile('stock-market.luau');

    const result = await _executeLuau<MaterialStockMarket>(script, { universeId: UniverseIDs.Oaklands, placeId: OaklandsPlaceIDs.Production });
    if (!result) return await new Promise<MaterialStockMarket>((res) => setTimeout(async () => res(await getMaterialStockMarket()), 1000 * 30));

    return result.results[0];
}

/**
 * Get the current items in the classic shop.
 * @returns {Promise<string[]>}
 */
export async function getCurrentClassicShop(): Promise<string[]> {
    const script = _readLuaFile('classic-shop.luau');

    const result = await _executeLuau<string[]>(script, { universeId: UniverseIDs.Oaklands, placeId: OaklandsPlaceIDs.Production });
    if (!result) return await new Promise<string[]>((res) => setTimeout(async () => res(await getCurrentClassicShop()), 1000 * 30));

    return result.results[0];
}

/**
 * Get the current rock rng list.
 * @returns {Promise<RockVariantRNG>}
 */
export async function getCurrentRockRNG(): Promise<RockVariantRNG> {
    const script = _readLuaFile('ore-rarity.luau');

    const result = await _executeLuau<RockVariantRNG>(script, { universeId: UniverseIDs.Oaklands, placeId: OaklandsPlaceIDs.Production });
    if (!result) return await new Promise<RockVariantRNG>((res) => setTimeout(async () => res(await getCurrentRockRNG()), 1000 * 30));

    return result.results[0];
}

/**
 * Get the current store items.
 * @returns {Promise<StoresItems>}
 */
export async function getCurrentStoreItems(): Promise<StoresItems> {
    const script = _readLuaFile('store-items.luau');

    const result = await _executeLuau<StoresItems>(script, { universeId: UniverseIDs.Oaklands, placeId: OaklandsPlaceIDs.Production });
    if (!result) return await new Promise<StoresItems>((res) => setTimeout(async () => res(await getCurrentStoreItems()), 1000 * 30));

    return result.results[0];
}

/**
 * Get the current ship location.
 * @returns {Promise<ShipLocation>}
 */
export async function getCurrentShipLocation(): Promise<ShipLocation> {
    const script = _readLuaFile('ship-location.luau');

    const result = await _executeLuau<ShipLocation>(script, { universeId: UniverseIDs.Oaklands, placeId: OaklandsPlaceIDs.Production });
    if (!result) return await new Promise<ShipLocation>((res) => setTimeout(async () => res(await getCurrentShipLocation()), 1000 * 30));

    return result.results[0];
}

/**
 * Fetch the current translation strings.
 * @returns {Promise<TranslationKeys>}
 */
export async function getTranslationStrings(): Promise<TranslationKeys> {
    const script = _readLuaFile('translated-languages.luau');

    const result = await _executeLuau<TranslationKeys>(script, { universeId: UniverseIDs.Oaklands, placeId: OaklandsPlaceIDs.Production });
    if (!result) return await new Promise<TranslationKeys>((res) => setTimeout(async () => res(await getTranslationStrings()), 1000 * 30));

    // Hoofer said this was deprecated so byebbye
    delete result.results[0]['ALTKEYS'];

    return result.results[0];
}

/**
 * Fetch all of the available newsletters.
 * @returns {Promise<Newsletters>}
 */
export async function getCurrentNewsletters(): Promise<Newsletters> {
    const script = _readLuaFile('newsletters.luau');

    const result = await _executeLuau<Newsletters>(script, { universeId: UniverseIDs.Oaklands, placeId: OaklandsPlaceIDs.Production });
    if (!result) return await new Promise<Newsletters>((res) => setTimeout(async () => res(await getCurrentNewsletters()), 1000 * 30));

    return result.results[0];
}

/**
 * Fetch all of the current items in Oaklands with their information.
 * @returns {Promise<getCurrentItems>}
 */
export async function getCurrentItems(): Promise<ItemInformation> {
    const script = _readLuaFile('item-details.luau');

    const result = await _executeLuau<ItemInformation>(script, { universeId: UniverseIDs.Oaklands, placeId: OaklandsPlaceIDs.Production });
    if (!result) return await new Promise<ItemInformation>((res) => setTimeout(async () => res(await getCurrentItems()), 1000 * 30));

    return result.results[0];
}