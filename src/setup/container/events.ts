import EventEmitter from 'events';
import container from '@/lib/container';

const events = new EventEmitter();

/**
 * This is so endpoints are prioritized on startup.
 * Cache stuff gets ran before endpoints register and the API hangs until everything has ran.
 * @todo Figure out a way to do this without events.
 */
events.on('registered_endpoints', async () => {
    await import("@/setup/cache");
});

container.events = events;