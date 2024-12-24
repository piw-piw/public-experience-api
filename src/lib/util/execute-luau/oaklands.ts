import { executeLuau, readLuaFile, delayRepoll } from "@/lib/util/luau";
import type { ChangelogVersions, ItemInformation, MaterialStockMarket, Newsletters, RockVariantRNG, StoresItems, TranslationKeys } from "@/lib/types/experience";
import { UniverseIDs, OaklandsPlaceIDs } from "@/lib/types/enums";
import container from "@/lib/container";

/**
 * Cache any new missing changelogs. The latest changelog is always refetched for any updates.
 * @returns {Promise<ChangelogVersions>} The changelogs that weren't cached.
 */
export async function cacheMissingChangelogs(): Promise<ChangelogVersions> {
    let script = readLuaFile('./oaklands/changelog.luau');

    const currentVersion = await container.redis.jsonGet('oaklands:changelog:current_version') || { id: 0, version: "0.0.0" };
    const cachedVersions = await container.redis.setGet('oaklands:changelog:versions_list') || [];

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

        await container.redis.setAdd('oaklands:changelog:versions_list', version);
        await container.redis.jsonSet(`oaklands:changelog:versions:${version}`, {
            _id, date: new Date(cleanDate), ...changes
        });
    }

    await container.redis.jsonSet('oaklands:changelog:current_version', { id: latestId, version: latestVersion });

    return parsed;
}

/**
 * Cache any missing newsletters. The latest newsletter is always refetched for any updates.
 * @returns {Promise<Newsletters>} The newsletters that weren't cached.
 */
export async function cacheMissingNewsletters(): Promise<Newsletters> {
    let script = readLuaFile('./oaklands/newsletters.luau');

    const currentPage = await container.redis.stringGet('oaklands:newsletter:current_page');
    const cachedPages = await container.redis.setGet('oaklands:newsletter:pages_list') || [];

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

    await container.redis.stringSet('oaklands:newsletter:current_page', parsed.latest_page);
    for (const [page, pageInfo] of Object.entries(parsed.pages)) {
        await container.redis.setAdd('oaklands:newsletter:pages_list', page);
        await container.redis.jsonSet(`oaklands:newsletter:pages:${page}`, pageInfo);
    }

    return parsed;
}

/**
 * Fetch all of the translation strings.
 * @returns {Promise<TranslationKeys>}
 */
export async function fetchTranslationStrings(): Promise<TranslationKeys> {
    let script = readLuaFile('./oaklands/translated-languages.luau');

    const result = await executeLuau<TranslationKeys>(script, {
        universeId: UniverseIDs.Oaklands,
        placeId: OaklandsPlaceIDs.Production
    });

    if (!result) return await delayRepoll(fetchTranslationStrings);

    const results = result.results[0];

    for (const [language, strings] of Object.entries(results)) {
        if (language === 'ALTKEYS') continue;

        await container.redis.setAdd('oaklands:translations:languages_list', language);
        await container.redis.jsonSet(`oaklands:translations:language:${language}`, strings);
    }

    return results;
}

/**
 * Fetch the current material stock market values.
 * @returns {Promise<MaterialStockMarket>}
 */
export async function fetchMaterialStockMarket(): Promise<MaterialStockMarket> {
    let script = readLuaFile('./oaklands/stock-market.luau');

    const result = await executeLuau<string>(script, {
        universeId: UniverseIDs.Oaklands,
        placeId: OaklandsPlaceIDs.Production
    });

    if (!result) return await delayRepoll(fetchMaterialStockMarket);

    const parsed: MaterialStockMarket = JSON.parse(result.results[0]);


    await container.redis.jsonSet('oaklands:stock_market:updated', new Date());
    await container.redis.jsonSet('oaklands:stock_market:reset', (() => {
        const currentHours = new Date().getUTCHours();
        const date = new Date();

        const nextResetHour = (Math.floor((currentHours + 2) / 6) * 6 + 4) % 24;
        
        date.setUTCHours(
            nextResetHour === currentHours
                ? (nextResetHour + 6) % 24
                : nextResetHour,
            0, 0, 0
        );

        if (nextResetHour === 4) date.setUTCDate(date.getUTCDate() + 1);

        return date;
    })());
    await container.redis.jsonSet('oaklands:stock_market:values', {
        trees: parsed.Trees,
        rocks: parsed.Rocks,
        ores: parsed.Ores
    });

    return parsed;
}

/**
 * Fetch the current ore rarity values.
 * @returns {Promise<RockVariantRNG>}
 */
export async function fetchOreRarity(): Promise<RockVariantRNG> {
    let script = readLuaFile('./oaklands/ore-rarity.luau');

    const result = await executeLuau<string>(script, {
        universeId: UniverseIDs.Oaklands,
        placeId: OaklandsPlaceIDs.Production
    });

    if (!result) return await delayRepoll(fetchOreRarity);

    const parsed: RockVariantRNG = JSON.parse(result.results[0]);

    await container.redis.jsonSet('oaklands:ore_rarity', parsed);

    return parsed;
}

/**
 * Fetch all of the current items in Oaklands.
 * @returns {Promise<ItemInformation>}
 */
export async function fetchItems(): Promise<ItemInformation> {
    let script = readLuaFile('./oaklands/item-details.luau');

    const result = await executeLuau<string>(script, {
        universeId: UniverseIDs.Oaklands,
        placeId: OaklandsPlaceIDs.Production
    });

    if (!result) return await delayRepoll(fetchItems);

    const parsed: ItemInformation = JSON.parse(result.results[0]);

    for (const [identifier, itemDetails] of Object.entries(parsed)) {
        const { details, store, item, gift } = itemDetails;
        const { name, description } = details;

        await container.redis.jsonSet(`oaklands:items:item:${identifier}`, {
            name, description,
            store, item, ...(gift
                ? { gift: { unbox_epoch: gift.unbox_epoch, unbox_date: new Date(gift.unbox_epoch * 1000) } }
                : {}
            )
        });
    }

    await container.redis.setAdd(`oaklands:items:item_list`, Object.keys(parsed));

    return parsed;
}

/**
 * Fetch a list of items each store has and their rotation times.
 * @returns {Promise<StoresItems>}
 */
export async function fetchStoreItems(): Promise<StoresItems> {
    let script = readLuaFile('./oaklands/store-items.luau');

    const result = await executeLuau<StoresItems>(script, {
        universeId: UniverseIDs.Oaklands,
        placeId: OaklandsPlaceIDs.Production
    });

    if (!result) return await delayRepoll(fetchStoreItems);

    const results = result.results[0];

    for (const [store, items] of Object.entries(results)) {
        await container.redis.setAdd(`oaklands:stores:item_list:${store}`, items);
    }

    await container.redis.setAdd('oaklands:stores:store_list', Object.keys(results));
    await container.redis.jsonSet('oaklands:stores:classic_shop_reset', (() => {
        const reset = new Date();

        if (reset.getUTCHours() >= 16) {
            reset.setUTCDate(reset.getUTCDate() + 1);
        }

        reset.setUTCHours(reset.getUTCHours() >= 16 ? 4 : 16, 0, 0, 0);

        return reset;
    })());

    return results;
}
