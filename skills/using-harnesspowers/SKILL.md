---
name: using-harnesspowers
description: Unified skill router across harnesspowers, agent-skills, superpowers, frontend-design, and claude-md-management. Use at session start or when you need to discover which skill applies to the current task. Authoritative routing tree — supersedes agent-skills:using-agent-skills.
---

# Using Harnesspowers — Unified Skill Router

## Authority

This routing tree is **authoritative for this environment**. If you also see a routing tree from `agent-skills:using-agent-skills`, defer to this one. This tree covers all skills from all plugins in this stack.

## Skill Discovery

When a task arrives, identify the development phase and apply the corresponding skill:

```
Task arrives
    │
    ├── Vague / don't know what to build yet?   → agent-skills:interview-me
    ├── Rough concept, need to explore variants? → agent-skills:idea-refine
    │
    ├── Need a spec?
    │   ├── No constitution yet                  → harnesspowers:sdd-write-spec (constitution mode)
    │   │                                           (wraps superpowers:brainstorming + agent-skills:interview-me + codebase analysis)
    │   │                                           outputs: sdd-specs/mission.md, sdd-specs/tech-stack.md, sdd-specs/roadmap.md
    │   ├── Constitution exists + feature reqs   → harnesspowers:sdd-write-spec (feature spec mode)
    │   │                                           updates sdd-specs/roadmap.md, creates sdd-specs/features/YYYY-MM-DD-<name>-spec.md
    │   └── Have a feature spec, want a plan     → harnesspowers:sdd-plan-feature
    │
    ├── Planning a feature?                      → harnesspowers:sdd-plan-feature
    │                                               (wraps agent-skills:planning-and-task-breakdown + superpowers:writing-plans)
    │
    ├── Executing a feature plan?                → harnesspowers:sdd-implement-plan
    │                                               (wraps TDD + subagent-driven-development;
    │                                                3-way mode: subagent-driven, autonomous, or checkpoint)
    │
    ├── Found bugs/missing features after        → harnesspowers:sdd-write-spec (feature spec mode)
    │   manual testing post-implementation?         seed input: inline notes or path to findings file
    │                                               then: sdd-plan-feature → sdd-implement-plan
    │
    ├── Implementing code (no plan)?             → agent-skills:incremental-implementation
    │   ├── Designing APIs or interfaces?        → agent-skills:api-and-interface-design
    │   ├── Building frontend / UI?
    │   │   ├── Visual design / creative direction? → frontend-design:frontend-design
    │   │   ├── Engineering quality (a11y, patterns, state)? → agent-skills:frontend-ui-engineering
    │   │   └── Full frontend work?              → both in sequence (design → engineering)
    │   ├── Working from documentation?          → agent-skills:source-driven-development
    │   └── Following a spec file?               → agent-skills:spec-driven-development
    │
    ├── Writing or running tests?                → superpowers:test-driven-development
    ├── Something broke?                         → superpowers:systematic-debugging
    │   └── Need structured doubt-first analysis? → agent-skills:doubt-driven-development
    │
    ├── Reviewing code (quality/correctness)?    → agent-skills:code-review-and-quality
    ├── Security-focused review?                 → agent-skills:security-and-hardening
    ├── Simplifying code?                        → agent-skills:code-simplification
    ├── Browser/devtools testing?                → agent-skills:browser-testing-with-devtools
    │
    ├── Performance work?                        → agent-skills:performance-optimization
    ├── CI/CD pipeline work?                     → agent-skills:ci-cd-and-automation
    ├── Adding logs/metrics/alerts?              → agent-skills:observability-and-instrumentation
    ├── Writing docs or ADRs?                    → agent-skills:documentation-and-adrs
    │                                               (also auto-triggered inside sdd-plan-feature for arch decisions
    │                                                and inside sdd-implement-plan for API/interface slices + completion)
    ├── Deprecating or migrating systems?        → agent-skills:deprecation-and-migration
    ├── Shipping / preparing for launch?         → agent-skills:shipping-and-launch
    ├── Git workflow (branching, commits, PRs)?  → agent-skills:git-workflow-and-versioning
    ├── Context engineering (system prompts)?    → agent-skills:context-engineering
    │
    ├── Optimising a CLAUDE.md file?             → harnesspowers:optimise-claude-md
    │   └── (also: claude-md-management:claude-md-improver for base audit)
    │
    └── Not sure which skill to use?             → harnesspowers:suggest-skills
```

## Core Operating Behaviors

These behaviors apply at all times, across all skills.

### 1. Surface Assumptions

Before implementing anything non-trivial, explicitly state your assumptions:

```
ASSUMPTIONS I'M MAKING:
1. [assumption about requirements]
2. [assumption about architecture]
3. [assumption about scope]
→ Correct me now or I'll proceed with these.
```

### 2. Manage Confusion Actively

When you encounter inconsistencies or unclear specifications:

1. **STOP.** Do not proceed with a guess.
2. Name the specific confusion.
3. Present the tradeoff or ask the clarifying question.
4. Wait for resolution before continuing.

### 3. Push Back When Warranted

Point out issues directly with concrete downsides. Honest technical disagreement is more valuable than false agreement.

### 4. Enforce Simplicity

Before finishing any implementation: can this be done in fewer lines? Are these abstractions earning their complexity? Would a staff engineer say "why didn't you just..."?

### 5. Maintain Scope Discipline

Touch only what you're asked to touch. Do not refactor adjacent systems or add features not in the spec.

### 6. Verify, Don't Assume

Every skill includes a verification step. A task is not complete until verification passes.

## Skill Rules

1. **Check for an applicable skill before starting work.**
2. **Skills are workflows, not suggestions.** Follow the steps in order.
3. **Multiple skills can apply in sequence.** Example: `agent-skills:interview-me` → `harnesspowers:sdd-write-spec` → `harnesspowers:sdd-plan-feature` → `harnesspowers:sdd-implement-plan` → `agent-skills:code-review-and-quality` → *(post-impl findings)* → `harnesspowers:sdd-write-spec` → `harnesspowers:sdd-plan-feature` → `harnesspowers:sdd-implement-plan`.

## Plugin Stack Overview

| Plugin | Role |
|--------|------|
| **harnesspowers** | SDD workflow orchestration — wraps primitives into opinionated workflows |
| **agent-skills** | Engineering primitives — implementation, review, CI/CD, observability, etc. |
| **superpowers** | Core disciplines — brainstorming, TDD, systematic debugging, writing plans |
| **frontend-design** | Design direction and frontend UI engineering quality |
| **claude-md-management** | CLAUDE.md audit and improvement tooling |

Use harnesspowers wrapper skills (sdd-write-spec, sdd-plan-feature, sdd-implement-plan) when running the SDD workflow. Use agent-skills primitives directly for standalone tasks outside that workflow.
