import type { RedisKeys, RedisString, RedisJson, RedisSet } from '@/lib/types/redis-keys';
import container from "@/lib/container";

export async function stringGet<T extends keyof RedisString>(key: T): Promise<RedisString[T] | null> {
    const value = await container.redis.client.get(key) as RedisKeys[T] | null;
    if (!value) return null;

    return value;
}

export async function jsonGet<T extends keyof RedisJson>(key: T): Promise<RedisJson[T] | null> {
    const value = await container.redis.client.json.get(key) as RedisKeys[T] | null;
    if (!value) return null;

    return value;
}

export async function jsonSet<T extends keyof RedisJson>(key: T, value: RedisJson[T]): Promise<boolean> {
    try {
        await container.redis.client.json.set(key, "$", value);
        return true;
    }
    catch {
        return false;
    }
}

export async function setGet<T extends keyof RedisSet>(key: T): Promise<RedisSet[T] | null> {
    const value = await container.redis.client.sMembers(key) as RedisKeys[T] | null;
    if (!value) return null;

    return value;
}

export async function setAdd<T extends keyof RedisSet>(key: T, value: string | string[]): Promise<boolean> {
    try {
        await container.redis.client.sAdd(key, value);
        return true;
    }
    catch {
        return false;
    }
}
