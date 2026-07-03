---
name: using-sdd-harness
description: Unified skill router across sdd-harness, agent-skills, superpowers, frontend-design, figma, and claude-md-management. Use at session start or when you need to discover which skill applies to the current task. Authoritative routing tree — supersedes agent-skills:using-agent-skills.
---

# Using Sdd-harness — Unified Skill Router

## Authority

This routing tree is **authoritative for this environment**. If you also see a routing tree from `agent-skills:using-agent-skills`, defer to this one. This tree covers all skills from all plugins in this stack.

## Skill Discovery

When a task arrives, identify the development phase and apply the corresponding skill:

```
Task arrives
    │
    ├── No constitution yet?                     → sdd-harness:sdd-constitution
    │                                               (wraps superpowers:brainstorming + agent-skills:interview-me + codebase analysis)
    │                                               outputs: sdd-specs/mission.md, sdd-specs/tech-stack.md, sdd-specs/roadmap.md
    │
    ├── Constitution exists:
    │   ├── Feature idea is vague/rough?
    │   │   ├── Vague / don't know what to build?    → agent-skills:interview-me
    │   │   ├── Rough concept, explore variants?    → agent-skills:idea-refine
    │   │   └── Need a PRD from rough idea?         → sdd-harness:sdd-prd
    │   │                                               (outputs sdd-specs/prds/YYYY-MM-DD-<name>-prd.md)
    │   │
    │   ├── Need a spec?
    │   │   ├── Constitution exists + feature reqs   → sdd-harness:sdd-write-spec
    │   │   │                                           updates sdd-specs/roadmap.md, creates sdd-specs/features/YYYY-MM-DD-<name>-spec.md
    │   │   └── Have a feature spec, want a plan     → sdd-harness:sdd-plan-feature
    │
    ├── Planning a feature?                      → sdd-harness:sdd-plan-feature
    │                                               (wraps agent-skills:planning-and-task-breakdown;
    │                                                outputs phase-structured plan.md with interface contracts + checkpoint blocks per phase)
    │
    ├── Executing a feature plan?                → sdd-harness:sdd-implement-plan
    │                                               (wraps superpowers:subagent-driven-development;
    │                                                slice loop, checkpoints, and whole-branch developer review)
    │
    ├── Verifying, ticking progress, and         → sdd-harness:sdd-verify-feature
    │   integrating/merging the branch?             (wraps agent-skills:code-review-and-quality + test-engineer persona
    │                                                + superpowers:finishing-a-development-branch)
    │
    ├── Found bugs/missing features after        → sdd-harness:sdd-write-spec
    │   manual testing post-implementation?         seed input: inline notes or path to findings file
    │                                               then: sdd-plan-feature → sdd-implement-plan
    │
    ├── Task involves a Figma design or figma.com URL?
    │   ├── Figma MCP tools NOT available in this session?
    │   │   └── Note the Figma URL/design as context in spec or plan;
    │   │       proceed with frontend-design + agent-skills:incremental-implementation
    │   └── Figma MCP tools available (figma:* tools present in tool registry)?
    │       ├── Implementing a screen/component from a design → figma:get_design_context FIRST,
    │       │                                                    then agent-skills:incremental-implementation
    │       ├── Spec or plan references Figma screens          → call figma:get_design_context per slice
    │       │                                                    before coding that slice
    │       └── Exploring design structure / tokens            → figma:get_metadata or figma:get_variable_defs
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
    │   ├── Need structured doubt-first analysis? → agent-skills:doubt-driven-development
    │   └── After fix lands:                      → sdd-harness:sdd-write-spec
    │                                                seed = bug report / findings
    │                                                updates roadmap.md + creates sdd-specs/features/YYYY-MM-DD-{fix}-spec.md
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
    └── Optimising a CLAUDE.md file?             → sdd-harness:optimise-claude-md
        └── (also: claude-md-management:claude-md-improver for base audit)
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
3. Multiple skills can apply in sequence. Example: `sdd-harness:sdd-constitution` → `sdd-harness:sdd-prd` → `sdd-harness:sdd-write-spec` → `sdd-harness:sdd-plan-feature` → `sdd-harness:sdd-implement-plan` → `sdd-harness:sdd-verify-feature`.

## Plugin Stack Overview

| Plugin | Role |
|--------|------|
| **sdd-harness** | SDD workflow orchestration — wraps primitives into opinionated workflows |
| **agent-skills** | Engineering primitives — implementation, review, CI/CD, observability, etc. |
| **superpowers** | Core disciplines — brainstorming, TDD, systematic debugging, writing plans |
| **frontend-design** | Design direction and frontend UI engineering quality |
| **figma** | Design → code bridge — read Figma designs into implementation context |
| **claude-md-management** | CLAUDE.md audit and improvement tooling |

Use sdd-harness wrapper skills (sdd-constitution, sdd-write-spec, sdd-plan-feature, sdd-implement-plan) when running the SDD workflow. Use agent-skills primitives directly for standalone tasks outside that workflow.
