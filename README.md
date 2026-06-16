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
superpowers (discipline)          — TDD, subagent-driven execution, brainstorming
frontend-design (UI/design)       — design direction, frontend quality
claude-md-management (tooling)    — CLAUDE.md audit and improvement
```

## Skills

| Skill | What It Does |
|-------|-------------|
| `/using-harnesspowers` | Routing tree — which skill for which task, across all three plugins |
| `/sdd-write-spec` | Create or extract SDD constitution — works for new and existing projects |
| `/sdd-plan-feature` | Plan a feature from the roadmap — outputs plan.md/requirements.md/validation.md; triggers ADR for significant arch decisions |
| `/sdd-implement-plan` | Execute a feature plan — 3-way mode (subagent-driven / autonomous / checkpoint), domain-aware dispatch, TDD enforced, docs checklist on completion |
| `/i-need-code-review` | Context-aware router for all code review options |
| `/optimise-claude-md` | Audit and improve any project's CLAUDE.md |
| `/suggest-skills` | Discover the right skill across all installed plugins |

## Installation

### Prerequisites

Install the companion plugins first:

```bash
# From addyosmani/agent-skills (custom repo)
/plugin marketplace add addy-agent-skills github:addyosmani/agent-skills
/plugin install agent-skills@addy-agent-skills

# From the official Claude plugin marketplace
/plugin install superpowers
/plugin install frontend-design
/plugin install claude-md-management
```

---

### Platform Integration Guides

#### 1. Claude Code
**Local development (symlink):**
```bash
# Clone the repo
git clone https://github.com/isaackolamide/harnesspowers <path-to-harnesspowers>

# Symlink into plugin cache
mkdir -p ~/.claude/plugins/cache/isaac-harnesspowers/harnesspowers
ln -sf <path-to-harnesspowers> ~/.claude/plugins/cache/isaac-harnesspowers/harnesspowers/2.0.0
```
Then add the plugin to `~/.claude/plugins/installed_plugins.json` and enable it in `~/.claude/settings.json`.

#### 2. Antigravity CLI / IDE
Antigravity automatically discovers and loads plugins from the `~/.gemini/config/plugins` directory.

**Local development (symlink):**
```bash
# Clone the repo
git clone https://github.com/isaackolamide/harnesspowers <path-to-harnesspowers>

# Symlink into Antigravity plugins directory
ln -sf <path-to-harnesspowers> ~/.gemini/config/plugins/harnesspowers

# Ensure plugin.json is linked to the root of harnesspowers
ln -sf .claude-plugin/plugin.json <path-to-harnesspowers>/plugin.json
```
Restart your Antigravity session to discover and enable the skills.

#### 3. GitHub Copilot
Copilot automatically reads repository-level rules and instructions from `.github/copilot-instructions.md`.

**To enforce harnesspowers rules in your workspace:**
```bash
# Copy the Copilot instructions to your workspace root
mkdir -p <your-project-root>/.github
cp <path-to-harnesspowers>/.github/copilot-instructions.md <your-project-root>/.github/copilot-instructions.md
```

**To load skills/plugins locally into Copilot CLI/Codex:**
```bash
# Symlink into Copilot plugins directory
ln -sf <path-to-harnesspowers> ~/.copilot/plugins/harnesspowers
```

## SDD Workflow

```
1. /sdd-write-spec    — Mission, tech stack, roadmap (new or existing project)
2. /sdd-plan-feature  — Feature plan + ADRs for arch decisions
3. /sdd-implement-plan — 3-way mode (subagent-driven / autonomous / checkpoint) + TDD + docs checklist
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
