# Contributing to TIDIR

Thank you for your interest in contributing to **TIDIR** (Threat Intelligence, Detection, Investigation & Response)!

TIDIR is an open, vendor-neutral research project establishing target technology component architectures for modern security operations. The full architectural specifications and interactive diagrams are hosted live at **[https://tidir.pages.dev](https://tidir.pages.dev)** *(custom domain: [https://tidir.harrymclaren.co.uk](https://tidir.harrymclaren.co.uk))*. We welcome contributions, RFCs, and improvements from security analysts, detection engineers, and architects.

---

## 🎯 Contribution Principles

1. **Vendor-Neutrality First**: All specifications, interfaces, and component architectures must remain vendor-neutral and capability-driven.
2. **Schema Standards Alignment**:
   - Telemetry models must map to the Open Cybersecurity Schema Framework (**OCSF**).
   - Cyber Threat Intelligence (CTI) must align with **STIX 2.1** / **TAXII 2.1**.
   - Detections must be expressed in Polyglot DaC format (vendor-neutral YAML metadata envelope with target-optimized query blocks; see [ADR-0019](docs/adr/0019-polyglot-detection-as-code-and-native-engine-adaptation.md)).
3. **Architectural Decisions (ADR)**: Any non-trivial design change or technology selection must be accompanied by an Architectural Decision Record in `docs/adr/` using the [ADR template](docs/adr/template.md).
4. **Diagram Standards**: All diagrams must be version-controlled Mermaid (`.mmd` or fenced `mermaid` markdown blocks) and pass `bun run diagrams:validate`.

---

## 🚀 Ways to Contribute

### 1. Issues & Discussions
- **Report Gaps & Bugs**: Find a missing telemetry relationship, broken link, or diagram syntax error? [Open an Issue](https://github.com/Haribu/TIDIR/issues).
- **Propose Architectural Changes (RFC)**: Want to introduce a new operational pattern or subsystem component? Open an issue tagged `rfc` to start the discussion before authoring deep specs.

### 2. Pull Requests
1. Fork the repository:
   ```bash
   git clone https://github.com/<your-username>/TIDIR.git
   cd TIDIR
   ```
2. Install dependencies using [`bun`](https://bun.sh):
   ```bash
   bun install
   ```
3. Create a feature branch:
   ```bash
   git checkout -b feat/my-new-capability
   ```
4. Run validation checks before committing:
   ```bash
   # Validate Mermaid diagrams
   bun run diagrams:validate
   # or directly: bun ./scripts/validate-diagrams.ts

   # Build docs to ensure clean compilation
   bun run docs:build
   ```
5. Submit a pull request to `main` with a clear explanation of the operational context and architectural rationale.

---

## 📬 Direct Contact & Inquiries

For collaboration inquiries, research discussions, or private feedback:
- **Harry McLaren**: [`info@harrymclaren.co.uk`](mailto:info@harrymclaren.co.uk)

---

## 👥 Contributors

TIDIR is an open research initiative shaped by the community. We gratefully recognize and celebrate everyone contributing:

- **Harry McLaren** ([@Haribu](https://github.com/Haribu)) — *Author & Lead Architect*
- **Dave B.** ([@crazydave85](https://github.com/crazydave85)) — *Documentation & link hygiene*
