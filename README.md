# Holiday Ranking Service

A GraphQL API that takes a city name and scores the next 7 days of weather for four activities: **skiing**, **surfing**, **outdoor sightseeing**, and **indoor sightseeing**. Each day gets a 0–10 score per activity based on real forecast data from [Open-Meteo](https://open-meteo.com/).

## Documentation

| Document | Contents |
|---|---|
| [decisions.md](docs/decisions.md) | Architectural decisions and trade-offs |
| [process.md](docs/process.md) | How the project was built and AI was used |
| [questions.md](docs/questions.md) | Open questions for PM and assumptions made |

## How to run

**Prerequisites:** Node.js 20+, pnpm, Docker (for Redis)

```bash
# 1. Start Redis
docker-compose up -d

# 2. Install dependencies
pnpm install

# 3. Start the server
pnpm dev
```

The GraphQL API is available at **http://localhost:4000** with Apollo Sandbox for interactive queries.

### Example query

```graphql
query {
  rankCity(city: "Innsbruck") {
    city
    latitude
    longitude
    days {
      date
      scores {
        skiing
        surfing
        outdoorSightseeing
        indoorSightseeing
      }
      weather {
        temperatureMax
        temperatureMin
        precipitationMm
        windSpeedMax
        snowfallMm
        weatherCode
      }
    }
  }
}
```

## Storage

- **SQLite** (`weather.db`) — city coordinates, written once on first geocode, never expires
- **Redis** — 7-day forecast cache, TTL 1 hour (configurable via `CACHE_TTL_SECONDS` env var)

Redis is optional. If unavailable, the service logs a warning and fetches fresh data from Open-Meteo on every request.

## Scoring

Each day is scored 0–10 per activity. Scores are composed of weighted sub-factors, each normalised 0–1:

| Activity | Key factors |
|---|---|
| Skiing | Snowfall (40%), temperature (30%), wind (20%), no rain (10%) |
| Surfing | Wind speed proxy for waves (50%), temperature (30%), no heavy rain (20%) |
| Outdoor sightseeing | Temperature (30%), precipitation (30%), wind (20%), WMO weather code (20%) |
| Indoor sightseeing | Inverse of outdoor score (`10 − outdoor`) |

Each day also returns raw `weather` data (temperature, wind, precipitation, snowfall, WMO code) so scores can be verified against the underlying conditions.

The scoring logic uses the **Strategy pattern** — each activity is an independent class implementing `ActivityScorer`. Adding a new activity requires one new class and one line in the registry.

## Assumptions

- **Surfing** — Open-Meteo's marine wave API requires coastal coordinates, which aren't guaranteed for an arbitrary city. Wind speed is used as a proxy for wave-generating conditions. This produces plausible relative scores but is not a substitute for real wave height data.
- **Geocoding** — uses the first result from Open-Meteo's free geocoding endpoint. Ambiguous city names (e.g. "Springfield") will resolve to the most prominent match.
- **Cache TTL** — defaults to 1 hour. Forecast data older than the TTL is automatically expired by Redis and re-fetched on the next request.

## Architectural decisions

Key design decisions — storage split, caching strategy, scoring pattern, logging — are documented in [`docs/decisions.md`](docs/decisions.md).

## Environment variables

| Variable | Default | Description |
|---|---|---|
| `REDIS_URL` | `redis://localhost:6379` | Redis connection URL |
| `CACHE_TTL_SECONDS` | `3600` | Forecast cache TTL in seconds |
| `PORT` | `4000` | Server port |
