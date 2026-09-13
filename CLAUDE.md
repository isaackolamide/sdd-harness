# Sdd-harness

SDD workflow orchestrator. Thin orchestration layer that wraps skills from two major plugins -> `superpowers` and `agent-skills`

## Architecture

Four-plugin dependency stack:
- **sdd-harness** — 9 SDD workflow skills + unified routing tree (this plugin)
- **agent-skills** — 24 engineering primitive skills (from `addyosmani/agent-skills`)
- **superpowers** — Core disciplines: TDD, debugging, brainstorming (from `claude-plugins-official`)
- **frontend-design** — Design direction + frontend UI engineering (from `claude-plugins-official`)
- **claude-md-management** — CLAUDE.md audit and improvement (from `claude-plugins-official`)

sdd-harness delegates to the other four. It owns no copies of their skills.

## Skills

| Skill | Purpose |
|-------|---------|
| `using-sdd-harness` | Authoritative routing tree across all plugins |
| `sdd-constitution` | Constitution: mission.md, tech-stack.md, roadmap.md — new and existing projects |
| `sdd-prd` | Discovery interview and Product Requirements Document (PRD) generator |
| `sdd-write-spec` | Feature spec (`sdd-specs/features/YYYY-MM-DD-<name>-spec.md`) and optional flow diagrams (`sdd-specs/diagrams/YYYY-MM-DD-<name>-flow.md`) |
| `sdd-plan-feature` | Feature plan: phase-structured plan.md (interface contracts + checkpoint blocks per phase), requirements.md, validation.md — triggers ADR for significant arch decisions |
| `sdd-implement-plan` | Executes feature plan — slice execution loop, TDD, checkpoints, ending with developer whole-branch code review (Step 4.1) |
| `sdd-implement-parallel-plans` | Executes multiple independent feature plans concurrently using isolated git worktrees |
| `sdd-verify-feature` | Runs parallel verification gate (test engineer & code quality reviewer), appends fixes to plan, ticks progress files, runs pre-merge audits, and integrates the branch |
| `optimise-claude-md` | CLAUDE.md audit with discoverability lens |

## References

- `references/clean-architecture-ddd-reference.md` — TypeScript Clean Architecture & DDD patterns


## Behaviour

- Surface assumptions before building
- Stop and ask when requirements conflict
- Push back when warranted
- Touch only what you're asked to touch
- When routing to cross-plugin skills, always use plugin-qualified names: `agent-skills:name`, `superpowers:name`
