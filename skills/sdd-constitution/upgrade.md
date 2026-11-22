# Constitution Upgrade

Brings an existing constitution in line with the current templates after a sdd-harness upgrade. The constitution is the project's own record, so the upgrade edits only what a migration below names and leaves every other line as written.

## Procedure

1. **Read** `sdd-specs/tech-stack.md`, plus `mission.md` or `roadmap.md` only if a migration names them, and the Migrations below.
2. **Select**: check each migration's *Applies when* against the file. Skip a migration whose predicate is false (already upgraded, or the field never existed).
3. **Build edits**: fill each value from the migration's *Value source*, and record where it came from (`file:line` or the command and its output). Where the value source yields nothing, write the migration's placeholder and add a question for the user.
4. **Conflict scan**: run each applied migration's *Conflict scan* over the whole file. For each hit, quote the line, name the new rule it contradicts, and give options with a recommendation. Leave conflicting lines unedited until the user decides.
5. **Gate**: present the diff, every value with its source, and the questions and conflicts from steps 3 and 4. Wait for explicit approval. The user's answers fill the placeholders, and each conflict they resolve becomes an edit.
6. **Write and commit**: write the approved edits, then `git commit -m "docs(constitution): upgrade to sdd-harness <version> templates"`.

## Migrations

### 1.21.0 — tech-stack.md Testing Strategy

**1. Coverage Target becomes Coverage Floor**
- *Applies when*: Testing Strategy has a line naming a coverage target.
- *Edit*: rename the field `Coverage Floor`, state each number exactly as configured (`80%`, not `80%+`), and append the template's regression-guard sentence.
- *Value source*: thresholds configured in the test runner or CI config. With none configured, the value is `unset until the first CI run`. A percentage that appears only in `tech-stack.md` is a target, not a floor, and is dropped.

**2. Test Speed Budget added**
- *Applies when*: there is no `Test Speed Budget` section.
- *Edit*: insert the template's section after Framework & Tools.
- *Value source*: the unit suite limit is the measured wall-clock time of one run of the project's unit test command, doubled and rounded up to the next 10 seconds. The single-test and integration-suite limits come from the user. When the unit command cannot run here (dependencies not installed, services needed), every limit is `[N]` and becomes a question. The template's `30s` and `100ms` are formatting examples.

**3. Coverage expectations by level replaced**
- *Applies when*: a `Coverage expectations by level` block exists.
- *Edit*: rename the block heading `Expectations by level:`, remove each line that only sets coverage percentages (the floor holds the configured numbers), strip the percentage from a line that also states other expectations, and keep every other line as written.

**4. Lowest-level rule added**
- *Applies when*: Testing Strategy does not contain "lowest level that can observe it".
- *Edit*: append the template's sentence ("Each behaviour is tested once, at the lowest level that can observe it. ...") to Test Levels. If the file has no Test Levels heading, append it to the end of Testing Strategy.

*Conflict scan* (migrations 1–4): a rule that has one behaviour tested at more than one level, for example "every scenario is first automated as an integration test, then unit tests drive the implementation", or a coverage percentage stated elsewhere in the file as a goal.
