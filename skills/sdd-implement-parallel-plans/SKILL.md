---
name: sdd-implement-parallel-plans
description: Use when you have 2+ independent feature plans that can be implemented concurrently without shared state.
metadata:
  type: implementation
  composesWith: [superpowers:dispatching-parallel-agents, sdd-harness:sdd-implement-plan]
---

# Parallel SDD Implementation

## Overview
Wraps `superpowers:dispatching-parallel-agents` with `git worktree` isolation to safely execute multiple SDD feature plans in parallel.

When you have multiple independent `plan.md`s ready, implementing them sequentially wastes time. However, dispatching parallel agents in the same working directory inevitably leads to `git index.lock` crashes and test suite pollution. This skill uses `git worktree` to give each parallel agent an isolated filesystem and branch.

**REQUIRED BACKGROUND:** You MUST understand `sdd-harness:sdd-implement-plan` and `superpowers:dispatching-parallel-agents`.

## When to Use

**Use when:**
- You have 2 or more separate, independent feature plans (`plan.md`).
- The features do not depend on each other and do not modify the same core files (no shared state).

**Don't use when:**
- The tasks are part of the *same* feature plan (use `superpowers:subagent-driven-development` instead).
- The features depend on each other sequentially.

## The Workflow

### Step 1: Create Isolated Worktrees
For each independent plan, create a git worktree. To avoid nested git issues and linting noise, place them in a `.worktrees/` directory at the project root and ensure it is ignored (matching the `superpowers:using-git-worktrees` convention).

```bash
# Ensure .worktrees is ignored to prevent linting/git noise
git check-ignore -q .worktrees 2>/dev/null || (echo ".worktrees/" >> .gitignore && git add .gitignore && git commit -m "chore: ignore .worktrees directory")

git worktree add .worktrees/<feature1-branch> -b <feature1-branch>
git worktree add .worktrees/<feature2-branch> -b <feature2-branch>
```

### Step 2: Dispatch Parallel Subagents
Dispatch one subagent per worktree in a single response block using `superpowers:dispatching-parallel-agents`.

Provide each subagent with:
1. The absolute path to its assigned worktree.
2. Instructions to `cd` into the worktree.
3. The specific plan it must implement using the `sdd-implement-plan` skill.

**Example Dispatch:**
```text
Subagent (general-purpose): "cd /absolute/path/to/project/.worktrees/feature1-branch && use the sdd-implement-plan skill for sdd-specs/plans/feature1"
Subagent (general-purpose): "cd /absolute/path/to/project/.worktrees/feature2-branch && use the sdd-implement-plan skill for sdd-specs/plans/feature2"
```

### Step 3: Review and Handoff
Once all subagents return successfully:
1. Review the implementation summaries.
2. Clean up the worktrees (the branches will safely remain in your local git repository):

```bash
git worktree remove .worktrees/<feature1-branch>
git worktree remove .worktrees/<feature2-branch>
```

3. Hand off to the user to run the verification gate sequentially on each branch:
   > "✓ Parallel implementation complete. To verify and integrate:
   > 1. `git checkout <feature1-branch>` then run `/sdd-verify-feature`
   > 2. `git checkout <feature2-branch>`, run `git rebase main` to sync with the first feature's merge, then run `/sdd-verify-feature`."

## Common Rationalizations (RED vs GREEN)

| Excuse | Reality / Action |
|--------|------------------|
| "I'll just dispatch parallel agents in the current directory since they touch different files." | `git index.lock` crashes and test pollution are inevitable. **Rule**: NEVER dispatch parallel implementation agents in the same working directory. Use `git worktree`. |
| "I'll create the worktrees directly in the root without ignoring them." | Creates nested git repo issues or linting noise. **Rule**: Always place worktrees in an ignored `.worktrees/` directory. |
| "I'll instruct parallel agents to use the /sdd-verify-feature slash command." | Slash commands are UI shortcuts for humans, not agents. Also, verification merges into base; concurrent verification crashes `main`. **Rule**: Implementation is parallel, verification is sequential by the user. |

## Red Flags - STOP and Start Over

- Dispatching parallel agents to execute plans in the same directory.
- Creating a `git worktree` inside the current repository without using an ignored `.worktrees/` folder.
- Instructing a subagent to use slash commands (e.g., `/sdd-implement-plan`) instead of the skill by name.
- Instructing a parallel subagent to run verification or merge a branch.
