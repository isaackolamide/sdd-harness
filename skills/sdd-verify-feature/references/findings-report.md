# Findings Report Format

Write for a human who has not read the diff. Present a headline, a triage table with its key, one card per finding, the recommendation, then the reply prompt.

**0. Headline** — exactly one line in this shape: `N findings: <count> <Verdict>, <count> <Verdict>. Biggest risk: #<n>, <plain words>.` N counts every row in the table, Low included. List only the verdicts that occur, in this order: Must fix, Should fix, Optional, Dismiss, Confirm. E.g. "3 findings: 1 Must fix, 1 Should fix, 1 Optional. Biggest risk: #1, anyone can read every customer's invoices."

**1. Triage table**, sorted by severity, with one row per merged finding:

| # | Finding | Category | Severity | Likelihood | Verdict | Effort | Route |
|---|---------|----------|----------|------------|---------|--------|-------|
| 1 | Customer ID pasted straight into SQL | Security | Critical | High | Must fix | S | Plan |
| 2 | Typo "seperator" in comment | Quality | Low | Low | Optional | S | Now |
| 3 | Spec says 10,000 rows; ADR-007 (newer) says 50,000 | Validation | Medium | High | Should fix | S | Spec |

Print this key under the table, verbatim:
> **Key** — Severity: how bad if shipped · Likelihood: how likely it is to actually bite · Effort: S small, M medium, L large · Route: `Now` fixed in this session, `Plan` new task for `/sdd-implement-plan`, `Spec` spec doc edited here, `Debt` shipped as known risk and logged in `tech-debt.md`, `Human` you check it yourself

- **Finding**: plain words of about 8 words or fewer. Leave out file paths and jargon (they go in the card).
- **Category**: Validation · Quality · Security · Manual. A merged finding takes the category of its highest-severity source; on a tie, Security wins over Validation, and Validation over Quality. A `Human` finding is Category Manual, Severity Low, Likelihood Medium, Effort S.
- **Severity** (how bad if shipped): Critical = data loss, a security breach, or a core flow broken · High = a user-visible bug or a failing AC · Medium = an edge-case bug or maintainability risk · Low = cosmetic. Map code-reviewer labels as Critical → Critical, Required → High, Optional → Low, Nit → Low. Raise a label only with a stated reason in the card.
- **Likelihood** (how likely the harm is to actually happen once shipped): High = happens in normal use, anyone can trigger it, or a test or AC already fails · Medium = needs an unusual but realistic input, load, or sequence of steps · Low = needs rare conditions or deliberate effort. Likelihood does not change Severity or Verdict; it tells the user how urgent the finding feels.
- **Verdict** (your recommendation): Must fix · Should fix · Optional · Dismiss. Must fix = Critical severity, a failing test, or an unmet AC. Should fix = High or Medium severity that is not Must fix. Optional = Low severity. A `Human` finding always gets the verdict Confirm. A Dismiss finding gets Route `—`, and its card or Low line gives the reason (false positive or intended design).
- **Effort**: S = one file and about 15 lines or fewer · M = several files, new tests, or more than about 15 lines · L = a design change or an ADR.
- **Route**:
  - `Now`: verify fixes it in this session. Use `Now` only if ALL of these are true: the fix changes no runtime behaviour; it adds or changes no test assertion (cosmetic edits to test files are fine); its Effort is S; it touches 2 files or fewer; and it is not Security, not a failing test, and not an unmet AC. Typical cases are typos, dead imports, comments, formatting, and lint.
  - `Spec`: verify edits `requirements.md`, `validation.md`, or `roadmap.md` directly. Use `Spec` when the spec or ADR is the stale side; when the spec and ADR agree and only the code differs, route `Plan`.
  - `Plan`: a fix task appended to `plan.md` for `/sdd-implement-plan`.
  - `Human`: a manual check for the user.
  - `Debt`: the user knowingly ships the problem. Verify records it in `sdd-specs/tech-debt.md`; no plan task, no checkbox. `Dismiss` is only for a false positive or intended design; a real problem the user accepts is `Debt`.
    - Not allowed for a failing test or an unmet AC.
    - A Critical Security finding needs the user to type the acceptance, e.g. `debt 1 (accept breach risk)`. Without that wording, keep the Route as `Plan`.
    - A reason is required for every `Debt` approval.
  - `Spec + Plan`: verify first adds the requirement to the spec, then appends the task that implements it. Use this when the fix brings in a new behaviour rule.

**2. One card per finding** that is not Low. Group all Low findings into a single one-line-each list.

> **#1 Customer ID pasted straight into SQL** — `src/export/query.ts:42` (code-reviewer + security-auditor)
> **Like you're 5:** The app asks "which customer?" and copies whatever you say straight into its question to the database. Say "me, or everyone" and it happily answers both.
> **As a user:** A customer edits the web address to `customerId=1 OR 1=1` and downloads every customer's invoices.
> **As an engineer:** The `customerId` query param is concatenated into the SQL string, so it is parsed as SQL, not as a value.
> **Likelihood:** High — the endpoint is public and the trick takes one edited URL.
> **Impact:** Critical — every customer's invoices leak, which is a reportable data breach.
> **Alternatives:** parameterised query *(recommended)* · ORM query builder · allow-list validation only *(weaker)*

Every card has these lines, in this order:
- **Like you're 5**: one or two sentences, everyday words, built on an object or situation from daily life (a lock, a queue, a recipe, a library book). No code terms, no file names, no acronyms.
- **As a user**: one concrete sentence naming an actor, what they do, and what they see or lose. Describe the user or business consequence, not the code mechanism.
- **As an engineer**: one or two sentences on the cause in code terms: the mechanism, the trigger, and what breaks.
- **Likelihood**: the table value, a dash, then one reason naming who or what triggers it.
- **Impact**: the table's Severity value, a dash, then one reason naming what is lost or broken.
- **Alternatives**: include them only where a real choice exists, and mark the one you recommend.

**Low findings** go in one list, one line each: `#N <finding> — <path:line> — <why it is low-risk, or what you need to do>`. They get no card.

**3. Recommendation** — after the cards, give your suggested decision so the user can accept it in one reply. It has these parts, in order:
- **Suggested reply**: a ready-to-send line in the reply format below, e.g. `approve 1,3 · dismiss 2 (intended)`. Approve every `Must fix` and `Should fix`. Dismiss every `Dismiss`. Approve `Optional` findings only when the route is `Now`. Leave `Human` findings out. Suggest `debt` instead of `approve` for a `Should fix` with Effort L and Likelihood Low. If the user has already said they want to ship a Critical Security finding, write its full typed acceptance into the suggested reply, e.g. `debt 1 (accept breach risk)`, so they can send it as is. If an open `TD-n` in `sdd-specs/tech-debt.md` matches a finding, label that finding "already tracked TD-n"; if it came back a second time, say so.
- **Why**: one sentence per group (not per finding) giving the reason, e.g. "1 is a security hole and 3 is a spec mismatch; 2 is a typo that Now fixes for free."
- **Caveat**: only if a recommended approval is a judgement call (a `Should fix` with effort `L`, or a route you would change), name it and say what the user gives up by skipping it.

**4. Reply prompt** — end with exactly this:
> Reply with numbers, e.g. `approve 1,3 · dismiss 2 (intended)`. Approving a finding follows its Route, so `Now` items are fixed in this session and `Plan` items go to `plan.md`. To change a route, say so, e.g. `2 → plan`. `plan TD-N` approves an open ledger row as a `Plan` fix. To ship a real problem and track it, `debt 4 (reason)`; a Critical Security finding needs `debt N (accept <risk> risk)`. For manual checks, `confirm 5` means you did it and `defer 5 (reason)` means you will do it later; each is noted under `## Manual Checks` with the date and your name.
