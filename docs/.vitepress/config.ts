import { defineConfig } from "vitepress";
import { withMermaid } from "vitepress-plugin-mermaid";
import { execSync } from "node:child_process";
import pkg from "../../package.json";

const gitCommit =
  process.env.CF_PAGES_COMMIT_SHA?.slice(0, 7) ||
  (() => {
    try {
      return execSync("git rev-parse --short HEAD").toString().trim();
    } catch {
      return "main";
    }
  })();

export default withMermaid(
  defineConfig({
    title: "TIDIR Architecture",
    description: "Threat Intelligence, Detection, Investigation & Response Reference Architecture",
    base: "/",
    cleanUrls: true,
    ignoreDeadLinks: true,
    sitemap: {
      hostname: "https://tidir.harrymclaren.co.uk"
    },
    markdown: {
      math: true
    },
    head: [
      [
        "link",
        { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }
      ],
      [
        "link",
        { rel: "canonical", href: "https://tidir.harrymclaren.co.uk" }
      ],
      [
        "link",
        { rel: "alternate", type: "text/plain", href: "/llms.txt", title: "LLM Context" }
      ],
      [
        "meta",
        { name: "author", content: "Harry McLaren" }
      ],
      [
        "meta",
        { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" }
      ],
      [
        "meta",
        {
          name: "keywords",
          content: "cybersecurity, SecOps, threat intelligence, detection engineering, incident response, OCSF, STIX, TAXII, SOAR, SIEM, security architecture, agentic AI, prompt injection firewall, continuous purple teaming, detection as code, autonomous SOC, SABSA"
        }
      ],
      [
        "meta",
        { property: "og:site_name", content: "TIDIR Architecture" }
      ],
      [
        "meta",
        { property: "og:type", content: "website" }
      ],
      [
        "meta",
        { property: "og:title", content: "TIDIR — Open SecOps Reference Architecture" }
      ],
      [
        "meta",
        {
          property: "og:description",
          content: "Open, vendor-neutral target technology component architecture for modern autonomous security operations: CTI, OCSF telemetry fabric, Detection-as-Code, agentic investigation, and monotonic response."
        }
      ],
      [
        "meta",
        { property: "og:url", content: "https://tidir.harrymclaren.co.uk/" }
      ],
      [
        "meta",
        { name: "twitter:card", content: "summary_large_image" }
      ],
      [
        "meta",
        { name: "twitter:title", content: "TIDIR — Open SecOps Reference Architecture" }
      ],
      [
        "meta",
        {
          name: "twitter:description",
          content: "Open, vendor-neutral target technology component architecture for modern autonomous security operations."
        }
      ],
      [
        "meta",
        { name: "twitter:creator", content: "@Haribu" }
      ],
      [
        "script",
        { type: "application/ld+json" },
        JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebSite",
              "@id": "https://tidir.harrymclaren.co.uk/#website",
              "url": "https://tidir.harrymclaren.co.uk/",
              "name": "TIDIR Architecture",
              "description": "Open, vendor-neutral target technology component architecture for modern autonomous security operations.",
              "publisher": {
                "@type": "Person",
                "name": "Harry McLaren",
                "url": "https://harrymclaren.co.uk"
              },
              "inLanguage": "en-GB"
            },
            {
              "@type": "TechArticle",
              "@id": "https://tidir.harrymclaren.co.uk/#article",
              "isPartOf": { "@id": "https://tidir.harrymclaren.co.uk/#website" },
              "headline": "TIDIR: Threat Intelligence, Detection, Investigation & Response Reference Architecture",
              "description": "A comprehensive target technology component architecture unifying cyber threat intelligence, line-rate OCSF normalization, decoupled lakehouse storage, Detection-as-Code, and defensive agentic AI with monotonic automated containment.",
              "author": {
                "@type": "Person",
                "name": "Harry McLaren",
                "url": "https://harrymclaren.co.uk"
              },
              "license": "https://www.apache.org/licenses/LICENSE-2.0",
              "keywords": [
                "Cybersecurity",
                "Security Operations",
                "Threat Intelligence",
                "Detection Engineering",
                "Incident Response",
                "OCSF",
                "STIX",
                "TAXII",
                "Detection-as-Code",
                "Agentic AI",
                "Autonomous SOC",
                "Security Architecture"
              ]
            }
          ]
        })
      ],
      [
        "script",
        {},
        "if (location.hostname === 'tidir.pages.dev') { location.replace('https://tidir.harrymclaren.co.uk' + location.pathname + location.search + location.hash); }"
      ],
      [
        "style",
        {},
        "mjx-assistive-mml { display: none !important; position: absolute !important; top: 0; left: 0; clip: rect(1px, 1px, 1px, 1px); user-select: none; white-space: nowrap; overflow: hidden !important; padding: 0 !important; border: 0 !important; height: 1px !important; width: 1px !important; } mjx-container[display='true'] { display: block !important; max-width: 100% !important; overflow-x: auto !important; overflow-y: hidden !important; padding: 0.75rem 0; } mjx-container:not([display='true']) { display: inline-block !important; max-width: 100%; } .mermaid foreignObject { overflow: visible !important; } .mermaid .nodeLabel, .mermaid .label, .mermaid .cluster-label, .mermaid .edgeLabel, .mermaid foreignObject div, .mermaid foreignObject span, .mermaid foreignObject p { line-height: 1.25 !important; font-family: Inter, ui-sans-serif, system-ui, sans-serif !important; margin: 0 !important; padding: 0 !important; }"
      ]
    ],
    themeConfig: {
      outline: {
        level: [2, 3],
        label: "On this page"
      },
      nav: [
        { text: "Start Here", link: "/guide/what-is-tidir" },
        { text: "Architecture", link: "/architecture/00-architectural-invariants" },
        { text: "Research", link: "/architecture/foundational-research" },
        { text: "Capabilities", link: "/architecture/02-capability-model" },
        { text: "Components", link: "/architecture/components/01-threat-intelligence" },
        { text: "ADRs", link: "/adr/" },
        { text: "Glossary", link: "/architecture/glossary" },
        { text: "Architecture JSON", link: "/architecture.json" },
        { text: "GitHub ↗", link: "https://github.com/Haribu/TIDIR" }
      ],
      sidebar: {
        "/guide/": [
          {
            text: "Start Here: Guided Journey",
            items: [
              { text: "What is TIDIR?", link: "/guide/what-is-tidir" },
              { text: "15-Minute Golden Path", link: "/guide/golden-path" },
              { text: "Adoption Roadmap & Maturity", link: "/guide/adoption-roadmap" },
              { text: "Persona-Driven Journeys", link: "/guide/persona-journeys" },
              { text: "Foundational Research & Literature", link: "/architecture/foundational-research" },
              { text: "Assurance Case Map", link: "/architecture/assurance-map" }
            ]
          },
          {
            text: "Next Steps",
            items: [
              { text: "Architectural Invariants", link: "/architecture/00-architectural-invariants" },
              { text: "System Overview", link: "/architecture/01-system-overview" },
              { text: "Capability Model", link: "/architecture/02-capability-model" }
            ]
          }
        ],
        "/architecture/components/": [
          {
            text: "Subsystem Deep Dives",
            items: [
              { text: "1. Cyber Threat Intelligence", link: "/architecture/components/01-threat-intelligence" },
              { text: "2. Telemetry & Data Fabric", link: "/architecture/components/02-data-fabric-telemetry" },
              { text: "3. Detection Engine", link: "/architecture/components/03-detection-engine" },
              { text: "4. Investigation & Cases", link: "/architecture/components/04-investigation-cases" },
              { text: "5. Response & Automation", link: "/architecture/components/05-response-automation" },
              { text: "6. AI & Agent Orchestration", link: "/architecture/components/06-ai-orchestration" }
            ]
          },
          {
            text: "Foundations & Decisions",
            items: [
              { text: "Architectural Invariants", link: "/architecture/00-architectural-invariants" },
              { text: "Foundational Research & Literature", link: "/architecture/foundational-research" },
              { text: "System Overview & 4-Plane Model", link: "/architecture/01-system-overview" },
              { text: "Reference Stacks", link: "/architecture/reference-stacks" },
              { text: "ADR Registry", link: "/adr/" }
            ]
          }
        ],
        "/architecture/": [
          {
            text: "Tier 1: Strategic Architecture",
            items: [
              { text: "Architectural Invariants & Constitution", link: "/architecture/00-architectural-invariants" },
              { text: "System Overview & 4-Plane Model", link: "/architecture/01-system-overview" },
              { text: "Distributed Detection & Finding Bus", link: "/architecture/distributed-detection-and-the-finding-bus" },
              { text: "Concrete Reference Stacks", link: "/architecture/reference-stacks" },
              { text: "Failure Modes & Tradeoffs", link: "/architecture/failure-modes-and-tradeoffs" },
              { text: "Foundational Research & Literature", link: "/architecture/foundational-research" },
              { text: "Glossary & Concept Taxonomy", link: "/architecture/glossary" },
              { text: "Target Threat Model", link: "/architecture/09-threat-model" },
              { text: "Assurance Case Map", link: "/architecture/assurance-map" }
            ]
          },
          {
            text: "Tier 2: Capabilities & Taxonomy",
            items: [
              { text: "Capability Model & Taxonomy", link: "/architecture/02-capability-model" },
              { text: "Macro Capabilities & Services", link: "/architecture/10-macro-capabilities-and-services" },
              { text: "Operational User Stories", link: "/architecture/08-user-stories" }
            ]
          },
          {
            text: "Tier 3: Technical Specifications",
            items: [
              { text: "Layer 1: Data Sources & Ingress", link: "/architecture/03-layer-1-data-sources" },
              { text: "Layer 2: Pipeline, Storage & Query", link: "/architecture/04-layer-2-pipeline-storage-query" },
              { text: "Layer 3: Intel & Detection Engineering", link: "/architecture/06-layer-3-threat-intel-detection" },
              { text: "Layer 4: Investigation & Automated Response", link: "/architecture/07-layer-4-incident-response" },
              { text: "Cross-Cutting Engineering Disciplines", link: "/architecture/05-cross-cutting-engineering-disciplines" }
            ]
          },
          {
            text: "Subsystem Deep Dives",
            items: [
              { text: "Component Deep Dives Overview", link: "/architecture/components/01-threat-intelligence" }
            ]
          }
        ],
        "/adr/": [
          {
            text: "Architecture Decisions: Overview",
            items: [
              { text: "ADR Registry Overview", link: "/adr/" },
              { text: "Foundational Research & Literature", link: "/architecture/foundational-research" }
            ]
          },
          {
            text: "ADRs: Governance & Strategy",
            collapsed: false,
            items: [
              { text: "0001 - Record Architecture Decisions", link: "/adr/0001-record-architecture-decisions" },
              { text: "0010 - SABSA Alignment & Attribute Profiling", link: "/adr/0010-sabsa-business-architecture-and-attribute-profiling" },
              { text: "0008 - SecOps Error Budgets & Chaos SRE", link: "/adr/0008-secops-error-budgets-and-chaos-security-engineering" },
              { text: "0021 - Graceful Degradation & Plan B", link: "/adr/0021-graceful-degradation-automated-fallback-and-continuity-plan-b" },
              { text: "0026 - End-to-End Coverage Assurance", link: "/adr/0026-end-to-end-coverage-assurance-and-degradation-circuit-breakers" }
            ]
          },
          {
            text: "ADRs: Data Fabric & Ingress",
            collapsed: false,
            items: [
              { text: "0002 - Preserve Unmapped OCSF Telemetry", link: "/adr/0002-preserve-unmapped-telemetry-in-ocsf" },
              { text: "0015 - Sandboxed Agents & OTLP Convergence", link: "/adr/0015-sandboxed-agent-execution-otlp-convergence-and-ephemeral-identity" },
              { text: "0016 - JIT Telemetry Elevation & Forensics", link: "/adr/0016-just-in-time-telemetry-elevation-and-ephemeral-forensics" },
              { text: "0025 - Pre-Detection Telemetry Lineage", link: "/adr/0025-pre-detection-telemetry-provenance-and-ingestion-lineage" }
            ]
          },
          {
            text: "ADRs: Detection & Intel",
            collapsed: false,
            items: [
              { text: "0007 - Continuous Purple Teaming & Consensus", link: "/adr/0007-continuous-automated-purple-teaming-and-multi-model-consensus" },
              { text: "0009 - Bayesian Multi-Signal Risk Scoring", link: "/adr/0009-bayesian-multi-signal-risk-scoring" },
              { text: "0011 - Bipartite Entity-Finding Graph", link: "/adr/0011-bipartite-entity-finding-graph-consolidation" },
              { text: "0013 - Ambient Deception & Canary Anchors", link: "/adr/0013-ambient-deception-fabric-and-canary-anchors" },
              { text: "0019 - Polyglot DaC & Native Engine Adaptation", link: "/adr/0019-polyglot-detection-as-code-and-native-engine-adaptation" },
              { text: "0022 - Exposure Management & CTEM Integration", link: "/adr/0022-exposure-management-and-continuous-threat-exposure-integration" },
              { text: "0023 - Distributed Detection & Edge Correlation", link: "/adr/0023-distributed-detection-and-edge-to-center-correlation" },
              { text: "0024 - Finding Bus Architecture & Contract", link: "/adr/0024-finding-bus-architecture-lineage-and-finding-contract" }
            ]
          },
          {
            text: "ADRs: Investigation & Response",
            collapsed: false,
            items: [
              { text: "0003 - Supernode Pruning & Graph Clustering", link: "/adr/0003-graph-supernode-pruning-and-clustering-boundaries" },
              { text: "0005 - Asymmetric Containment & Break-Glass", link: "/adr/0005-saga-pattern-containment-and-break-glass-protocol" },
              { text: "0020 - Operator Skill Retention & Simulators", link: "/adr/0020-operator-skill-retention-and-incident-replay-simulators" },
              { text: "0027 - First-Principles Workflow & Automation-as-Code", link: "/adr/0027-first-principles-workflow-orchestration-and-automation-as-code" }
            ]
          },
          {
            text: "ADRs: AI Runtime & Observability",
            collapsed: false,
            items: [
              { text: "0004 - Defensive AI & Agent Trust Boundary", link: "/adr/0004-defensive-ai-runtime-and-prompt-injection-firewall" },
              { text: "0006 - Agent Evals-as-Code Harness", link: "/adr/0006-agent-evaluation-harness-evals-as-code" },
              { text: "0012 - AI Orchestration & MVP Roadmap", link: "/adr/0012-ai-orchestration-runtime-mcp-and-mvp-roadmap" },
              { text: "0014 - AI Observability & SLM Judges", link: "/adr/0014-ai-observability-self-learning-and-slm-judges" },
              { text: "0017 - Agent Fleet Control & Loop Breakers", link: "/adr/0017-agent-fleet-control-plane-and-runtime-observability" },
              { text: "0018 - NHI Lifecycle & Machine Attestation", link: "/adr/0018-non-human-identity-lifecycle-and-machine-attestation" }
            ]
          }
        ]
      },
      socialLinks: [
        { icon: "github", link: "https://github.com/Haribu/TIDIR" }
      ],
      footer: {
        message: `Human-Led Architecture · AI-Supported · <a href="https://github.com/Haribu/TIDIR/blob/main/LICENSE" target="_blank" rel="noopener">Apache-2.0 Licence</a> · Live Commit: <a href="https://github.com/Haribu/TIDIR/commit/${gitCommit}" target="_blank" rel="noopener"><code>${gitCommit}</code></a>`,
        copyright: `Copyright © 2026 Harry McLaren · TIDIR v${pkg.version}`
      },
      search: {
        provider: "local"
      }
    },
    mermaid: {
      theme: "dark",
      themeVariables: {
        darkMode: true,
        background: "#0b0f19",
        primaryColor: "#1e293b",
        primaryTextColor: "#f8fafc",
        primaryBorderColor: "#38bdf8",
        lineColor: "#64748b",
        secondaryColor: "#1e1b4b",
        tertiaryColor: "#0f172a",
        mainBkg: "#1e293b",
        nodeBorder: "#38bdf8",
        nodeTextColor: "#f8fafc",
        clusterBkg: "#0f172a",
        clusterBorder: "#334155",
        titleColor: "#38bdf8",
        edgeLabelBackground: "#1e293b",
        fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
        fontSize: "13px"
      },
      flowchart: {
        htmlLabels: true,
        useMaxWidth: true,
        padding: 12
      }
    }
  })
);
