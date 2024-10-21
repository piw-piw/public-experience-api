import EventEmitter from 'events';
import container from '@/lib/container';

const events = new EventEmitter();

events.on('compare_version', async (curr: number) => {
    const cachedVersion = await container.redis.get('current_version');
    if (!cachedVersion) {
        await container.redis.set('current_version', curr);
        events.emit('version_change', { prev: null, curr });

        return;
    }

    const prev = parseInt(cachedVersion);
    if (prev !== curr) {
        await container.redis.set('current_version', curr);
        events.emit('version_change', { prev, curr });
    }
});

container.events = events;