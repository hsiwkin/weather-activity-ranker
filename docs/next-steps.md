# Next Steps

## Code quality & CI
- Add AI-powered PR reviews for security and code quality (e.g. via Cursor Bugbot or similar)
- Enforce test coverage thresholds in CI (e.g. 80% line coverage minimum)
- Add an integration/e2e test hitting a real Open-Meteo response

## Observability
- Replace `console.*` with `pino` — structured JSON output, configurable log levels, consistent format across Apollo Server and application code

## Features
- Replace wind-speed proxy for surfing with actual wave height data (Open-Meteo marine API, conditional on coastal coordinates detection)
- Externalise scoring weights so they can be tuned without redeploying (env vars or a config table in SQLite)
