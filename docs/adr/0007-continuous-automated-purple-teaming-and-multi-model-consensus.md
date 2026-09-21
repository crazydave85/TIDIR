# 0007. Continuous Automated Purple Teaming and Multi-Model Consensus

* Status: accepted
* Deciders: Architecture Team / Harry
* Date: 2026-09-15

## Context and Problem Statement

Modern detection engineering requires empirical validation to prevent false-positive alert fatigue and ensure resilience against evolving adversary techniques. While synthetic unit tests and historical data replay provide static verification, they cannot validate the end-to-end operational pipeline under live adversary conditions (e.g. sensor emit latency, in-flight stream parsing, and agentic dossier assembly).

Furthermore, as autonomous AI agents synthesize complex multi-vector findings into investigative dossiers, single-model reasoning paths risk confirmation bias or stochastic hallucinations. If an autonomous agent prematurely closes a finding as benign or recommends disruptive containment based on flawed hypothesis framing, defensive integrity is compromised.

Finally, industry trends often propose an "output-driven ingestion" model—ingesting telemetry only when tied to an active, pre-existing detection rule. While intended to control SIEM licensing costs, this approach cripples retrospective hunting (`CTI-05`) and blinds the enterprise when novel zero-day exploits emerge.

How does the architecture achieve continuous empirical validation, suppress autonomous reasoning bias, and guarantee long-term retrospective visibility without ballooning operational costs?

## Decision Drivers

* Closed-loop verification of detection rules via continuous, automated adversary emulation.
* Elimination of single-model hallucination risks and confirmation bias during autonomous triage.
* Rejection of the "output-driven ingestion" blindspot in favour of cost-effective, decoupled lakehouse telemetry retention.
* Strict adherence to vendor-neutral, capability-oriented standards and British English conventions.

## Considered Options

1. **Periodic Manual Purple Team Exercises**: Run quarterly collaborative testing with external red teams.
2. **Strict Output-Driven Ingestion**: Only collect log streams explicitly linked to deployed detection rules.
3. **Continuous Automated Purple Teaming, Dual-Model Consensus, and Decoupled Lakehouse Ingestion (Selected)**.

## Decision Outcome

Chosen option: **Continuous Automated Purple Teaming, Dual-Model Consensus, and Decoupled Lakehouse Ingestion**, because:

### 1. Continuous Automated Purple Teaming (Level 3 Purple Team & Mutation Resilience)
- The CI/CD detection pipeline integrates an **Automated Adversary Emulation Harness**.
- When candidate detection rules are committed, or on scheduled continuous intervals, the harness executes non-destructive atomic adversary techniques in an isolated staging environment.
- The pipeline empirically asserts:
  1. *Sensor Visibility*: Kernel/eBPF sensors emit the raw fact.
  2. *Line-Rate Normalisation*: Telemetry arrives and coerces into canonical OCSF classes within SLA.
  3. *Streaming Detection Latency*: Stream engines trigger detection findings ($\lt 5\text{s}$).
  4. *Autonomous Scoping*: Agent harnesses correctly hydrate the investigative dossier.
  5. *Mutation Survival & Evasion Resilience*: The emulation harness applies automated syntactic and procedural mutations (CLI argument permutations, environment variable indirection, parent PID spoofing, alternate system call bindings). Detections surviving procedural variations are verified as *functional* (resilient); rules that break under minor syntactic perturbation are flagged as *tactical* (brittle), preventing the false sense of security inherent in superficial "ATT&CK Bingo" checklists.

### 2. Dual-Model Consensus Arbiter (Heterogeneous & Symbolic Architecture)
- High-stakes triage operations implement an adversarial consensus pattern with strict operational boundaries:
  - **The Proposer Agent**: Generates the primary adversary hypothesis, correlates OCSF event graphs, and drafts the containment recommendation.
  - **The Challenger Agent**: Independently receives the raw evidence ledger and critically audits the hypothesis. It actively seeks benign alternative explanations, checks for missing baseline data, and tests for confirmation bias.
  - **Out-of-Band Decoupling & Latency Bounding**: Multi-model arbitration operates strictly out-of-band for deep investigative case assembly with hard timeout boundaries ($\le 500\,\text{ms}$). High-velocity streaming containment for machine-speed ransomware never blocks on LLM consensus.
  - **Eliminating Shared Mode Collapse (Heterogeneous & Symbolic)**: To eliminate uniform prompt-injection vulnerabilities and shared training-set blind spots, the Challenger must be architecturally heterogeneous—combining a separate model family (e.g. specialized on-prem SLM judge, ADR-0014) with **deterministic symbolic validation** (validating chronological timestamp monotonicity, asserting edge existence via Cypher/SQL, and verifying schema types).
  - **Asymmetric Voting Logic (Pessimistic Quorum Protocol)**:
    - *The Challenge*: Neural transformer models evaluate contextual semantic intent, while heuristic/symbolic engines evaluate boolean AST rules and graph paths. For dual-use Living-off-the-Land (LotL) activity, engines can systematically diverge, risking arbitration thrashing or latency-inducing human escalations.
    - *Triage & Hypothesis Escalation (Pessimistic Quorum)*: For read-only scoping and alert priority escalation, an asymmetric **pessimistic quorum** applies: *if either engine identifies a potential intrusion or unverified anomaly, the finding elevates*.
    - *Automated Destructive Containment (Consensus Requirement)*: For active disruptive containment actions (e.g. host isolation, credential revocation), complete unanimous agreement between neural and symbolic verifiers is strictly mandatory. Any semantic disagreement automatically routes the action to the human operator workbench without stall or automated execution.
- If the Proposer and Challenger models diverge beyond acceptable confidence thresholds ($\lt 80\%$ agreement), the incident dossier automatically escalates to a human operator with a comparative analysis of both reasoning paths.

### 3. Rejection of Output-Driven Ingestion Anti-Pattern
- The platform firmly rejects restrictive "output-driven ingestion."
- All security-relevant telemetry is collected at line rate into low-cost columnar lakehouse storage (open Parquet/Iceberg on object storage). Only high-priority, actionable streams are indexed in the hot analytics engine.
- This guarantees sub-linear cost scaling while preserving 365+ days of forensic depth for automated retro-hunting (`CTI-05`).

### Positive Consequences

* Delivers empirical, measurable detection coverage metrics directly aligned with MITRE ATT&CK.
* Reduces unsupported or erroneous agent recommendations and premature case dismissals via adversarial model arbitration and Evals-as-Code grounding validation (target: grounding fidelity $\ge 95\%$ on golden incident benchmarks).
* Eliminates the risk of historical visibility starvation during novel threat disclosures.

### Negative Consequences

* Automated emulation harnesses require continuous maintenance to update atomic execution payloads.
* Dual-model arbitration incurs additional token consumption and asynchronous out-of-band inference latency ($\le 3\,\text{s}$ SLA) during case framing (streaming containment remains decoupled and evaluated by the deterministic safety kernel in $\le 500\,\text{ms}$).

### Scientific & Literature Grounding

* **Base-Rate Fallacy & Alert Fatigue Mitigation**: [Axelsson (2000)](https://doi.org/10.1145/357830.357849), *The Base-Rate Fallacy and the Difficulty of Intrusion Detection*; [FND-01](/architecture/foundational-research#fnd-01).
* **Empirical Limits of Autonomous Cyber Reasoning & Exploit Discovery**: [UK AI Security Institute [AISI] (2026)](/architecture/foundational-research#fnd-17), *Empirical Evaluations of Frontier Autonomous Cyber Capabilities*; [FND-17](/architecture/foundational-research#fnd-17).
* **Elimination of Shared Mode Collapse via Proposer/Challenger Consensus**: [Anthropic (2026)](/architecture/foundational-research#fnd-17), *Claude Mythos System Card & Project Glasswing*; [FND-17](/architecture/foundational-research#fnd-17).
