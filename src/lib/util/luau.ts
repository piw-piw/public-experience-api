import path from 'path';
import { existsSync, readFileSync } from 'fs';
import { LuauExecutionApi } from "openblox/cloud";
import { pollMethod } from "openblox/helpers";
import { HttpError } from 'openblox/http';
import container from "@/lib/container";

/**
 * Read the contents of a Lua/Luau file.
 * @param fileName The file to read.
 * @returns {string}
 */
export function readLuaFile(fileName: string): string {
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
export async function poll<Data extends Object>(info: { universeId: number; placeId: number; version: number; sessionId: string; taskId: string; }): Promise<{ version: number; results: Data[]; } | null> {
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
                return await new Promise((r) => setTimeout(async () => r(poll<Data>(info)), reset * 1000));
            }

            container.logger(`Luau executtion failed due to an HttpError. Status code was ${response.statusCode}.`);
            return await new Promise((r) => setTimeout(async () => r(poll<Data>(info)), 30 * 1000));
        }

        container.logger(`LuaU execution failed with error: ${err.message}`);
        return null;
    }
}

const COOLDOWN: Record<string, number> = {};

/**
 * Prevent scripts from being ran too quickly.
 * This will take the script and Base64 it, then compare it to a list of scripts ran.
 * This is the only good way I could think of preventing a script from running twice at once with the current limitations.
 * @param script The code being ran.
 * @returns {boolean}
 */
function _scriptOnInternalCooldown(script: string): boolean {
    const now = new Date().getTime();
    const base64Script = Buffer.from(script).toString('base64');
    
    const lastRan = COOLDOWN[base64Script];
    if (lastRan > now) {
        return true
    }
    /**
     *  If it's not on cooldown, add it to the list and return false so it runs once.
    */
    else {
        COOLDOWN[base64Script] = now + 1000 * 60;
        return false;
    }
}

/**
 * Execute Luau.
 * @param script The script to run.
 * @param info The info to include with the task.
 * @returns {Promise<{ version: number; results: Data[] } | null>}
 */
export async function executeLuau<Data extends Object>(script: string, info: { universeId: number, placeId: number, version?: number }): Promise<{ version: number; results: Data[]; } | null> {
    if (_scriptOnInternalCooldown(script)) return null;

    try {
        const { data: { universeId, placeId, version, sessionId, taskId } } = await LuauExecutionApi.executeLuau({ ...info, script });
        return await poll<Data>({ universeId, placeId, version, sessionId, taskId });
    }
    catch (err: any) {
        if (err instanceof HttpError) {
            const { response } = err;

            if (response.statusCode === 429) {
                const reset = parseInt(response.headers.get('x-ratelimit-reset')!);

                container.logger(`Luau execution ratelimit was exhausted. Retrying in ${reset} seconds.`);
                return await new Promise((r) => setTimeout(async () => r(executeLuau<Data>(script, info)), reset * 1000));
            }

            container.logger(`Luau executtion failed due to an HttpError. Status code was ${response.statusCode}.`);
            return await new Promise((r) => setTimeout(async () => r(executeLuau<Data>(script, info)), 30 * 1000));
        }

        container.logger(`LuaU execution failed with error: ${err.message}`);
        return null;
    }
}

export async function delayRepoll<T>(callback: () => Promise<T>): Promise<T> {
    return await new Promise<T>((res) => setTimeout(async () => res(await callback()), 1000 * 30));
}