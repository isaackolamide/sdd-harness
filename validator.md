# Validation: foundation-improvement (Phase 0.0.1)

## Acceptance Criteria

### Group 1 — Root Script Dispatcher
- [ ] Given the monorepo root, when `pnpm setup bpru-admin-portal` is run, then `setup.sh` executes and exits 0
- [ ] Given the monorepo root, when `pnpm start bpru-admin-portal` is run, then local dev services start (equivalent to current `pnpm dev`)
- [ ] Given the monorepo root, when `pnpm start bpru-admin-portal --docker` is run, then Docker Compose fullstack starts
- [ ] Given the monorepo root, when `pnpm start --docker` is run (no app arg), then it defaults to `bpru-admin-portal` and Docker Compose starts
- [ ] `pnpm setup`, `pnpm start`, `pnpm start:docker` from `bpru-admin-portal/` continue to work unchanged

### Group 2 — Full-Stack Docker Compose
- [ ] Given a cold terminal, when `pnpm start bpru-admin-portal --docker` is run, then container logs show: LocalStack healthy → table created → backend started → webapp started (in that order)
- [ ] `curl http://localhost:3000` returns the Next.js app HTML
- [ ] `curl http://localhost:3001/api/v1/health` returns `{"status":"ok"}`
- [ ] Ctrl+C tears down all containers cleanly (no orphaned processes)
- [ ] `node_modules` inside containers are isolated (anonymous volumes — host `node_modules` not shadowed)

### Group 3 — TestContainers Integration Tests
- [ ] Given no Docker running beforehand, when `pnpm --filter backend test:integration` is run, then a LocalStack container starts, all 4 suites pass, and the container is torn down
- [ ] No file in `backend/` contains the string `localhost:4566`
- [ ] Total integration test run time is under 90 seconds on a warm machine

### Group 4 — App-Level Secrets Loading
- [ ] Given a running backend with the secret seeded, then startup logs contain `[secrets] loaded N keys from app-config`
- [ ] Given a running backend with no secret present, then startup logs contain `[secrets] app-config not found, skipping` and the backend starts normally (no crash, health check returns 200)

### Group 5 — Documentation
- [ ] `bpru-v4/CLAUDE.md` documents `pnpm setup <app>` and `pnpm start <app> [--docker]`
- [ ] `bpru-admin-portal/CLAUDE.md` documents `start:docker`, removes LocalStack prerequisite from integration test section, and notes the app secrets path
- [ ] `bpru-v4/README.md` exists and a new joiner can follow it from scratch (prerequisites → setup → start) without additional guidance
- [ ] All Phase 0.0.1 items in `specs/roadmap.md` are ticked `[x]`

## Test Coverage
- [ ] Unit tests pass: `pnpm --filter backend test`
- [ ] Integration tests pass cold (no pre-running LocalStack): `pnpm --filter backend test:integration`
- [ ] TypeScript compiles clean: `pnpm typecheck`

## Manual Checks
- [ ] `pnpm start bpru-admin-portal --docker` from `bpru-v4/` root — verify all three containers reach healthy state
- [ ] Edit a backend source file while Docker Compose is running — verify hot reload triggers (tsx watch recompiles)
- [ ] Edit a webapp source file while Docker Compose is running — verify Next.js fast refresh triggers
- [ ] Stop Docker Compose with Ctrl+C — verify no processes remain on ports 3000, 3001, or 4566

## Definition of Done

This feature is mergeable when:
- All acceptance criteria above are checked
- No regressions in existing unit tests (`pnpm check` passes)
- No hardcoded `localhost:4566` remains in `backend/` source or tests
- Code review approved
