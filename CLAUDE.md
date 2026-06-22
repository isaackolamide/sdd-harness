# Harnesspowers v2

SDD workflow orchestrator for Claude Code. Thin orchestration layer that composes `agent-skills`, `superpowers`, `frontend-design`, and `claude-md-management` into end-to-end development workflows.

## Architecture

Four-plugin dependency stack:
- **harnesspowers** — 8 SDD workflow skills + unified routing tree (this plugin)
- **agent-skills** — 24 engineering primitive skills (from `addyosmani/agent-skills`)
- **superpowers** — Core disciplines: TDD, debugging, brainstorming (from `claude-plugins-official`)
- **frontend-design** — Design direction + frontend UI engineering (from `claude-plugins-official`)
- **claude-md-management** — CLAUDE.md audit and improvement (from `claude-plugins-official`)

harnesspowers delegates to the other four. It owns no copies of their skills.

## Skills

| Skill | Purpose |
|-------|---------|
| `using-harnesspowers` | Authoritative routing tree across all plugins |
| `sdd-write-spec` | Constitution: mission.md, tech-stack.md, roadmap.md — new and existing projects |
| `sdd-plan-feature` | Feature plan: phase-structured plan.md (interface contracts + checkpoint blocks per phase), requirements.md, validation.md — triggers ADR for significant arch decisions |
| `sdd-implement-plan` | Executes feature plan — slice execution loop, TDD, checkpoints, ending with developer whole-branch code review (Step 4.1) |
| `sdd-verify-feature` | Performs formal validation via test-engineer, docs audit, and quality review checklist; appends review fixes to plan.md if needed; ticks plan.md and roadmap.md when complete |
| `sdd-integrate-feature` | Programmatic verification gate (clean git status, all checkboxes ticked), merges changes, and cleans up the branch |
| `optimise-claude-md` | CLAUDE.md audit with discoverability lens |
| `suggest-skills` | Cross-plugin skill discovery |

## References

- `references/clean-architecture-ddd-reference.md` — TypeScript Clean Architecture & DDD patterns
- `references/sdd-testing-guide.md` — How to test and fix SDD skills when failures are found
- `sdd-tests/` — 24 test scenarios for sdd-write-spec, sdd-plan-feature, sdd-implement-plan, sdd-verify-feature, and sdd-integrate-feature

## Behaviour

- Surface assumptions before building
- Stop and ask when requirements conflict
- Push back when warranted
- Touch only what you're asked to touch
- When routing to cross-plugin skills, always use plugin-qualified names: `agent-skills:name`, `superpowers:name`
