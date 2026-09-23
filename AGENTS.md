# Agent Instructions & Repository Guidelines — TIDIR

Welcome to the **TIDIR** (Threat Intelligence, Detection, Investigation & Response) repository. This project develops open, vendor-neutral research and target technology component architectures for modern security operations.

---

## 🧭 Repository Mission & Scope

TIDIR unifies four core security operational domains into a closed-loop architecture:
1. **Cyber Threat Intelligence (CTI)**: Ingestion, normalization, decay scoring, low-latency caching, and retro-hunting.
2. **Telemetry & Data Fabric**: Line-rate OCSF normalization, distributed streaming buses (Kafka/Redpanda), and dual-tier storage (Hot Index vs. Lakehouse).
3. **Detection Engineering**: Stateful streaming detection, lakehouse batch analytics, and GitOps Detection-as-Code (DaC).
4. **Investigation & Case Management**: Entity resolution, process/network graphs, unified timelines, and tamper-evident evidence lockers.
5. **Response & Automation**: Blast-radius risk-tiered playbook execution with strict human-in-the-loop authorization gates.

---

## 📁 Repository Structure

```
TIDIR/
├── README.md                      # Public project mission, overview & quickstart
├── AGENTS.md                      # Operational rules & developer guide for AI agents
├── package.json                   # Bun scripts, VitePress & tooling configuration
├── .gitignore                     # Git ignore rules
├── docs/
│   ├── index.md                   # VitePress documentation portal landing page
│   ├── architecture/
│   │   ├── 01-system-overview.md  # Target component architecture & topology
│   │   ├── 02-capability-model.md # Functional capability taxonomy matrix
│   │   ├── distributed-detection-and-the-finding-bus.md # Strategic position paper
│   │   └── components/            # Domain-level architecture specifications
│   │       ├── 01-threat-intelligence.md
│   │       ├── 02-data-fabric-telemetry.md
│   │       ├── 03-detection-engine.md
│   │       ├── 04-investigation-cases.md
│   │       └── 05-response-automation.md
│   ├── adr/                       # Architectural Decision Records (MADR format; 26 ADRs)
│   │   ├── template.md            # Standard ADR template
│   │   └── 0001-record-architecture-decisions.md
│   ├── diagrams/                  # Standalone Mermaid diagrams (.mmd)
│   │   └── tidir-target-architecture.mmd
│   └── .vitepress/                # VitePress theme, config & mermaid integration
│       └── config.ts
├── verify                         # Executable CLI: runs full local verification suite
├── ship                           # Executable CLI: verified pre-push & deployment runner
└── scripts/                       # Maintenance & verification scripts (TypeScript)
    ├── verify.ts                  # Holistic verification suite orchestrator
    ├── validate-diagrams.ts       # Validates Mermaid syntax across .mmd and markdown files
    ├── lint-site-structure.ts     # Asserts navigation, ADR registry & document closure
    ├── lint-terminology.ts        # Validates controlled architectural vocabulary
    ├── lint-docs-math.ts          # Audits compiled HTML for MathJax rendering errors
    ├── build-docs.ts              # Production static site compiler with sitemap
    ├── generate-llms-full.ts      # Compiles single-file corpus for LLMs (llms-full.txt)
    ├── verify-live.ts             # Asserts production HTTP 200 health via native fetch
    └── ship.ts                    # Verified release automation pipeline
```

---

## 🛠️ Tooling & Command Standards

This repository strictly uses [`bun`](https://bun.sh) for package management and script execution.

```bash
# Install dependencies
bun install

# Start local documentation server with live reload & Mermaid rendering
bun run docs:dev

# Build production static site to docs/.vitepress/dist
bun ./scripts/build-docs.ts # In sandboxes; or `bun run docs:build` in standard terminal

# Preview built static site locally
bun run docs:preview

# Validate all Mermaid diagrams for syntax errors
bun ./scripts/validate-diagrams.ts # In sandboxes; or `bun run diagrams:validate`

# Check site structure, ADR registry parity & zero orphaned docs
bun ./scripts/lint-site-structure.ts # In sandboxes; or `bun run lint:structure`

# Check architectural terminology and diagram text consistency
bun ./scripts/lint-terminology.ts # In sandboxes; or `bun run lint:terminology`

# Run full holistic verification suite
./verify # Or `bun ./scripts/verify.ts` (runs universally in sandboxes, CI, and standard shells)

# Deployments (Cloudflare Pages):
# Direct local deployments are strictly retired.
# Deployments occur exclusively and automatically via GitHub Actions (.github/workflows/deploy-pages.yml) upon push to `main`.
```

---

## 📐 Architecture & Contribution Rules

1. **Standardized Schemas First**:
   - Telemetry models must map to the Open Cybersecurity Schema Framework (**OCSF**).
   - Threat intelligence structures must align with **STIX 2.1** / **TAXII 2.1**.
   - Detections must be expressed in Polyglot DaC format (vendor-neutral YAML metadata envelope with target-optimized query blocks; see [ADR-0019](docs/adr/0019-polyglot-detection-as-code-and-native-engine-adaptation.md)).

2. **Diagram Standards**:
   - All architecture diagrams must be written in **Mermaid** and version-controlled.
   - Flow direction should standardise on `flowchart TB` or `flowchart LR`.
   - Subgraphs must group logical subsystems clearly.
   - **Sequential Numbering & Monotonic Top-to-Bottom / Left-to-Right Ordering**: Numbered subgraphs (`1. ...`, `2. ...`, `N. ...`) must always be declared and rendered in strict sequential order matching their numeric sequence (e.g. 1 at top/left down to N at bottom/right).
   - **Feedback Loop Layout Restraint (Dagre Cycle Inversion Prevention)**: In Mermaid (`flowchart TB` / `flowchart LR`), drawing a direct backward directed edge from a downstream subgraph (e.g. `subgraph 5`) back to an upstream subgraph (e.g. `subgraph 1`) causes Mermaid's Dagre layout engine to invert graph ranking, erroneously placing the final grouping at the very top of the diagram before Step 1. Feedback, learning, and calibration channels returning to earlier stages MUST terminate downstream into a dedicated terminal calibration/feedback subgraph (e.g. `ACT ==> FB`), with internal annotations or edge text articulating the re-injection channels. Inter-subgraph backward arrows that violate sequential topological ordering are strictly prohibited and enforced by `./scripts/validate-diagrams.ts`.

3. **Architectural Decisions (ADR)**:
   - Any architectural decision, technology selection, or significant change must be accompanied by an ADR in `docs/adr/`.
   - Follow the established MADR template in `docs/adr/template.md`.

4. **Security & Secrets Non-Negotiable**:
   - **Zero credentials in Git**: Never commit API keys, tokens, or personal identifiers.
   - All external deployment tokens must be read from external local environment stores or CI secrets.

5. **Target Invariants vs. Empirical Guarantees (Discipline of Claims)**:
   - **Editorial Rule**: *Architectures specify mechanisms and target properties. Experiments establish outcomes.*
   - **No Absolutist Guarantees**: Never claim that the architecture "guarantees zero data loss", "guarantees 100% detection", "eliminates all hallucinations", or "provides strict immunity". Distributed networks partition, OS kernels drop packets under storm conditions, and probabilistic models hallucinate.
   - **Separate Intent from Demonstrated Properties**: Explicitly articulate what the architecture is *designed to enforce* (declarative invariants, schemas, boundaries) versus what requires empirical testing and measurement.
   - **The WHAT and WHY over the HOW**: Articulate the capabilities and invariants at the reference architecture tier. Offload runtime parameters, mathematical tuning, and distributed systems recovery mechanics into Tier 3 ADRs.

6. **First-Class Failure & Graceful Degradation**:
   - Every specification must account for component degradation. When describing a capability, address:
     1. *Failure Mode*: What happens when the underlying bus, engine, or API fails?
     2. *Observability ("How We Know")*: What active probe, canary, or metric signals degradation?
     3. *Continuity Plan B*: What deterministic fallback or manual flight deck maintains operational continuity? (See [ADR-0021](docs/adr/0021-graceful-degradation-automated-fallback-and-continuity-plan-b.md)).

7. **The TIDIR Trust Doctrine & Security-State Monotonicity**:
   - **Trust Doctrine Maxim**: *"Probabilistic components may propose. Deterministic components authorize."* Probabilistic models (LLMs, neural embeddings, clustering heuristics) operate in a strictly read-only analytical capacity. All mutations, containment state transitions, and tool calls are governed by deterministic schemas, policy validators, and human consensus gates.
   - **No Self-Granting Authority**: No component receives execution authority merely because another component believes it is correct.
   - **Prompt Injection as an Architectural Assumption (Agent Trust Boundary)**: Assume untrusted telemetry can and will influence reasoning; system safety relies entirely on deterministic external boundaries (the Agent Trust Boundary), ephemeral read-only SVIDs, and typed parameters. Prompt injection is assumed possible; the architecture prevents successful injection from becoming unauthorized authority.
   - **Multi-Model Critique is Advisory, Not Authoritative**: While diverse models provide useful defense-in-depth critique, foundation models sharing common training corpora cannot be assumed epistemically independent. Agreement between models is never treated as proof of safety; deterministic invariant evaluation and schema validation are the sole prerequisites for execution authority.
   - **Security-State Monotonicity ($R(s_{\text{post}}) \subseteq R(s_{\text{pre}})$)**: *Forward compensation is permitted. Security-state regression is not.* A compensating action MUST NOT increase attacker reachability beyond the last verified-safe security state without explicit human authorisation.

8. **Acronym Expansion on First Use (Readability & Narrative Quality)**:
   - Always spell out and explain acronyms on their first appearance per document (e.g. *Open Cybersecurity Schema Framework (OCSF)*, *Detection-as-Code (DaC)*, *Cyber Threat Intelligence (CTI)*, *Mean Time to Detect (MTTD)*, *Mean Time to Contain (MTTC)*, *Security Operations Center (SOC)*, *Directed Acyclic Graph (DAG)*, *Small Language Model (SLM)*, *SPIFFE Verifiable Identity Document (SVID)*, *Single Point of Failure (SPOF)*).
   - This ensures the architecture remains clear, educational, and accessible without assuming prior jargon familiarity.

9. **The TIDIR Architectural Constitution (11 Non-Negotiable Invariants)**:
   All specifications, ADRs, and implementations must strictly preserve:
    1. *Telemetry Preservation*: Ingested telemetry must survive and remain queryable in an open, vendor-neutral representation (e.g. Parquet/Iceberg on object storage). Semantic telemetry rejection (dropping events because no rule currently queries them) is strictly prohibited. Governed evidence compaction that provably preserves forensic reconstructability is permitted.
    2. *Evidence Traceability*: Every consequential assertion is traceable to underlying raw observations.
    3. *Dependency-Aware Confidence*: Correlated derivations sharing common ancestry cannot masquerade as independent evidence. Co-derived signals are discounted via dependency-aware probabilistic models (e.g. Bayesian graph compounding).
    4. *No Self-Granting Authority*: Probabilistic components propose; deterministic components authorise.
    5. *Least Capability*: Every machine actor receives only task-scoped, short-lived, ephemeral authority (e.g. SPIFFE SVIDs with TTL $\le 15\text{m}$).
    6. *Bounded Autonomy*: Autonomous execution has explicit temporal, financial, computational, and blast-radius limits.
    7. *Fail-Secure Posture*: Component failure cannot silently increase attacker reachability ($s_{n+1} \preceq s_n$).
    8. *Degraded Defence*: Loss of an advanced capability reduces sophistication, never total visibility (graceful degradation).
    9. *Human Recoverability*: Autonomous control planes always preserve independently accessible manual flight decks (master E-stop, break-glass).
    10. *Reconstructability*: Consequential decisions and actions can be deterministically reconstructed after the fact via the Incident Decision DAG.
    11. *Operational Portability & Exit*: No consequential security telemetry, detection logic, case state, policy definition, or audit lineage SHALL be irrecoverably dependent upon a proprietary execution environment.

10. **Normative Architecture vs. Reference Implementation (RFC 2119 Discipline)**:
    - All specifications must strictly distinguish architectural invariants from illustrative reference technologies using RFC 2119 keywords (`MUST`, `SHOULD`, `MAY`).
    - Declarative schemas (OCSF, STIX 2.1, TAXII), workload identities (SPIFFE SVIDs), state-machine contracts, and the 11 Invariants are **MUST**.
    - Specific concrete technologies (e.g. Kafka, Redpanda, ClickHouse, Apache Iceberg, Falco, DuckDB) are designated as **REFERENCE IMPLEMENTATION** or **EXAMPLE** to maintain pure vendor-neutrality.

11. **Editorial & Information-Quality Doctrine ("Explain First, Name Second")**:
    - **Core Axiom**: *TIDIR prose must be understandable before it is impressive. Use technical terminology because it increases precision, not because it signals sophistication.*
    - *If a concept can be expressed accurately using established engineering terminology, do not create a TIDIR-specific name for it.*
    - *Every architectural claim should be defensible by asking: "What engineering problem does this solve, what assumption does it rely upon, and what would falsify it?"*
    - **Progression Sequence**: Whenever introducing a complex or TIDIR-specific concept, follow this sequence:
      1. *Plain-English statement*: State the intuition without jargon.
      2. *Concrete engineering example*: Show the operational problem or failure mode.
      3. *Technical explanation*: Describe the underlying mechanism.
      4. *Formal TIDIR terminology*: Provide the architectural term.
      5. *Formalism / Equation*: Provide mathematics only where it adds genuine precision.
    - **Prefer Concrete Verbs to Abstract Nouns**: Write active sentences showing what the system does (e.g., *"The system combines evidence while tracking dependencies between observations"* instead of *"The system performs dependency-aware probabilistic evidence correlation"*).
    - **Decompress Noun & Hyphen Stacks**: Avoid chains of 3+ hyphenated modifiers or abstract noun clusters (e.g., break *"blast-radius-constrained autonomous containment orchestration"* into clean grammatical English).
    - **One Important Idea Per Sentence**: Break dense multi-clause statements into smaller, crisp units—especially across invariants, state transitions, and safety bounds.
    - **Answer "Why?"**: Structure explanations as: *Problem $\to$ Failure Mode $\to$ Requirement $\to$ TIDIR Response*.
    - **The "So What?" Test**: Every abstraction must describe its actual operational consequence.

12. **Concept Classification & Burden of Proof (Established, Adapted, TIDIR-Specific)**:
    - **Established**: Standard computer science / security concepts adopted directly (e.g., least privilege, capability security, circuit breakers, dead-letter queues, append-only logs, state machines, workload identity). Retain established names; do not invent neologisms for known patterns.
    - **Adapted**: Established engineering concepts applied to security operations (e.g., compensating transactions adapted to containment reachability, SRE alert error budgets applied to detection fidelity).
    - **TIDIR-Specific**: Novel syntheses or formulations intentionally defined by TIDIR (e.g., Confidence–Authority Separation, Security-State Monotonicity, Evidential Independence).
    - **Burden of Proof**: Every novel term must prove that existing engineering language is insufficient before being retained.
    - **What TIDIR is NOT Claiming**: TIDIR does not claim to have invented data lakes, probabilistic inference, graph analysis, workload identity, Detection-as-Code, circuit breakers, or least privilege. Its contribution is the specific architectural synthesis and governing safety invariants under which these techniques interact.

13. **Accessible Mathematics & DOM Machine Readability**:
    - Every mathematical formula (e.g., $\mathcal{R}(s_{\text{post}}) \subseteq \mathcal{R}(s_{\text{pre}})$, $\mathcal{S}_{n+1} \preceq \mathcal{S}_n$) must be accompanied by an immediate natural-language textual explanation in markdown.
    - Mathematical notation serves expert verification; plain English ensures accessibility across search indexing, screen readers, and LLM parsers.
    - Never allow formulas to extract as ungrounded symbols without semantic context.

---

## ⚠️ Operational Gotchas & Agent Guidelines (Learned Lessons)

1. **Explicit Dependency Closure**:
   - Every package imported in `docs/.vitepress/config.ts`, `docs/`, or `scripts/` (e.g., `vitepress`, `vitepress-plugin-mermaid`, `markdown-it-mathjax3`) **must** be explicitly declared in `package.json` (`devDependencies` or `dependencies`).
   - Never assume packages exist ambiently in parent directories or developer global paths.

2. **Frozen Lockfile Discipline (`bun.lock`)**:
   - Any modification to `package.json` dependencies must be immediately followed by `bun install` with network access to re-sync and save `bun.lock`.
   - CI executes `bun install --frozen-lockfile`. If `package.json` and `bun.lock` diverge by even a single character, CI will fail immediately.

3. **Pre-Push Holistic Verification**:
   - Before pushing changes to `main`:
     1. Run the unified verification suite: `./verify` (or `bun ./scripts/verify.ts`)
        (Executes site structure check, terminology check, Mermaid syntax validation, docs build with sitemap and llms.txt compilation, and MathJax HTML audit).
     2. Verify working tree is clean: `git status`
   - Never commit speculative fixes piecemeal to `origin/main` to test in CI. Verify local closure first.

4. **Runtime Standard (Zero Node/NPM)**:
   - Always invoke commands using `bun` / `bunx`. Never attempt `node`, `npm`, or `npx`.

5. **Branch Protection & Production Gating**:
   - The `main` branch enforces required CI checks (`Validate Diagrams & Build Site`) and requires 1 approving review on pull requests from external contributors.
   - Force-pushes (`allow_force_pushes: false`) and branch deletions (`allow_deletions: false`) are strictly prohibited.
   - Repository administrator (`Haribu`) retains push privileges to `main` when local verification passes.

6. **Exclusive Deployment via GitHub Actions (Zero Local/Direct Deployments)**:
   - Deployments to Cloudflare Pages occur **strictly and exclusively via GitHub Actions** (`.github/workflows/deploy-pages.yml`) upon push to `main`.
   - Direct local deployments (via CLI scripts, local Wrangler, or bypassing CI/CD) are permanently retired and deliberately non-functional to eliminate configuration drift and out-of-band state mutation.
   - All code, specification, and diagram changes must pass local holistic verification (`./verify` or `bun ./scripts/verify.ts`) before pushing to `main`. Once pushed, GitHub Actions handles build verification, automated testing, and production deployment.

7. **LaTeX Math Escaping for VitePress / Markdown-it**:
   - When writing inline math containing relational comparisons ($<$, $>$, $\le$, $\ge$), **never use raw `<` or `>`** inside dollar delimiters (e.g. avoid `$< 5s$`). The VitePress markdown parser treats `<` as an unclosed HTML opening tag and silently swallows or drops the expression in rendered HTML.
   - Always use LaTeX macros: `\lt`, `\gt`, `\le`, and `\ge` (e.g. `$\lt 5\text{s}$`, `$\gt 15\,\text{seconds}$`, `$\text{FPR} \le 5\%$`).

