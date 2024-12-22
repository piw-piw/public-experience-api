import type { RedisKeys } from '@/lib/types/redis-keys';
import container from "@/lib/container";

export async function stringGet<T extends keyof RedisKeys>(key: T): Promise<RedisKeys[T] | null> {
    const value = await container.redis.client.get(key) as RedisKeys[T] | null;
    if (!value) return null;

    return value;
}

export async function jsonGet<T extends keyof RedisKeys>(key: T): Promise<RedisKeys[T] | null> {
    const value = await container.redis.client.json.get(key) as RedisKeys[T] | null;
    if (!value) return null;

    return value;
}

export async function jsonSet<T extends keyof RedisKeys>(key: T, value: RedisKeys[T]): Promise<boolean> {
    try {
        await container.redis.client.json.set(key, "$", value);
        return true;
    }
    catch {
        return false;
    }
}

export async function setGet<T extends keyof RedisKeys>(key: T): Promise<RedisKeys[T] | null> {
    const value = await container.redis.client.sMembers(key) as RedisKeys[T] | null;
    if (!value) return null;

    return value;
}

export async function setAdd<T extends keyof RedisKeys>(key: T, value: string | string[]): Promise<boolean> {
    try {
        await container.redis.client.sAdd(key, value);
        return true;
    }
    catch {
        return false;
    }
}
