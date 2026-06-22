import { Redis } from 'ioredis';

export const redis = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
  lazyConnect: true,
  enableOfflineQueue: false,
});

let redisAvailable = false;

export async function connectRedis(): Promise<void> {
  try {
    await redis.connect();
    redisAvailable = true;
    console.log('Redis connected');
  } catch {
    console.warn(
      'WARNING: Redis unavailable — weather forecasts will not be cached. ' +
        'Start Redis (docker-compose up -d) to enable caching.',
    );
  }
}

const cacheKey = (city: string) => `weather:${city.toLowerCase().trim()}`;

export async function getWeatherCache<T>(city: string): Promise<T | null> {
  if (!redisAvailable) return null;
  try {
    const raw = await redis.get(cacheKey(city));
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    console.warn(`WARNING: Redis read failed for key "${cacheKey(city)}" — fetching fresh data`);
    return null;
  }
}

export async function setWeatherCache(
  city: string,
  data: unknown,
  ttlSeconds: number,
): Promise<void> {
  if (!redisAvailable) return;
  try {
    await redis.set(cacheKey(city), JSON.stringify(data), 'EX', ttlSeconds);
  } catch {
    console.warn(`WARNING: Redis write failed for key "${cacheKey(city)}" — result will not be cached`);
  }
}
