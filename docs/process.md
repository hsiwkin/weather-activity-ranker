# Process

## Tools used

- Cursor (Sonnet) for the majority of implementation, debugging, and iteration
- Codex and Claude used during planning/exploration phase
- Mix of Ask, Plan, and Agent modes — planning before building, not asking AI to "just do it"

## Approach

- Started with a plan: identified the core domain (scoring per activity), storage needs (permanent coords vs ephemeral cache), and API shape before writing code
- Executed incrementally — one feature or concern at a time, reviewing AI output after each step before moving on
- Gave explicit feedback between rounds: approving, redirecting, or asking clarifying questions rather than accepting output wholesale
- Used AI for scaffolding, but drove all architectural decisions explicitly — the AI presented options, I chose
- Kept a tight feedback loop: run locally, verify, then push

## Examples of AI decision making and oversight

- **Storage split** — AI initially proposed SQLite-only (zero infrastructure, easier for reviewers); I challenged this with "why not Redis?", which led to the split: SQLite for permanent city coordinates, Redis for ephemeral forecast cache (documented in [decisions.md](decisions.md))
- **GraphQL server** — evaluated Apollo Server vs alternatives (e.g. Pothos, Mercurius, plain `graphql-http`); chose Apollo for its built-in sandbox, mature ecosystem, and fit with the Node.js + GraphQL stack specified in the brief
- **Apollo Sandbox prefill** — AI initially used wrong option name (`defaultQuery` vs `document`); I caught it wasn't working and asked to investigate rather than accepting the first attempt
- **CI debugging** — CI failed across 4 successive runs (pnpm version conflict → Node version → missing `jest` dep → missing `ts-node`). Rather than fixing blindly, I set the AI to monitor CI in a loop — after each fix it watched the run, identified the next failure, applied a root-caused fix, and pushed again, repeating until green.