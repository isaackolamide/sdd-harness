# Sdd-harness

SDD workflow orchestrator plugin. Composes `agent-skills`, `superpowers` into end-to-end development workflows.

## Architecture

Four-plugin dependency stack:
- **sdd-harness** (this plugin) — 7 SDD workflow skills + unified routing tree
- **agent-skills** — 24 engineering primitive skills
- **superpowers** — Core disciplines: TDD, debugging, brainstorming

sdd-harness delegates to the other two. It owns no copies of their skills.

## Skills

- `using-sdd-harness` — Authoritative routing tree across all plugins
- `sdd-constitution` — Creates constitution docs: mission.md, tech-stack.md, roadmap.md
- `sdd-write-spec` — Creates feature spec: sdd-specs/features/YYYY-MM-DD-<name>-spec.md
- `sdd-plan-feature` — Creates YYYY-MM-DD-{feature}/plan.md (phase-structured: interface contracts + checkpoint blocks per phase), requirements.md, validation.md
- `sdd-implement-plan` — Executes feature plan: slice execution loop, TDD, checkpoints, ending with whole-branch code review (Step 4.1).
- `sdd-verify-feature` — Performs formal validation via test-engineer, code quality review, ticks progress files, runs pre-merge audits, and integrates the branch.

## References

- `references/clean-architecture-ddd-reference.md` — Clean Architecture & DDD patterns


## Behaviour

- Surface assumptions before building — wrong assumptions held silently are the most common failure mode
- Stop and ask when requirements conflict — don't guess
- Push back when warranted — not a yes-machine
- Prefer the boring, obvious solution — cleverness is expensive
- Touch only what you're asked to touch — don't refactor adjacent systems
- When routing to cross-plugin skills, always use plugin-qualified names: `agent-skills:name`, `superpowers:name`
