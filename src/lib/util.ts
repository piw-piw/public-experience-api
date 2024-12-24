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
 * Fetch the path of an Oaklands item image.
 * @param type The type of item.
 * @param identifier The name of the item.
 * @returns {string}
 */
export function getImagePath(type: string, identifier: string): string {
    const dir = path.join(process.cwd(), 'assets', type, `${identifier}.png`);
    if (!existsSync(dir)) return path.posix.join(`no-image.png`);
    return path.posix.join(type, `${identifier}.png`);
}

/**
 * Fetch the image buffer for an Oaklands item image.
 * @param type The type of item.
 * @param identifier The name of the item.
 * @param extension The extension of the file.
 * @returns {ArrayBuffer | null}
 */
export function readAssetImageBuffer(type: string, identifier: string, extension: string): ArrayBuffer | null {
    let dir = path.join(process.cwd(), 'assets', type, `${identifier}.${extension}`);
    if (!existsSync(dir)) dir = path.join(process.cwd(), 'assets', 'no-image.png');
    
    const buffer = readFileSync(dir);
    const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);

    if (arrayBuffer instanceof SharedArrayBuffer) return null;

    return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;
}