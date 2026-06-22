# harnesspowers

> SDD workflow orchestrator for Claude Code — thin layer that composes `agent-skills` and `superpowers` into end-to-end development workflows.

## What This Is

harnesspowers is a Claude Code plugin that provides the **SDD (Spec-Driven Development) workflow** — a structured path from blank slate to shipped feature, with a built-in iteration loop for post-implementation findings:

```
spec → plan → implement → review
                              ↓
                findings → spec → plan → implement
```

It owns no primitive skills itself. It delegates to four companion plugins: `agent-skills` (engineering primitives), `superpowers` (core disciplines), `frontend-design` (UI/design direction), and `claude-md-management` (CLAUDE.md tooling).

## Plugin Stack

```
harnesspowers (orchestrator)      — 8 SDD workflow skills
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
| `/sdd-verify-feature` | Validate spec compliance (via test-engineer), docs audit, and quality review checklist; appends review fixes to plan.md if needed |
| `/sdd-integrate-feature` | Programmatic verification gate (clean git working tree, all checkboxes ticked), merges changes, and cleans up the branch |
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

Three commands, run in order. Pick the entry point that fits your situation.

### Starting fresh — no constitution yet

```text
/sdd-write-spec        # Interviews you → sdd-specs/mission.md, tech-stack.md, roadmap.md
/sdd-plan-feature      # "Add user authentication" → plan.md, requirements.md, validation.md
/sdd-implement-plan    # Builds slice by slice with TDD, ends with initial whole-branch review
/sdd-verify-feature    # Formally validates criteria, audits docs & checks quality
/sdd-integrate-feature # Programmatic verification gate, merges and cleans up the branch
```

For an existing codebase, `sdd-write-spec` reads your file structure and 50 commits of git history before asking anything.

### Constitution exists — adding a new feature

```text
/sdd-write-spec        # Feature Spec Mode → sdd-specs/features/YYYY-MM-DD-{name}-spec.md
/sdd-plan-feature      # Reads feature spec → plan.md, requirements.md, validation.md
/sdd-implement-plan    # Code & developer review
/sdd-verify-feature    # Validate & quality audit
/sdd-integrate-feature # Merge and cleanup
```

Once `sdd-specs/mission.md`, `tech-stack.md`, and `roadmap.md` exist, `sdd-write-spec` switches to Feature Spec Mode: it maps your requirements against `mission.md` boundaries, checks for "never do" conflicts, and creates a scoped spec file instead of rewriting the constitution.

### Feature is clear — skip the spec

```text
You already know what to build and the codebase is familiar.
/sdd-plan-feature      # Describe the feature directly → plan.md, requirements.md, validation.md
/sdd-implement-plan
/sdd-verify-feature
/sdd-integrate-feature
```

### Found bugs or missing features after testing

After manual testing reveals issues post-implementation, re-enter the workflow at `sdd-write-spec`. Describe your findings inline or point to a notes file — it interviews you to synthesize them into a scoped spec, then the standard plan → implement cycle runs.

```text
/sdd-write-spec        # Feature Spec Mode — findings as seed input (inline or --file path/to/notes.md)
                       # Interviews you → sdd-specs/features/YYYY-MM-DD-{name}-spec.md
/sdd-plan-feature      # Plan the fixes → plan.md, requirements.md, validation.md
/sdd-implement-plan    # Implement with TDD
/sdd-verify-feature    # Verify fixes and compliance
/sdd-integrate-feature # Merge and cleanup
```

This keeps post-impl fixes inside the same spec/plan/implement discipline as new features — findings don't get patched ad-hoc, they go through the workflow.

### What each step produces

**`/sdd-write-spec`** — no constitution yet:

- `sdd-specs/mission.md` — objective, boundaries, "never do" list
- `sdd-specs/tech-stack.md` — folder layout, code style, test strategy
- `sdd-specs/roadmap.md` — phases and milestones

**`/sdd-write-spec`** — constitution exists (Feature Spec Mode):

- `sdd-specs/features/YYYY-MM-DD-{name}-spec.md` — scoped feature spec, direct input to `sdd-plan-feature`
- `sdd-specs/roadmap.md` — updated with the new feature milestone

**`/sdd-plan-feature`**:

- `sdd-specs/plans/YYYY-MM-DD-{name}/plan.md` — phase-structured task list with interface contracts and checkpoint blocks
- `sdd-specs/plans/YYYY-MM-DD-{name}/requirements.md` — scope, decisions, out-of-scope
- `sdd-specs/plans/YYYY-MM-DD-{name}/validation.md` — acceptance criteria, definition of done
- `sdd-docs/decisions/ADR-{NNN}.md` — written automatically when a significant architectural choice surfaces

**`/sdd-implement-plan`**:

- Commits per slice; phase checkpoint blocks run and ticked at each phase boundary; ends with whole-branch code review.

**`/sdd-verify-feature`**:

- Automated verification gate (validation.md ticked); documentation check; code quality audit (findings written as review fixes in plan.md); ticks plan.md and roadmap.md when passed.

**`/sdd-integrate-feature`**:

- Ensures clean git status and all checklists are fully ticked, then handles branch merge and cleanup.

### Inside each command

**`/sdd-plan-feature`** runs `agent-skills:planning-and-task-breakdown` and formats the output directly into a phase-structured `plan.md` — phases with tasks, lightweight interface contracts per task (what each slice produces and consumes), and a checkpoint block at the end of each phase. No code is pre-written in the plan; TDD execution happens at implementation time. A structured summary of all three output files is shown *before writing them*, with a focused probe question. When a significant architectural decision surfaces, it writes an ADR to `sdd-docs/decisions/ADR-{NNN}.md` — outside the feature directory so it outlives the feature.

**`/sdd-implement-plan`** asks once how slices should run:

- **Subagent-driven** *(recommended for ≥4 slices)* — fresh subagent per slice; spec compliance + code quality review between each. Best for long plans where context preservation matters.
- **Autonomous** — single session, no pauses. Best for small plans or prototypes.
- **Checkpoint** — single session, pauses after each slice for your confirmation.

Inline modes enforce Red-Green-Refactor strictly: one failing test written before any code, minimal code to pass it, refactor only after green. At each phase boundary, the `### Checkpoint — Phase N` block from `plan.md` is verified before the next phase begins — a phase gate that catches integration issues early. The skill ends with Step 4.1 Whole-Branch Review (`superpowers:requesting-code-review`) to verify code compliance. It does not perform validation, quality audits, or branch merge.

**`/sdd-verify-feature`** dispatches `agent-skills:test-engineer` to verify each criterion in `validation.md`. It then performs documentation checks and executes the `agent-skills:code-review-and-quality` checklist. If any critical or important quality findings are found, they are appended to the bottom of `plan.md` as `## Review Fixes`, and it exits so the user can re-run `/sdd-implement-plan`. If verification passes, it ticks off the features in `plan.md` and `roadmap.md`.

**`/sdd-integrate-feature`** programmatically verifies that all checkboxes in `plan.md` and `validation.md` are marked `[x]` and that the working directory is clean. It then runs `superpowers:finishing-a-development-branch` using the auto-detected or user-supplied target base branch.

## What's NOT in This Plugin

Skills that used to be copied here now live in `agent-skills` directly:

- interview-me, idea-refine
- incremental-implementation, api-and-interface-design
- code-review-and-quality, security-and-hardening
- ci-cd-and-automation, observability-and-instrumentation
- documentation-and-adrs, deprecation-and-migration

Install `agent-skills@addy-agent-skills` to get all of these.
