import path from 'path';
import { existsSync, readdirSync, readFileSync } from 'fs';
import { ExperiencesApi } from "openblox/cloud";
import { OaklandsPlaceIDs, UniverseIDs } from '@/lib/types/enums';

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
 * Get the last update time for Oaklands.
 * @returns {Promise<Date>}
 */
export async function getLastOaklandsUpdate(): Promise<Date> {
    const details = await ExperiencesApi.placeInfo({ universeId: UniverseIDs.Oaklands, placeId: OaklandsPlaceIDs.Production });

    if (!details) {
        throw new Error('Failed to get last update time.');
    }

    return details.data.updateTime;
}

export function getImagePath(type: string, identifier: string) {
    const dir = path.join(process.cwd(), 'assets', type, `${identifier}.png`);
    if (!existsSync(dir)) return path.posix.join(`no-image.png`);
    return path.posix.join(type, `${identifier}.png`);
}

export function readAssetImageBuffer(type: string, identifier: string, extension: string) {
    let dir = path.join(process.cwd(), 'assets', type, `${identifier}.${extension}`);
    if (!existsSync(dir)) dir =path.join(process.cwd(), 'assets', 'no-image.png');
    
    const buffer = readFileSync(dir);

    const arrayBuffer = new ArrayBuffer(buffer.length);
    const view = new Uint8Array(arrayBuffer);

    for (let i = 0; i < buffer.length; ++i) {
      view[i] = buffer[i];
    }

    return arrayBuffer;
}