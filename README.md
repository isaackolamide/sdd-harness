# harnesspowers

> SDD workflow orchestrator for Claude Code — thin layer that composes `agent-skills` and `superpowers` into end-to-end development workflows.

## What This Is

harnesspowers is a Claude Code plugin that provides the **SDD (Spec-Driven Development) workflow** — a structured path from blank slate to shipped feature:

```
spec → plan → implement → review
```

It owns no primitive skills itself. It delegates to four companion plugins: `agent-skills` (engineering primitives), `superpowers` (core disciplines), `frontend-design` (UI/design direction), and `claude-md-management` (CLAUDE.md tooling).

## Plugin Stack

```
harnesspowers (orchestrator)      — 7 SDD workflow skills
     ↓ delegates to
agent-skills (primitives)         — 24 engineering skills
superpowers (discipline)          — TDD, debugging, brainstorming
frontend-design (UI/design)       — design direction, frontend quality
claude-md-management (tooling)    — CLAUDE.md audit and improvement
```

## Skills

| Skill | What It Does |
|-------|-------------|
| `/using-harnesspowers` | Routing tree — which skill for which task, across all three plugins |
| `/sdd-write-spec` | Create or extract SDD constitution — works for new and existing projects |
| `/sdd-plan-feature` | Plan a feature from the roadmap — outputs plan.md/requirements.md/validation.md; triggers ADR for significant arch decisions |
| `/sdd-implement-plan` | Execute a feature plan slice-by-slice — domain-aware dispatch (frontend, API), TDD with testing-patterns reference, docs checklist on completion |
| `/i-need-code-review` | Context-aware router for all code review options |
| `/optimise-claude-md` | Audit and improve any project's CLAUDE.md |
| `/suggest-skills` | Discover the right skill across all installed plugins |

## Installation

### Prerequisites

Install the companion plugins first:

```
# From addyosmani/agent-skills (custom repo)
/plugin marketplace add addy-agent-skills github:addyosmani/agent-skills
/plugin install agent-skills@addy-agent-skills

# From the official Claude plugin marketplace
/plugin install superpowers
/plugin install frontend-design
/plugin install claude-md-management
```

### Install harnesspowers

**From GitHub (once published):**
```
/plugin marketplace add isaac-harnesspowers github:isaackolamide/harnesspowers
/plugin install harnesspowers@isaac-harnesspowers
```

**Local development (symlink):**
```bash
# Clone the repo
git clone https://github.com/isaackolamide/harnesspowers ~/Documents/Projects/grow/harnesspowers

# Symlink into plugin cache
mkdir -p ~/.claude/plugins/cache/isaac-harnesspowers/harnesspowers
ln -sf ~/Documents/Projects/grow/harnesspowers ~/.claude/plugins/cache/isaac-harnesspowers/harnesspowers/2.0.0
```

Then add to `~/.claude/plugins/installed_plugins.json` and enable in `~/.claude/settings.json`.

## SDD Workflow

```
1. /sdd-write-spec    — Mission, tech stack, roadmap (new or existing project)
2. /sdd-plan-feature  — Feature plan + ADRs for arch decisions
3. /sdd-implement-plan — Domain-aware slices (frontend/API dispatch) + TDD + docs checklist
4. /i-need-code-review — Choose the right review approach
```

## What's NOT in This Plugin

Skills that used to be copied here now live in `agent-skills` directly:
- interview-me, idea-refine
- incremental-implementation, api-and-interface-design
- code-review-and-quality, security-and-hardening
- ci-cd-and-automation, observability-and-instrumentation
- documentation-and-adrs, deprecation-and-migration

Install `agent-skills@addy-agent-skills` to get all of these.
