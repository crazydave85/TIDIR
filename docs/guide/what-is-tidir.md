# What is TIDIR?

> **Tier 1: Strategic Architecture** · **Audience**: All Audiences · **Normative Status**: Informational / Orientation  
> **Prerequisites**: None · **Next Step**: [Architectural Invariants & Constitution](/architecture/00-architectural-invariants)

---

## The Challenge: Asymmetric Deficit in Security Operations

Modern security operations are trapped in an escalating asymmetry:
* **Attackers** leverage automated vulnerability scanning, opportunistic exploit scripts, and emerging LLM-assisted vulnerability exploitation ([NCSC Assessment on AI and Cyber Threat](https://www.ncsc.gov.uk/report/impact-of-ai-on-cyber-threat); [Fang et al., 2024](https://arxiv.org/abs/2404.08144)), while relying on living-off-the-land techniques to achieve average breakout times under 62 minutes ([CrowdStrike Global Threat Report](https://www.crowdstrike.com/global-threat-report/)).
* **Defenders** remain encumbered by proprietary data silos, restrictive ingestion licensing penalties, alert fatigue mathematically driven by the Base-Rate Fallacy ([Axelsson 2000](https://doi.org/10.1145/357830.357849)), and brittle, manual triage runbooks.

Traditional Security Information and Event Management (SIEM) and Security Orchestration, Automation, and Response (SOAR) stacks attempt to bridge this gap through heuristic alert rules and unconstrained playbook scripts. In practice, this produces either paralysis (thousands of low-fidelity alerts) or dangerous fragility (uncontrolled automation causing self-inflicted business outages). Detailed lineage of these claims is cataloged in [Foundational Research & Literature](/architecture/foundational-research).

---

## The TIDIR Response: A Closed-Loop Cyber Defence Control System

**TIDIR** (Threat Intelligence, Detection, Investigation & Response) is an open, vendor-neutral target technology component architecture. It defines the formal boundaries, declarative schemas, and mathematical invariants required to transform security operations into a **closed-loop feedback control system**:

$$\text{Observe} \longrightarrow \text{Normalise} \longrightarrow \text{Infer} \longrightarrow \text{Investigate} \longrightarrow \text{Decide} \longrightarrow \text{Actuate} \longrightarrow \text{Learn}$$

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           THE TIDIR OPERATING MAXIM                             │
│                                                                                 │
│         "Probabilistic components propose. Deterministic components authorise." │
└─────────────────────────────────────────────────────────────────────────────────┘
```

Rather than treating AI agents or statistical classifiers as autonomous decision-makers, TIDIR establishes a strict boundary:
1. **Probabilistic Systems (LLMs, clustering algorithms, risk models)** operate exclusively in an analytical and proposal capacity.
2. **Deterministic Systems (policy kernels, cryptographic identity issuers, monotonic state machines)** authorize and enforce mutations in the real world.

---

## The 5 Core Principles That Define TIDIR

1. **Confidence is not Authority**: Epistemic confidence ($99.9\%$ likelihood of compromise) does not confer operational authority to sever network links or isolate hosts. Authority is independently derived from policy, identity, and blast-radius constraints.
2. **Evidence Requires Provenance and Independence**: Every assertion must link to immutable raw telemetry. Correlated derivations sharing common upstream ancestry are discounted rather than double-counted.
3. **Probabilistic Reasoning Must Remain Bounded**: Generative models and autonomous triage agents operate behind the **Agent Trust Boundary**, consuming typed schemas rather than raw executable text strings.
4. **Defensive Actuation Must Respect Security-State Monotonicity**: Partial failure during containment cannot silently regress security posture ($s_{n+1} \preceq s_n$). Forward compensation is permitted; reopening compromised perimeters is not.
5. **Complex Defence Must Degrade Gracefully**: If streaming event buses or cloud AI gateways fail, defence does not disappear—it degrades gracefully to local edge spooling, scheduled batch lakehouse sweeps, and rule-based tabular timelines.

---

## Next Steps on the Golden Path

To explore the architecture systematically, proceed through the architectural orientation:

* ➡️ **Step 2**: [The Architectural Constitution & Invariants](/architecture/00-architectural-invariants)
* ➡️ **Step 3**: [System Overview & The 4-Plane Model](/architecture/01-system-overview)
* ➡️ **Scientific Foundations**: [Foundational Research & Literature](/architecture/foundational-research)
* ➡️ **Step 4**: [The Capability & Service Delivery Model](/architecture/02-capability-model)
* ➡️ **Step 5**: [The Target Threat Model & Assurance Case](/architecture/09-threat-model)
