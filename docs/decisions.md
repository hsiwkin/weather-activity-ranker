# Architectural Decisions

## Storage split: SQLite for cities, Redis for weather cache

**SQLite** holds city coordinates (`city_locations` table). Geocoded lat/lon never changes, so it only needs to be written once and read forever — a persistent, embedded file is the simplest fit. No infrastructure required.

**Redis** holds weather forecasts. Forecast data is ephemeral by nature and has a natural TTL (1 hour). Redis handles expiry natively via `SET key value EX 3600`, removing the need for manual TTL logic or a `fetched_at` column. It's also the idiomatic tool for short-lived cache entries.

Keeping them separate means each store does exactly one job: SQLite for permanent relational data, Redis for ephemeral cache.

## No shared base class or middleware for cache logic

The two services cache differently: geocoding uses SQLite with no TTL (write once, read forever), weather uses Redis with a TTL. A shared abstraction would need to accommodate both, making it either too generic or leaking implementation details. Caching is also an infrastructure concern, not a domain one — composition (calling cache helpers directly) expresses the relationship more honestly than inheritance. The duplication is ~5 lines per service, which doesn't justify a class hierarchy.

## Interfaces are co-located with their module (file), not extracted to a shared types file

This is a small project. Interfaces that describe external API response shapes (e.g. `GeocodingApiResponse`) are implementation details — nothing outside the module (file) needs to know about them. Shared interfaces (e.g. `Coordinates`) are exported from the module (file) that owns them and imported directly by consumers. A separate `types.ts` would add navigation overhead without meaningful benefit at this scale.

## Redis is optional — service degrades gracefully when unavailable

The brief requires caching, but a missing cache shouldn't make the service completely unusable. If Redis is down, forecast data is fetched fresh from Open-Meteo on every request — slower, but correct.

On startup, `connectRedis()` attempts a connection and logs a clear warning if it fails. `enableOfflineQueue: false` ensures any subsequent cache calls fail immediately rather than hanging. Both `getWeatherCache` and `setWeatherCache` are wrapped in try/catch and log a warning on failure. A `redisAvailable` flag skips cache calls entirely if the initial connection never succeeded.
