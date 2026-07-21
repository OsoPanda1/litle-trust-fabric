# LITLE: An Epistemological Curation Standard for Open Science

**Draft — v0.1 — July 2026**

**Status:** Pre-print. Not peer-reviewed.

---

## Abstract

We propose LITLE, a standard and reference platform for the curation, verification, and certification of Open Access academic works. LITLE addresses the signal-to-noise problem in Open Science by applying a 9-dimensional epistemic scoring engine, a post-quantum cryptographic identity layer (ML-DSA-87 / SHAKE256), a quarantine-based submission pipeline with automated triangulation against ORCID, Crossref, ISNI, and web sources, and a federated governance model. This whitepaper describes the architecture, scoring methodology, cryptographic design, threat model, and comparison against existing platforms.

---

## 1. Introduction

### 1.1 Problem Statement

Open Science has removed barriers to access but also removed the quality signal that traditional peer review provided. Researchers and AI agents alike face an increasing volume of unverified, non-reproducible, or poorly documented works. Existing platforms (Zenodo, Figshare, Dataverse, Crossref) provide preservation and DOI registration but do not offer:

- Multi-dimensional epistemic quality scoring
- Cryptographic identity anchored to content (not metadata)
- Verifiable authorship stylometry
- A quarantine/triangulation pipeline for submission integrity
- Post-quantum cryptographic hardening

### 1.2 Contribution

- A 9-dimensional epistemic scoring protocol with simulated annealing weight optimization
- A dual-stack Digital Academic Certificate (DAC) supporting classical (SHA-256) and post-quantum (ML-DSA-87) signatures
- A quarantine pipeline with automated triangulation against 5 external registries
- A federated governance model requiring 5/7 quorum for standard modifications

---

## 2. Epistemic Scoring Engine

### 2.1 Dimensions

Nine dimensions scored on a 0–5 scale:

| Dimension | Weight | Rationale |
|---|---|---|
| Methodological Rigor | 20% | Core to scientific validity |
| Reproducibility | 18% | Verifiability of results |
| Citation Integrity | 15% | Scholarly accountability |
| Peer Review Status | 12% | Community validation |
| Data Transparency | 12% | Data accessibility |
| AI Provenance | 10% | Transparency of AI use |
| Longevity Potential | 8% | Format preservation |
| Epistemological Novelty | 5% | Knowledge contribution |

### 2.2 Scoring Algorithm

The composite score is a weighted sum. Weight optimization is performed via simulated annealing over 1000 iterations with exponential temperature decay (`T_k = T_0 * 0.95^k`). The objective function maximizes the Pareto frontier of dimension coverage vs. score separation.

### 2.3 Quantum-Inspired Correlation

Pairwise "entanglement energy" is computed between dimensions per work:

```
E(i,j) = |score_i - score_j| * correlation(i,j)
```

This identifies works where scoring dimensions are in tension (high energy) or alignment (low energy). The term "quantum" is used as an analogy — no quantum hardware is involved. The name reflects the non-independent, correlational nature of epistemic quality dimensions.

---

## 3. Cryptographic Design

### 3.1 Identity Layer (LITLE-ID)

- Format: `LTL-{YYYY}-{WorkType}-{4-char hex}-{4-char hex}` (URI form)
- Digest: SHA-256 (classic profile) or SHAKE256 (PQC profile)
- Container: 512 bytes (classic) or 8192 bytes (PQC) with Bech32m encoding
- Canonical form: Bech32m string with `litle1` prefix

### 3.2 Post-Quantum Signatures

ML-DSA-87 (CRYSTALS-Dilithium5) as specified in FIPS 204:

- Parameter set targeting NIST security level 5
- Public key: 2,592 bytes
- Signature: 4,627 bytes (requires 8KB container)
- Key derivation via SHAKE256 KDF

### 3.3 Dual-Stack DAC

Three certification suites:

| Suite | Hash | Signature | Verification |
|---|---|---|---|
| `classic` | SHA-256 | HMAC-SHA-512 | Deterministic re-computation |
| `pqc` | SHAKE256 | ML-DSA-87 | Key-committing hash construction |
| `dual` | Both | Both | Independent verification passes |

---

## 4. Quarantine Pipeline

### 4.1 Workflow

```
Author Submission → QUARANTINE → Triangulation → GREEN  → Index
                                                  RED    → Reject
                                                  ?      → FED-5
```

### 4.2 Triangulation Sources

| Source | API | Purpose |
|---|---|---|
| ORCID | pub.orcid.org/v3.0 | Author identity verification |
| Crossref | api.crossref.org/works | DOI existence check |
| ISNI | isni.org/api | Identifier verification |
| DuckDuckGo | lite.duckduckgo.com/lite | Web similarity |
| LITLE Library | Internal | Deduplication |

Each source returns a `sourceHash` (SHAKE256 of relevant content) and a `confidence` score (0–1). The aggregate decision uses a weighted voting mechanism.

---

## 5. Federated Governance

- 7 federations, each with one vote
- Quorum for stable RFCs: 5/7
- Quorum for revocations: 6/7
- RFC lifecycle: draft → proposed → stable → deprecated
- Current federations: TAMV (founder), plus 6 additional seats

---

## 6. Comparison with Existing Platforms

| Feature | Zenodo | Figshare | Dataverse | Crossref | LITLE (proposed) |
|---|---|---|---|---|---|
| DOI registration | Yes | Yes | Yes | Yes | No (Crossref-compatible) |
| Epistemic scoring | No | No | No | No | Yes (9 dimensions) |
| Cryptographic identity | No | No | No | No | Yes (PQC-ready) |
| Authorship verification | No | No | No | No | Yes (GMM stylometry) |
| Submission quarantine | No | No | No | No | Yes (5-source triangulation) |
| Post-quantum signatures | No | No | No | No | Yes (ML-DSA-87) |
| Federated governance | No | No | No | No | Yes (7 federations) |
| AI provenance tracking | No | No | No | No | Yes (Evidence Chain) |

See [`docs/benchmark.md`](benchmark.md) for detailed comparison.

---

## 7. Limitations

- The epistemic scoring engine has not been validated against human expert judgments
- Authorship GMM is adapted from speaker verification (P4) — accuracy on academic text is unmeasured
- ML-DSA-87 is a reference implementation, not a formally audited library
- No large-scale benchmark exists against Zenodo, Figshare, Dataverse, or Crossref
- Quarantine triangulation is automated — false positives/negatives are possible
- The platform has not undergone external security audit

---

## 8. Areas Requiring Further Work

- Human-expert validation of epistemic scoring (inter-rater reliability study)
- Academic text corpus for authorship GMM training
- External cryptographic audit of PQC implementation
- Large-scale DOI dedup benchmark against Crossref
- Formal verification of quarantine decision logic
- Threat modeling review (see [`docs/threat-model.md`](threat-model.md))

---

## References

1. NIST FIPS 202 — SHA-3 Standard: Permutation-Based Hash and Extendable-Output Functions
2. NIST FIPS 204 — Module-Lattice-Based Digital Signature Standard (ML-DSA)
3. RFC-0001: LITLE-ID Specification. LITLE Standards. 2026.
4. RFC-0008: Evidence Chain. LITLE Standards. 2026.
5. RFC-0010: Federated Governance. LITLE Standards. 2026.
6. RFC-0014: Open Science Curation. LITLE Standards. 2026.
7. RFC-0015: Digital Academic Certificate. LITLE Standards. 2026.
8. Lyu et al. "CRYSTALS-Dilithium: A Lattice-Based Digital Signature Scheme." 2022.
9. keensoft/csv-generator. "Código Seguro de Verificación." Spanish Government.
10. albino-pav/P4. "Speaker Verification System." GitHub.
11. martinszy/verificacion_de_datos. "Data Verification Pipeline." GitHub.
