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
| `/sdd-implement-plan` | Execute a feature plan — 3-way mode (subagent-driven / autonomous / checkpoint), domain-aware dispatch, TDD enforced, validation gate, hands off to agent-skills:code-review-and-quality |
| `/optimise-claude-md` | Audit and improve any project's CLAUDE.md |
| `/suggest-skills` | Discover the right skill across all installed plugins |

## Installation

> **SSH blocked?** If your network blocks SSH connections to GitHub, run this once before installing:
> ```bash
> git config --global url."https://github.com/".insteadOf "git@github.com:"
> ```
> This rewrites any `git@github.com:` URLs to HTTPS automatically.

### Platform Integration Guides

#### 1. Claude Code

```bash
# Register marketplaces for harnesspowers and its agent-skills dependency
claude plugin marketplace add https://github.com/isaackolamide/harnesspowers.git
claude plugin marketplace add https://github.com/addyosmani/agent-skills.git

# Install companion plugins
claude plugin install superpowers@claude-plugins-official
claude plugin install frontend-design@claude-plugins-official
claude plugin install claude-md-management@claude-plugins-official
claude plugin install agent-skills@addy-agent-skills

# Install harnesspowers
claude plugin install harnesspowers@harnesspowers
```

Restart Claude Code after installation to apply changes.

**Updating harnesspowers:**
```bash
claude plugin update harnesspowers@harnesspowers
```

#### 2. Antigravity CLI / IDE
Antigravity automatically discovers and loads plugins from the `~/.gemini/config/plugins` directory.

```bash
# Clone the repo
git clone https://github.com/isaackolamide/harnesspowers <path-to-harnesspowers>

# Symlink into Antigravity plugins directory
ln -sf <path-to-harnesspowers> ~/.gemini/config/plugins/harnesspowers
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
3. /sdd-implement-plan — 3-way mode (subagent-driven / autonomous / checkpoint) + TDD + validation gate + code review
```

## What's NOT in This Plugin

Skills that used to be copied here now live in `agent-skills` directly:
- interview-me, idea-refine
- incremental-implementation, api-and-interface-design
- code-review-and-quality, security-and-hardening
- ci-cd-and-automation, observability-and-instrumentation
- documentation-and-adrs, deprecation-and-migration

Install `agent-skills@addy-agent-skills` to get all of these.
