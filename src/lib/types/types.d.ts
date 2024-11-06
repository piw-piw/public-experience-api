import type EventEmitter from 'events';
import type { RedisClientType } from "redis";
import type pg from 'pg';
import * as RedisUtil from '@/lib/util/redis';

declare global {
    interface Container {
        redis: {
            client: RedisClientType;
        } & typeof RedisUtil;
        database: pg.Pool;
        events: EventEmitter;
        logger: (message: string) =>  void;
    }
};