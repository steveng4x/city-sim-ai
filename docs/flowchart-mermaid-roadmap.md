# Flowchart Mermaid Roadmap

## Understanding Summary

- The flowchart tool has already migrated from JSON authoring to Mermaid authoring.
- The current implementation intentionally supports a narrow Mermaid subset rather than full Mermaid flowchart syntax.
- The roadmap must serve prompt authors, app maintainers, and end users equally.
- The near-term goal is to make the supported subset explicit, safe, and consistent for AI generation.
- The longer-term goal is to define a phased path toward broader Mermaid compatibility without destabilizing the internal normalized graph model.
- The sample file `src/features/tools/json/1.mmd` should become clearer primarily in terms of AI generation consistency.
- Broader Mermaid compatibility should only be added where it cleanly maps to the app's normalized node/link representation.

## Assumptions

- The current parser contract is the main constraint, not Mermaid syntax itself.
- The renderer should continue consuming normalized graph data instead of raw Mermaid semantics.
- Full Mermaid flowchart parity is not a near-term requirement.
- Broader compatibility should be incremental and justified by concrete product value.
- The current six internal node types remain the canonical semantic model unless explicitly changed.

## Decision Log

### 1. Use a phased roadmap

- Decision: adopt a phased path instead of either freezing the current subset forever or expanding rapidly toward general Mermaid support.
- Alternatives considered: safety-only review, broad-compatibility-first review.
- Why chosen: it preserves current stability while giving maintainers a deliberate runway for compatibility improvements.

### 2. Prioritize all audiences equally

- Decision: optimize the roadmap for prompt authors, maintainers, and end users equally.
- Alternatives considered: optimize for one audience only.
- Why chosen: the syntax contract affects generation quality, parser scope, and editor usability at the same time.

### 3. Treat example clarity as AI-consistency-first

- Decision: optimize `src/features/tools/json/1.mmd` primarily for AI generation consistency.
- Alternatives considered: source readability only, rendered clarity only, parser safety only.
- Why chosen: the sample doubles as both a human reference and a likely prompt pattern.

### 4. Keep the renderer contract stable

- Decision: continue treating the internal normalized node/link model as the app-level source of rendering truth.
- Alternatives considered: direct Mermaid-native rendering semantics.
- Why chosen: broader Mermaid support becomes much riskier if rendering and authoring semantics are coupled directly.

### 5. Make advanced Mermaid support a product decision

- Decision: treat subgraphs, rich edge families, styling/classes, icons/images, and interactions as explicit later-phase product decisions.
- Alternatives considered: parser creep through gradual unsupported syntax acceptance.
- Why chosen: these features require model expansion, not just syntax parsing.

## Final Design

### Recommended Overall Approach

Keep the product narrower than Mermaid itself, but make that narrowness explicit instead of accidental. The roadmap should start by hardening the supported subset and the sample authoring conventions, then selectively widen compatibility where the additional Mermaid syntax still normalizes cleanly into the current internal graph model.

### Phase 1: Stable Supported Subset

The immediate design should formalize the currently supported subset as the public contract.

Supported now:

- `flowchart` or `graph` header
- one node declaration per line
- six supported shape mappings only
- `-->` and `-->|label|` edges only
- comments using `%%`
- simple node ids matching the current parser regex

Unsupported now, and should be documented as unsupported:

- chained links
- `A & B --> C` style fan-out/fan-in syntax
- dotted, thick, open, invisible, circle, cross, and bidirectional edges
- edge ids and edge metadata blocks
- `@{ shape: ... }` syntax
- subgraphs
- classes, styles, `linkStyle`, and curve configuration
- markdown strings
- icon and image nodes
- interaction features such as `click`

Mermaid pitfalls that should be explicitly documented:

- lowercase `end` can break flowchart parsing
- `o` and `x` after link markers can be interpreted as special edge syntax
- labels with troublesome punctuation may require quotes in future-compatible authoring

#### Phase 1 guidance for `1.mmd`

The sample should be rewritten as a highly regular reference pattern:

- declare nodes in a predictable order
- separate node declarations from edges
- separate main flow edges from branch edges and note edges using comments
- use branch-label vocabulary consistently
- avoid semantically overloaded node types when the meaning is really just a process step

The goal is not richer Mermaid. The goal is a sample that models should copy correctly.

### Phase 2: Controlled Compatibility Expansion

Add only compatibility features that provide clear value and still collapse into the existing internal model.

Recommended candidates:

- support all standard top-level directions: `TB`, `TD`, `BT`, `RL`, `LR`
- support quoted labels reliably
- optionally support alternate labeled-edge syntax if it normalizes to the same edge structure
- optionally support a limited alias layer for Mermaid semantic shapes that map directly to existing app node types, such as `stadium`, `rect`, `diamond`, and `subproc`

What should still remain out of scope in Phase 2:

- subgraphs
- general `@{ shape: ... }` support across Mermaid’s full shape catalog
- styling/classes and curve configuration
- advanced edge semantics and edge IDs
- icon/image nodes
- click/interactivity features

The rule for Phase 2 is simple: if it does not normalize cleanly to the current six node types and current edge model, it does not belong yet.

### Phase 3: Explicit Model Expansion

Only pursue this phase if the product goal changes from “AI-friendly Mermaid process authoring” to “consume broader Mermaid flowcharts from outside sources.”

This phase would consider:

- subgraphs and grouped structure
- rich edge families and semantic edge types
- advanced shape declarations beyond aliases
- style metadata or persistent visual semantics

This is not a parser-only phase. It requires redesign of the normalized internal model, round-tripping policy, and likely editor affordances.

## Non-Functional Considerations

### Performance

- Default assumption: current flowchart sizes remain small to medium.
- Recommendation: continue preferring simple parsing and normalization passes over heavy Mermaid feature emulation.

### Scale

- Default assumption: diagrams are authored interactively by a single user and are not large enough to justify advanced layout semantics.
- Recommendation: keep the grammar intentionally constrained until real usage pressures appear.

### Security / Privacy

- Mermaid syntax features that imply interaction, external assets, or links should remain unsupported by default.
- This keeps the tool away from `click`, icon packs, external images, and other externally resolved content.

### Reliability

- The supported subset must fail fast with clear validation messages.
- Silent partial support is riskier than explicit rejection.

### Maintenance

- Every syntax expansion should be evaluated against three questions:
  - Can it normalize into the current internal model?
  - Can it round-trip predictably?
  - Can prompt authors use it without increasing generation ambiguity?

## Implementation Plan

### Track A: Phase 1 hardening

1. Fix the Mermaid skill and subset documentation so edge syntax and unsupported features are explicit.
2. Add a short “supported vs unsupported Mermaid syntax” reference for maintainers and users.
3. Rewrite `src/features/tools/json/1.mmd` into a more regular prompt-friendly structure.
4. Add parser validation messaging for known Mermaid pitfalls if not already surfaced clearly.

### Track B: Phase 2 compatibility work

1. Add top-level direction support to the parser and serializer.
2. Add reliable quoted-label support.
3. Evaluate whether alternate labeled-edge syntax is worth supporting.
4. Add limited shape aliases only where they map exactly to current app node types.

### Track C: Phase 3 decision gate

1. Decide whether the product needs general Mermaid interoperability.
2. If yes, redesign the internal model before adding subgraphs or rich edge semantics.
3. If no, stop after Track A or Track B and preserve the constrained contract.

## Recommended Next Move

Start with Track A only. It delivers the highest value with the lowest risk and directly improves prompt authorship, maintenance clarity, and end-user reliability.
