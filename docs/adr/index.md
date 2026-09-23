# Architectural Decision Records (ADR) Registry

This directory serves as the immutable registry of **Architectural Decision Records (ADRs)** for the TIDIR platform. Every significant architectural, schema, runtime, and governance choice is documented following the [MADR (Markdown Architectural Decision Records)](template.md) standard.

---

## Registry Overview

All decisions are recorded as version-controlled markdown documents alongside the architecture specifications. Visual state machines and topologies within ADRs are authored in declarative Mermaid syntax and validated programmatically in CI/CD.

```
Total Decisions: 27 | Accepted: 27 | Deprecated: 0 | Superseded: 0
```

---

## 1. Governance & Strategy

| ADR | Title | Status | Deciders | Summary |
| :--- | :--- | :--- | :--- | :--- |
| [**0001**](0001-record-architecture-decisions.md) | **Record Architecture Decisions** | `accepted` | Architecture Team / Harry | Establishes MADR markdown records with version-controlled Mermaid diagrams as the governance standard. |
| [**0008**](0008-secops-error-budgets-and-chaos-security-engineering.md) | **SecOps Error Budgets & Chaos Engineering** | `accepted` | SecOps / SRE Team | Adopts SRE Alert Noise Error Budgets (false-positive rate $\le 5\%$) with automated CI/CD deployment freezes on budget exhaustion. |
| [**0010**](0010-sabsa-business-architecture-and-attribute-profiling.md) | **SABSA Alignment & Attribute Profiling** | `accepted` | Enterprise Architecture | Maps all TIDIR capabilities to the SABSA 6x6 matrix and operational security attribute profiles. |
| [**0021**](0021-graceful-degradation-automated-fallback-and-continuity-plan-b.md) | **Graceful Degradation & Continuity Plan B** | `accepted` | Architecture / SecOps / SRE | Codifies a 4-tier capabilities-driven degradation model, failure detection probes, and automated Plan B fallbacks across all layers. |
| [**0026**](0026-end-to-end-coverage-assurance-and-degradation-circuit-breakers.md) | **End-to-End Coverage Assurance & Circuit Breakers** | `accepted` | Architecture / Detection Leads / Harry | Establishes a 10-step verification chain, active purple-team emulation canaries, and automated confidence-capping circuit breakers. |

---

## 2. Data Fabric & Ingress

| ADR | Title | Status | Deciders | Summary |
| :--- | :--- | :--- | :--- | :--- |
| [**0002**](0002-preserve-unmapped-telemetry-in-ocsf.md) | **Preserve Unmapped OCSF Telemetry** | `accepted` | Data Engineering | Mandates preserving non-standard raw fields inside an `unmapped_data` JSON object to prevent telemetry loss. |
| [**0015**](0015-sandboxed-agent-execution-otlp-convergence-and-ephemeral-identity.md) | **Sandboxed Agent Execution & OTLP Convergence** | `accepted` | SecOps / AI Platform | Runs specialist agents in gVisor/Firecracker microVMs emitting standard OTLP spans, unified with enterprise APM. |
| [**0016**](0016-just-in-time-telemetry-elevation-and-ephemeral-forensics.md) | **JIT Telemetry Elevation & Ephemeral Forensics** | `accepted` | SecOps / Detection Leads | Implements dynamic agent-driven sensor elevation (eBPF, PCAP, memory) with strict TTLs ($\le 30\,\text{min}$) and auto-eviction. |
| [**0025**](0025-pre-detection-telemetry-provenance-and-ingestion-lineage.md) | **Pre-Detection Telemetry Provenance & Lineage** | `accepted` | Architecture / Data Engineering / Harry | Extends the Evidence DAG upstream using W3C Trace Context and micro-batch transform hashes to eliminate pipeline blind spots. |

---

## 3. Detection Engineering & Threat Intelligence

| ADR | Title | Status | Deciders | Summary |
| :--- | :--- | :--- | :--- | :--- |
| [**0007**](0007-continuous-automated-purple-teaming-and-multi-model-consensus.md) | **Continuous Purple Teaming & Consensus** | `accepted` | Detection Engineering | Enforces automated adversary emulation in CI/CD with Proposer/Challenger multi-model consensus on rule logic. |
| [**0009**](0009-bayesian-multi-signal-risk-scoring.md) | **Bayesian Multi-Signal Risk Scoring** | `accepted` | Detection Engineering | Overcomes the Base Rate Fallacy by compounding orthogonal weak signals (asset, identity, network) into a composite score. |
| [**0011**](0011-bipartite-entity-finding-graph-consolidation.md) | **Bipartite Entity-Finding Graph Consolidation** | `accepted` | Detection & Graph Leads | Structures detection correlation as a bipartite graph of Entities and Findings with community detection clustering. |
| [**0013**](0013-ambient-deception-fabric-and-canary-anchors.md) | **Ambient Deception Fabric & Canary Anchors** | `accepted` | SecOps / Red Team | Deploys low-overhead honeytokens and canary assets emitting zero-noise high-confidence alerts with instant triage priority. |
| [**0019**](0019-polyglot-detection-as-code-and-native-engine-adaptation.md) | **Polyglot Detection-as-Code & Native Engines** | `accepted` | Architecture / Detection Leads | Pairs vendor-neutral YAML metadata envelopes with target-optimized query blocks (KQL, SPL, SQL) and AI-driven parity testing. |
| [**0022**](0022-exposure-management-and-continuous-threat-exposure-integration.md) | **Exposure Management & CTEM Integration** | `accepted` | Architecture / Threat Intel / Detection | Integrates Exposure Intelligence as bidirectional prior probabilities and closed-loop realized risk feedback. |
| [**0023**](0023-distributed-detection-and-edge-to-center-correlation.md) | **Distributed Detection & Edge Correlation** | `accepted` | Architecture / Detection Leads | Establishes local native detection, central cross-domain correlation, and on-demand contextual telemetry retrieval. |
| [**0024**](0024-finding-bus-architecture-lineage-and-finding-contract.md) | **Finding Bus Architecture & OCSF Finding Contract** | `accepted` | Architecture / Detection Leads / Harry | Establishes an open publish-subscribe boundary for distributed detections in OCSF Class 2001/2004 with explicit parent lineage. |

---

## 4. Investigation & Automated Response

| ADR | Title | Status | Deciders | Summary |
| :--- | :--- | :--- | :--- | :--- |
| [**0003**](0003-graph-supernode-pruning-and-clustering-boundaries.md) | **Supernode Pruning & Graph Boundaries** | `accepted` | Investigation Leads | Solves graph explosion by pruning high-degree utility nodes (DNS, shared DCs) during automated graph traversal. |
| [**0005**](0005-saga-pattern-containment-and-break-glass-protocol.md) | **Asymmetric Containment & Break-Glass Protocol** | `accepted` | SecOps Leads | Executes containment as distributed Sagas with forward escalation on failure and audited human-in-the-loop break-glass overrides. |
| [**0020**](0020-operator-skill-retention-and-incident-replay-simulators.md) | **Operator Skill Retention & Incident Replay** | `accepted` | SecOps / AI Platform | Counteracts the Ironies of Automation via forensic currency quotas, workload throttling, and incident replay simulators. |
| [**0027**](0027-first-principles-workflow-orchestration-and-automation-as-code.md) | **First-Principles Workflow & Automation-as-Code** | `accepted` | Architecture / SecOps / Platform / Harry | Replaces monolithic SOAR with a 4-plane decoupled architecture: Automation-as-Code, durable orchestration, polyglot sandboxed workers, and JIT secrets. |

---

## 5. AI Runtime, Agent Safety & Observability

| ADR | Title | Status | Deciders | Summary |
| :--- | :--- | :--- | :--- | :--- |
| [**0004**](0004-defensive-ai-runtime-and-prompt-injection-firewall.md) | **Defensive AI & Agent Trust Boundary** | `accepted` | AI Platform / SecOps | Isolates untrusted telemetry payloads to a sandboxed Data Plane, preventing indirect prompt injection attacks. |
| [**0006**](0006-agent-evaluation-harness-evals-as-code.md) | **Agent Evaluation Harness (Evals-as-Code)** | `accepted` | AI Platform Leads | Implements continuous regression testing of agent prompts and triage accuracy against versioned golden datasets. |
| [**0012**](0012-ai-orchestration-runtime-mcp-and-mvp-roadmap.md) | **AI Orchestration Runtime & MCP Roadmap** | `accepted` | AI Platform / Architecture | Standardises tool interfaces on the Model Context Protocol (MCP) and defines phased MVP milestones. |
| [**0014**](0014-ai-observability-self-learning-and-slm-judges.md) | **AI Observability & SLM Judges** | `accepted` | AI Platform Leads | Deploys local Small Language Model (SLM) judges for real-time hallucination checks, groundedness audits, and cost tracking. |
| [**0017**](0017-agent-fleet-control-plane-and-runtime-observability.md) | **Agent Fleet Control Plane & Loop Breakers** | `accepted` | AI Platform Leads | Implements supervisor-driven agent lifecycle management, zombie task reaping, semantic loop breakers, and priority preemption. |
| [**0018**](0018-non-human-identity-lifecycle-and-machine-attestation.md) | **Non-Human Identity Lifecycle & Machine Attestation** | `accepted` | Identity / Cloud Security | Enforces cryptographic SPIFFE/SPIRE attestation for ephemeral agent identities and line-rate profiling of service credentials. |

---

## Proposing New Architecture Decisions

To propose a new architecture decision:
1. Copy [`template.md`](template.md) to a new file: `docs/adr/00XX-my-decision-title.md`.
2. Populate the context, decision drivers, considered options, and trade-offs.
3. Submit a Pull Request following the [Contributing Guide](../../CONTRIBUTING.md).
