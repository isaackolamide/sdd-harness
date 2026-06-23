# harnesspowers

> SDD workflow orchestrator for Claude Code — thin layer that composes `agent-skills` and `superpowers` into end-to-end development workflows.

## What This Is

harnesspowers is a Claude Code plugin that provides the **SDD (Spec-Driven Development) workflow** — a structured path from blank slate to shipped feature, with a built-in iteration loop for post-implementation findings:

```
spec → plan → implement → review
                              ↓
                findings → spec → plan → implement
```

It wraps skills from two major plugins -> `superpowers` and `agent-skills`

## Plugin Stack

```
harnesspowers (orchestrator)      — 6 SDD workflow skills
     ↓ delegates to
agent-skills (primitives)         — 24 engineering skills
superpowers (discipline)          — TDD, subagent-driven execution, brainstorming
frontend-design (UI/design)       — design direction, frontend quality
claude-md-management (tooling)    — CLAUDE.md audit and improvement
```

## Skills

| Skill | What It Does |
|-------|-------------|
| `/using-harnesspowers` | Routing tree — which skill for which task, across all plugins |
| `/sdd-write-spec` | Create or extract SDD constitution — works for new and existing projects |
| `/sdd-plan-feature` | Plan a feature from the roadmap — outputs plan.md/requirements.md/validation.md; triggers ADR for significant arch decisions |
| `/sdd-implement-plan` | Execute a feature plan — 3-way mode (subagent-driven / autonomous / checkpoint), domain-aware dispatch, TDD enforced, phase checkpoints, developer whole-branch review |
| `/sdd-verify-feature` | Validate spec compliance, audit code quality, update progress files, run pre-merge audits, and integrate/merge the branch |
| `/optimise-claude-md` | Audit and improve any project's CLAUDE.md |

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
Copilot automatically reads user-level (global) rules and instructions from your home directory.

**To enforce harnesspowers rules globally across all your projects:**

For macOS/Linux:
```bash
# Copy the Copilot instructions to your home directory
cp <path-to-harnesspowers>/.github/copilot-instructions.md ~/.copilot-instructions.md
```

For Windows:
```cmd
:: Copy the Copilot instructions to your user profile directory
copy <path-to-harnesspowers>\.github\copilot-instructions.md %USERPROFILE%\copilot-instructions.md
```

Alternatively, in Visual Studio Code:
1. Open the Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`).
2. Search and select **Copilot: Open Custom Instructions**.
3. Paste the content of `<path-to-harnesspowers>/.github/copilot-instructions.md` into the editor.

**To load skills/plugins locally into Copilot CLI/Codex:**
```bash
# Symlink into Copilot plugins directory
ln -sf <path-to-harnesspowers> ~/.copilot/plugins/harnesspowers
```

## How to Use

The SDD (Spec-Driven Development) workflow is structured into four main phases, executed in sequence.


![alt text](image.png)

> [!TIP]
> Unsure which skill to run for a specific task? Run `/using-harnesspowers` at the start of your session to view the authoritative routing tree across all plugins in the stack.

### Choose Your Entry Point

Pick the starting command that matches your current project state:

#### 1. Starting Fresh (New Project or Greenfield Initiative)
You do not have a project constitution yet. You need to bootstrap the core scope, guidelines, and roadmap.
```text
/sdd-write-spec        # Interactive interview → generates mission.md, tech-stack.md, roadmap.md
/sdd-plan-feature      # Choose feature/milestone → plan.md, requirements.md, validation.md
/sdd-implement-plan    # TDD slice-by-slice implementation loop
/sdd-verify-feature    # Formal validation, quality audits, ticks roadmap, merges branch
```
*Note: For an existing codebase, `/sdd-write-spec` will automatically read your folder structure and commit history to pre-fill context before asking any questions.*

#### 2. Constitution Exists (Adding a New Feature)
The project constitution already exists. You are starting a new feature from the roadmap.
```text
/sdd-write-spec        # Runs in Feature Spec Mode → sdd-specs/features/YYYY-MM-DD-{feature}-spec.md
/sdd-plan-feature      # Reads feature spec → plan.md, requirements.md, validation.md
/sdd-implement-plan    # Runs implementation slices & developer review
/sdd-verify-feature    # Formally validates criteria & integrates branch
```

#### 3. Scope is Clear (Skip Feature Spec)
You already know exactly what to build, and the codebase is highly familiar.
```text
/sdd-plan-feature      # Describe feature directly → plan.md, requirements.md, validation.md
/sdd-implement-plan    # TDD execution loop
/sdd-verify-feature    # Validate, audit, and merge
```

#### 4. Post-Implementation Findings (Bugs & Feedback)
Manual testing or review revealed issues or adjustments after running `/sdd-implement-plan`. Feed findings back into the spec/plan loop to handle them with discipline:
```text
/sdd-write-spec        # Feature Spec Mode — provides findings as seed (inline or --file path/to/notes.md)
/sdd-plan-feature      # Plan the fixes → plan.md, requirements.md, validation.md
/sdd-implement-plan    # Implement fixes with TDD
/sdd-verify-feature    # Validate fixes and complete integration
```

---

### Command Deep Dive & Outputs

#### Phase 1: `/sdd-write-spec`
Sets project-wide boundaries and standardizes context.
* **Constitution Mode (No existing specs):**
  * `sdd-specs/mission.md` — Core objective, user persona, and "never do" list boundaries.
  * `sdd-specs/tech-stack.md` — Directory structure, code style rules (with code snippet), and test runner configurations.
  * `sdd-specs/roadmap.md` — Project milestones and release phases.
* **Feature Spec Mode (Constitution exists):**
  * `sdd-specs/features/YYYY-MM-DD-{name}-spec.md` — Scoped feature specification.
  * `sdd-specs/roadmap.md` — Appends the feature to the active roadmap phase.

#### Phase 2: `/sdd-plan-feature`
Breaks the feature spec into structured, implementable tasks.
* **Outputs:**
  * `sdd-specs/plans/YYYY-MM-DD-{name}/plan.md` — Task breakdown with strict interface contracts and phase checkpoints.
  * `sdd-specs/plans/YYYY-MM-DD-{name}/requirements.md` — Project scope, out-of-scope items, and design constraints (e.g. security, telemetry, migration risk).
  * `sdd-specs/plans/YYYY-MM-DD-{name}/validation.md` — Acceptance criteria checklist and definition of done.
  * `sdd-docs/decisions/ADR-{NNN}.md` — Generated automatically if significant architectural choices surface.

#### Phase 3: `/sdd-implement-plan`
Executes the plan slice by slice using Test-Driven Development (TDD) on an isolated feature branch.
* **Execution Modes (selected on start):**
  * **Subagent-driven** (Recommended for $\ge$ 4 slices): Spawns an isolated subagent per task; maintains context cleanliness.
  * **Autonomous**: Executes the entire plan in a single run without pausing.
  * **Checkpoint**: Pauses for user confirmation after completing each slice.
* **Outputs:**
  * Commits corresponding to each task slice.
  * Phase checkpoints verified, ticked, and committed at phase boundaries.
  * Whole-branch code review results.

#### Phase 4: `/sdd-verify-feature`
Validates code compliance and merges the feature branch.
* **Workflow:**
  * Dispatches the `test-engineer` subagent to verify all criteria in `validation.md` and audits raw execution logs.
  * Runs a rigorous code quality audit. Any issues found are added to `plan.md` as `## Review Fixes` to be resolved via `/sdd-implement-plan`.
  * Ticks off progress in `plan.md` and `roadmap.md` upon completion.
  * Runs a pre-merge programmatic verification gate (checks git cleanliness, runs main build, lint, and test scripts).
  * Integrates the branch and cleans up using `superpowers:finishing-a-development-branch`.

## What's NOT in This Plugin

Skills that used to be copied here now live in `agent-skills` directly:

- interview-me, idea-refine
- incremental-implementation, api-and-interface-design
- code-review-and-quality, security-and-hardening
- ci-cd-and-automation, observability-and-instrumentation
- documentation-and-adrs, deprecation-and-migration

Install `agent-skills@addy-agent-skills` to get all of these.
