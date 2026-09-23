# 0009. Bayesian Multi-Signal Risk Scoring (Overcoming the Base Rate Fallacy)

* Status: accepted
* Deciders: Architecture Team / Harry
* Date: 2026-09-15

## Context and Problem Statement

A fundamental mathematical challenge in detection engineering is the **False Positive Paradox**, caused by the **Base Rate Fallacy**. In an enterprise environment processing hundreds of millions of events daily, malicious activity represents an infinitesimally small fraction of total telemetry ($\lt 0.0001\%$). 

Under Bayes' theorem:
$$P(\text{Intrusion} \mid \text{Alert}) = \frac{P(\text{Alert} \mid \text{Intrusion}) \cdot P(\text{Intrusion})}{P(\text{Alert})}$$

If the prior probability of an intrusion $P(\text{Intrusion})$ is negligible, even a detection rule or machine learning classifier with 99% specificity will generate an overwhelming majority of false-positive alarms. Elevating isolated, single-event anomalies (e.g. an unusual PowerShell flag or a new administrative IP) directly to analyst queues inevitably causes severe cognitive fatigue and missed intrusions.

How does the architecture mathematically suppress the Base Rate Fallacy and ensure that only high-probability, actionable findings reach human operators?

## Decision Drivers

* Suppression of single-event false-alarm cascades.
* Mathematical grounding of risk elevation using dependency-aware compounding evidence signals.
* Seamless integration with normalized OCSF event graphs, evidence lineage, and entity resolution.
* Strict vendor-neutrality and capability-driven definitions.

## Considered Options

1. **Threshold Tuning on Single-Event Alerts**: Increase alert thresholds on individual rules (e.g. alert only after 20 failed logins instead of 5).
2. **Machine Learning Anomaly Scores Without Context**: Use standalone unsupervised anomaly scores to flag outliers.
3. **Compound Bayesian Risk Lens with Evidence Lineage Domains over Relational Execution Graphs (Selected)**.

## Decision Outcome

Chosen option: **Compound Bayesian Risk Lens with Evidence Lineage Domains over Relational Execution Graphs**, because:

### 1. Weak Signals vs. Actionable Findings
- The architecture introduces an explicit separation between **Signals** and **Findings**:
  - **Weak Signals (Vertex Properties)**: Individual detection rules, statistical anomalies, and IOC matches are not emitted as standalone alerts. They are appended as temporal properties to entities in the in-memory execution graph (Layer 3).
  - **Elevated Findings (OCSF Class 2001/2004)**: An incident dossier is only elevated to Layer 4 when the compound Bayesian risk score crosses the elevation threshold ($S \ge 75/100$).

### 2. Dependency-Aware Probabilistic Evidence Aggregation

A primary failure mode of naive Bayesian compounding in security operations is the **Shared Evidence Fallacy**. Consider an adversary launching an obfuscated script:

```
Sysmon Process Event (Raw Observation)
    │
    ├── Sigma Rule Detection (Suspicious PowerShell Flags)
    ├── Living-off-the-Land Binary (LOLBin) Match
    ├── MITRE ATT&CK T1059.001 Mapping
    └── Statistical Command-Line Length Anomaly
```

While the security stack registers four discrete "findings", they stem from a **single underlying piece of evidence**. Naively assuming conditional independence and multiplying their likelihood ratios causes posterior confidence to explode artificially, generating false-positive escalations.

To prevent this, TIDIR codifies the **Canonical Finding Contract**:

```yaml
finding_id: "find-8942-uuid"
source_observation_ids:
  - "obs-sysmon-98214"
sensor_domains:
  - "ENDPOINT_PROCESS"
derivation_chain:
  - "sigma-proc-injection-v2"
  - "anomaly-cmdline-len-v1"
correlation_group: "host-wkstn-891.internal"
independence_class: "SAME_OBSERVATION_DERIVATION" # SAME_OBSERVATION_DERIVATION, SAME_SENSOR_FAMILY, or CROSS_DOMAIN_ORTHOGONAL
```

- **Lineage Metadata Schema**:
  - `source_observation_ids`: Array of raw telemetry event identifiers serving as the root truth.
  - `sensor_domains`: Telemetry category (e.g. `ENDPOINT_PROCESS`, `NETWORK_FLOW`, `AUTHENTICATION_LOGS`, `DNS_RESOLVER`).
  - `derivation_chain`: Downstream detection rules, parsers, and machine learning models that derived signals from the observations.
  - `correlation_group`: Shared entity or infrastructure boundary (e.g. host UUID, user SID, private subnet).
  - `independence_class`: Classification of orthogonality (`SAME_OBSERVATION_DERIVATION`, `SAME_SENSOR_FAMILY`, or `CROSS_DOMAIN_ORTHOGONAL`).

- **Common Ancestry Discounting (Reference Heuristic Formulation)**:
  > [!NOTE]
  > **Epistemic Classification: Heuristic Reference Formulation**:
  > The dependency-discounting equations and thresholds below ($S \ge 75/100$) represent a **parameterized reference scoring heuristic**, not a closed-form theorem of Bayesian correctness. Heterogeneous telemetry streams exhibit non-linear causal couplings that violate simple conditional independence. TIDIR codifies these equations as an initial baseline architecture, subject to empirical calibration and validation under the Attack-to-Containment Benchmark Harness.

  - The Risk Lens estimates composite risk by evaluating **Evidence Lineage Domains**, discounting co-derived observables:
    $$S = f(\text{Adversary TTP Severity}, \text{Asset Criticality}, \text{Identity Privilege}, \text{Orthogonal Evidence Domains})$$
  - When two signals share identical `source_observation_ids` or upstream `derivation_chain` steps, the secondary signal's likelihood ratio ($LR$) is discounted to its residual information gain via the reference heuristic:
    $$LR_{\text{adjusted}}(e_2 \mid e_1) = 1 + (LR(e_2) - 1) \cdot (1 - \text{Overlap}(e_1, e_2))$$
    where $\text{Overlap}(e_1, e_2) \in [0, 1]$ parameterizes shared derivation ancestry and common sensor-family features.
  - *Orthogonal Domain Requirement*: Compound risk elevation ($S \ge 75/100$) requires corroboration across at least two distinct `sensor_domains` (e.g. an endpoint parent-child process relationship *and* an outbound connection to an unclassified Autonomous System Number / ASN) evaluated as `CROSS_DOMAIN_ORTHOGONAL`.
  - *Evidential vs. Statistical Independence*: In security telemetry, distinct sensor domains (e.g. host process events and network flows) may still be causally linked observations of the same underlying attacker activity. `CROSS_DOMAIN_ORTHOGONAL` does not assert literal statistical independence; it defines **sufficient evidential independence for the scoring heuristic, validated empirically** against production baselines to prevent co-derived finding inflation.
  - Isolated anomalies that fail to accumulate corroborating signals within a configurable time window decay naturally without operator intervention.

### 3. Deterministic Override Circuit (Preventing Single-Event False Negatives & Guarding Against Operational DoS)
- **The Threat**: Stealthy adversaries intentionally engineer single-action, low-telemetry exploits (e.g. Bring Your Own Vulnerable Driver / BYOVD kernel tampering, LSASS memory injection, or canary token detonation). Mandating multi-signal corroboration for all alerts introduces a **False Negative bias** where an intrusion is suppressed because subsequent detection stages were evaded.
- **Dual-Path Elevation Architecture**:
  - *Probabilistic Path (Weak Signals)*: Heuristics, statistical baselines, and behavioural anomalies continue through graph compounding and decay logic.
  - *Deterministic Override Circuit (Invariants & Canaries)*: Pre-certified high-consequence triggers—such as [ADR-0013](0013-ambient-deception-fabric-and-canary-anchors.md) canary honeytokens, blocklisted vulnerable kernel driver loads, or rapid cryptographic extension renaming—**bypass graph compounding entirely**.
  - When an override invariant triggers, the Risk Lens instantly assigns a critical composite score ($S = 100$) and dispatches an emergency OCSF Class 2004 finding directly to Layer 4 with zero correlation delay.
- **Dynamic Blast-Radius Rate Limiting (Anti-Operational DoS)**:
  - *Vulnerability*: Adversaries aware of deterministic trigger invariants could weaponize high-fidelity indicators (e.g. spoofing C2 beacons or planting canary hashes in shared volumes) to flood the SOC or force automated operational lockdowns.
  - *Token-Bucket Rate Limiter*: The deterministic bypass path enforces a strict token-bucket rate limiter constrained by identity context, asset class, and network subnet ($\beta_{\text{override}} \le N_{\max}/\Delta t$, e.g. max 5 override triggers per subnet/hour).
  - *Graceful Downgrade*: If the frequency of deterministic overrides exceeds the threshold for a given scope, the engine automatically downgrades subsequent triggers to high-priority Bayesian queueing ($S = 85$) with immediate notification to the lead detection engineer, preventing denial-of-service against the control plane while preserving alert visibility.

### 4. Composite Multi-Source Risk Ingress & Calibration

Real-world enterprise environments generate risk signals from heterogeneous internal and third-party engines. Rather than treating risk scoring as an opaque vendor black box, TIDIR standardizes a multi-source risk ingress and calibration pipeline:

1. **Multi-Source Signal Ingress Taxonomy**:
   - *Raw Telemetry Anomalies*: Statistical outliers and sliding-window threshold violations emitted by stateful stream engines (`DET-01`).
   - *Decayed Threat Intelligence Signals*: Dynamic indicator match confidence adjusted by half-life temporal decay curves (`CTI-02`).
   - *Product-Native Risk Scores*: Native severity and risk evaluations emitted by endpoint (EDR), network (NDR), and cloud security (CNAPP) appliances (e.g. Microsoft Defender, CrowdStrike Falcon, AWS GuardDuty). These are ingested as upstream probabilistic evidence rather than unquestioned ground truth.
   - *Third-Party & Comparative Risk Models*: External threat ratings, supply chain risk scores, and comparative industry benchmarks.
   - *Bespoke Enterprise Heuristics*: Custom business logic tailored to specific mission-critical assets, sensitive data enclaves, and regulatory boundaries.
2. **Shared Ancestry Calibration & Co-Derivation Discounting (Invariant 3)**:
   - When an upstream commercial EDR alert and a custom streaming SQL rule fire on the same underlying operating system event, both derivations trace to identical raw observations (`source_observation_ids`).
   - The Bayesian engine evaluates their `derivation_chain` lineage and discounts the secondary signal to its residual marginal information gain, permanently preventing co-derived signals from artificially compounding into an erroneous Sev-1 emergency.
3. **OCSF Finding Contract Normalization**:
   - Regardless of source, all risk evaluations are normalized into canonical OCSF Class 2001 (Security Finding) and Class 2004 (Detection Finding) envelopes with bounded 0–100 integer risk scores, ensuring uniform mathematical aggregation across the Bipartite Entity-Finding Graph ([ADR-0011](0011-bipartite-entity-finding-graph-consolidation.md)).

### Positive Consequences

* Suppresses the Base Rate Fallacy through dependency-aware multi-signal correlation; target engineering property: triage queue load reduction of $\gt 75\%$ relative to single-event alerting.
* Ensures that elevated findings delivered to an analyst carry a multi-signal contextual narrative.
* Prevents brittle thresholding from blinding the system to slow-and-low multi-stage intrusions.
* Guards against single-event suppression through the Deterministic Override Circuit.

### Negative Consequences

* Introduces short in-memory graph correlation windows (typically 15–30 minutes) before certain compound findings elevate.
* Highly sophisticated attacks executing an isolated single-action exploit against non-critical assets must rely on lakehouse batch sweeps (`DET-02`) if real-time corroboration is absent and no deterministic invariant rule applies.

### Architectural Invariant Mapping

* **Preserves**: `I2` (Evidence Provenance & Traceability via canonical observation IDs), `I3` (Evidential Independence via shared ancestry discounting), `I4` (Authority Separation by maintaining risk scores as analytical proposals).
* **Potential Tensions & Boundary Conditions**: `I6` (Bounded Autonomy) is managed via token-bucket rate limiters on the deterministic override circuit to prevent adversary-induced operational DoS.
* **Empirical Validation Strategy**: 30-day historical replay backtests asserting $\ge 75\%$ triage queue load reduction; atomic adversary canary injection verifying sub-second deterministic bypass.
