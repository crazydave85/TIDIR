import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

console.log("📦 Compiling authoritative machine-readable architecture graph (architecture.json)...");

const pkg = JSON.parse(readFileSync("package.json", "utf-8"));

interface Invariant {
  id: string;
  name: string;
  title: string;
  normative: boolean;
  maxim: string;
  property: string;
  reference_pattern?: string;
}

interface Capability {
  id: string;
  name: string;
  domain: string;
  execution_mode: "Deterministic Engine" | "AI/Agent-Augmented" | "Human-in-the-Loop";
  description: string;
  target_slo: string;
  invariants_enforced: string[];
}

interface Service {
  id: string;
  name: string;
  macro_capability: string;
  description: string;
  underpinning_capabilities: string[];
}

interface Threat {
  id: string;
  name: string;
  stride: string;
  description: string;
  underpinning_capabilities: string[];
  mitigated_by_invariants: string[];
  governing_adrs: string[];
}

interface ArchitecturalModel {
  schema_version: string;
  architecture_version: string;
  generated_at: string;
  canonical_source: string;
  title: string;
  description: string;
  maxim: string;
  four_planes: {
    data_plane: string;
    analytical_plane: string;
    defence_control_plane: string;
    actuation_plane: string;
  };
  tcb_components: string[];
  invariants: Invariant[];
  capabilities: Capability[];
  services: Service[];
  threats: Threat[];
}

const model: ArchitecturalModel = {
  schema_version: "1.0.0",
  architecture_version: pkg.version,
  generated_at: new Date().toISOString(),
  canonical_source: "https://tidir.harrymclaren.co.uk",
  title: "TIDIR Reference Architecture Graph",
  description: "Machine-readable graph representation of TIDIR invariants, capabilities, services, threats, and governance contracts.",
  maxim: "Probabilistic components propose. Deterministic components authorise.",
  four_planes: {
    data_plane: "Line-rate ingestion, streaming buses, and raw lakehouse storage. Untrusted telemetry inputs.",
    analytical_plane: "Detection engines, graph correlators, and probabilistic agent meshes. Advisory analysis without inherent authority.",
    defence_control_plane: "Security kernel governing policy evaluation, invariant enforcement, blast-radius validation, identity issuance, and emergency E-Stops.",
    actuation_plane: "Outbound API connectors, endpoint EDR agents, and identity providers. Task-scoped execution with monotonic reachability guarantees."
  },
  tcb_components: [
    "Identity Authority (SPIFFE/SPIRE)",
    "Declarative Policy Kernel (OPA/Cedar)",
    "Containment State Machine",
    "Cryptographic Evidence DAG"
  ],
  invariants: [
    {
      id: "INV-01",
      name: "Telemetry Preservation",
      title: "Absence of current detection value does not justify destruction of forensic evidence",
      normative: true,
      maxim: "Absence of current detection value does not justify destruction of forensic evidence.",
      property: "Raw forensic evidence is preserved in open, vendor-neutral formats unless explicitly governed by statutory minimization, legal privilege, or credential sanitization policies; arbitrary edge dropping is prohibited.",
      reference_pattern: "Line-rate stream ingestion into open columnar lakehouses (e.g. Apache Iceberg / Parquet) on object storage."
    },
    {
      id: "INV-02",
      name: "Evidence Traceability",
      title: "Every consequential machine assertion is traceable to underlying raw observations",
      normative: true,
      maxim: "Every consequential machine assertion is traceable to underlying raw observations.",
      property: "Every consequential alert, finding, or incident assertion must be deterministically traceable to underlying raw observations.",
      reference_pattern: "source_observation_ids and derivation_chain lineage committed to the Incident Decision DAG."
    },
    {
      id: "INV-03",
      name: "Evidential Independence",
      title: "Common ancestry cannot be represented as independent corroboration",
      normative: true,
      maxim: "Common ancestry cannot be represented as independent corroboration.",
      property: "Correlated derivations sharing common raw telemetry ancestry cannot masquerade as independent evidence; co-derived signals must be discounted.",
      reference_pattern: "Dependency-aware probabilistic risk compounding (Bayesian graph compounding or factor graphs)."
    },
    {
      id: "INV-04",
      name: "No Self-Granting Authority (Authority Separation)",
      title: "Probabilistic components propose. Deterministic components authorize",
      normative: true,
      maxim: "Probabilistic components propose. Deterministic components authorize.",
      property: "Probabilistic models propose; deterministic policies authorise. Reasoning agents operate strictly in read-only analysis mode.",
      reference_pattern: "Agent Trust Boundary isolating data plane from control plane; deterministic schema AST validation."
    },
    {
      id: "INV-05",
      name: "Least Capability & Ephemeral Identity",
      title: "Machine identities receive only task-scoped, short-lived authority",
      normative: true,
      maxim: "Machine identities receive only task-scoped, short-lived authority.",
      property: "Every machine actor receives only task-scoped, ephemeral authority with cryptographic workload identity (TTL $\\le 15\\text{m}$, max 15 minutes).",
      reference_pattern: "SPIFFE/SPIRE Verifiable Identity Documents (SVIDs) valid for <= 15 minutes."
    },
    {
      id: "INV-06",
      name: "Bounded Autonomy & Blast Radius",
      title: "Autonomous execution is strictly constrained by time, cost, scope, and blast radius",
      normative: true,
      maxim: "Autonomous execution is strictly constrained by time, cost, scope, and blast radius.",
      property: "Autonomous execution has strict temporal, financial, computational, and blast-radius limits with critical asset immunity.",
      reference_pattern: "Pre-execution impact simulation with Tier 0 critical asset immunity."
    },
    {
      id: "INV-07",
      name: "Reachability Monotonicity (Fail-Secure Posture)",
      title: "Partial failure cannot silently restore attacker reachability (s_{n+1} <= s_n)",
      normative: true,
      maxim: "Partial failure cannot silently restore attacker reachability.",
      property: "Component failure cannot silently increase attacker reachability relative to the validated environmental model ($s_{n+1} \\preceq s_n$, where $\\hat{\\mathcal{R}}_A(s_{\\text{post}}, \\mathcal{M}_t) \\subseteq \\hat{\\mathcal{R}}_A(s_{\\text{pre}}, \\mathcal{M}_t)$).",
      reference_pattern: "Monotonic state machines executing forward perimeter escalation rather than rolling back security barriers."
    },
    {
      id: "INV-08",
      name: "Graceful Defensive Degradation",
      title: "Failure of an advanced capability reduces sophistication, never total visibility",
      normative: true,
      maxim: "Failure of an advanced capability reduces sophistication, never total visibility.",
      property: "Loss of an advanced capability reduces sophistication, never total visibility (graceful degradation and Plan B fallbacks).",
      reference_pattern: "4-tier degradation: local edge spooling, scheduled batch lakehouse sweeps, and rule-based tabular timelines."
    },
    {
      id: "INV-09",
      name: "Human Recoverability & Break-Glass Flight Decks",
      title: "Autonomous control planes always preserve independently accessible manual flight decks",
      normative: true,
      maxim: "Autonomous control planes always preserve independently accessible manual flight decks.",
      property: "Autonomous control planes always preserve independently accessible manual flight decks and master break-glass emergency stops.",
      reference_pattern: "Cryptographic Master E-Stop and authenticated dual-authorization break-glass protocols."
    },
    {
      id: "INV-10",
      name: "Reconstructability (The Incident Decision DAG)",
      title: "Consequential decisions can be deterministically reconstructed from immutable records",
      normative: true,
      maxim: "Consequential decisions can be deterministically reconstructed from immutable records.",
      property: "Consequential decisions and containment actions can be deterministically reconstructed after the fact via the Incident Decision DAG.",
      reference_pattern: "Incident Decision DAG sealed with RFC 3161 cryptographic timestamps and WORM storage."
    },
    {
      id: "INV-11",
      name: "Operational Portability & Exit",
      title: "Vendor neutrality is an architectural invariant, not merely a design intention",
      normative: true,
      maxim: "Vendor neutrality is an architectural invariant, not merely a design intention.",
      property: "No consequential security telemetry, detection logic, case state, policy definition, or audit lineage SHALL be irrecoverably dependent upon a proprietary execution environment.",
      reference_pattern: "Open standards: OCSF schema, Parquet/Iceberg storage, Polyglot DaC, STIX/TAXII 2.1, and open JSON-LD DAGs."
    }
  ],
  capabilities: [
    {
      id: "CAP-CTI-01",
      name: "Feed Aggregation & Ingestion",
      domain: "Cyber Threat Intelligence",
      execution_mode: "Deterministic Engine",
      description: "Ingest commercial, open-source, ISAC, and internal telemetry feeds via STIX/TAXII and streaming endpoints.",
      target_slo: "Ingestion latency < 5 min from publication",
      invariants_enforced: ["INV-01", "INV-11"],
      mitre_d3fend: ["D3-TIE", "D3-IDA"]
    },
    {
      id: "CAP-CTI-02",
      name: "Deduplication & Confidence Scoring",
      domain: "Cyber Threat Intelligence",
      execution_mode: "Deterministic Engine",
      description: "Normalize disparate indicator types, resolve overlapping claims, and compute half-life decay curves.",
      target_slo: "Automated decay curves calculated daily",
      invariants_enforced: ["INV-02", "INV-03"],
      mitre_d3fend: ["D3-IDA", "D3-FEH"]
    },
    {
      id: "CAP-CTI-05",
      name: "Retroactive Sweep (Retro-Hunt)",
      domain: "Cyber Threat Intelligence",
      execution_mode: "Deterministic Engine",
      description: "Automatically sweep historical lakehouse telemetry upon discovery of novel zero-day IOCs/TTPs.",
      target_slo: "90-day sweep executed in < 15 min",
      invariants_enforced: ["INV-01", "INV-10"],
      mitre_d3fend: ["D3-HA", "D3-IRA"]
    },
    {
      id: "CAP-DATA-01",
      name: "Multi-Source Ingestion",
      domain: "Telemetry & Data Fabric",
      execution_mode: "Deterministic Engine",
      description: "Collect telemetry from host kernel instrumentation, cloud control planes, identity tokens, and network sensors.",
      target_slo: "Durable acknowledgement; designed for loss-intolerant ingestion with local buffer failover",
      invariants_enforced: ["INV-01", "INV-08"],
      mitre_d3fend: ["D3-HPA", "D3-MTC"]
    },
    {
      id: "CAP-DATA-02",
      name: "Canonical Schema Normalization",
      domain: "Telemetry & Data Fabric",
      execution_mode: "Deterministic Engine",
      description: "Coerce raw schema structures into OCSF objects at line rate with structured unmapped_data catch-all.",
      target_slo: "Normalization overhead < 5ms per event",
      invariants_enforced: ["INV-01", "INV-11"],
      mitre_d3fend: ["D3-SVE", "D3-DLQ"]
    },
    {
      id: "CAP-DATA-05",
      name: "Historical Security Lakehouse",
      domain: "Telemetry & Data Fabric",
      execution_mode: "Deterministic Engine",
      description: "Store long-term telemetry in open columnar formats with partition pruning on object storage.",
      target_slo: "365+ day retention with sub-linear cost",
      invariants_enforced: ["INV-01", "INV-11"],
      mitre_d3fend: ["D3-WORM", "D3-FEH"]
    },
    {
      id: "CAP-DET-01",
      name: "Real-Time Stream Detection",
      domain: "Detection Engineering",
      execution_mode: "Deterministic Engine",
      description: "Evaluate sliding-window stateful rules and pattern matches against line-rate event streams.",
      target_slo: "Time-to-detect (MTTD) < 5 seconds",
      invariants_enforced: ["INV-04", "INV-08"],
      mitre_d3fend: ["D3-PSA", "D3-NTA"]
    },
    {
      id: "CAP-DET-05",
      name: "Bayesian Multi-Signal Risk Lens",
      domain: "Detection Engineering",
      execution_mode: "Deterministic Engine",
      description: "Compound orthogonal evidence vectors (asset, identity, network) while discounting co-derived signals.",
      target_slo: "Dynamic composite score (0-100); false alarms < 5%",
      invariants_enforced: ["INV-03", "INV-04"],
      mitre_d3fend: ["D3-BCA", "D3-EIC"]
    },
    {
      id: "CAP-DET-07",
      name: "Deception & Canary Surface Fabric",
      domain: "Detection Engineering",
      execution_mode: "Deterministic Engine",
      description: "Embed lightweight honeytokens, Kerberos SPN decoys, and file lures emitting OCSF canary events for zero-noise detection.",
      target_slo: "False Positive Rate = 0.00%; MTTD < 1 second",
      invariants_enforced: ["INV-03", "INV-04"],
      mitre_d3fend: ["D3-DN", "D3-HT"]
    },
    {
      id: "CAP-INV-05",
      name: "Agent Mesh & Multi-Model Consensus",
      domain: "Investigation & Cases",
      execution_mode: "AI/Agent-Augmented",
      description: "Coordinate specialist subagents with adversarial Proposer/Challenger critique behind the Agent Trust Boundary.",
      target_slo: "MTTI < 60s; > 80% consensus",
      invariants_enforced: ["INV-02", "INV-04", "INV-05"],
      mitre_d3fend: ["D3-MDA", "D3-IT"]
    },
    {
      id: "CAP-INV-07",
      name: "Just-in-Time (JIT) Telemetry Elevation",
      domain: "Investigation & Cases",
      execution_mode: "AI/Agent-Augmented",
      description: "Programmatically command edge sensors to elevate collection fidelity (eBPF, PCAP, memory) for bounded windows (TTL <= 30m).",
      target_slo: "Elevation command dispatch < 10 sec; 48h auto-eviction",
      invariants_enforced: ["INV-01", "INV-05"],
      mitre_d3fend: ["D3-SCA", "D3-JIT"]
    },
    {
      id: "CAP-AIGOV-02",
      name: "Dual-Plane Data/Control Isolation",
      domain: "AI Governance & Verification",
      execution_mode: "Deterministic Engine",
      description: "Enforces strict boundaries preventing unformatted raw telemetry strings from acting as agent control instructions.",
      target_slo: "Zero instruction execution from untrusted log payloads",
      invariants_enforced: ["INV-04", "INV-05"],
      mitre_d3fend: ["D3-IT"]
    },
    {
      id: "CAP-AIGOV-06",
      name: "Ephemeral Agent Attestation & SVIDs",
      domain: "AI Governance & Verification",
      execution_mode: "Deterministic Engine",
      description: "Cryptographic SPIFFE/SPIRE attestation issuing task-scoped, short-lived X.509 SVIDs (TTL <= 15m) for every agent worker.",
      target_slo: "Dynamic SVID minting < 100ms; auto-revocation on task closure",
      invariants_enforced: ["INV-04", "INV-05"],
      mitre_d3fend: ["D3-LAM", "D3-SVID"]
    },
    {
      id: "CAP-RESP-02",
      name: "Monotonic Containment & Forward Escalation",
      domain: "Automated Response",
      execution_mode: "Deterministic Engine",
      description: "Fail-secure execution preventing security regression on error; escalates perimeter forward.",
      target_slo: "100% fail-secure posture; MTTR < 60 min",
      invariants_enforced: ["INV-06", "INV-07", "INV-09"],
      mitre_d3fend: ["D3-SMS", "D3-FE"]
    }
  ],
  services: [
    {
      id: "SVC-1.1",
      name: "Dynamic Threat Intelligence & Indicator Cache",
      macro_capability: "Threat Horizon & Continuous Intelligence",
      description: "Continuous ingestion, normalisation, and automated confidence-decay scoring with in-memory edge matching.",
      underpinning_capabilities: ["CAP-CTI-01", "CAP-CTI-02"]
    },
    {
      id: "SVC-1.2",
      name: "Automated Retrospective Hunting Sweeps",
      macro_capability: "Threat Horizon & Continuous Intelligence",
      description: "Asynchronous 365+ day historical lakehouse scans upon zero-day emergence.",
      underpinning_capabilities: ["CAP-CTI-05", "CAP-DATA-05"]
    },
    {
      id: "SVC-2.1",
      name: "Universal Ingestion & Line-Rate OCSF Normalisation",
      macro_capability: "Universal Telemetry Fabric & Open Lakehouse",
      description: "High-throughput collection across host, cloud, and network sensors compiled into canonical OCSF.",
      underpinning_capabilities: ["CAP-DATA-01", "CAP-DATA-02"]
    },
    {
      id: "SVC-4.1",
      name: "Agentic Triage & Progressive Disclosure Investigation",
      macro_capability: "Autonomous Investigation & Gated Containment",
      description: "Hierarchical agent mesh, Agent Trust Boundary, and progressive Situation Summaries.",
      underpinning_capabilities: ["CAP-INV-05"]
    },
    {
      id: "SVC-4.2",
      name: "Blast-Radius Gated Containment & Monotonic State Machines",
      macro_capability: "Autonomous Investigation & Gated Containment",
      description: "Pre-execution impact simulation, fail-closed forward escalation, and reachability monotonicity.",
      underpinning_capabilities: ["CAP-RESP-02"]
    }
  ],
  threats: [
    {
      id: "THR-T1",
      name: "Sensor Evasion & Telemetry Blinding",
      stride: "Spoofing / Tampering",
      description: "Attacker unloads kernel sensors, disrupts transport forwarders, or exploits network partitions to evade detection.",
      underpinning_capabilities: ["CAP-DATA-01", "RESIL-01", "RESIL-02"],
      mitigated_by_invariants: ["INV-01", "INV-08"],
      governing_adrs: ["ADR-0021"],
      mitre_attack: ["T1562.001", "T1070"],
      mitre_atlas: ["AML.T0015"],
      mitre_d3fend: ["D3-MTC", "D3-HPA", "D3-SFL"]
    },
    {
      id: "THR-T2",
      name: "Schema Poisoning & DoS Inundation",
      stride: "Tampering / Denial of Service",
      description: "Adversary emits malformed payloads or unmapped event floods to exhaust pipeline memory or crash parsers.",
      underpinning_capabilities: ["CAP-DATA-02", "CAP-DATA-03"],
      mitigated_by_invariants: ["INV-01", "INV-11"],
      governing_adrs: ["ADR-0002"],
      mitre_attack: ["T1565.002", "T1499"],
      mitre_atlas: ["AML.T0020"],
      mitre_d3fend: ["D3-SVE", "D3-DLQ", "D3-RPL"]
    },
    {
      id: "THR-T3",
      name: "Evidence Tampering & Audit Destruction",
      stride: "Repudiation",
      description: "Compromised administrator attempts to purge or modify investigative query logs and case dossiers.",
      underpinning_capabilities: ["CAP-INV-04", "RESIL-05"],
      mitigated_by_invariants: ["INV-02", "INV-10"],
      governing_adrs: ["ADR-0001", "ADR-0010"],
      mitre_attack: ["T1070.003", "T1485", "T1565.001"],
      mitre_atlas: ["AML.T0024"],
      mitre_d3fend: ["D3-WORM", "D3-CH", "D3-TSA"]
    },
    {
      id: "THR-T4",
      name: "Indirect Prompt Injection & Instruction Manipulation",
      stride: "Elevation of Privilege",
      description: "Adversary embeds malicious control directives inside command line arguments, log files, or CTI reports.",
      underpinning_capabilities: ["CAP-INV-05", "CAP-AIGOV-02", "CAP-AIGOV-06"],
      mitigated_by_invariants: ["INV-04", "INV-05"],
      governing_adrs: ["ADR-0004", "ADR-0015"],
      mitre_attack: ["T1059", "T1548"],
      mitre_atlas: ["AML.T0051", "AML.T0057", "AML.T0054"],
      mitre_d3fend: ["D3-IT", "D3-LAM", "D3-MDA"]
    },
    {
      id: "THR-T5",
      name: "Alert Storm DoS & Analyst Desensitisation",
      stride: "Denial of Service",
      description: "Adversary generates high-volume weak anomalies across enterprise nodes to induce alert fatigue.",
      underpinning_capabilities: ["CAP-DET-04", "CAP-DET-05", "CAP-DET-06"],
      mitigated_by_invariants: ["INV-03", "INV-06"],
      governing_adrs: ["ADR-0003", "ADR-0008", "ADR-0009"],
      mitre_attack: ["T1499.003", "T1562"],
      mitre_atlas: ["AML.T0040"],
      mitre_d3fend: ["D3-ARA", "D3-BCA", "D3-SND"]
    },
    {
      id: "THR-T6",
      name: "Automated Response Sabotage & Self-Inflicted Outage",
      stride: "Denial of Service",
      description: "Adversary manipulates defensive playbooks into isolating critical production databases or domain controllers.",
      underpinning_capabilities: ["CAP-RESP-01", "CAP-RESP-02", "CAP-RESP-04", "RESIL-05"],
      mitigated_by_invariants: ["INV-06", "INV-07", "INV-09"],
      governing_adrs: ["ADR-0005"],
      mitre_attack: ["T1489", "T1562.001"],
      mitre_atlas: ["AML.T0053"],
      mitre_d3fend: ["D3-SMS", "D3-BRC", "D3-BGO"]
    },
    {
      id: "THR-T7",
      name: "Machine Token & Ephemeral Identity Hijacking",
      stride: "Elevation of Privilege / Spoofing",
      description: "Adversary extracts ephemeral machine tokens, SPIFFE SVID certificates, or MCP API secrets to pivot across the agent mesh.",
      underpinning_capabilities: ["CAP-AIGOV-06", "CAP-AIGOV-07"],
      mitigated_by_invariants: ["INV-04", "INV-05"],
      governing_adrs: ["ADR-0015", "ADR-0018"],
      mitre_attack: ["T1078.004", "T1550.001"],
      mitre_atlas: ["AML.T0047", "AML.T0054"],
      mitre_d3fend: ["D3-LAM", "D3-MTC", "D3-IT"]
    },
    {
      id: "THR-T8",
      name: "Model & Knowledge Base Poisoning / Adversarial Evasion",
      stride: "Tampering / Information Disclosure",
      description: "Adversary injects corrupted case dossiers into RAG memory, poisons CTI threat graphs, or crafts adversarial telemetry to evade ML judges.",
      underpinning_capabilities: ["CAP-DET-05", "CAP-DET-07", "CAP-AIGOV-01"],
      mitigated_by_invariants: ["INV-02", "INV-10"],
      governing_adrs: ["ADR-0010", "ADR-0013", "ADR-0014"],
      mitre_attack: ["T1565.001", "T1562.001"],
      mitre_atlas: ["AML.T0018", "AML.T0020", "AML.T0015", "AML.T0040"],
      mitre_d3fend: ["D3-CH", "D3-BCA", "D3-MDA", "D3-DN"]
    },
    {
      id: "THR-T9",
      name: "Excessive Agency & Sensitive Data Exfiltration via Model Outputs",
      stride: "Information Disclosure / Elevation of Privilege",
      description: "Adversary induces recursive tool invocation loops or coaxes triage agents into exfiltrating sensitive forensic artifacts or credentials.",
      underpinning_capabilities: ["CAP-INV-05", "CAP-AIGOV-02", "CAP-AIGOV-03", "CAP-AIGOV-05"],
      mitigated_by_invariants: ["INV-05", "INV-06"],
      governing_adrs: ["ADR-0004", "ADR-0012", "ADR-0017"],
      mitre_attack: ["T1005", "T1048", "T1499"],
      mitre_atlas: ["AML.T0053", "AML.T0024", "AML.T0043"],
      mitre_d3fend: ["D3-EOP", "D3-SLB", "D3-IT"]
    }
  ],
  glossary: JSON.parse(readFileSync("config/glossary.json", "utf-8")).terms,
  foundations: JSON.parse(readFileSync("config/foundations.json", "utf-8")).foundations
};

const outputPath = resolve("docs/public/architecture.json");
writeFileSync(outputPath, JSON.stringify(model, null, 2), "utf-8");
console.log(`✅ Successfully compiled ${outputPath} (${(Buffer.byteLength(JSON.stringify(model)) / 1024).toFixed(1)} KB)`);

// Synchronize the 11 invariants into docs/public/llms.txt directly from model.invariants
const llmsTxtPath = resolve("docs/public/llms.txt");
let llmsTxt = readFileSync(llmsTxtPath, "utf-8");

const invariantListLines = model.invariants.map((inv, idx) => {
  return `${idx + 1}. **${inv.name}**: ${inv.property}`;
}).join("\n");

const constitutionHeader = "## The TIDIR Architectural Constitution (11 Invariants)";
const nextHeader = "## Normative Architectural Contracts & Reference Standards";

const startIdx = llmsTxt.indexOf(constitutionHeader);
const endIdx = llmsTxt.indexOf(nextHeader);

if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
  llmsTxt =
    llmsTxt.substring(0, startIdx) +
    `${constitutionHeader}\n\n${invariantListLines}\n\n` +
    llmsTxt.substring(endIdx);
  writeFileSync(llmsTxtPath, llmsTxt, "utf-8");
  console.log(`✅ Successfully synchronized 11 invariants to ${llmsTxtPath}`);
} else {
  console.warn("⚠️ Warning: Could not match invariant section in llms.txt to synchronize.");
}
