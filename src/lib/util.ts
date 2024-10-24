import path from 'path';
import { readdirSync } from 'fs';
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