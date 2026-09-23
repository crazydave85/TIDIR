# 0008. SecOps Error Budgets and Chaos Security Engineering

* Status: accepted
* Deciders: Architecture Team / Harry
* Date: 2026-09-15

## Context and Problem Statement

In high-throughput security operations, the relationship between detection engineering velocity and front-line analyst cognitive sustainability is often unmanaged. Detection engineers deploy rules that appear functional in isolation but generate excessive false-positive volume under live operational conditions, externalising the cost of noisy logic onto tier-1 analysts and driving severe alert fatigue.

Automated response playbooks and distributed containment workflows interact with complex distributed APIs (endpoint control planes, cloud identity providers, perimeter firewalls). Under real-world intrusion conditions, these APIs experience network latency, throttling ($429$), and partial downtime. If automated containment workflows are only tested under ideal laboratory conditions, their resilience under catastrophic attack conditions remains unverified.

How does the architecture balance detection deployment velocity with analyst cognitive sustainability, while ensuring that automated containment workflows withstand distributed network faults?

## Decision Drivers

* Elimination of alert fatigue by holding detection engineering accountable for false-positive operational load.
* Continuous resilience verification of distributed containment connectors and monotonic fail-closed state machines.
* Alignment of security operations with established Site Reliability Engineering (SRE) principles.
* Strict adherence to capability-oriented paradigms and British English conventions.

## Considered Options

1. **Unconstrained Rule Deployment with Post-Hoc Tuning**: Allow detection engineers to deploy rules without volume quotas, tuning only after operational complaints.
2. **Strict Alert Caps**: Hard-cap the number of alerts emitted per day, dropping any excess findings.
3. **SecOps Error Budgets and Chaos Security Engineering (Selected)**.

## Decision Outcome

Chosen option: **SecOps Error Budgets and Chaos Security Engineering**, because:

### 1. The SecOps Alert Noise Budget
- Borrowing from SRE error budget management, every functional detection category (e.g. Endpoint, Identity, Cloud Control Plane, Network) is assigned a measurable **Noise Budget**:
  $$\text{Noise Ratio} = \frac{\text{Benign / False-Positive Findings}}{\text{Total Elevated Findings}} \times 100$$
- The target Service Level Objective (SLO) mandates a Noise Ratio of $\le 5\%$ across all elevated incident dossiers.
- **Automated Deployment Freeze**:
  - The Detection-as-Code CI/CD runner continuously tracks the 30-day rolling Noise Budget per detection category.
  - If a specific detection domain burns through its monthly Noise Budget ($\gt 5\%$ false-positive rate), the deployment pipeline automatically places an **Engineering Deployment Freeze** on that domain.
  - No new detection rules can be merged for that category until the noisy rules are tuned, refactored, or decommissioned in Git.

### 2. Chaos Security Engineering in Continuous Purple Teaming
- The automated adversary emulation pipeline ([ADR-0007](0007-continuous-automated-purple-teaming-and-multi-model-consensus.md)) is extended with an active **Chaos Security Engine**.
- During pre-production validation, the test harness injects synthetic faults while adversary techniques are executing:
  - *Telemetry Partitions*: Artificially drops or delays streaming log partitions to test late-arrival watermarking.
  - *Connector Faults*: Simulates HTTP 429 rate limits, socket timeouts, and intermittent 5xx responses from third-party enforcement APIs.
- The pipeline asserts that the **Containment Orchestrator** ([ADR-0005](0005-saga-pattern-containment-and-break-glass-protocol.md)) detects the failure, trips the circuit breaker, and executes asymmetric forward escalation without rolling back security barriers.

### Positive Consequences

* Quantifies and protects front-line analyst cognitive capacity through automated engineering gates.
* Transforms resilience from an assumption into an empirically verified property of the response fabric.
* Aligns SecOps performance metrics with modern enterprise SRE standards.

### Negative Consequences

* Deployment freezes may temporarily delay the release of new detection coverage while existing rules are tuned.
* Chaos testing requires dedicated staging sandboxes that mirror production API latency and failure states.
