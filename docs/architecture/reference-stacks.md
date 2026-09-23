# Concrete Reference Technology Stacks & Blueprints

> **Tier 3: Technical Specifications** · **Audience**: Principal Engineers, DevOps/SecOps Architects, Platform Engineers · **Normative Status**: Informational / Illustrative Reference  
> **Prerequisites**: [System Overview & The 4-Plane Model](/architecture/01-system-overview) · [The Architectural Constitution](/architecture/00-architectural-invariants)

---

## 1. Bridging Normative Architecture to Production Engineering

TIDIR's core specifications are intentionally vendor-neutral. They define declarative schemas (OCSF, STIX 2.1), formal state-machine bounds ($s_{n+1} \preceq s_n$), and mathematical invariants using RFC 2119 keywords (`MUST`, `SHOULD`, `MAY`).

However, practicing engineers must build with concrete technologies. This document provides three reference technology blueprints mapping the **4-Plane Model** to proven production platforms:
1. **The CNCF / Open-Source Reference Stack**: Built entirely on cloud-native, open-source infrastructure.
2. **The AWS Cloud-Native Reference Stack**: Built on managed Amazon Web Services primitives.
3. **The Microsoft / Azure Hybrid Reference Stack**: Built on Microsoft 365, Azure, and Fabric infrastructure.

---

## 2. The CNCF / Open-Source Reference Stack

The open-source stack delivers strict on-premises data boundary enforcement via sovereign clusters, zero proprietary licensing fees, and full compliance with Invariant 11 (Operational Portability).

```mermaid
flowchart TB
  subgraph Plane1 ["1. Telemetry & Finding Data Plane (Ingress)"]
    direction LR
    SRC["Sensors: Cilium Tetragon (eBPF)\nLinux Auditd / Wire Taps"] --> FWD["Edge Collector:\nVector / Fluent Bit"]
    FWD --> BUS["Streaming Bus:\nRedpanda / Apache Kafka"]
    BUS --> NORM["OCSF Normalizer:\nVector VRL + Schema Registry"]
    NORM --> LAKE["Decoupled Storage:\nApache Iceberg on MinIO + ClickHouse"]
  end

  subgraph Plane2 ["2. Analytical & Reasoning Plane (Read-Only Proposals)"]
    direction LR
    DAC_ENG["Detection Engine:\nClickHouse SQL + Falco Rules"] --> BAYES["Risk Lens:\nPython/Rust Bayesian Scorer"]
    BAYES --> AGENTS["Triage Mesh:\nLocal SLMs (vLLM / Ollama)"]
  end

  subgraph Plane3 ["3. Defence Control Plane (Deterministic Policy)"]
    direction LR
    ATB["Agent Trust Boundary:\nAST Schema Validator"] --> OPA["Policy Kernel:\nOpen Policy Agent (OPA)"]
    OPA --> SPIRE["Identity Issuer:\nSPIRE (SPIFFE SVIDs <= 15m)"]
  end

  subgraph Plane4 ["4. Actuation Plane (Monotonic Sagas)"]
    direction LR
    ORCH["Saga Orchestrator:\nTemporal.io Workflows"] --> CONN["Connectors:\nAnsible / Network Switch APIs"]
  end

  subgraph Feedback ["5. Closed-Loop Continuous Calibration"]
    direction LR
    CALIB["Attributed CTI Re-Cache & Evals-as-Code (CI/CD)"]
    REFEED["Upstream Sensor Re-tuning & Model Calibration Signals"]
    CALIB --> REFEED
  end

  Plane1 ==>|OCSF Finding Records| Plane2
  Plane2 ==>|Structured Typed Proposals| Plane3
  Plane3 ==>|Validated Capability Scopes| Plane4
  Plane4 ==>|Execution Results & DAG Nodes| Feedback
```

### Component Mapping: CNCF / Open-Source Stack

| TIDIR Architectural Layer | Logical Role | Open-Source / CNCF Reference Technology | Operational Rationale |
| :--- | :--- | :--- | :--- |
| **Layer 1: Ingress** | Kernel & Host Instrumentation | **Cilium Tetragon / Falco** | High-performance eBPF kernel event filtering with minimal CPU overhead. |
| **Layer 1: Edge Forwarding** | Buffer & Stream Routing | **Vector (Datadog open-source)** | Memory-safe Rust forwarder capable of high-throughput parsing and VRL transforms. |
| **Layer 2: Streaming Bus** | Distributed Event Log | **Redpanda / Apache Kafka** | Low-latency, partition-scalable streaming with Raft consensus. |
| **Layer 2: Lakehouse** | Decoupled Columnar Storage | **Apache Iceberg on MinIO/Ceph** | Open table format supporting partition evolution, time-travel, and zero-copy queries. |
| **Layer 2: Hot Index** | Fast Aggregation & Streaming Queries | **ClickHouse** | Sub-second analytical queries across billions of security events; vectorized execution. |
| **Layer 3: Detection Engine** | Polyglot DaC Execution | **Polyglot DaC (ClickHouse SQL + Falco)** | Versioned in Git; native target optimization without translation performance penalty. |
| **Layer 3: Risk Scoring** | Multi-Signal Evidence Compounding | **Rust / Python Microservice** | Implements the Bayesian Multi-Signal Risk Lens ([ADR-0009](/adr/0009-bayesian-multi-signal-risk-scoring)). |
| **Layer 4: Analytical Mesh** | Advisory Investigation Agents | **Local SLMs (Qwen/Llama) via vLLM** | Self-hosted inference eliminating cloud data leakage, running strictly read-only. |
| **Layer 4: Defence Control Plane** | Policy Enforcement & Authorization | **Open Policy Agent (OPA) / Gatekeeper** | Declarative Rego policies validating blast-radius limits and Tier 0 immunity. |
| **Layer 4: Workload Identity** | Machine Attestation & SVIDs | **SPIFFE / SPIRE** | Cryptographic task-scoped X.509 certificates with TTL $\le 15\text{m}$. |
| **Layer 4: Actuation Plane** | Fail-Secure Containment | **Temporal.io** | Distributed state machine enforcing monotonic saga execution and forward escalation. |

---

## 3. The AWS Cloud-Native Reference Stack

The AWS stack maximizes managed service scalability, native security finding aggregation, and serverless compute efficiency.

```mermaid
flowchart TB
  subgraph AwsPlane1 ["1. Telemetry & Finding Data Plane (AWS)"]
    direction LR
    AWS_SRC["Sources: CloudWatch Logs / VPC Flow\nAWS GuardDuty / Security Hub"] --> KINESIS["Streaming Ingress:\nAmazon Kinesis Data Firehose"]
    KINESIS --> S3_LAKE["Lakehouse Storage:\nAmazon S3 (Apache Iceberg)"]
    KINESIS --> OPENSEARCH["Hot Streaming Index:\nAmazon OpenSearch Service"]
  end

  subgraph AwsPlane2 ["2. Analytical & Reasoning Plane (AWS)"]
    direction LR
    ATHENA["Batch DaC Analytics:\nAmazon Athena (Presto/Trino)"] --> BEDROCK["AI Reasoning Mesh:\nAmazon Bedrock (Claude / Llama)"]
  end

  subgraph AwsPlane3 ["3. Defence Control Plane (AWS)"]
    direction LR
    CEDAR["Policy Kernel:\nAWS Verified Permissions (Cedar)"] --> IAM["Ephemeral Identity:\nAWS IAM Roles Anywhere / SPIRE"]
  end

  subgraph AwsPlane4 ["4. Actuation Plane (AWS)"]
    direction LR
    STEP["Saga Orchestration:\nAWS Step Functions"] --> AWS_ACT["Containment Actuators:\nAWS Network Firewall / Systems Manager"]
  end

  subgraph AwsFeedback ["5. Closed-Loop Continuous Calibration"]
    direction LR
    AWS_CALIB["EventBridge Feedback Bus & CI/CD Regression Evals"]
    AWS_REFEED["Security Hub Finding Calibration & Detection Backlog Update"]
    AWS_CALIB --> AWS_REFEED
  end

  AwsPlane1 ==>|Normalized OCSF Findings| AwsPlane2
  AwsPlane2 ==>|Typed AST Proposals| AwsPlane3
  AwsPlane3 ==>|Scoped Containment Grants| AwsPlane4
  AwsPlane4 ==>|Execution Lineage to S3 WORM| AwsFeedback
```

### Component Mapping: AWS Cloud-Native Stack

| TIDIR Architectural Layer | Logical Role | AWS Cloud-Native Technology | Operational Rationale |
| :--- | :--- | :--- | :--- |
| **Layer 1: Ingress** | Native Security Finding Federation | **AWS Security Hub / GuardDuty** | Normalizes AWS-native findings directly into OCSF Class 2001/2004 structures. |
| **Layer 1: Ingestion Stream** | Line-Rate Telemetry Ingress | **Amazon Kinesis Data Firehose** | Serverless streaming with dynamic partitioning directly into columnar formats. |
| **Layer 2: Lakehouse** | Decoupled Columnar Object Storage | **Amazon S3 (Apache Iceberg tables)** | High-durability object storage with S3 Object Lock for WORM compliance (INV-01). |
| **Layer 2: Hot Index** | Real-Time Triage & Full-Text Search | **Amazon OpenSearch Service** | Low-latency querying for active 14-day alert investigations and tabular dashboards. |
| **Layer 3: Detection Engine** | Scheduled Lakehouse Batch DaC | **Amazon Athena (Presto/Trino)** | Partition-pruned SQL sweeps executing historical anomaly detection across Iceberg tables. |
| **Layer 4: Analytical Mesh** | Advisory Triage Agents | **Amazon Bedrock (Claude / Llama 3)** | Enterprise VPC-isolated inference endpoints operating behind the Agent Trust Boundary. |
| **Layer 4: Control Plane** | Policy Kernel & Blast-Radius Gate | **AWS Verified Permissions (Cedar)** | Millisecond-latency authorization assertions evaluating Tier 0 asset immunity. |
| **Layer 4: Ephemeral Identity** | Workload Attestation | **AWS IAM Roles Anywhere / SPIRE** | Issues temporary session credentials constrained to task boundaries. |
| **Layer 4: Actuation Plane** | Fail-Secure Monotonic Containment | **AWS Step Functions** | Declarative state machine orchestration guaranteeing forward escalation upon step failure. |

---

## 4. The Microsoft / Azure Hybrid Reference Stack

The Microsoft / Azure stack aligns with enterprise Microsoft 365, Entra ID, and Azure Data Explorer deployments.

```mermaid
flowchart TB
  subgraph MsPlane1 ["1. Telemetry & Finding Data Plane (Azure)"]
    direction LR
    MS_SRC["Sources: Microsoft Defender XDR\nEntra ID Logs / Azure Activity"] --> HUB["Streaming Ingress:\nAzure Event Hubs"]
    HUB --> ONELAKE["Storage Fabric:\nMicrosoft Fabric OneLake / ADLS Gen2"]
    HUB --> ADX["Streaming Hot Index:\nAzure Data Explorer (ADX) / Sentinel"]
  end

  subgraph MsPlane2 ["2. Analytical & Reasoning Plane (Azure)"]
    direction LR
    KQL_DAC["Detection Engine:\nMicrosoft Sentinel KQL GitOps"] --> AZ_AI["Reasoning Mesh:\nAzure OpenAI (Private Endpoint)"]
  end

  subgraph MsPlane3 ["3. Defence Control Plane (Azure)"]
    direction LR
    AZ_POL["Policy Kernel:\nAzure Policy / Open Policy Agent"] --> ENTRA["Ephemeral Identity:\nMicrosoft Entra Workload ID"]
  end

  subgraph MsPlane4 ["4. Actuation Plane (Azure)"]
    direction LR
    LOGIC["Saga Orchestrator:\nAzure Logic Apps (Standard)"] --> MS_ACT["Containment Actuators:\nDefender API / Azure Firewall Manager"]
  end

  subgraph MsFeedback ["5. Closed-Loop Continuous Calibration"]
    direction LR
    MS_CALIB["Defender Exposure Management Feedback & Incident Replay"]
    MS_REFEED["Exposure Graph Calibration & Ingress Rule Refinement"]
    MS_CALIB --> MS_REFEED
  end

  MsPlane1 ==>|Line-Rate Standardized Findings| MsPlane2
  MsPlane2 ==>|Structured Triage Proposals| MsPlane3
  MsPlane3 ==>|Authorized Action Tokens| MsPlane4
  MsPlane4 ==>|Execution Records & Audit Logs| MsFeedback
```

### Component Mapping: Microsoft / Azure Hybrid Stack

| TIDIR Architectural Layer | Logical Role | Microsoft / Azure Reference Technology | Operational Rationale |
| :--- | :--- | :--- | :--- |
| **Layer 1: Ingress** | Domain Security Findings | **Microsoft Defender XDR** | Emits high-fidelity native endpoint, identity, and cloud findings into Event Hubs. |
| **Layer 1: Ingestion Stream** | Enterprise Event Bus | **Azure Event Hubs (Kafka protocol)** | High-throughput streaming bus with native geo-redundancy. |
| **Layer 2: Lakehouse** | Decoupled Enterprise Lakehouse | **Azure Data Lake Storage Gen2 (ADLS)** | Scalable object storage structured via Delta Lake / Apache Iceberg formats. |
| **Layer 2: Hot Index** | Real-Time Log & Anomaly Engine | **Azure Data Explorer (ADX) / Sentinel** | Extremely fast KQL execution across billions of events with native hot caching. |
| **Layer 3: Detection Engine** | Detection-as-Code via GitOps | **Sentinel KQL Repositories (GitHub/Azure DevOps)** | Polyglot DaC rules authored in KQL, validated in automated PR workflows. |
| **Layer 4: Analytical Mesh** | Advisory Investigation Assistants | **Azure OpenAI Service (GPT-4o)** | Private Link enterprise model deployment with zero data retention for training. |
| **Layer 4: Control Plane** | Policy Kernel & Governance | **Azure Policy / OPA on AKS** | Deterministic authorization blocking disruptive actions on mission-critical resource groups. |
| **Layer 4: Ephemeral Identity** | Workload Identity Attestation | **Microsoft Entra Workload ID / SPIRE** | Federated token issuance without static client secrets. |
| **Layer 4: Actuation Plane** | Monotonic Containment Workflows | **Azure Logic Apps (Standard)** | Orchestrates containment steps with mandatory approval cards and forward compensation. |

---

## 5. Architectural Invariant Compliance Across Reference Stacks

Regardless of the technology stack selected, every production implementation MUST enforce the 11 constitutional invariants:

1. **Telemetry Preservation (`INV-01`)**: All three stacks store raw telemetry in open columnar formats (Parquet/Iceberg) with `unmapped_data` preserved, preventing vendor lock-in.
2. **Authority Separation (`INV-04`)**: In every stack, AI inference engines (vLLM, Bedrock, Azure OpenAI) operate in a read-only capacity behind the Agent Trust Boundary without direct mutation keys.
3. **Reachability Monotonicity (`INV-07`)**: All three orchestration engines (Temporal, Step Functions, Logic Apps) execute containment as forward-compensating state machines where partial errors escalate outwards rather than rolling back security barriers.
4. **Human Recoverability (`INV-09`)**: All three implementations retain independent, out-of-band manual flight decks and cryptographic master Emergency Stops (E-Stops).
