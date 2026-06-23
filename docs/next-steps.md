# Next Steps

## Code quality & CI
- Add AI-powered PR reviews for security and code quality (e.g. via Cursor Bugbot or similar)
- Enforce test coverage thresholds in CI (e.g. 80% line coverage minimum)
- Add an integration/e2e test hitting a real Open-Meteo response

## Observability
- Replace `console.*` with `pino` — structured JSON output, configurable log levels, consistent format across Apollo Server and application code

## Features
- Replace wind-speed proxy for surfing with actual wave height data using the Open-Meteo marine API. No separate coastal detection service needed — the marine API returns `null` for `wave_height` on inland coordinates and real values for coastal ones. If all `wave_height` values are `null`, score surfing as `0` (no fallback to wind proxy — a misleading proxy score is worse than an honest zero) and expose a `marineDataAvailable: Boolean` flag on the response so clients can indicate that surfing is not applicable for that location.
- Externalise scoring weights so they can be tuned without redeploying (env vars or a config table in SQLite)
