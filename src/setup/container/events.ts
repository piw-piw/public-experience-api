import EventEmitter from 'events';
import container from '@/lib/container';

const events = new EventEmitter();

events.on('registered_endpoints', async () => {
    await import("@/setup/cache");
});

events.on('oaklands_update', async ({ curr }: { prev: number; curr: number; }) => {
});

container.events = events;