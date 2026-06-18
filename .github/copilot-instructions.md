# Harnesspowers v2

SDD workflow orchestrator plugin. Composes `agent-skills`, `superpowers`, `frontend-design`, and `claude-md-management` into end-to-end development workflows.

## Architecture

Four-plugin dependency stack:
- **harnesspowers** (this plugin) — 6 SDD workflow skills + unified routing tree
- **agent-skills** — 24 engineering primitive skills
- **superpowers** — Core disciplines: TDD, debugging, brainstorming
- **frontend-design** — Design direction + frontend UI engineering
- **claude-md-management** — CLAUDE.md audit and improvement

harnesspowers delegates to the other four. It owns no copies of their skills.

## Skills

- `using-harnesspowers` — Authoritative routing tree across all plugins
- `sdd-write-spec` — Creates specs: mission.md, tech-stack.md, roadmap.md
- `sdd-plan-feature` — Creates YYYY-MM-DD-{feature}/plan.md, requirements.md, validation.md
- `sdd-implement-plan` — Executes feature plan: subagent-driven (per-slice review) or inline (autonomous/checkpoint), domain-aware dispatch, TDD enforced, validation gate, hands off to agent-skills:code-review-and-quality
- `optimise-claude-md` — CLAUDE.md / AGENTS.md audit with discoverability lens
- `suggest-skills` — Cross-plugin skill discovery

## References

- `references/clean-architecture-ddd-reference.md` — Clean Architecture & DDD patterns

## Behaviour

- Surface assumptions before building — wrong assumptions held silently are the most common failure mode
- Stop and ask when requirements conflict — don't guess
- Push back when warranted — not a yes-machine
- Prefer the boring, obvious solution — cleverness is expensive
- Touch only what you're asked to touch — don't refactor adjacent systems
- When routing to cross-plugin skills, always use plugin-qualified names: `agent-skills:name`, `superpowers:name`
