# 0006. Agent Evaluation Harness and Evals-as-Code

* Status: accepted
* Deciders: Architecture Team / Harry
* Date: 2026-09-15

## Context and Problem Statement

As autonomous AI agents assume responsibility for consequential cognitive workflows in the security operations lifecycle—such as natural language telemetry exploration, autonomous 30-day lakehouse baseline scoping, adversary hypothesis formulation, and threat flow codification—the risk of model hallucination, stochastic drift, and regression increases.

While Detection-as-Code (DaC) enforces strict unit testing, schema linting, and 30-day historical replay for declarative detection rules, generative agent workflows lack equivalent continuous integration verification. If an underlying model is updated, or if an agent prompt/tool definition changes, the quality of investigative dossiers, entity resolutions, and blast-radius estimations can silently degrade.

How does the architecture systematically measure, validate, and govern autonomous AI agent performance before deployment to production operations?

## Decision Drivers

* Continuous verification of agentic reasoning quality, tool execution precision, and hallucination bounds.
* Deterministic CI/CD regression gates parity with Detection-as-Code practices.
* Objective benchmarking against curated, realistic ground-truth security incidents.
* Cost and latency governance: enforcing token consumption and query latency budgets per agent invocation.

## Considered Options

1. **Ad-Hoc Manual Spot Checks**: Security analysts periodically review agent-generated case dossiers and triage notes.
2. **Generic LLM Benchmarks**: Rely on vendor-published benchmark scores (e.g. standard MMLU or coding benchmarks).
3. **Continuous Evals-as-Code with Assertion-First Harness and Golden Incident Corpus (Selected)**.

## Decision Outcome

Chosen option: **Continuous Evals-as-Code with Assertion-First Harness and Golden Incident Corpus**, because:
- **Evals-as-Code Repository Lifecycle**: Agent prompts, system guidelines, tool definitions, and scoring rubrics are managed as declarative code in version-controlled repositories, tested via automated CI/CD pipelines on every pull request.
- **Golden Incident Benchmark Dataset**:
  - Maintains a versioned corpus of representative security incidents across system, identity, network, and cloud attack archetypes.
  - Evaluation targets are explicitly stratified across the **Three-Tier Ground Truth Taxonomy**:
    1. *Objective Ground Truth*: Programmatically indisputable facts (synthetic atomic adversary emulation flags, canary credential hits, signed provenance attestations).
    2. *Expert Adjudication*: Consolidated, double-blind human consensus ratings from senior security analysts on hypothesis quality, scoping boundary precision, and investigation narrative coherence.
    3. *Operational Outcome*: Post-incident production validation (whether containment halted attacker advancement without operational side-effects, verified absence of recurrence over 30 days).
- **Assertion-First Dual Scoring Architecture**:
  - *Deterministic Assertions*: Programmatic pass/fail checks validating schema conformity (e.g. verifying that generated hypotheses strictly cite valid OCSF event IDs), tool call syntax, parameter validity, and token budget compliance.
  - *Structured Evaluation Judges*: Automated evaluation models evaluate qualitative reasoning against formal rubrics (e.g., hypothesis clarity, absence of unsupported speculation, containment plan completeness).
- **Regression Gates & Performance Budgets**: An agent prompt or harness modification cannot merge to production unless it meets strict thresholds:
  - $\ge 95\%$ grounding fidelity (zero ungrounded assertions).
  - $100\%$ schema-valid tool invocation syntax.
  - Enforcement of p95 latency ($\lt 5\text{s}$ for triage synthesis) and strict token spend ceilings.

### Positive Consequences

* Prevents behavioural degradation or hallucination regressions when switching or upgrading underlying model tiers.
* Transforms prompt engineering and agent design into an empirical, test-driven engineering discipline.
* Provides auditable, measurable metrics on autonomous triage accuracy for security leadership.

### Negative Consequences

* Requires ongoing curation and sanitization of production incidents to expand and refresh the golden benchmark corpus.
* Introduces CI/CD pipeline execution costs and time for running multi-case agent evaluation suites during pull requests.

### Scientific & Literature Grounding

* **Empirical Evaluations of Autonomous Cyber Capabilities**: [UK AI Security Institute [AISI] (2026)](/architecture/foundational-research#fnd-17), *Empirical Evaluations of Frontier Autonomous Cyber Capabilities*; [FND-17](/architecture/foundational-research#fnd-17).
* **Autonomous Exploit Testing & Benchmark Methodology**: [Fang et al. (2024)](https://arxiv.org/abs/2404.08144), *LLM Agents can Autonomously Exploit One-day Vulnerabilities*; [FND-17](/architecture/foundational-research#fnd-17).
* **Frontier Reasoning Model Evaluations & Guardrail Failure Modes**: [Anthropic (2026)](/architecture/foundational-research#fnd-17), *Claude Mythos System Card & Project Glasswing*; [FND-17](/architecture/foundational-research#fnd-17).
