---
name: suggest-skills
description: Surveys ALL installed skills across every plugin and recommends the most relevant ones for the current task or conversation context. Use when you want to discover which skill(s) to invoke, or to explore what's available across your full skill stack. Broader than using-harnesspowers — crosses plugin boundaries and works from free-form context.
---

# Suggest Skills

## Overview

This skill maps your current task or conversation context to the best available skills across your **entire installed skill ecosystem** — harnesspowers, agent-skills, superpowers, claude-md-management, frontend-design, claude-code-setup, and utility skills. It is a cross-plugin discovery tool, not a router limited to one plugin.

**Difference from `/using-harnesspowers`:**
- `using-harnesspowers` routes via a fixed decision tree (fast, structured, authoritative)
- `suggest-skills` works from free-form context, crosses all plugin boundaries, and surfaces options you might not know exist

## When to Use

- You're not sure which skill to invoke for your current task
- You want to know what's available across all plugins, not just harnesspowers
- You're starting a new project or a new phase of work
- You want a second opinion on which tool fits best
- You typed `/suggest-skills` (always correct — that's what this skill is for)

## Process

### Step 1: Capture Context

If the user invoked with context (a description, task, or conversation exists), use it directly — skip to Step 2.

If invoked with no context, ask exactly one question:

> "What are you trying to accomplish? One sentence is enough — or describe where you're stuck."

Do not ask follow-up questions. Work with whatever context you receive.

### Step 2: Analyze and Score

Read the **Full Skill Catalog** section below. For each skill, assess relevance to the user's context:

- **High relevance**: the task phase matches AND keywords from the user's description overlap with the skill's trigger conditions
- **Medium relevance**: adjacent phase, or skill could apply if scope broadens slightly
- **Low / not relevant**: unrelated phase or task type

Prefer skills that are **immediately actionable** over skills that only apply later. If multiple skills from the same plugin cover the same phase, prefer the one with more specific fit.

### Step 3: Present Recommendations

Output the top 3–5 skills (lean toward 3 unless there are compelling reasons to show more). Use this format exactly:

```
## Suggested Skills

**1. /skill-name** (plugin-name)
→ Why: [one sentence explaining why this fits the user's specific context]
→ What it produces: [concrete output — a file, a review, a plan, etc.]

**2. plugin:skill-name** (plugin-name)
→ Why: [...]
→ What it produces: [...]

**3. /skill-name** (plugin-name)
→ Why: [...]
→ What it produces: [...]

---
Invoke any of these with the command shown. Type "go" or "1" to start with the top recommendation.
```

**Ordering rules:**
1. The skill most directly matching the current task phase comes first
2. If the task has unclear scope, put a clarification/ideation skill (interview-me, brainstorming) first
3. Never list `suggest-skills` itself as a recommendation

---

## Full Skill Catalog

This catalog is the authoritative reference for all installed skills. Update it when new plugins are installed.

*Last updated: 2026-06-16*

---

### harnesspowers

| Invoke | What It Does | Trigger Conditions |
|--------|-------------|-------------------|
| `/using-harnesspowers` | Authoritative routing tree for all three plugins — routes any development task to the right skill | Starting a session, want routing across all plugins |
| `/sdd-write-spec` | Creates SDD constitution: mission.md, tech-stack.md, roadmap.md — new or existing project | Starting any initiative that needs a spec, greenfield or brownfield |
| `/sdd-plan-feature` | Plans a feature — outputs plan.md, requirements.md, validation.md | Have an SDD constitution, planning the next feature |
| `/sdd-implement-plan` | Executes a feature plan — 3-way mode (subagent-driven with per-slice review; autonomous inline; checkpoint inline), domain-aware dispatch, TDD enforced, validation gate | Have a plan.md, ready to implement |
| `/optimise-claude-md` | Audits and improves CLAUDE.md files using agent-skills lens | Onboarding to a project, improving agent context quality |

---

### agent-skills

| Invoke | What It Does | Trigger Conditions |
|--------|-------------|-------------------|
| `agent-skills:interview-me` | One-question-at-a-time interview to extract actual requirements | Ask is vague, user says "interview me", scope unclear |
| `agent-skills:idea-refine` | Divergent/convergent thinking to turn vague ideas into proposals | Have a rough concept, want to explore variants before committing |
| `agent-skills:planning-and-task-breakdown` | Dependency graph, vertical slices, task sizing, checkpoint placement | Have requirements, need a structured execution order |
| `agent-skills:incremental-implementation` | Thin vertical slices: implement → test → verify → commit | Any multi-file code change without a prior plan |
| `agent-skills:api-and-interface-design` | Contract-first API/interface design, Hyrum's Law | Designing REST/GraphQL APIs, module boundaries, component props |
| `agent-skills:frontend-ui-engineering` | Production-grade UI patterns, component design, accessibility | Building web components, pages, or UI-heavy applications |
| `agent-skills:source-driven-development` | Implements from official docs with citation-verified fidelity | Working with a library/API, need doc-verified code |
| `agent-skills:spec-driven-development` | Follows a spec file step-by-step | Have a written spec, implementing from it |
| `agent-skills:doubt-driven-development` | Structured skepticism — challenges assumptions before acting | Requirements feel wrong, want systematic doubt analysis |
| `agent-skills:code-review-and-quality` | Five-axis review: correctness, readability, architecture, security, performance | Have code ready to merge |
| `agent-skills:security-and-hardening` | OWASP Top 10, STRIDE threat modeling, input validation | Touching user input, auth, data storage, external integrations |
| `agent-skills:code-simplification` | Removes accidental complexity, improves readability without behavior change | Code works but feels too clever or hard to read |
| `agent-skills:browser-testing-with-devtools` | End-to-end testing using browser DevTools and Playwright patterns | Testing UI flows, network interactions, browser behavior |
| `agent-skills:performance-optimization` | Profiling, bottleneck identification, optimization patterns | App is slow, want metrics-driven performance work |
| `agent-skills:ci-cd-and-automation` | Quality gates, pipeline setup, deployment strategies | Setting up or modifying CI/CD pipelines |
| `agent-skills:observability-and-instrumentation` | Structured logs, RED metrics, tracing, symptom-based alerting | Adding telemetry, shipping production features |
| `agent-skills:documentation-and-adrs` | Architecture Decision Records, API docs, documentation standards | Making architectural decisions, changing APIs |
| `agent-skills:deprecation-and-migration` | Safe removal of old systems, migration patterns | Removing old systems, sunsetting features |
| `agent-skills:shipping-and-launch` | Pre-launch checklist, rollout strategy, rollback plan | Getting ready to ship or launch |
| `agent-skills:git-workflow-and-versioning` | Branching strategy, commit conventions, PR workflow, semantic versioning | Branching, committing, opening PRs, versioning releases |
| `agent-skills:context-engineering` | Designs system prompts, tool selection, and context management | Building or optimizing AI system prompts, tool configs |

---

### superpowers

| Invoke | What It Does | Trigger Conditions |
|--------|-------------|-------------------|
| `superpowers:brainstorming` | Explores user intent, requirements, and design before implementation | Starting any creative or feature work; must use before EnterPlanMode |
| `superpowers:test-driven-development` | Red-Green-Refactor, test pyramid, DAMP over DRY, Beyonce Rule | Implementing logic, fixing bugs, or changing behavior |
| `superpowers:systematic-debugging` | Five-step triage: reproduce → localize → reduce → fix → guard | Tests fail, builds break, behavior is unexpected |
| `superpowers:writing-plans` | Decomposes specs into small verifiable tasks with acceptance criteria | Have a spec or requirements for a multi-step task |
| `superpowers:executing-plans` | Executes an implementation plan in a separate session with checkpoints | Have a written plan, want autonomous execution with review gates |
| `superpowers:verification-before-completion` | Runs verification commands and confirms output before claiming success | About to say "done" or "fixed" — requires evidence before assertions |
| `superpowers:requesting-code-review` | Verifies work meets requirements after completing tasks or features | Completing tasks, implementing major features, before merging |
| `superpowers:receiving-code-review` | Processes incoming code review feedback systematically | Received review comments and need to address them |
| `superpowers:finishing-a-development-branch` | Guides completion: merge, PR, or cleanup options | Implementation complete, all tests pass, need to integrate |
| `superpowers:using-git-worktrees` | Creates isolated git worktrees for parallel or experimental work | Working on multiple features simultaneously or in isolation |
| `superpowers:dispatching-parallel-agents` | Launches multiple subagents concurrently for independent tasks | Have independent tasks that can run in parallel |
| `superpowers:subagent-driven-development` | Executes implementation plans with independent tasks in current session | Have an approved plan with parallelizable tasks |
| `superpowers:writing-skills` | Creates, edits, or verifies skills before deployment | Creating new skills, editing existing ones |

---

### claude-md-management

| Invoke | What It Does | Trigger Conditions |
|--------|-------------|-------------------|
| `claude-md-management:claude-md-improver` | Scans CLAUDE.md files, evaluates quality, makes targeted updates | Check, audit, update, or fix CLAUDE.md files |
| `claude-md-management:revise-claude-md` | Revises a specific CLAUDE.md file based on instructions | Want to directly edit CLAUDE.md with AI guidance |

---

### frontend-design

| Invoke | What It Does | Trigger Conditions |
|--------|-------------|-------------------|
| `frontend-design:frontend-design` | Creates distinctive, production-grade frontend interfaces with high design quality | Building web components, pages, or UI-heavy applications |

---

### claude-code-setup

| Invoke | What It Does | Trigger Conditions |
|--------|-------------|-------------------|
| `claude-code-setup:claude-automation-recommender` | Analyzes a codebase and recommends hooks, subagents, skills, plugins, MCP servers | Optimizing Claude Code setup, first-time project setup |

---

### Utility Skills

| Invoke | What It Does | Trigger Conditions |
|--------|-------------|-------------------|
| `/run` | Launches and drives the project app to verify a change works | Want to confirm a change works in the real app (not just tests) |
| `/verify` | Runs the app and observes behavior to confirm a change does what it should | Verifying a PR or fix works end-to-end |
| `/code-review` | Reviews the current diff for correctness bugs at a given effort level | Want a quick diff-level review |
| `/security-review` | Security-focused review of current changes | Shipping anything that touches auth, input, or sensitive data |
| `/init` | Initializes a new CLAUDE.md with codebase documentation | Onboarding a new project to Claude Code |
| `/loop` | Runs a prompt or slash command on a recurring interval | Setting up a recurring task or polling loop |
| `/claude-api` | Builds, debugs, and optimizes Claude API / Anthropic SDK apps | Code imports `anthropic`; working with Anthropic SDK features |
| `/update-config` | Configures Claude Code harness via settings.json | "From now on when X…", permissions, hooks, env vars |
| `/keybindings-help` | Customizes keyboard shortcuts and keybindings | Rebinding keys, adding chord shortcuts |
| `/fewer-permission-prompts` | Scans transcripts and adds allowlist to reduce permission prompts | Getting too many permission prompts |

---

## Common Rationalizations

| Thought | Reality |
|---------|---------|
| "I already know which skill to use" | You might be right. But suggest-skills takes 10 seconds and might surface something better. |
| "The task is too simple for a skill" | Even simple tasks often benefit from one of the utility skills (verify, run, code-review). |
| "I'll just start and figure it out" | That's how you end up mid-implementation asking "should I have planned this differently?" |

## Verification

A good recommendation set:
- Has a clear #1 that's immediately actionable for the stated task
- Shows the correct invocation command for each skill
- Includes a brief "why" that references the user's specific context (not just the skill description)
- Does not list more than 5 skills (if it does, re-score and cut)
