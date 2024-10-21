import EventEmitter from 'events';
import container from '@/lib/container';

const events = new EventEmitter();

container.events = events;