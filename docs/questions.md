# Questions for PM

1. Should we surface AI-generated recommendations alongside (or enriching) the holiday rankings?
   **Assumed no** — pure weather-based scoring is sufficient for v1; AI enrichment would require defining what "better" means and prompt/model infrastructure that's out of scope for a time-boxed exercise.

2. Should we collect user feedback on rankings and use it to adjust/tweak them over time?
   **Assumed no** — rankings are deterministic from weather data. A feedback loop implies real users, a feedback model, and a way to apply it — none of which exist at this stage.

3. Should ranking weights be externally configurable — including their numeric values — so they can be changed without redeploying the service?
   **Assumed no for now** — hardcoded weights are appropriate for a PoC. The Strategy pattern makes each scorer an isolated class, so externalising weights is a straightforward next step if the model needs tuning after validation.
