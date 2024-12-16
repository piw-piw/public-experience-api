import EventEmitter from 'events';
import {
    getCurrentChangelogs,
    getCurrentItems,
    getCurrentNewsletters,
    getCurrentRockRNG,
    getCurrentStoreItems,
    getTranslationStrings
} from '@/lib/util/execute-luau';
import container from '@/lib/container';
import type { ChangelogEntry } from '@/lib/types/experience';

const events = new EventEmitter();

events.on('registered_endpoints', async () => {
    await import("@/setup/cache");
});

events.on('oaklands_update', async ({ curr }: { prev: number; curr: number; }) => {
    container.logger('Fetching latest news letters.');
    const newsletters = await getCurrentNewsletters();
    
    if (newsletters) {
        await container.redis.set('news_letters', newsletters);
    }

    container.logger('Fetching the latest changelogs.');
    const changelog = await getCurrentChangelogs();

    if (changelog) {
        const versions: Record<string, Omit<ChangelogEntry, '_id'>> = {};

        let latestVersionId = 0;
        let latestVersion = '0.0.0';
        for (const [version, details] of Object.entries(changelog)) {
            if (latestVersionId < details._id) {
                latestVersionId = details._id;
                latestVersion = version;
            }

            const { _id, ...changes } = details;
            versions[version] = changes;
        }

        await container.redis.set('changelog', [latestVersion, versions]);
    }

    container.logger('Fetching current item details.');
    const itemDetails = await getCurrentItems();

    if (itemDetails) {
        await container.redis.set('item_details', itemDetails);
    }

    container.logger('Fetching latest translation strings.');
    const translationStrings = await getTranslationStrings();

    if (translationStrings) {
        await container.redis.set('translation_strings', translationStrings);
    }

    container.logger('Fetching latest shop items.');
    const shopItems = await getCurrentStoreItems();

    if (shopItems) {
        await container.redis.set('store_items', shopItems);
    }

    container.logger('Fetching latest rock rng.');
    const rockRNG = await getCurrentRockRNG();

    if (rockRNG) {
        await container.redis.set('current_rock_rng', rockRNG);
    }

    // Only set it after everything runs, in the event something fails.
    // This forces it to recache after 5 minutes anyway.
    await container.redis.set('last_update_epoch', Math.floor(curr));
});

container.events = events;