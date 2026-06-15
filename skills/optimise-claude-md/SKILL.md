---
name: optimise-claude-md
description: Use when asked to update, audit, improve, create, or review a CLAUDE.md (or AGENTS.md) in any project. Applies two-layer analysis — base quality audit plus the agent-skills lens — producing a minimal, high-signal file rather than a comprehensive one.
---

# Update CLAUDE.md

Audits and improves CLAUDE.md files using the `claude-md-management` quality rubric as a baseline, then applies the agent-skills engineering lens on top. The goal is a minimal, high-signal file — not a comprehensive one.

**Core principle:** Every line must be non-discoverable, operationally significant, and impossible to guess by convention. Everything else degrades agent performance and inflates cost.

## Phase 1 — Discovery

**Step 1a — Confirm scope.** Ask the user which directory to treat as the project root (default: cwd). This prevents accidentally scanning sibling projects or unrelated workspaces in a monorepo. Confirm before running any `find` commands.

**Step 1b — Find existing CLAUDE.md / AGENTS.md files:**

```bash
find <root> -name "CLAUDE.md" -o -name "AGENTS.md" 2>/dev/null | grep -v node_modules | grep -v .git
```

Read each file completely before continuing.

**Step 1c — Identify major subdirectories.** A subdirectory is "major" if it contains any of:
- A manifest file: `package.json`, `go.mod`, `Cargo.toml`, `pyproject.toml`, `pom.xml`, `build.gradle`
- A test directory (`__tests__`, `test/`, `spec/`, `tests/`) or CI config (`.github/workflows/`, `Jenkinsfile`, `.circleci/`)
- Conventional monorepo structure paths at depth 1-2: `apps/*/`, `packages/*/`, `services/*/`, `libs/*/`, `modules/*/`

```bash
# Find subdirs with manifest files (depth 1-3, exclude root)
find <root> -mindepth 2 -maxdepth 4 \( -name "package.json" -o -name "go.mod" -o -name "Cargo.toml" -o -name "pyproject.toml" -o -name "pom.xml" -o -name "build.gradle" \) 2>/dev/null | grep -v node_modules | grep -v .git | xargs -I{} dirname {} | sort -u
```

For each major subdirectory found, note whether a CLAUDE.md already exists there.

## Phase 2 — Base Audit

Invoke `claude-md-management:claude-md-improver` for the structured quality score. Note what it flags as missing — you'll revisit those findings in Phase 3, where the criteria differ.

## Phase 3 — Agent-Skills Lens

Apply these five checks to every line. Flag anything that fails.

### Check 1: Discoverability Test (per line)

A line earns its place only if it passes **all three**:
1. **Not discoverable** — agent cannot find this by reading code, READMEs, or existing docs
2. **Operationally significant** — changes what commands the agent runs or decisions it makes
3. **Impossible to guess by convention** — no reasonable default leads the agent to the right answer

Flag for removal: directory structure, tech stack, commands the agent can discover by running, anything already in a README.

### Check 2: Five Non-Negotiables

These must be present in every CLAUDE.md — they are behavioral constraints no codebase makes discoverable. Add a `## Behaviour` section if missing:

```markdown
## Behaviour

- Surface assumptions before building — wrong assumptions held silently are the most common failure mode
- Stop and ask when requirements conflict — don't guess
- Push back when warranted — not a yes-machine
- Prefer the boring, obvious solution — cleverness is expensive
- Touch only what you're asked to touch — don't refactor adjacent systems
```

### Check 3: Process Over Prose

Flag any block longer than 5 lines that reads as an essay or reference doc rather than a workflow. Convert to a checklist with a concrete exit criterion. "Seems right" is not an exit criterion.

### Check 4: Layer Separation

Flag content that belongs in another layer of the harness:
- "Always do X before Y" procedural rules → should be a hook
- Long how-to workflows → should be a skill
- Repeated patterns that appear project-wide → should be a skill invoked by `using-harnesspowers`

### Check 5: Router vs Monolith

If the file exceeds 80 lines, check whether it's covering concerns from multiple modules. Flag sections that belong in a module-level CLAUDE.md closer to the relevant code. The root file should route, not dump.

See the **Subdirectory Coverage** section of the Phase 6 report for directories that may warrant their own CLAUDE.md.

## Phase 4 — Anchoring Check

Scan for:
- Deprecated patterns, libraries, or directories — even warnings load them into every context window
- "Don't use X" statements — rewrite as positive constraints, or move to a module-level file scoped to where that code lives

## Phase 5 — Codebase Smell Flag

Every line flagged for removal is a signal about something confusing enough to trip an agent — which means it's probably confusing enough to trip a new engineer too. For each removal, note:
> "Agent kept making this mistake → consider fixing [root cause] so this line can stay deleted."

## Phase 6 — Quality Report

Output before making any changes:

```
## CLAUDE.md Audit

### Summary
- Lines reviewed: X | Lines passing discoverability test: X | Lines flagged: X
- Non-negotiables: present / missing
- Structure: router / monolith / needs hierarchy

### Findings
| Content | Issue | Action |
|---------|-------|--------|
| "..." | Discoverable / Anchoring / Essay / Wrong layer | Remove / Rewrite / Move |

### Additions
- [ ] Five non-negotiables (if missing)
- [ ] [Any genuine project landmines identified]

### Codebase Smells
- [Root causes worth fixing so the line stays gone]

### Subdirectory Coverage
| Directory | Has CLAUDE.md | Significance Signal |
|-----------|---------------|---------------------|
| [path] | ✓ / ✗ | package.json / go.mod / Dockerfile / etc. |

**Gaps:** [list uncovered dirs, or "none — all major subdirs have CLAUDE.md"]

If gaps exist: consider adding CLAUDE.md to uncovered directories.
Use `claude-md-management:claude-md-improver` on each to scaffold a minimal, module-scoped file.
```

## Phase 7 — Apply With Approval

After user confirms, apply. Show final line count delta.

**Exit criterion:** Every remaining line passes the three-part discoverability test. Five non-negotiables are present. File is under 60 lines unless genuine landmines justify more.

---

## Anti-Rationalization Table

| Excuse | Rebuttal |
|--------|----------|
| "The agent needs to know our directory structure" | It lists directories itself. Delete it. |
| "These commands are non-obvious" | Can the agent run `npm run --list` or read package.json? Then delete them. |
| "This is important architectural context" | If it's derivable from reading the code or a README, the agent finds it. Delete it. |
| "We need to warn about the deprecated module" | You've loaded that module into every context window. Fix the import structure instead. |
| "The claude-md-management score will drop" | That rubric rewards completeness. This skill rewards signal density. They measure different things. |
| "But it was useful before" | Models improve. Instructions that were essential six months ago may now be overhead. Re-test. |
