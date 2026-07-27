# DART BUCKS: USER INTERFACE GUIDE & INCENTIVE OPERATIONAL WORKFLOW

> **Document Version**: 5.0.0  
> **Target Audience**: Job Coaches, Employment Specialists, Department Managers (Manager Darlene), Cashiers, & Shredding Staff  
> **Tool Location**: `https://schedual-five.vercel.app/Tools/dart-bucks-generator`  
> **UI Components**: [[GenerationModeToggle]] | [[DrawerAmountPresets]] | [[BillWeightingTiles]] | [[MonthPaletteEngine]] | [[MattePaperEngine]] | [[SingleBillInspector]] | [[SheetPageNavigator]] | [[ShredDestructionPolicy]]  

---

## 1. Tool Overview & Quick Navigation

The **DartBucks Generator** is an interactive, prepress-ready web application built into the DART CMS platform. Staff use this tool to print on-the-spot reward bills or generate itemized cash drawers for facility departments, complete with 4.0" × 2.0" Monopoly dimensions, 12-month color palettes, white matte paper print optimization, and high-security audit logging.

To access the tool:
1. Log in to DART CMS.
2. Click **Tools** in the top navigation or footer.
3. Select **DartBucks Generator** (`/Tools/dart-bucks-generator`).

---

## 2. Architecture & Design Capabilities

### 2.1. White Matte Paper Print Realism
- **Clean White Base**: Formatted for physical printing on standard white matte paper stock (`fill="#ffffff"`).
- **Flat Matte Intaglio Inks**: Computerish reflective gradients and glossy glows are replaced with flat matte intaglio ink tones (`#1e293b`, `#831843`, `#713f12`, `#064e3b`).
- **Subtle Intaglio Texture Mesh**: Micro-line intaglio texturing (`#matte-intaglio-mesh`) is restricted to the inner hatched border frame and center seal, allowing the clean white matte paper to dominate.

### 2.2. 12-Month Monopoly Color Palette Engine
- **Automated Calendar Month Inks**: Automatically detects the current calendar month or allows manual override:
  - **January**: Ice Navy & Blue (`#1e293b`, `#0284c7`)
  - **February**: Rose & Magenta (`#4c0519`, `#be185d`)
  - **March**: Shamrock & Mint Green (`#14532d`, `#4d7c0f`)
  - **April**: Lavender & Pastel Spring (`#475569`, `#a21caf`)
  - **May**: Solar Gold & Amber (`#78350f`, `#d97706`)
  - **June**: Marine Cyan & Teal (`#0f172a`, `#0891b2`)
  - **July**: Classic Monopoly Ink (`#18181b`, `#be185d`, `#b45309`, `#047857`)
  - **August**: Solar Blaze & Coral (`#78350f`, `#ea580c`)
  - **September**: Autumn Copper (`#9a3412`, `#c2410c`)
  - **October**: Pumpkin & Plum (`#18181b`, `#6b21a8`)
  - **November**: Wine & Walnut (`#78350f`, `#881337`)
  - **December**: Holly & Evergreen (`#166534`, `#991b1b`)

### 2.3. High-Security Destructive Shred Palette
- **Set Shred Date Trigger**: When **Set Shred Date** is enabled (`validityMode === "expires"`), the bill face transforms into the **Destructive Shred Palette** featuring Deep Crimson `#991b1b` outer borders and the mandatory warning: `"MUST BE DESTROYED BY DART SHRED DEPT ON: [DATE]"`.

### 2.4. Itemized Cash Drawer Allotment & Live Weighting Sync
- **Automated Allotment Dispersion**: Disperses total cash drawer amounts ($100, $200, $250) into itemized $20, $10, $5, and $1 bills (e.g. 7×$20s, 4×$10s, 3×$5s, 5×$1s for a $200 balanced drawer).
- **Instant Weighting Reflection**: Toggling between **Balanced**, **Heavy ($20s)**, **Light ($1s)**, or **Custom** weightings instantly updates the live print canvas and multi-sheet page navigator.

---

## 3. Step-by-Step UI Workflows

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DART BUCKS PREPRESS DASHBOARD                       │
├───────────────────────────────┬─────────────────────────────────────────────┤
│  LEFT PANEL: CONTROLS & FORM  │      RIGHT PANEL: LIVE PREPRESS CANVAS      │
│  • Mode: [Drawer] / [Single]  │  [ Single Bill ] [ Sheet Front ] [ Back ]   │
│  • Drawer Amount: [$200]/[$250]│  ┌───────────────────────────────────────┐  │
│  • Weighting: [Balanced/Light]│  │                                       │  │
│  • 12-Month Palette Selector  │  │    HIGH-DPI MATTE SHEET PREVIEW       │  │
│  • Validity: [Forever/Shred]  │  │                                       │  │
│  • Paper Size: [11"x12" / US] │  └───────────────────────────────────────┘  │
└───────────────────────────────┴─────────────────────────────────────────────┘
```

---

### Workflow A: Job Coach On-the-Spot Field Reward ($1, $5, $10 Bills)

**Use Case**: You are at the [[DARTThriftShop]] or on a job site and notice a client proudly wearing their **DART ID Badge** or official **DART Shirt**. You want to reward them on the spot with a DART Buck.

#### Step-by-Step UI Instructions:
1. Open [[DartBucksGenerator]].
2. In the **[[GenerationModeToggle]]** box (top-left), click **Single Denomination Batch**.
3. Under **[[SingleBillInspector]]**, click the desired bill value:
   - **$1** (Silver-Grey / Slate Matte Ink)
   - **$5** (Vivid Monopoly Pink Ink)
   - **$10** (Canary Gold Ink)
   - **$20** (Monopoly Emerald Mint Ink)
4. Verify the **[[LiveCardPreview]]** to confirm bill graphics and serial number (`COACH-JUL26-0001-XX`).
5. Click **[[ExportPDFButton]]** in the top-right banner.
6. Print the generated prepress sheet, cut the bills, and hand them to the client!

---

### Workflow B: Manager Darlene Departmental Cash Drawer ($100, $200, $250 Allotment)

**Use Case**: Department Manager [[ManagerDarlene]] asks: *"Hey, this department needs $200 in DartBucks for their store register drawer, can you get that for them?"*

#### Step-by-Step UI Instructions:
1. Open [[DartBucksGenerator]].
2. Under **[[GenerationModeToggle]]**, select **Cash Drawer Mode ($200/$250)**.
3. Type `$200` (or click `$100` / `$250` presets) into the **Target Cash Amount** box.
4. Select your **[[BillWeightingPreference]]**:
   - **Balanced**: Standard mix (7×$20s, 4×$10s, 3×$5s, 5×$1s).
   - **Heavy ($20s)**: Higher denomination bills (10×$20s).
   - **Light ($1s)**: Extra $1s and $5s for high-volume change drawers (1×$20, 2×$10s, 6×$5s, 30×$1s).
   - **Custom**: Type exact bill quantities into the denomination input boxes.
5. Review the **[[SheetPageNavigator]]** to inspect **Sheet 1 of 2** and **Sheet 2 of 2**.
6. Click **[[ExportPrepressPDFButton]]**. The **[[PrintAuthModal]]** appears:
   - Enter Issuer Name (*Manager Darlene* or *Job Coach*)
   - Select Department (*Commercial Services*, *Thrift Shop*, *Janitorial*, etc.)
   - Enter Authorization PIN
7. **Print & Sign**:
   - Page 1 prints as the formal **[[CashDrawerAuditSlip]]** listing batch hash, date, issuer, and bill counts.
   - Manager [[ManagerDarlene]] and department recipient sign Page 1, attach it to the cash drawer, and issue the batch!

---

### Workflow C: Register Turn-In & Shred Department Destruction Policy

**Operational Rule**: Clients present earned DartBucks at the DART Thrift Store register to make purchases. Paired cashier teams (a job coach working alongside an adult with a disability) accept physical bills directly into the register drawer.

#### Unused Bill Destruction Policy:
- **Policy Standard**: Any unissued, expired, damaged, or leftover DartBucks that are NOT returned to active circulation **MUST be handed over to the DART Shredding Department for secure destruction**.
- **Audit Logging**:
  - In the **Monthly Audit & Shred Ledger** table (bottom of screen), locate the batch row.
  - Click **[ Shred Unused ]**.
  - Confirm handover to the Shredding Department.
  - The status updates to **Shredded / Destroyed** with an ISO timestamp, permanently closing out the batch ledger record.

---

## 4. Quick Reference UI Control Summary

| UI Element | Location | Function |
| :--- | :--- | :--- |
| **[[GenerationModeToggle]]** | Top Left | Switch between single denomination batches and cash drawer allotments. |
| **[[DrawerAmountPresets]]** | Left Column | Type any target drawer amount ($100, $200, $250) or click presets. |
| **[[MonthPaletteEngine]]** | Left Column | Select any of the 12 calendar month ink themes for instant live preview updates. |
| **[[SingleBillInspector]]** | Preview Top | Toggle single bill preview between $20, $10, $5, and $1 bill faces. |
| **[[SheetPageNavigator]]** | Preview Top | Navigate multi-sheet prepress pages (Sheet 1 of 2, Sheet 2 of 2). |
| **[[PrintAuthModal]]** | Pop-up Modal | Enforces manager authorization PIN, issuer name, and department tracking. |
| **[[TurnedInButton]]** | Audit Table | 1-click marks batch as collected at the store register. |
| **[[ShredUnusedButton]]** | Audit Table | Marks unallocated bills as handed over to the DART Shredding Department. |
| **[[ExportPDFButton]]** | Header Banner | Generates 300DPI prepress PDF containing Audit Slip & bill sheets. |

---

## 5. Related WikiLinks & Tools

- [[DartBucksGenerator]] - Main App Route (`/Tools/dart-bucks-generator`)
- [[ManagerDarleneWorkflow]] - Departmental Allotment Standard Operating Procedure
- [[DARTThriftShop]] - Community Retail & Register Turn-In Site
- [[DARTShreddingDepartment]] - Secure Currency Shredding & Destruction Protocol
- [[CashDrawerAuditSlip]] - Page 1 Printable PDF Receipt & Signature Form
