# Operational & Engineering User Stories

> **Tier 2: Capabilities & Taxonomy** · **Audience**: SOC Leads, Detection Engineers, Incident Responders · **Normative Status**: Reference Operational Scenarios  
> **Prerequisites**: [Macro Capabilities & Services](10-macro-capabilities-and-services.md) · **Next Step**: [Layer 1: Data Sources](03-layer-1-data-sources.md)

---

To ensure that the TIDIR architecture translates into seamless operational execution, this document defines concrete **User Stories** across the three primary actor categories:
1. **Human Operators**: Triage Analysts, Incident Commanders, and Threat Hunters who exercise ultimate operational authority and forensic judgment.
2. **Agentic AI Operators**: Autonomous software harnesses that execute high-velocity context assembly, hypothesis generation, and containment preparation.
3. **Platform & Systems Engineers**: Data Engineers, Detection Engineers (DaC), Threat Intelligence Engineers, and SecOps SREs who author, test, version, and maintain the system.

All stories adhere to the canonical structure:
> **As a** `[Role]`, **I want** `[Capability]`, **so that** `[Outcome]`.

> [!NOTE]
> **Reference Target SLOs**:
> Latency thresholds and completion targets defined within Acceptance Criteria (e.g. $\lt 60\text{ seconds}$ blast-radius assessment, $\lt 3\text{ minutes}$ 30-day lakehouse queries) represent **Reference Target Service Level Objectives (SLOs)** for reference hardware and dataset baselines rather than mandatory architectural invariants.

---

## 2. Human Operator User Stories

### Story H1: Contextual Graph Triage without Pivot Fatigue
* **As a** Senior Triage Analyst (Layer 4),
* **I want** incoming high-priority cases to arrive with pre-correlated entity graphs, chronological timelines, and affected mission-critical assets already resolved,
* **So that** I can assess the complete blast radius of an active intrusion in under 60 seconds without manually pivoting across multiple query terminals.

#### Acceptance Criteria
1. The Incident Dossier presents a unified Directed Acyclic Graph (DAG) connecting user identities, source IPs, hostnames, and process lineages without manual join queries.
2. Telemetry timestamps across cloud and endpoint streams are normalized to microsecond UTC accuracy with clock-skew correction.
3. Multi-event alert storms (e.g. 500 failed login attempts preceding a privilege escalation) are collapsed into a single multi-event finding cluster.
4. The analyst can issue plain-language commands to the agentic harness (e.g. *"Show all outbound network connections from this process guid in the preceding 2 hours"*) and receive structured tabular results within 5 seconds.

---

### Story H2: Authorising Disruptive Containment with Impact Previews
* **As an** Incident Commander (Layer 4),
* **I want** the system to execute a deterministic pre-execution blast-radius simulation before I authorise high-impact containment actions (Tier 2),
* **So that** I do not inadvertently sever critical business operations, drop transactional customer connections, or trigger unexpected service outages.

#### Acceptance Criteria
1. Prior to prompting for human authorisation, the response orchestrator queries Layer 1 CMDB relationships and Layer 2 network flow caches to compute live blast-radius metrics (active TCP sessions, downstream dependent microservices, database replica status).
2. The authorisation modal explicitly presents the simulation summary: affected hostnames, projected service disruption, and estimated recovery time.
3. No Tier 2 containment action can be dispatched unless verified forward compensation procedures (e.g. restoring benign service availability while strictly upholding the reachability invariant $R(s_{\text{post}}) \subseteq R(s_{\text{pre}})$) are pre-compiled and verified.
4. Authorisations are cryptographically logged to the immutable audit register with the authorising commander's digital signature and stated operational rationale.

---

### Story H3: Hypothesis-Driven Retroactive Threat Hunting
* **As a** Proactive Threat Hunter (Layers 2 & 3),
* **I want** to execute ad-hoc, multi-dataset analytical queries across multi-month lakehouse archives using vendor-neutral SQL,
* **So that** I can identify stealthy, slow-and-low adversary campaigns that evade real-time streaming detection thresholds.

#### Acceptance Criteria
1. Queries push down partition filters (`dt=YYYY-MM-DD`, `schema_class=1007`) to object storage, scanning only relevant columnar partitions.
2. Query execution over 30 days of enterprise telemetry completes within analytical response SLAs (< 3 minutes).
3. Discovered suspicious patterns can be converted into new Detection Opportunity Backlog items in Layer 3 with a single click.

---

### Story H4: Break-Glass Emergency Containment During High-Velocity Outbreak
* **As an** Incident Commander (Layer 4),
* **I want** to invoke an authenticated emergency break-glass override on pre-compiled Tier 2 containment playbooks when an active ransomware or exfiltration pattern is verified,
* **So that** I can sever adversary lateral traversal across critical infrastructure within 15 seconds without awaiting multi-party consensus.

#### Acceptance Criteria
1. The incident commander can trigger break-glass execution only when system telemetry validates an active catastrophic threat signature crossing the automated threshold.
2. The authorisation instantly executes forward containment across target connectors while automatically staging verified reachability-safe forward compensation tasks.
3. Invocation immediately emits signed cryptographic alerts across real-time executive broadcast streams.
4. The authorisation event, rationale, and digital signature are permanently committed to the tamper-evident audit ledger.

---

### Story H5: Unified Multi-Vendor Finding Fusion
* **As a** Senior Triage Analyst (Layer 4),
* **I want** pre-computed external detection findings (EDR detections, CNAPP misconfigurations, and perimeter WAF blocks) to attach directly to affected host and identity entities in the bipartite graph alongside raw telemetry,
* **So that** I can conduct complete cross-domain investigations in a unified dossier without pivoting across isolated commercial vendor consoles.

#### Acceptance Criteria
1. External security alerts from commercial providers (CrowdStrike, Defender, Wiz, Prisma, Cloudflare) ingest as OCSF Category 2 Finding classes (Class 2001 Security Finding, Class 2004 Detection Finding).
2. The graph correlation engine attaches incoming external findings directly to existing entity vertices (`device.hostname`, `actor.user.name`, `ip_address`) using causal bipartite edges.
3. Overlapping external alerts (e.g. an EDR malware alert and a CNAPP high-risk role assumption on the same EC2 instance) merge into a single correlated case with a synthesized compound risk score.
4. The investigation workbench renders a unified attack progression without requiring the analyst to cross-reference multiple vendor dashboards.

---

## 3. Agentic AI Operator User Stories

### Story A1: Autonomous 30-Day Lakehouse Baseline Scoping
* **As an** Agentic Triage Harness (Layer 4),
* **I want** to autonomously formulate and execute read-only Lakehouse queries upon alert elevation,
* **So that** I can calculate normal behavioural baselines for the affected user and endpoint before the human analyst opens the case.

#### Acceptance Criteria
1. The agent triggers immediately upon receipt of an OCSF Class 2004 Detection Finding crossing the risk threshold.
2. The agent queries Layer 2 lakehouse storage for the affected `actor.user.name` and `device.hostname` spanning the preceding 30 days.
3. The agent extracts: typical operating hours, frequently accessed cloud roles, baseline data egress volumes, and rare administrative actions.
4. The agent operates strictly under **Tier 0 (Read-Only)** authorisation boundaries, with zero environmental write capabilities.

---

### Story A2: Adversary Hypothesis Generation & Plan Drafting
* **As an** Agentic Investigation Harness (Layer 4),
* **I want** to evaluate clustered graph findings against MITRE ATT&CK patterns and synthesize an explanatory narrative with a prioritised containment plan,
* **So that** human responders receive a structured investigative briefing rather than disconnected telemetry fragments.

#### Acceptance Criteria
1. The agent synthesizes a concise, plain-language operational hypothesis detailing: attack vector, observed lateral traversal, compromised credentials, and suspected adversary objective.
2. Every factual assertion in the hypothesis cites specific OCSF event records and cryptographic evidence hashes in the case locker.
3. The agent drafts a phased remediation plan cleanly separating Tier 0 (autonomous passive enrichment), Tier 1 (targeted low-disruption isolation), and Tier 2 (disruptive actions requiring human approval).

---

### Story A3: Closed-Loop Threat Intelligence & Detection Calibration
* **As an** Agentic Continuous Feedback Harness (Layers 3 & 4),
* **I want** to extract confirmed attacker observables and false-positive indicators upon incident closure,
* **So that** the platform automatically enriches internal CTI repositories and opens tuning pull requests in the Detection-as-Code registry.

#### Acceptance Criteria
1. When a case is resolved as True Positive, verified attacker hashes, IP infrastructure, and C2 domains are automatically structured into STIX 2.1 entities and pushed to Layer 3 CTI.
2. The agent initiates an automated retro-hunt across the Layer 2 Lakehouse for all newly catalogued indicators.
3. When a case is closed as False Positive / Benign Baseline, the agent analyzes the triggering rule logic, generates an exclusion predicate (e.g. filtering out an authorised backup daemon), validates the change against synthetic test suites, and opens a Git pull request for human detection engineer review.

---

### Story A4: Cognitive Isolation Against Adversarial Prompt Injection in Telemetry
* **As a** defensive AI Triage Agent (Layer 4),
* **I want** all incoming event command lines, file strings, and threat intelligence bodies to be schema-validated and ingested through an isolated data plane,
* **So that** adversary-injected instructions embedded within process arguments or payload strings cannot hijack my investigative reasoning or weaponize my tool access.

#### Acceptance Criteria
1. Untrusted raw telemetry payloads are parsed into typed JSON structures by an isolated pre-processing filter before context injection.
2. The agent reasoning prompt physically isolates data blocks from instruction blocks; the agent never evaluates raw text as operational commands.
3. Tool invocations enforce strongly typed parameters checked by deterministic schema validators; raw command-line string interpolation is architecturally blocked.
4. If adversarial prompt injection patterns are identified within telemetry strings, the agent logs an adversarial evasion finding (OCSF Class 2004) without halting the triage workflow.

---

### Story A5: Zero-Hesitation Autonomous Containment on Canary Triggers
* **As an** Autonomous Response Agent (Layer 4),
* **I want** alerts tagged with `metadata.is_canary: true` to bypass probabilistic risk thresholds and trigger immediate Tier 1 containment playbooks,
* **So that** adversary lateral movement and credential theft are neutralized within seconds without human triage delays.

#### Acceptance Criteria
1. When an event interacts with an ambient deception primitive (honeytoken cloud key, decoy Active Directory SPN, canary filesystem lure), Layer 1 tags the record with `metadata.is_canary: true`.
2. The agent treats the alert as having an empirical false-positive probability of zero ($P(\text{Benign} \mid \text{Trigger}) \to 0$), immediately promoting the case to a verified intrusion anchor.
3. The response engine dispatches targeted, low-disruption Tier 1 containment actions (e.g. revoking the compromised credential, isolating the host process, null-routing the interacting external IP) within 5 seconds of event receipt.
4. Workflows enforce monotonic progression: isolation states freeze in place on step failure and escalate forward, while verified alerts broadcast instantly to the incident commander channel.

---

## 4. Platform & Systems Engineer User Stories

### Story E1: Zero-Loss Line-Rate Schema Normalization & Source Ingestion
* **As a** Security Data Engineer (Layer 2),
* **I want** ingestion workers to coerce heterogeneous logs and alerts—including standard machine-readable logs (Syslog RFC 5424, Windows EVTX, systemd-journald, cloud audit trails) and external vendor finding webhooks (OCSF Category 2)—into canonical OCSF while preserving unmapped vendor fields in an `unmapped_data` JSON catch-all,
* **So that** the enterprise maintains strict schema contracts for detection engineering without suffering forensic data loss from schema truncation.

#### Acceptance Criteria
1. Ingestion workers normalize incoming events at line rate (> 100,000 eps per cluster node) with p99 processing latency < 250ms.
2. Parsers support standard enterprise formats: Windows EVTX channels, Linux journald/auditd, RFC 5424 Syslog, cloud control-plane audit streams, and external security finding webhooks (CrowdStrike, Defender, Wiz, Cloudflare).
3. Any raw attribute not explicitly defined in the authoritative OCSF schema class is stored verbatim in the `unmapped_data` dictionary.
4. Payloads with unrecoverable corruption or invalid encoding are safely routed to Dead-Letter Queues (DLQ) with error tags.
5. Data engineers can replay DLQ streams through updated parser definitions without pipeline downtime.

---

### Story E2: Test-Driven Detection-as-Code (DaC) CI/CD Deployment
* **As a** Detection Engineer (Layer 3),
* **I want** to author Polyglot Detection-as-Code rules (vendor-neutral metadata envelopes with target-optimized query blocks; [ADR-0019](../adr/0019-polyglot-detection-as-code-and-native-engine-adaptation.md)) in Git and validate them against synthetic unit fixtures and recorded adversary simulations in CI/CD,
* **So that** I can deploy new detections to production stream and batch runtimes with zero false-positive regressions.

#### Acceptance Criteria
1. Detection rules are versioned as declarative text files (YAML) featuring vendor-neutral OCSF metadata envelopes, MITRE ATT&CK mappings, and target-optimized query implementations (KQL, SPL, SQL).
2. The CI/CD pipeline runs unit tests asserting rule behaviour against synthetic true-positive and benign edge-case payloads across all declared engine implementations.
3. The pipeline verifies candidate rules against recorded adversary simulation telemetry executed in the `test` environment.
4. The pipeline replays candidate rules across a 30-day historical lakehouse sample in `pre-prod`, calculating the Expected Alert Volume (EAV) and rejecting rules that exceed noise thresholds.

---

### Story E3: Machine-Readable Attack Flow Production
* **As a** Cyber Threat Intelligence (CTI) Engineer (Layer 3),
* **I want** to model tactical threat actor behaviours as structured, machine-readable Directed Acyclic Graphs (DAGs) aligned with Priority Intelligence Requirements (PIRs),
* **So that** detection engineers can immediately build targeted, multi-stage detection logic without interpreting ambiguous free-text PDF reports.

#### Acceptance Criteria
1. Threat intelligence products are exported in structured machine-readable formats defining sequential attacker steps, prerequisite conditions, and forensic observables.
2. Each attack flow step explicitly maps to MITRE ATT&CK technique IDs and target OCSF data classes.
3. New attack flows automatically update the Detection Opportunity Backlog, scoring implementation priority by multiplying threat prevalence, Tier 0 asset exposure, and sensor visibility feasibility.

---

### Story E4: Blast-Radius Policy Modelling & SRE Availability Management
* **As a** SecOps Automation SRE (Layer 4),
* **I want** to define declarative playbook execution policies with verified forward compensation logic, rate limits, and health checks,
* **So that** automated response workflows execute with five-nines availability and zero unintended cascading failures.

#### Acceptance Criteria
1. Playbooks are defined as configuration files with explicit timeout, retry, backoff, and circuit-breaker thresholds per connector.
2. Connectors to third-party endpoints (endpoint control planes, cloud identity providers, perimeter firewalls) run continuous synthetic health checks; degraded connectors automatically fall back to human queuing.
3. Every automated containment sequence enforces monotonic forward progression, freezing barriers on partial failure and triggering forward escalation without regression.

---

### Story E5: CI/CD Agent Evaluation Benchmark Run (Evals-as-Code)
* **As an** AI Systems Engineer (Layer 4),
* **I want** to execute automated regression and evaluation benchmarks across candidate agent prompts, system rules, and tool schemas during Git pull requests,
* **So that** model updates or prompt modifications do not introduce hallucinations, degrade triage accuracy, or exceed latency and token budgets.

#### Acceptance Criteria
1. The CI pipeline executes the candidate agent against a versioned Golden Incident Benchmark Dataset covering diverse attack vectors and benign scenarios.
2. The pipeline enforces deterministic assertions validating that 100% of tool invocations adhere to typed JSON schemas and all hypotheses cite verified OCSF event records.
3. Structured evaluation judges calculate qualitative metrics, blocking merge if grounding fidelity falls below 95%.
4. Invocations are measured against p95 latency thresholds (< 5 seconds for triage synthesis) and strict per-case token budgets.
