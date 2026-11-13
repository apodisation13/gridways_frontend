# Gridways project context

- For achievements/contracts (достижения/контракты), start with [docs/achievements/README.md](docs/achievements/README.md) and use the project skill [.agents/skills/gridways-achievements/SKILL.md](.agents/skills/gridways-achievements/SKILL.md). Read the detailed references relevant to the task, not every document for unrelated work.
- For season trees and enemy generation, read [docs/seasons/SEASON_WORKFLOW.md](docs/seasons/SEASON_WORKFLOW.md). Working data stays in ignored `data/`; see [docs/data-layout.md](docs/data-layout.md).
- Keep these maintained documents consistent with changes to events, counters, API contracts and call sites. Separate implemented behavior from plans. Code and current user instructions take precedence over historical notes.
- The backend is a separate repository named `GridwaysBackend`. Locate its checkout in the current workspace or ask the user for its location when needed. Do not store personal absolute paths in tracked documentation or assume frontend changes alone update backend behavior.
- Current project convention: do not run backend tests unless the user explicitly changes that instruction. Do not add a frontend test directory by default. Use relevant type/lint checks and focused temporary checks; report their actual scope.
