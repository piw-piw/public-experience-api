import EventEmitter from 'events';
import { getCurrentRockRNG } from '@/lib/util';
import container from '@/lib/container';

const events = new EventEmitter();

events.on('oaklands_update', async ({ curr }: { prev: number; curr: number; }) => {
    const rockRNG = await getCurrentRockRNG();

    if (!rockRNG) {
        return;
    }

    await container.redis.set('last_update_epoch', Math.floor(curr));
    await container.redis.set('current_rock_rng', JSON.stringify(rockRNG));
});

container.events = events;