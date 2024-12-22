import { executeLuau, readLuaFile, delayRepoll } from "@/lib/util/luau";
import type { ChangelogVersions, Newsletters } from "@/lib/types/experience";
import { UniverseIDs, OaklandsPlaceIDs } from "@/lib/types/enums";
import container from "@/lib/container";

/**
 * Cache any new missing changelogs. The latest changelog is always refetched for any updates.
 * @returns {Promise<ChangelogVersions>} The changelogs that weren't cached.
 */
export async function cacheMissingChangelogs(): Promise<ChangelogVersions> {
    let script = readLuaFile('./oaklands/changelog.luau');

    const currentVersion = await container.redis.jsonGet('changelog:current_version') || { id: 0, version: "0.0.0" };
    const cachedVersions = await container.redis.setGet('changelog:versions_list') || [];

    script = script.replace(
        `'CACHED_VERSIONS'`,
        cachedVersions
            .filter(v => v !== currentVersion.version)
            .map(v => `['${v}'] = true`)
            .join(', ')
    );

    const result = await executeLuau<string>(script, {
        universeId: UniverseIDs.Oaklands,
        placeId: OaklandsPlaceIDs.Production
    });

    if (!result) return await delayRepoll(cacheMissingChangelogs);
    if (!result.results[0].length) return {};

    const parsed: ChangelogVersions = JSON.parse(result.results[0]);

    let latestId = currentVersion.id;
    let latestVersion = currentVersion.version;
    for (const [version, changelog] of Object.entries(parsed)) {
        const { _id, date, ...changes } = changelog;
        const cleanDate = date.replace(/(\d+)(st|nd|rd|th)/, '$1');

        if (_id > latestId) {
            latestId = _id;
            latestVersion = version;
        }

        await container.redis.setAdd('changelog:versions_list', version);
        await container.redis.jsonSet(`changelog:versions:${version}`, {
            _id, date: new Date(cleanDate), ...changes
        });
    }

    await container.redis.jsonSet('changelog:current_version', { id: latestId, version: latestVersion });

    return parsed;
}

/**
 * Cache any missing newsletters. The latest newsletter is always refetched for any updates.
 * @returns {Promise<Newsletters>} The newsletters that weren't cached.
 */
export async function cacheMissingNewsletters(): Promise<Newsletters> {
    let script = readLuaFile('./oaklands/newsletters.luau');

    const currentPage = await container.redis.stringGet('newsletter:current_page');
    const cachedPages = await container.redis.setGet('newsletter:pages_list') || [];

    script = script.replace(
        `'CACHED_PAGES'`,
        cachedPages
            .filter(v => v !== currentPage)
            .map(v => `['${v}'] = true`)
            .join(', ')
    );

    const result = await executeLuau<string>(script, {
        universeId: UniverseIDs.Oaklands,
        placeId: OaklandsPlaceIDs.Production
    });

    if (!result) return await delayRepoll(cacheMissingNewsletters);
    if (!result.results[0].length) return { latest_page: "unknown", pages: {} };

    const parsed: Newsletters = JSON.parse(result.results[0]);

    await container.redis.client.set('newsletter:current_page', parsed.latest_page);
    for (const [page, pageInfo] of Object.entries(parsed.pages)) {
        await container.redis.setAdd('newsletter:pages_list', page);
        await container.redis.jsonSet(`newsletter:pages:${page}`, pageInfo);
    }

    return parsed;
}