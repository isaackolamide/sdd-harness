# Deeper texts

One entry per stop. Read this file only when the user picks "Go deeper on this stop", and show only that stop's entry.

- **Stop 1:** the rule of thumb is that an hour of spec saves a day of rework once a feature has more than one screen, actor, or workflow.
- **Stop 3:** you don't need every step. `/sdd-prd` is optional when the idea is already clear.
- **Stop 4:** on an existing codebase it reads your folder layout, dependencies, docs, and git history first, so you answer far fewer questions.
- **Stop 5:** for a new screen, the spec can offer 2-3 visual directions to choose from.
- **Stop 6:** the plan folder also holds `requirements.md` and `validation.md`. Big architecture decisions get an ADR.
- **Stop 7:** anything accepted rather than fixed during verify is logged in `sdd-specs/tech-debt.md`, so it is not lost.
- **Stop 8:** this is also why the specs matter long-term. The next person can read why a behavior exists.
