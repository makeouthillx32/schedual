# MONOPOLY CURRENCY MASTER DESIGN & AESTHETIC ELEVATION PLAN

> **Document Version**: 4.0.0  
> **Scope**: Aesthetic Critique, Vector Intaglio Engraving, Filigree Flourishes, Treasury Signatures, & Future Holographic Roadmap  
> **Target File**: `components/tools/dart-bucks/utils/svgGenerator.ts`  

---

## 1. Critique of Current SVG Generation

An audit of the existing SVG output (`svgGenerator.ts`) reveals key aesthetic and security gaps when evaluated against authentic vintage board game currency (Monopoly play money) and bank-note engraving:

| Current Vector Element | Aesthetic / Security Critique | Proposed Elevation |
| :--- | :--- | :--- |
| **Serial Number Box** | Flat solid white rectangle (`#ffffff`) looks like a digital overlay. | **Engraved Intaglio Frame**: Transparent guilloche border with corner scrolls, security micro-print, and soft drop shadow. |
| **Corner Numerals** | Basic circular stroke without ornate framing. | **Filigree Scroll Vignettes**: Ornate Victorian vector filigree framing each corner numeral. |
| **Center Denomination** | Flat white text with black stroke. | **Engraved 3D Intaglio Block**: Multi-layer offset drop-shadow text with internal fine cross-hatching (`#intaglio-hatch`). |
| **Monopoly Security Rim** | Plain circular border. | **Micro-printed Rim Text**: Curved text along the inner rim reading *"DESERT AREA RESOURCES & TRAINING • DART INCENTIVE CURRENCY"*. |
| **Treasury Signatures** | None. | **Dual Treasury Signature Lines**: Authentic banknote signature lines for *"Treasurer / Manager Darlene"* and *"Secretary / Job Coach"*. |

---

## 2. Elevated Vector Architecture (Implementation Plan)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       ELEVATED MONOPOLY BILL VECTOR LAYOUT                  │
├─────────────────────────────────────────────────────────────────────────────┤
│ ┌─[Filigree]───────────────────────────────────────────────[Filigree]─┐ │
│ │  (20)  ✦ ✦ ✦   D A R T   B U C K S   ✦ ✦ ✦               (20)   │ │
│ │      ┌──────────────────────────────────────────────┐                │ │
│ │      │   D A R T   C O M M E R C I A L   C U R R E N C Y │                │ │
│ │  $   │        ┌────────────────────────────┐        │    $           │ │
│ │      │        │       G I A N T  2 0       │        │                │ │
│ │      │        └────────────────────────────┘        │                │ │
│ │      └──────────────────────────────────────────────┘                │ │
│ │  _______________________                 _______________________    │ │
│ │  Treasurer / Manager Darlene             Secretary / Job Coach      │ │
│ │  ┌──────────────────────────────────────────────────────────────┐   │ │
│ │  │ SERIAL: COACH-B8A3F1-0001-8B           BATCH HASH: B8A3F1   │   │ │
│ │  └──────────────────────────────────────────────────────────────┘   │ │
│ └─[Filigree]───────────────────────────────────────────────[Filigree]─┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Architectural Enhancements:
1. **Victorian Filigree Corner Vignettes**: Four ornate corner scrolls defined in SVG `<g id="corner-filigree">`.
2. **Dual Banknote Treasury Signatures**: Authentic signature lines engraved on the bottom left and bottom right of the bill.
3. **Micro-Printed Security Borders**: Fine $0.5\text{ pt}$ text running along the inner border perimeter.
4. **Intaglio Cross-Hatch Shading**: Fine 45° diagonal mesh pattern creating depth on giant center numerals.

---

## 3. Implementation Status

The proposed enhancements are being compiled directly into [svgGenerator.ts](file:///z:/schedual/components/tools/dart-bucks/utils/svgGenerator.ts).

---

## 4. Envisioned Next MD: Phase 5 Future Roadmap

```
  ┌───────────────────────────────────────────────────────────────────────┐
  │         NEXT MASTER DESIGN (PHASE 5): MOBILE QR & HOLOGRAMS           │
  └───────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
                 [[Phase5_MobileQRVerification]]
                 (Real-Time Mobile Camera Scanner for Redemption)
                                      │
                                      ▼
                 [[Phase5_OpticalHologramOverlay]]
                 (Dynamic CSS/WebGL Metallic Foil Foil Shader)
                                      │
                                      ▼
                 [[Phase5_ClientAchievementBadges]]
                 (Earned Skill Medallions Printed Directly on Bills)
```

The next Master Design (`MONOPOLY_CURRENCY_PHASE5_ROADMAP.md`) will focus on:
1. **Dynamic WebGL Metallic Foil Shader**: Simulated iridescent holographic foil foil band along the left margin.
2. **Mobile Web Camera Scanner**: Instantly scans serial QR code at the DART Thrift Store register to auto-redeem bills and record client reward balances.
3. **Skill Medallion Overlay**: Automatically prints earned client skill badges (e.g. *"Safety Star"*, *"Attendance Champion"*) onto the bill surface.
