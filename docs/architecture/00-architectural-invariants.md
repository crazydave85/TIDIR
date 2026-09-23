# The TIDIR Architectural Constitution: Invariants & Safety Principles

> **Tier 1: Strategic Architecture** · **Golden Path Step 2 of 5** · **Audience**: All Audiences · **Normative Status**: Normative  
> **Prerequisites**: [Step 1: What is TIDIR?](/guide/what-is-tidir) · **Next Step**: [Step 3: System Overview & 4-Plane Model](/architecture/01-system-overview)

---

Modern security operations cannot rely on monolithic assumptions of correctness. Distributed networks partition, OS kernels drop packets under storm conditions, adversary telemetry can be poisoned, and probabilistic models can hallucinate. 

**TIDIR** (Threat Intelligence, Detection, Investigation & Response) is fundamentally a **safety architecture for autonomous cyber defence**. Rather than merely presenting a collection of technology components, it defines the invariant boundaries and mathematical constraints governing the interaction between uncertain evidence, probabilistic reasoning, deterministic authority, and physical actuation.

---

## 1. The Confidence–Authority Separation Principle

The central thesis of the TIDIR architecture is the strict decoupling of analytical belief from operational action:

> [!IMPORTANT]
> **The Confidence–Authority Separation Principle**:
> *Epistemic confidence SHALL NOT implicitly confer operational authority. Authority is independently derived from policy, identity, asset criticality, blast-radius constraints, and human governance.*

A probabilistic reasoning model or Bayesian correlation engine may compute a 99.9% confidence score that a database cluster is compromised. That confidence provides **zero self-granting authority** to sever network links or isolate the host. 

Conversely, interaction with a high-fidelity canary credential produces high-confidence, directly attributable evidence, yet the response policy still constrains the blast radius to non-destructive session freezing if the entity is designated as Tier 0 critical infrastructure.

### The Hierarchy of Defence Reasoning

Every security transition in TIDIR traverses a strict unidirectional chain:

```
Untrusted Observations (Layer 1)
     │
     ▼
Detections & Parsers (Layer 2)
     │
     ▼
Evidence Lineage & Confidence Estimation (Layer 3)
     │
     ▼
Investigative Hypotheses (Layer 4 Specialist Mesh)
     │
     ▼
Independent Adversarial Challenge (Challenger Model / Symbolic Verifier)
     │
     ▼
Permissible Policy & Capability Scope (Deterministic Safety Kernel / SVIDs)
     │
     ▼
Blast-Radius & Criticality Simulation (Pre-Execution Card)
     │
     ▼
Deterministic / Consensus Authorisation Gates (Dual-Auth / Break-Glass)
     │
     ▼
Monotonic Environmental Actuation (Connectors / Forward Escalation)
     │
     ▼
Closed-Loop Feedback & Evals (Continuous Calibration)
```

---

## 2. The 11 Non-Negotiable Invariants

All architectural layers, components, and Architectural Decision Records (ADRs) must strictly preserve these eleven foundational invariants:

### I1 — Telemetry Preservation
*Absence of current detection value does not justify destruction of forensic evidence.*

- **Plain-English Meaning**: Security logs must never be thrown away simply because no active detection rule currently searches for them. We preserve the forensic information value of raw observations so teams can investigate future attacks, subject only to explicitly governed legal, privacy, and secret-sanitization policies.
- **Concrete Example**: An organization receives millions of DNS query logs. Because no current detection query monitors uncommon record types, legacy systems drop them at the collector to save ingestion costs. When an advanced adversary campaign exploiting that exact DNS technique is disclosed six months later, the organization is blind. Under TIDIR, those logs are preserved in open storage, enabling retroactive hunting.
- **Invariant Property**: Ingested telemetry must survive and remain queryable in an open, vendor-neutral, schema-agnostic representation. Telemetry is never dropped at the edge merely because no active detection rule currently queries it.
- **Information Governance & Legal Boundaries**: Forensic preservation is bounded by explicit, governed policy: statutory data minimization mandates (e.g. GDPR Article 5(1)(c)), legally compelled deletion schedules, legal privilege redactions, automated credential and secret scrubbing, and governed forensic compaction that provably preserves evidentiary reconstructability. Unregulated destruction or vendor-cost dropping is strictly prohibited.
- **Reference Pattern**: Line-rate stream ingestion into open columnar lakehouses (`L2_STORAGE`) backed by object storage (e.g. Apache Iceberg / Parquet) with structured redaction pipelines. Under the Distributed Detection model ([ADR-0023](/adr/0023-distributed-detection-and-edge-to-center-correlation)), local and native detections emit finding metadata while raw contextual telemetry is retained in cost-effective lakehouses or edge ring buffers, preserved and retrievable on-demand rather than discarded.
- **Foundational Research & Standards**: [FND-04: OCSF Telemetry Schema (Linux Foundation 2023)](/architecture/foundational-research#fnd-04), [FND-16: Open Columnar Table Formats (Apache Iceberg 2021)](/architecture/foundational-research#fnd-16).

### I2 — Evidence Provenance & Traceability
*Every consequential machine assertion is traceable to underlying raw observations.*

- **Plain-English Meaning**: Every alert, finding, and hypothesis generated by the system must show its work by pointing directly to the original raw logs.
- **Concrete Example**: An automated triage agent asserts that a workstation has been compromised via pass-the-hash. Rather than presenting an unsupported narrative, the agent cites the exact raw authentication event ID, the Kerberos ticket request ID, and the network connection log. If an assertion lacks verifiable raw observation IDs, the system rejects it immediately.
- **Invariant Property**: No detection finding, agent hypothesis, or containment recommendation may exist without explicit citation to immutable observation identifiers (`source_observation_ids`) and derivation lineage (`derivation_chain`). Uncited claims are deterministically rejected.
- **Foundational Research & Standards**: [FND-14: Event Ordering & Causality (Lamport 1978)](/architecture/foundational-research#fnd-14), [FND-15: RFC 3161 Cryptographic Time-Stamp Protocol (IETF 2001)](/architecture/foundational-research#fnd-15).

### I3 — Evidential Independence (Anti-Shared Ancestry)
*Common ancestry cannot be represented as independent corroboration.*

- **Plain-English Meaning**: Two alerts are not independent proof of an attack if they both came from the same underlying event. TIDIR tracks that shared ancestry so the same evidence is not counted twice.
- **Concrete Example**: An adversary executes an encoded command on an endpoint (Event $E_1$). This single event triggers an alert from the endpoint sensor ($A_1$), an alert from the security analytics tool ($A_2$), and an alert from the system log parser ($A_3$). Because all three alerts share a single parent observation, the system treats them as one piece of evidence with three representations, preventing false confidence inflation.
- **Invariant Property**: Correlated derivations sharing common ancestry cannot masquerade as independent evidence. Evidence aggregation across orthogonal sensor domains must discount co-derived signals to their residual information gain.
- **Reference Pattern**: Dependency-aware probabilistic risk compounding (such as Bayesian graph compounding or factor graphs) explicitly penalising shared parent nodes in the entity-finding graph. In Exposure Intelligence integration ([ADR-0022](/adr/0022-exposure-management-and-continuous-threat-exposure-integration)), exposure context sets the prior probability $P(\text{Breach})$ rather than acting as a redundant corroborating signal, preventing artificial compounding between vulnerabilities and their exploit detections. To prevent base-rate blindness on unmapped or zero-day attack vectors, the architecture enforces a minimum prior probability bound—the **Exposure Floor** ($P(\text{Breach}) \ge \epsilon \gt 0$, adapting standard Laplace prior smoothing to prevent zero-frequency suppression). Deterministic invariant violations (canary tokens, kernel driver tampering) bypass prior weighting entirely.
- **Foundational Research & Standards**: [FND-01: Base-Rate Fallacy in Intrusion Detection (Axelsson 2000)](/architecture/foundational-research#fnd-01), [FND-07: MITRE ATT&CK Grounded Evidence (MITRE 2018)](/architecture/foundational-research#fnd-07).

### I4 — Authority Separation (Trust Doctrine Maxim)
*Probabilistic components propose. Deterministic components authorize.*

- **Plain-English Meaning**: AI models and probabilistic algorithms can analyze data and suggest actions, but they have zero authority to make changes on their own. Only deterministic security policies can authorize an action.
- **Concrete Example**: An AI triage assistant investigates an incident and recommends isolating a database server. Even if the AI scores the incident with 99.9% malicious certainty, the AI cannot trigger the isolation command. The request passes to the deterministic policy kernel, which checks asset criticality, maintenance windows, and blast-radius rules before deciding whether to permit the action.
- **Invariant Property**: Neural transformer models, large language models (LLMs), clustering heuristics, and probabilistic classifiers operate strictly in read-only analysis mode. No machine actor receives execution authority merely because another component asserts it is correct.
- **Foundational Research & Standards**: [FND-02: Separation of Mechanism & Policy (Saltzer & Schroeder 1975)](/architecture/foundational-research#fnd-02), [FND-10: Indirect Prompt Injection Vulnerabilities (Greshake et al. 2023)](/architecture/foundational-research#fnd-10), [FND-11: Dual LLM Security Architecture (Willison 2023)](/architecture/foundational-research#fnd-11), [FND-17: Adversary AI Capabilities & Machine-Speed Exploit Chaining (NCSC 2024; Anthropic 2026; Hugging Face 2026)](/architecture/foundational-research#fnd-17).

### I5 — Least Capability & Ephemeral Identity
*Machine identities receive only task-scoped, short-lived authority.*

- **Plain-English Meaning**: Automation scripts and background services never hold permanent passwords or API keys. They receive temporary cryptographic certificates that expire in 15 minutes or less.
- **Concrete Example**: An automated containment task needs to revoke an active user session in an identity provider. The system verifies the task's binary signature and grants it a cryptographic certificate valid for 10 minutes, scoped exclusively to session revocation for that single user ID.
- **Invariant Property**: Machine authority must be short-lived, workload-bound, and strictly task-scoped. Machine actors never hold permanent ambient API keys or credentials.
- **Reference Pattern**: Task-scoped cryptographic attestation issuing ephemeral X.509 certificates (e.g., SPIFFE/SPIRE Verifiable Identity Documents / SVIDs) valid for $\le 15\text{ minutes}$ (valid for a maximum lifetime of 15 minutes), with capability constraints enforced at the network and API layers.
- **Foundational Research & Standards**: [FND-02: Principle of Least Privilege (Saltzer & Schroeder 1975)](/architecture/foundational-research#fnd-02), [FND-03: Zero Trust Architecture (NIST SP 800-207)](/architecture/foundational-research#fnd-03), [FND-06: Workload Identity & Attestation (CNCF SPIFFE 2020)](/architecture/foundational-research#fnd-06).

### I6 — Bounded Autonomy & Blast Radius
*Autonomous execution is strictly constrained by time, cost, scope, and blast radius.*

- **Plain-English Meaning**: Automated workflows run within strict boundaries: maximum runtimes, maximum cost ceilings, limited tool steps, and total protection for critical business systems.
- **Concrete Example**: A containment playbook begins isolating machines affected by malware. The system enforces hard ceilings: the playbook times out after 180 seconds, cannot invoke more than 8 tool actions, and is mathematically blocked from isolating domain controllers, hospital medical devices, or core payment switches without human approval.
- **Invariant Property**: Automated actions enforce hard ceilings: wall-clock execution timeouts ($\le 180\text{s}$, max 180 seconds), financial inference limits ($\le \$2.50$, max $2.50), max tool-hops ($\le 8$, max 8 tool invocations), and asset criticality boundaries. Critical assets are immune to automated destructive isolation.
- **Foundational Research & Standards**: [FND-01: Alert Noise Error Budgets (Axelsson 2000)](/architecture/foundational-research#fnd-01), [FND-09: Circuit Breakers & Bulkhead Isolation (Nygard 2007)](/architecture/foundational-research#fnd-09).

### I7 — Fail-Secure Containment & Reachability Monotonicity
*Partial failure cannot silently restore attacker reachability ($s_{n+1} \preceq s_n$, where post-transition reachability is a subset of pre-transition reachability).*

- **Plain-English Meaning**: If an automated security action fails halfway through, the system must never roll back security barriers or leave the network more exposed than before. When things fail, the system freezes in place or escalates defenses outward relative to its validated environment model.
- **Concrete Example**: An incident response playbook isolates a compromised host by blocking its firewall port and revoking its access tokens. If the firewall API fails after the tokens are revoked, the playbook does not restore the revoked tokens. Instead, it freezes the host in its current state and escalates isolation to the upstream switch port.
- **Invariant Property**: Containment workflows execute declarative state machines where forward compensation is permitted, but security barriers never roll back upon downstream API errors. Failures freeze perimeters in place and escalate forward to broader network boundaries.
- **Model-Bounded Formalism**:
  TIDIR guarantees monotonicity relative to the control system's validated topological, identity, and environmental reachability model $\mathcal{M}_t$, acknowledging that unobservable out-of-band attacker channels require continuous empirical discovery and model updating:
  $$\hat{\mathcal{R}}_A(s_{n+1}, \mathcal{M}_t) \subseteq \hat{\mathcal{R}}_A(s_n, \mathcal{M}_t) \quad \land \quad \hat{\mathcal{V}}_{\text{telemetry}}(s_{n+1}, \mathcal{M}_t) \supseteq \hat{\mathcal{V}}_{\text{telemetry}}(s_n, \mathcal{M}_t)$$
  *Plain-English Explanation: In every automated state transition from $s_n$ to $s_{n+1}$, modelled adversary reachability across network perimeters, identity tokens, and attack surface $\hat{\mathcal{R}}_A$ must remain a subset of, or equal to, the prior state, while telemetry visibility $\hat{\mathcal{V}}_{\text{telemetry}}$ remains equal or expands. Any proposed action that would increase modelled reachability without explicit human authorization is deterministically rejected.*
- **Foundational Research & Standards**: [FND-08: Sagas & Forward Compensating Workflows (Garcia-Molina & Salem 1987)](/architecture/foundational-research#fnd-08), [FND-19: Adversary Breakout Velocity & Dwell Time (CrowdStrike 2024; Mandiant 2024)](/architecture/foundational-research#fnd-19).

### I8 — Graceful Defensive Degradation
*Failure of an advanced capability reduces sophistication, never total visibility.*

- **Plain-English Meaning**: If an advanced feature like an AI model or a real-time streaming pipeline fails, security operations do not stop. The system automatically drops down to simpler, reliable backup mechanisms.
- **Concrete Example**: If a cloud AI service goes offline during an active incident, the security console does not fail. It automatically switches to standard chronological timelines sorted by timestamp, running local rule-based searches to ensure analysts retain full situational awareness.
- **Invariant Property**: The architecture implements four continuous operational tiers. If streaming buses, graph stores, or cloud AI gateways experience outages, systems automatically degrade to local edge spooling, scheduled batch sweeps, and deterministic rule-based tabular timelines.
- **Foundational Research & Standards**: [FND-09: Distributed Circuit Breakers & Bulkheads (Nygard 2007)](/architecture/foundational-research#fnd-09), [FND-13: Ironies of Automation & Degradation (Bainbridge 1983)](/architecture/foundational-research#fnd-13).

### I9 — Human Recoverability & Break-Glass Flight Decks
*Autonomous control planes always preserve independently accessible manual flight decks.*

- **Plain-English Meaning**: Human operators always hold ultimate authority. There is always a manual master switch to stop automated actions, along with an emergency override procedure for human operators.
- **Concrete Example**: If a malfunctioning playbook begins isolating endpoints in error, an incident commander presses a physical or cryptographically signed master Emergency Stop (E-Stop). This instantly halts all automated mutations across the fleet without needing to disable individual agents or APIs.
- **Invariant Property**: Humans retain permanent, out-of-band control. The system provides a cryptographic master E-Stop to halt automated mutations, paired with a dual-authorized break-glass protocol for machine-speed emergencies that broadcasts signed audit trails.
- **Foundational Research & Standards**: [FND-12: Situation Awareness in Dynamic Automation (Endsley 1995)](/architecture/foundational-research#fnd-12), [FND-13: Human Flight Decks & Automation Ironies (Bainbridge 1983)](/architecture/foundational-research#fnd-13).

### I10 — Reconstructability (The Incident Decision DAG)
*Consequential decisions can be deterministically reconstructed from immutable records.*

- **Plain-English Meaning**: Years after an incident, responders and auditors can reconstruct exactly why any decision was made, what evidence was known at that second, and which human or policy authorized the action.
- **Concrete Example**: During an annual compliance audit, regulators ask why a financial database was placed into read-only mode during an alert. The system displays the immutable graph node linking the action directly to the originating anomalous query log, the policy version in effect, and the timestamped consensus signature of the responders.
- **Invariant Property**: Every investigative finding, hypothesis, decision, and response action is committed as a cryptographically sealed edge in the **Incident Decision DAG**, capturing exact model versions, raw input hashes, authorizing keys, and environmental outcomes.
- **Foundational Research & Standards**: [FND-14: Distributed Logical Clocks & Causal Ordering (Lamport 1978)](/architecture/foundational-research#fnd-14), [FND-15: RFC 3161 Trusted Time-Stamp Tokens (IETF 2001)](/architecture/foundational-research#fnd-15).

### I11 — Operational Portability & Non-Lock-In
*Vendor neutrality is an architectural invariant, not merely a design intention.*

- **Plain-English Meaning**: No security log, detection rule, or incident history is locked into a single proprietary vendor. Organizations can export and run their defenses anywhere using open standards.
- **Concrete Example**: If an enterprise migrates from one cloud provider to another, all detection rules (written in Detection-as-Code), telemetry records (stored in open Parquet/Iceberg formats), and incident histories migrate cleanly without requiring complete rewrites.
- **Invariant Property**: No consequential security telemetry, detection logic, investigative case state, policy definition, or audit lineage SHALL be irrecoverably dependent upon a proprietary execution environment or vendor-controlled storage format.
- **Exit & Interoperability Criteria**: Conformance requires full bi-directional exportability and replayability using open representations: telemetry in OCSF / open columnar formats (Parquet/Iceberg), detections in Polyglot DaC, threat intelligence in STIX 2.1 / TAXII 2.1, and execution lineage in open JSON-LD / DAG structures.
- **Foundational Research & Standards**: [FND-04: OCSF Specification (Linux Foundation 2023)](/architecture/foundational-research#fnd-04), [FND-05: STIX 2.1 / TAXII 2.1 (OASIS Open 2021)](/architecture/foundational-research#fnd-05), [FND-16: Open Lakehouse Specifications (Apache Iceberg 2021)](/architecture/foundational-research#fnd-16).

---

### Invariant & Scientific Research Matrix

The table below summarizes the academic papers, standards specifications, and institutional research grounding each of the 11 Constitutional Invariants. For full citation details, DOIs, and empirical analyses, refer to the [Canonical Scientific Research Table](/architecture/foundational-research#scientific-research-table).

| Invariant | Title & Core Principle | Primary Literature & Standards Grounding | Canonical Ref |
| :--- | :--- | :--- | :--- |
| **I1** | **Telemetry Preservation** | OCSF Schema (Linux Foundation 2023); Open Table Formats (Apache Iceberg 2021) | [FND-04](/architecture/foundational-research#fnd-04), [FND-16](/architecture/foundational-research#fnd-16) |
| **I2** | **Evidence Traceability** | Logical Clocks & Event Ordering (Lamport 1978); Cryptographic TSP (RFC 3161) | [FND-14](/architecture/foundational-research#fnd-14), [FND-15](/architecture/foundational-research#fnd-15) |
| **I3** | **Evidential Independence** | Base-Rate Fallacy in Intrusion Detection (Axelsson 2000); MITRE ATT&CK (2018) | [FND-01](/architecture/foundational-research#fnd-01), [FND-07](/architecture/foundational-research#fnd-07) |
| **I4** | **Authority Separation** | Separation of Protection & Mechanism (Saltzer & Schroeder 1975); Indirect Prompt Injection (Greshake et al. 2023; Willison 2023); Adversary AI Capabilities (NCSC 2024; Anthropic 2026; Hugging Face 2026) | [FND-02](/architecture/foundational-research#fnd-02), [FND-10](/architecture/foundational-research#fnd-10), [FND-11](/architecture/foundational-research#fnd-11), [FND-17](/architecture/foundational-research#fnd-17) |
| **I5** | **Least Capability** | Least Privilege (Saltzer & Schroeder 1975); Zero Trust (NIST SP 800-207); SPIFFE/SPIRE Workload Identity (CNCF 2020) | [FND-02](/architecture/foundational-research#fnd-02), [FND-03](/architecture/foundational-research#fnd-03), [FND-06](/architecture/foundational-research#fnd-06) |
| **I6** | **Bounded Autonomy** | SRE Alert Noise Error Budgets (Axelsson 2000); Stability Patterns & Bulkheads (Nygard 2007) | [FND-01](/architecture/foundational-research#fnd-01), [FND-09](/architecture/foundational-research#fnd-09) |
| **I7** | **Security-State Monotonicity** | Sagas & Compensating Transactions (Garcia-Molina & Salem 1987); Breakout Velocity & Dwell Time (CrowdStrike 2024; Mandiant 2024) | [FND-08](/architecture/foundational-research#fnd-08), [FND-19](/architecture/foundational-research#fnd-19) |
| **I8** | **Degraded Defence** | Circuit Breakers & Graceful Degradation (Nygard 2007); Ironies of Automation (Bainbridge 1983) | [FND-09](/architecture/foundational-research#fnd-09), [FND-13](/architecture/foundational-research#fnd-13) |
| **I9** | **Human Recoverability** | Situation Awareness in Dynamic Systems (Endsley 1995); Human Flight Decks & Ironies of Automation (Bainbridge 1983) | [FND-12](/architecture/foundational-research#fnd-12), [FND-13](/architecture/foundational-research#fnd-13) |
| **I10** | **Reconstructability (Incident DAG)** | Distributed Clocks (Lamport 1978); Cryptographic Time-Stamp Tokens (RFC 3161) | [FND-14](/architecture/foundational-research#fnd-14), [FND-15](/architecture/foundational-research#fnd-15) |
| **I11** | **Operational Portability & Exit** | OCSF (2023); STIX 2.1 / TAXII 2.1 (OASIS 2021); Apache Iceberg (2021) | [FND-04](/architecture/foundational-research#fnd-04), [FND-05](/architecture/foundational-research#fnd-05), [FND-16](/architecture/foundational-research#fnd-16) |

---

## 3. Global Claims Discipline & Editorial Standards

To ensure architectural credibility and scientific rigor, TIDIR documentation adheres to strict language discipline:

| Prohibited Marketing Absolute | Mandated Architectural Formulation | Rationale |
| :--- | :--- | :--- |
| "Eliminates hallucinations" | "Reduces unsupported or erroneous recommendations via evidence grounding and adversarial verification" | Probabilistic models can always produce errors; safety comes from external bounding, not model infallibility. |
| "Absolute Data Sovereignty" | "On-Premises Data Boundary Enforcement via Sovereign Inference Clusters" | Sovereignty depends on full supply chains, physical security, and networks, not just local inference. |
| "Solves the Base Rate Fallacy" | "Mitigates the operational consequences of the Base Rate Fallacy via dependency-aware evidence aggregation" | The mathematical base rate phenomenon persists; the system manages its impact on alert volume. |
| "Guarantees zero data loss" | "Designed to prevent telemetry loss via local NVMe spooling and direct-to-object bypass" | Catastrophic physical failures can cause loss; architectures specify mechanisms, experiments verify outcomes. |
| "Zero-risk response automation" | "Blast-radius bounded response automation with pre-execution impact simulation" | Any automated operational action carries non-zero risk of disruption. |

---

## 4. ADR Governance & Invariant Matrix

Every Architectural Decision Record (ADR) in TIDIR must explicitly declare its invariant mapping in the MADR structure:
* **Preserves**: Invariants actively enforced or strengthened by the decision.
* **Potential Tensions & Boundary Conditions**: Invariants requiring explicit trade-off management or circuit breakers.
* **Empirical Validation Strategy**: Concrete tests, benchmarks, or chaos experiments proving invariant preservation under hostile or degraded conditions.
