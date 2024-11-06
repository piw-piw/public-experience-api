import container from "@/lib/container";
import { type RedisKeys } from '@/lib/types/redis-keys';

function _toJSON<Result extends Object>(input: string) {
    try {
        const json = JSON.parse(input) as Result;
        return json;
    }
    catch {
        return null;
    }
}

/**
 * Get a key from the redis database.
 * @param {T} key The key to get
 * @returns {Promise<RedisKeys[T] | null>}
 */
export async function get<T extends keyof RedisKeys>(key: T): Promise<RedisKeys[T] | null> {
    const value = await container.redis.client.get(key);
    if (!value) return null;

    return _toJSON<RedisKeys[T]>(value);
}

/**
 * Set a key in the redis database.
 * @param {T} key The key to set.
 * @param {RedisKeys[T]} value The data to set.
 * @returns {Promise<boolean>}
 */
export async function set<T extends keyof RedisKeys>(key: T, value: RedisKeys[T]): Promise<boolean> {
    try {
        await container.redis.client.set(key, JSON.stringify(value));
        return true;
    }
    catch {
        return false;
    }
}