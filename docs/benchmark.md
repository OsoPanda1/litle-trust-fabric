# LITLE Benchmark: Comparison with Existing Platforms

**Draft — v0.1 — July 2026**

---

## 1. Methodology

This benchmark compares LITLE (proposed) against four established platforms across 12 dimensions relevant to Open Science preservation, verification, and certification. Scoring is based on publicly available documentation and feature analysis. All scores are subjective assessments by the author pending peer validation.

**Scale:** 0 (not supported) — 5 (fully supported, production-ready)

---

## 2. Feature Comparison Matrix

| Feature | Zenodo | Figshare | Dataverse | Crossref | LITLE (proposed) |
|---|---|---|---|---|---|
| DOI/Handle registration | 5 | 5 | 5 | 5 | 2 (via Crossref API, not native) |
| File preservation | 5 | 5 | 5 | 0 | 3 (container format, no blob storage) |
| Metadata standards | 4 (DataCite) | 3 (custom) | 4 (DDI/DataCite) | 5 (Crossref schema) | 3 (custom, DataCite-compatible) |
| Epistemic quality scoring | 0 | 0 | 0 | 0 | 4 (9 dimensions, SA optimization) |
| Cryptographic identity | 0 | 0 | 0 | 0 | 5 (LITLE-ID, PQC-ready) |
| Authorship verification | 0 | 0 | 0 | 0 | 3 (GMM stylometry, unvalidated) |
| Source verification | 0 | 0 | 0 | 0 | 4 (5-step pipeline) |
| Evidence chain / provenance | 0 | 0 | 0 | 0 | 4 (SHAKE256 Merkle-DAG) |
| Submission quarantine | 0 | 0 | 0 | 0 | 4 (5-source triangulation) |
| Post-quantum signatures | 0 | 0 | 0 | 0 | 4 (ML-DSA-87) |
| Federated governance | 0 | 0 | 0 | 0 | 4 (7 federations, 5/7 quorum) |
| AI provenance tracking | 0 | 0 | 0 | 0 | 4 (Evidence Chain model/prompt nodes) |
| API availability | 5 (REST) | 4 (REST) | 4 (REST) | 5 (REST) | 0 (not yet public) |
| Maturity / adoption | 5 | 4 | 4 | 5 | 1 (pre-production) |

---

## 3. Detailed Comparison

### 3.1 Zenodo (CERN)
- **Strengths:** Proven infrastructure, CERN backing, DOI minting, community trust
- **Weaknesses:** No quality filtering, no authorship verification, no PQC, no governance beyond CERN
- **LITLE differentiator:** Epistemic scoring, cryptographic identity, quarantine pipeline

### 3.2 Figshare
- **Strengths:** Easy submission, broad file support, institutional integration
- **Weaknesses:** Limited metadata, no verification layer, no certification
- **LITLE differentiator:** Full verification suite (4 methodologies), DAC certification

### 3.3 Dataverse (Harvard)
- **Strengths:** Strong data citation, DDI metadata, institutional branding
- **Weaknesses:** Focus on data (not general academic works), no quality scoring, no PQC
- **LITLE differentiator:** General academic works, 9-dim epistemic scoring, PQC hardening

### 3.4 Crossref
- **Strengths:** Ubiquitous DOI registration, metadata API, DOI Event Tracker
- **Weaknesses:** Registration-only, no preservation, no content verification
- **LITLE differentiator:** Content-level verification, evidence chain, certification

---

## 4. Gap Analysis

| Gap | LITLE Status | Priority |
|---|---|---|
| DOI registration | Not implemented (Crossref API integration planned) | High |
| File/blob storage | Not implemented (container only) | High |
| Metadata export | DataCite schema export pending | Medium |
| Public API | Not yet available | High |
| Scalability | Not tested under load | High |
| Adoption | Zero external users | High |
| External audit | Not performed | High |
| Peer-reviewed publication | Pre-print only | Medium |

---

## 5. Performance Benchmarks (Preliminary)

These are preliminary measurements on development hardware (local machine, no production load).

| Operation | Latency | Notes |
|---|---|---|
| LITLE-ID generation (classic) | ~2ms | SHA-256 of content |
| LITLE-ID generation (PQC) | ~80ms | SHAKE256 of content |
| ML-DSA-87 key generation | ~350ms | Reference implementation |
| ML-DSA-87 signing | ~420ms | 8KB container |
| ML-DSA-87 verification | ~55ms | Key-committing |
| Epistemic scoring (SA) | ~180ms | 1000 iterations |
| Triangulation (all 5 sources) | ~2-5s | Network-dependent |
| DAC generation (classic) | ~5ms | HMAC-SHA-512 |
| DAC generation (dual) | ~450ms | ML-DSA + HMAC |

---

## 6. Open Questions for Benchmark Validation

1. How does LITLE epistemic scoring correlate with human expert judgment? (Needs IRB study)
2. What is the deduplication accuracy of the quarantine pipeline? (Needs labeled dataset)
3. How does ML-DSA-87 signing performance scale under concurrent load?
4. What is the storage overhead of Bech32m-encoded PQC containers vs. raw bytes?
5. How does LITLE triangulation compare to manual curator review?

---

## 7. References

1. Zenodo. https://zenodo.org
2. Figshare. https://figshare.com
3. Dataverse. https://dataverse.org
4. Crossref. https://www.crossref.org
5. NIST FIPS 204. Module-Lattice-Based Digital Signature Standard
6. RFC-0001 through RFC-0015. LITLE Standards.

---

## 8. Revision History

| Date | Version | Changes |
|---|---|---|
| 2026-07-21 | 0.1 | Initial draft |
