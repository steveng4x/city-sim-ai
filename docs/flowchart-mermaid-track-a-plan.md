# Track A Implementation Plan

## Goal

Harden the Mermaid flowchart authoring contract without expanding parser scope beyond the current intended subset.

## Scope

- In:
  - tighten skill and subset documentation
  - add a clear supported-versus-unsupported syntax reference
  - rewrite `src/features/tools/json/1.mmd` into a more regular prompt-friendly sample
  - improve validation messaging for known Mermaid pitfalls where practical
- Out:
  - broad Mermaid compatibility expansion
  - subgraphs, styling, classes, edge IDs, icon/image nodes, or interaction features
  - internal data-model redesign

## Deliverables

1. Updated Mermaid generation skill with:
   - exact supported grammar
   - explicit unsupported syntax list
   - Mermaid-specific syntax hazards
   - examples aligned with current parser behavior
2. A compact maintainer-facing syntax reference document.
3. A rewritten `1.mmd` sample optimized for AI generation consistency.
4. Clearer validation or error guidance for common Mermaid authoring mistakes.

## Work Breakdown

### Task 1: Tighten the skill file

Files:
- `/.github/skills/flowchart-mermaid-generation.md`

Actions:
- fix formatting defects in the current skill file
- define the supported syntax precisely:
  - header forms
  - node declaration patterns
  - edge declaration patterns
  - id rules
- add a short unsupported syntax section
- add Mermaid hazard notes:
  - lowercase `end`
  - `o` / `x` edge ambiguity
  - when quoting labels is safer than plain text

Verification:
- the file reads coherently top to bottom
- examples only use syntax the parser currently accepts

### Task 2: Add a supported syntax reference

Files:
- `docs/flowchart-mermaid-supported-syntax.md`

Actions:
- create a short reference table with:
  - supported now
  - explicitly unsupported now
  - candidate later-phase additions
- keep the reference shorter and more operational than the roadmap doc
- make it useful for both maintainers and prompt authors

Verification:
- a reader can determine in under a minute whether a Mermaid construct is expected to work

### Task 3: Rewrite the native sample

Files:
- `src/features/tools/json/1.mmd`

Actions:
- keep the same semantic process unless there is a strong clarity reason to simplify it
- restructure with predictable sections using comments:
  - node declarations
  - main flow
  - branch edges
  - note edges
- standardize branch label vocabulary
- reduce prompt ambiguity in node-type choices where needed

Verification:
- the sample remains valid Mermaid for the current parser
- the sample is easier to imitate in prompts than the current flat version

### Task 4: Improve validation guidance

Files:
- likely `src/features/tools/utils/flowchart.js`
- possibly editor-facing status/error surfaces if needed

Actions:
- review current parser errors for common Mermaid failures
- improve messages only where they materially help users recover
- prioritize messages for:
  - invalid header
  - unsupported shapes
  - invalid node ids
  - malformed labeled edges
  - known Mermaid hazard patterns if detectable cheaply

Verification:
- errors point the user toward correction rather than just failure
- no broad parser redesign is introduced

## Execution Order

1. Tighten the skill file.
2. Add the supported syntax reference.
3. Rewrite `1.mmd` to match the contract.
4. Improve validation guidance.
5. Run a final review pass across docs and sample consistency.

## Risks

- Over-documenting unsupported Mermaid syntax may imply planned support too strongly.
  - Mitigation: clearly label unsupported items as out of scope for Track A.
- Rewriting the sample may improve promptability but reduce richness.
  - Mitigation: preserve the same business flow unless simplification clearly helps consistency.
- Validation-message improvements may drift into parser expansion.
  - Mitigation: keep changes message-focused and reject feature creep.

## Suggested Checkpoints

### Checkpoint 1

- skill file revised
- supported syntax reference drafted

### Checkpoint 2

- sample rewritten
- validation-message candidates identified

### Checkpoint 3

- final wording and consistency pass complete

## Exit Criteria

- the supported Mermaid subset is explicit and stable
- prompt authors have a reliable sample to imitate
- maintainers have a quick syntax reference
- users get clearer guidance when authoring invalid Mermaid