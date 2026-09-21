# Component Specification: Telemetry & Data Fabric

> **Tier 3: Technical Specifications** · **Audience**: Data Engineers, SecOps Infrastructure Leads · **Normative Status**: Reference Component  
> **Prerequisites**: [Cyber Threat Intelligence](01-threat-intelligence.md) · **Next Step**: [Detection Engine](03-detection-engine.md)

---

The Telemetry & Data Fabric provides the foundational data infrastructure for TIDIR. It guarantees reliable, high-throughput ingestion across the **SOC Visibility Quad** (Logs, Endpoint, Network, and Application / Cloud / Artificial Intelligence runtime observability), real-time normalisation into the Open Cybersecurity Schema Framework (OCSF), and tier-optimised storage across hot analytical indices and durable lakehouse repositories.

```mermaid
flowchart TB
  subgraph Collectors ["Telemetry Collection (SOC Visibility Quad)"]
    AGENTS["Endpoint Sensors (Host Telemetry & Kernel Collectors)"]
    CLOUD_INGEST["Cloud Connectors (Control Plane & Infrastructure Logs)"]
    NET_INGEST["Network Probes (Session Flows & Protocol Metadata)"]
    AUTH_INGEST["Identity Logs (Authentication & Federation Events)"]
    APP_INGEST["Application & AI Observability (eBPF Traces, API Telemetry & LLM Logs)"]
  end

  subgraph IngestionStream ["Streaming Pipeline"]
    STREAM_BUS["Distributed Event Bus (Partitioned Message Topics)"]
    SCHEMA_NORM["OCSF Transformation Workers"]
    DLQ["Dead-Letter Queue (DLQ)"]
  end

  subgraph DualStorage ["Storage Architecture"]
    HOT_INDEX["Hot Analytics Index\n(15-30 days retention)\n(Sub-second Search)"]
    LAKEHOUSE["Security Data Lakehouse\n(Columnar Parquet & Metadata Catalogue)\n(Multi-year Retention)"]
  end

  AGENTS --> STREAM_BUS
  CLOUD_INGEST --> STREAM_BUS
  NET_INGEST --> STREAM_BUS
  AUTH_INGEST --> STREAM_BUS
  APP_INGEST --> STREAM_BUS

  STREAM_BUS --> SCHEMA_NORM
  SCHEMA_NORM -->|Failed Validation| DLQ
  SCHEMA_NORM -->|Normalised Stream| HOT_INDEX
  SCHEMA_NORM -->|Micro-batch Flush| LAKEHOUSE
```

---

## 2. Core Functional Requirements

1. **Scalable Ingestion & Buffering**:
   - Resilient against downstream pipeline slowdowns using distributed partitioned commit logs.
   - Dynamic partition autoscaling based on incoming event rates (Events Per Second - EPS).
   - At-least-once message delivery semantics with consumer deduplication.

2. **OCSF Schema Normalisation**:
   - Decouple raw vendor telemetry from detection logic.
   - Mapping catalog across the SOC Visibility Quad:
     - Host Activity (Process Creation, Network Connections, File Operations) -> OCSF System Activity / Process Activity classes.
     - Cloud Management Plane -> OCSF Cloud / Account Activity classes.
     - Network Flows -> OCSF Network Activity classes.
     - Identity / Auth Events -> OCSF Authentication / Identity classes.
     - Application & AI Observability (API transactions, eBPF system call hooks, model inference audits, SaaS logs) -> OCSF Application Activity / API Activity classes.
   - Dead-Letter Queue (DLQ) for non-conforming or unparseable payloads with automated alerting.

3. **Dual-Tier Storage Architecture**:
   - **Hot Tier (Search & Immediate Triage)**:
     - High-throughput inverted text and columnar indices.
     - Retains recent 15–30 days.
     - Optimised for needle-in-a-haystack lookups, timeline queries, and analyst interactive dashboards.
   - **Lakehouse Tier (Historical, Deep Analytics & ML)**:
     - Open table metadata catalogue backed by highly durable object storage.
     - Columnar Parquet compression (Snappy / Zstd).
     - Partitioned by event timestamp (`dt=YYYY-MM-DD/hh=HH`) and OCSF class.
     - Queryable via distributed SQL execution engines.

4. **Threat-Led Telemetry Validation & Coverage Closure**:
   - Ingestion priorities are aligned with the empirical technique frequency curve established by Cyber Threat Intelligence (CTI).
   - Automated collection audits continuously verify that the mandatory OCSF attributes required by the top 20 high-prevalence adversary techniques (e.g. process execution ancestry, memory access permissions, token impersonation, network egress flows) are actively collected across critical asset classes.
   - Sensor instrumentation deficits that would blind detection of top-prevalence techniques trigger immediate gap notifications, ensuring collection depth where adversary frequency is highest before expending budget on peripheral log sources.

---

## 3. Architectural Capability Archetypes & Protocol Standards

| Subsystem Component | Functional Capability Pattern | Data Model & Protocol Standards |
| :--- | :--- | :--- |
| **Streaming Message Fabric** | Distributed partitioned append-only log with horizontal partition rebalancing and consumer offset tracking. | Binary streaming protocol; SASL/SCRAM authentication; mTLS encryption. |
| **Line-Rate Normalisation Engine** | Stateless, horizontally scalable schema translation workers compiling proprietary event formats into standard records. | Open Cybersecurity Schema Framework (OCSF v1.3+); JSON/Avro serialization. |
| **Hot Analytics Engine** | Distributed columnar and inverted search index supporting sub-second aggregations and temporal range queries. | Open search query dialect; REST/HTTP API. |
| **Columnar Lakehouse Engine** | Serverless distributed query engine operating directly against immutable columnar file stores with ACID snapshot isolation. | Open table format metadata specifications; Apache Parquet format. |
