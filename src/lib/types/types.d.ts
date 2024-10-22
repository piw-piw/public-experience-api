import type EventEmitter from 'events';
import type { RedisClientType } from "redis";
import type pg from 'pg';

declare global {
    interface Container {
        redis: RedisClientType;
        database: pg.Pool;
        events: EventEmitter;
        logger: (message: string) =>  void;
    }
};