# 0005. Saga-Pattern Containment Workflows and Break-Glass Emergency Protocols

* Status: accepted
* Deciders: Architecture Team / Harry
* Date: 2026-09-15

## Context and Problem Statement

Automated security response actions interact with heterogeneous downstream APIs across host enforcement, identity providers, network firewalls, and cloud control planes. During active security incidents, these downstream control planes frequently encounter transient failures, rate limiting, or network degradation. 

If a multi-step containment workflow experiences a partial failure (for example: successfully revoking an identity session, but failing to isolate the compromised host due to an endpoint timeout), the enterprise environment is left in an inconsistent and vulnerable state.

Additionally, while human-in-the-loop consensus gates are necessary to protect business continuity from false-positive containment disruptions, high-velocity outbreaks (e.g. automated ransomware propagation or active cloud credential exfiltration) occurring during off-hours can cause devastating damage if delayed by multi-signature approval queues.

How does the architecture guarantee reliable, consistent automated containment while providing a deterministic, auditable emergency override path for high-velocity threats?

## Decision Drivers

* High availability and deterministic state consistency across distributed containment APIs.
* Enforcing **Security-State Monotonicity**: No automated compensation or failure recovery may expand adversary reachability beyond the current contained posture.
* Compression of containment execution latency during critical, high-velocity outbreaks.
* Complete cryptographic non-repudiation and auditability for all automated and manual response actions.

## Considered Options

1. **Best-Effort Sequential Execution**: Fire API calls in sequence without compensation or state tracking; alert human operators on failure.
2. **Synchronous Two-Phase Commit (2PC)**: Attempt distributed locking across all target APIs before committing state changes.
3. **Security-State Monotonic Saga Orchestration with Asymmetric Forward Escalation and Audited Break-Glass Override (Selected)**.

## Decision Outcome

Chosen option: **Security-State Monotonic Saga Orchestration with Asymmetric Forward Escalation and Audited Break-Glass Override**, because:
- **Security-State Monotonicity ($S_{\text{post}} \sqsupseteq S_{\text{pre}}$)**:
  - Containment workflows are executed as distributed Sagas, but with a foundational divergence from classic transactional ACID sagas: **Security containment operations are asymmetric and fail-secure**.
  - Formally: If $\hat{\mathcal{R}}_A(s, \mathcal{M}_t)$ is the adversary reachability set in state $s$ relative to the validated environmental and identity topology model $\mathcal{M}_t$, every automated transition $\tau: s \to s'$ must satisfy:
    $$\hat{\mathcal{R}}_A(s', \mathcal{M}_t) \subseteq \hat{\mathcal{R}}_A(s, \mathcal{M}_t)$$
  - **Model-Bounded Monotonicity vs. Unobservable Ground Truth**: TIDIR guarantees monotonicity relative to the control plane's validated topological and reachability model $\mathcal{M}_t$, not unobservable ground-truth adversary capabilities. In production environments, local containment operations ($R_{\text{known}}$) can inadvertently trigger out-of-band side-effects (e.g. revoking an IdP token causing an application to fall back to legacy local credentials; isolating an EDR-managed NIC causing an adversary to pivot to an unmanaged out-of-band IPMI interface). The state machine requires pre-flight dependency analysis to ensure that compensatory transitions do not widen adversary attack paths across known fallback pathways.
  - **Action Monotonicity vs. Security-State Monotonicity**: Operational actions themselves need not be monotonic (e.g. an egress firewall shunt might be redirected, or a failed endpoint agent command might be superseded by a switch-port isolation). However, the *security posture* is strictly monotonic: **no automated compensation may increase attacker reachability beyond the last verified-safe security state**.
  - If any step in a forward containment sequence ($T_1 \dots T_n$) fails after exhausted idempotent retries and exponential backoff, the orchestrator **NEVER executes reverse compensation on previously secured controls** ($C_{i-1} \dots C_1$). Reversing containment (e.g. un-quarantining a host or re-enabling a revoked session token because a downstream firewall API timed out) actively restores adversary footholds and weaponizes transient network faults against the defense.
- **Forward Containment Escalation**:
  - Upon step failure, the orchestrator freezes the current containment boundary and executes forward escalation: applying broader, out-of-band perimeter network fences (e.g. boundary route shunts, upstream VPC ACL drops) and elevating the incident with high-priority paging to on-duty Incident Commanders.
- **Idempotent Isolation Leases & Bounded TTL (Anti-Deadlock Guard)**:
  - In widespread lateral outbreaks across distributed endpoints, holding partial containment states indefinitely while awaiting operator clearance risks distributed resource deadlocks, connection exhaustion, and operational disruption.
  - All forward-recovery containment states are bound to an **Idempotent Isolation Lease** with a bounded Time-To-Live (TTL, e.g. 45 minutes).
  - If a stalled state machine is not ratified or reconciled by an operator before the lease expires, the orchestrator deterministically triggers an automated safe-fallback: promoting to an out-of-band boundary isolation or escalating to a critical supervisor alarm, ensuring containment is never held in an indeterminate deadlock.
- **Circuit Breakers and Rate-Limiting Decoupling**: API connectors maintain stateful circuit breakers. If a downstream provider exhibits elevated error rates, the connector trips into a fallback state, queueing operations for human operator evaluation rather than silently failing.
- **Break-Glass Emergency Containment Protocol**:
  - Under verified high-severity triggers (e.g. stateful detection of active cryptographic file encryption on multiple endpoints), an on-duty Incident Commander can invoke an authenticated **Break-Glass Override**.
  - Bypasses multi-signature consensus gates for pre-defined critical playbooks.
  - Automatically emits real-time cryptographic audit events across out-of-band broadcast channels (e.g. incident notification hubs, executive broadcast streams) and locks the action to an immutable audit ledger with digital non-repudiation.

### Positive Consequences

* Structurally prevents automated rollbacks from dismantling containment perimeters during active attacks.
* Enforces a fail-secure posture across heterogeneous hybrid enterprise environments.
* Compresses containment execution latency during existential, high-velocity intrusions without sacrificing authorization auditability.

### Negative Consequences

* Step failures require human operator intervention to manually evaluate and reconcile partially contained states.
* Upstream perimeter escalation may affect broader network segments if endpoint-level isolation fails.
