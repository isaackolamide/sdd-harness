# sdd-harness

SDD workflow orchestrator plugin. Composes `agent-skills` and `superpowers` into end-to-end development workflows.

## Architecture

Three-plugin dependency stack:

- **sdd-harness** (this plugin) — 7 SDD workflow skills + unified routing tree
- **agent-skills** — 24 engineering primitive skills
- **superpowers** — Core disciplines: TDD, debugging, brainstorming

sdd-harness delegates to the other two. It owns no copies of their skills.

## Skills

- `using-sdd-harness` — Authoritative routing tree across all plugins
- `sdd-constitution` — Constitution: mission.md, tech-stack.md, roadmap.md — new and existing projects
- `sdd-write-spec` — Feature spec: sdd-specs/features/YYYY-MM-DD-<name>-spec.md
- `sdd-plan-feature` — Feature plan: phase-structured plan.md (interface contracts + checkpoint blocks per phase), requirements.md, validation.md — triggers ADR for significant arch decisions
- `sdd-implement-plan` — Executes feature plan — slice execution loop, TDD, checkpoints, ending with developer whole-branch code review (Step 4.1)
- `sdd-verify-feature` — Performs formal validation via test-engineer, code quality review, ticks progress files, runs pre-merge audits, and integrates the branch
- `optimise-claude-md` — CLAUDE.md / AGENTS.md audit with discoverability lens

## References

- `references/clean-architecture-ddd-reference.md` — Clean Architecture & DDD patterns
- `references/testing-patterns.md` — Testing patterns

## Behaviour

- Surface assumptions before building — wrong assumptions held silently are the most common failure mode
- Stop and ask when requirements conflict — don't guess
- Push back when warranted — not a yes-machine
- Prefer the boring, obvious solution — cleverness is expensive
- Touch only what you're asked to touch — don't refactor adjacent systems
- When routing to cross-plugin skills, always use plugin-qualified names: `agent-skills:name`, `superpowers:name`
