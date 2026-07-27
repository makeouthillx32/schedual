# DART BUCKS: SECURITY ARCHITECTURE & CLIENT INCENTIVE DISTRIBUTION PROTOCOL

> **Document Version**: 2.4.0  
> **Effective Date**: July 26, 2026  
> **System Scope**: [[DartBucksGenerator]] | [[HallMonitorSecurity]] | [[CashDrawerAudit]]  

---

## 1. Executive Security Summary & Architecture

The **DART Buck Incentive Currency System** is designed for Desert Area Resources & Training (DART) to reward clients for extraordinary performance, adherence to workplace standards, and active community participation.

To maintain monetary integrity and eliminate fraud or duplication across facility locations, DART Bucks utilize a **Decentralized Security Batch Architecture**.

```
    ┌────────────────────────────────────────────────────────────────────────┐
    │                        SERIAL NUMBER STRUCTURE                         │
    │                                                                        │
    │     [ STATION ] ─── [ BATCH HASH ] ─── [ SERIAL ] ─── [ CHECKSUM ]      │
    │       COACH          B8A3F1             0001            8B             │
    └────────────────────────────────────────────────────────────────────────┘
```

### Security Guardrails:
1. **[[StationID]] Verification**: Identifies the specific coach, station, or department issuing the currency (e.g., `THRIFT`, `VOCATIONAL`, `COACH`).
2. **[[BatchHash]] Tamper Proofing**: Generated using 24-bit pseudo-random entropy per generation run, linking all bills in a batch to a single printable [[CashDrawerAudit]] slip.
3. **[[CryptographicChecksum]]**: Calculated via modulo-256 weight distribution over the combined Station and Serial string (`(sum * 31 + char) % 256`). Counterfeit bills created by altering digits fail checksum validation immediately.
4. **Contrast-Aware Watermark**: High-contrast vector watermarks (`[[watermark-dark.svg]]` / `[[watermark-light.svg]]`) embedded into the fiber mesh background prevent photocopy duplication.

---

## 2. Field Distribution & Client Incentive Protocols

DART Bucks are distributed through two primary operational channels: **On-the-Spot Field Rewards** and **Departmental Cash Drawer Allotments**.

### Protocol A: On-the-Spot Field Recognition ("Spotted in Uniform")
Coaches and staff members are authorized to issue single DART Bucks ($1, $5, or $10 denominations) when observing positive client behaviors in the field or community.

* **Scenario Example**: Staff member encounters a client at the [[DARTThriftShop]] or in public who is proudly wearing their **DART ID Badge** or official **DART Shirt**.
* **Action**:
  1. Greet the client and acknowledge their positive representation of DART.
  2. Issue a $1, $5, or $10 DART Buck directly from the coach's active serial batch.
  3. Log the client's name and the issued serial number in the [[CoachDailyReport]].

```
+-------------------------------------------------------------------------+
|                  ON-THE-SPOT INCENTIVE TRIGGER MATRIX                   |
+--------------------------+--------------------+-------------------------+
| Behavior / Achievement   | Recommended Bill   | Authorized Issuer       |
+--------------------------+--------------------+-------------------------+
| Wearing Badge/DART Shirt | $1 - $5 DartBuck   | All Job Coaches & Staff |
| Perfect Shift Attendance | $10 DartBuck       | Job Coach               |
| Peer Assistance / Safety | $5 - $10 DartBuck  | Employment Specialist   |
| Contest Winner / Milestone| $20 DartBuck       | Department Manager      |
+--------------------------+--------------------+-------------------------+
```

---

## 3. Manager Cash Drawer Allotment & Departmental Batches

When managers (e.g., [[ManagerDarlene]]) request currency allotments for individual departments or facility-wide incentive programs, staff generate structured **Cash Drawers** ($200 or $250 standard batches).

```
   ┌──────────────────────────────────────────────────────────────────────┐
   │                  MANAGER DARLENE ALLOTMENT WORKFLOW                  │
   └──────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
                      [[DepartmentDrawerRequest]]
                      (Specify Total: e.g. $200.00)
                                      │
                                      ▼
                      [[BillWeightingSelection]]
                      (Balanced / Heavy $20s / Light $1s)
                                      │
                                      ▼
                      [[BatchPDFGeneration]]
                      • Page 1: [[CashDrawerAuditSlip]]
                      • Pages 2+: Duplex Mirrored Bills
                                      │
                                      ▼
                      [[ManagerSignatureVerification]]
```

### Department Allotment Procedure:
1. **Request Intake**: Manager (e.g., [[ManagerDarlene]]) submits a request for a $200 or $250 drawer for one or more departments (e.g., [[ThriftStoreDept]], [[JanitorialDept]], [[VocationalDept]]).
2. **Batch Configuration**:
   - Open [[DartBucksGenerator]].
   - Select **Cash Drawer Mode**.
   - Set Target Amount to `$200` or `$250`.
   - Choose [[BillWeighting]]:
     - `Balanced`: Standard mix ($20s, $10s, $5s, $1s).
     - `Light Bills`: Change drawer mix with extra $1s and $5s.
     - `Heavy Bills`: High-denomination mix.
3. **Audit Slip Generation**:
   - Page 1 of the generated PDF renders the formal [[CashDrawerAuditSlip]].
   - The slip captures:
     - Date & Time Stamp
     - Unique [[BatchId]]
     - Issuing Station Identifier
     - Full Itemized Bill Count & Total Cash Value
     - Dual Signature Lines (Coach/Manager & Cashier/Recipient).
4. **Duplex Mirrored Printing**:
   - Print the batch double-sided using short-edge or long-edge flip.
   - [[DuplexMirroringMath]] (`mirroredCol = cols - 1 - col`) guarantees that front and back bill graphics align pixel-perfectly on cut lines.

---

## 4. Verification & Anti-Counterfeiting Checklist

Before accepting or redeeming DART Bucks at the [[DARTStore]] or [[ClientIncentiveCenter]], cashiers and coaches must verify:

- [ ] **Serial Format Match**: Must conform to `[Station]-[BatchHash]-[Serial]-[Checksum]`.
- [ ] **Checksum Validity**: Checksum digits match mathematical hash.
- [ ] **Watermark Presence**: High-contrast DART vector emblem visible in fiber mesh.
- [ ] **Batch Audit Match**: Serial matches an issued [[CashDrawerAuditSlip]] on file.

---

## 5. Related Documentation Links

- [[DartBucksGenerator]] - Main TypeScript React Generation Tool
- [[HallMonitorSecurity]] - Role-Based Access Control & Permission Rules
- [[CashDrawerAudit]] - Departmental Audit Log & Reconciliation
- [[ManagerDarleneProtocol]] - Administrative Allotment Standard Operating Procedure
- [[DARTThriftShop]] - Community Retail & Field Recognition Site
