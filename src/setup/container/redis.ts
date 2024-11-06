import container from "@/lib/container";
import { createClient, type RedisClientType } from "redis";
import * as RedisUtil from '@/lib/util/redis';

const { REDIS_USERNAME, REDIS_PASSWORD, REDIS_HOST } = process.env;

const redisCache: RedisClientType = createClient({
    url: `redis://${REDIS_USERNAME}:${REDIS_PASSWORD}@${REDIS_HOST}`
});

await redisCache.connect();

container.redis = {
    client: redisCache,
    ...RedisUtil
};