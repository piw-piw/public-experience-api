import EventEmitter from 'events';
import {
    getCurrentRockRNG,
    getCurrentStoreItems,
    getTranslationStrings
} from '@/lib/util/execute-luau';
import container from '@/lib/container';

const events = new EventEmitter();

events.on('registered_endpoints', async () => {
    await import("@/setup/cache");
});

events.on('oaklands_update', async ({ curr }: { prev: number; curr: number; }) => {
    await container.redis.set('last_update_epoch', Math.floor(curr));

    const rockRNG = await getCurrentRockRNG();
    const shopItems = await getCurrentStoreItems();
    const translationStrings = await getTranslationStrings();

    if (rockRNG) {
        await container.redis.set('current_rock_rng', rockRNG);
    }

    if (shopItems) {
        await container.redis.set('store_items', shopItems);
    }

    if (translationStrings) {
        await container.redis.set('translation_strings', translationStrings);
    }
});

container.events = events;