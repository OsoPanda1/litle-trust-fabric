# LITLE Threat Model

**Draft — v0.1 — July 2026**

---

## 1. Scope

This document describes the security threat model for the LITLE platform and standard. It covers the cryptographic identity layer, verification pipeline, submission quarantine, and governance. It does not cover general web application security (XSS, CSRF, SQL injection) which follows standard OWASP guidelines.

---

## 2. Assets

| Asset | Description | Criticality |
|---|---|---|
| LITLE-ID | Cryptographic identity binding a work to its content hash | High |
| DAC | Digital Academic Certificate with signatures | High |
| Private keys | PQC (ML-DSA) and classic (HMAC) signing keys | Critical |
| Evidence Chain Merkle root | Anchor of verification DAG | High |
| Epistemic scores | Quality assessment of works | Medium |
| Quarantine decisions | Index/reject determinations | Medium |
| Author identity | ORCID/name binding | Medium |
| Governance keys | Federation voting keys | High |

---

## 3. Threat Actors

| Actor | Capability | Motivation |
|---|---|---|
| External attacker | Network-level, limited computational resources | Reputation damage, trust subversion |
| Compromised author | Has valid credentials, may submit fraudulent works | Self-dealing, false certification |
| Nation-state adversary | Significant computational resources, may have quantum capabilities | Subversion of trust infrastructure |
| Malicious federation member | Has governance vote, may propose harmful changes | Standard manipulation |
| Malicious platform operator | Controls infrastructure, may tamper with data | Undetected modification |
| AI agent scrapers | May consume certified works without verification | Training data integrity subversion |

---

## 4. Threat Scenarios

### T1. LITLE-ID Collision
- **Scenario:** Attacker finds a hash collision for a legitimate work's content
- **Impact:** Fraudulent work replaces authentic work in the registry
- **Mitigation:** SHAKE256 (PQC profile) provides 256-bit security against collision. SHA-256 (classic profile) is retained for backward compatibility but PQC profile is recommended for new works.

### T2. Signature Forgery (Classical)
- **Scenario:** Attacker forges HMAC-SHA-512 signature
- **Impact:** Falsified DAC certificate
- **Mitigation:** HMAC-SHA-512 provides 256-bit security. Key rotation enforced every 90 days via `LITLE_AUTHOR_SECRET` environment variable.

### T3. Signature Forgery (PQC)
- **Scenario:** Nation-state adversary with quantum computer forges ML-DSA-87 signature
- **Impact:** Falsified PQC DAC certificate
- **Mitigation:** ML-DSA-87 is selected for NIST security level 5 (≥ AES-256 equivalent). Key-committing verify() construction prevents multi-target attacks.

### T4. Quarantine Bypass
- **Scenario:** Author submits a work that passes triangulation checks despite being a duplicate
- **Impact:** Duplicate work enters the index
- **Mitigation:** Web similarity check via DuckDuckGo provides an additional dedup layer. FED-5 manual review panel for inconclusive cases.

### T5. Epistemic Score Manipulation
- **Scenario:** Author submits works designed to game the scoring engine
- **Impact:** Inflated tier placement (e.g., Bronze work certified as Platinum)
- **Mitigation:** Scoring parameters are governed by federations (RFC-0010). Dimension weights are public and auditable. Simulated annealing uses deterministic seeds.

### T6. Private Key Compromise
- **Scenario:** Attacker gains access to the signing private key
- **Impact:** Unlimited forged certificates
- **Mitigation:** Key material derived from environment secret. No persistent key storage. Rotation mechanism via re-deployment.

### T7. Governance Attack
- **Scenario:** Coalition of 5/7 federations votes malicious RFC change
- **Impact:** Standard integrity subverted
- **Mitigation:** Revocation requires 6/7 quorum (higher bar). RFCs are versioned and reviewed. Federations are independent entities.

---

## 5. Cryptographic Assumptions

| Primitive | Assumption | Notes |
|---|---|---|
| SHA-256 | Collision resistance: 128-bit | Classical security, NIST-recommended |
| SHAKE256 | Collision resistance: 128-bit | FIPS 202, chosen for PQC profile |
| HMAC-SHA-512 | MAC security: 256-bit | Keyed, suitable for classical DAC |
| ML-DSA-87 | EUF-CMA security: Level 5 | FIPS 204, lattice-based |
| Fisher-Yates (CSV) | Permutation security: seeded | Not cryptographic, but sufficient for verification codes |

---

## 6. Attack Surface

```
┌──────────────────────────────────────────────────┐
│                   Attack Surface                   │
├──────────────────────────────────────────────────┤
│  Public /verify endpoint       → hash verification│
│  Public /certificate endpoint  → signature check  │
│  Public /submit form           → quarantine input │
│  Supabase API                  → auth bypass       │
│  Admin /admin/quarantine       → unauthorized cur.│
│  Triangulation APIs            → API rate limits  │
│  Environment variables          → secret exposure  │
│  Client-side scoring            → manipulation     │
└──────────────────────────────────────────────────┘
```

---

## 7. Mitigation Summary

| Threat | Mitigation | Status |
|---|---|---|
| T1 — Collision | SHAKE256 / SHA-256 | Implemented |
| T2 — Classical forgery | HMAC-SHA-512, 90-day key rotation | Implemented |
| T3 — PQC forgery | ML-DSA-87 Level 5, key-committing verify | Implemented |
| T4 — Quarantine bypass | 5-source triangulation, FED-5 escalation | Implemented |
| T5 — Score manipulation | Public parameters, deterministic annealing | Implemented |
| T6 — Key compromise | Derivation from env, no persistent storage | Implemented |
| T7 — Governance attack | 6/7 revocation quorum, versioned RFCs | Implemented |

---

## 8. Open Issues

- No external cryptographic audit has been performed
- ML-DSA-87 implementation is not formally verified
- No key rotation cadence is enforced (relies on deployment practice)
- Triangulation API rate limits are uncontrolled
- FED-5 manual review has no formal dispute mechanism
