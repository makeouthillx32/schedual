# DART BUCKS: USER INTERFACE GUIDE & INCENTIVE OPERATIONAL WORKFLOW

> **Document Version**: 4.0.0  
> **Target Audience**: Job Coaches, Employment Specialists, Department Managers (Manager Darlene), Cashiers, & Shredding Staff  
> **Tool Location**: `https://schedual-five.vercel.app/Tools/dart-bucks-generator`  
> **UI Components**: [[GenerationModeToggle]] | [[DrawerAmountPresets]] | [[BillWeightingTiles]] | [[A4PreviewTabs]] | [[CropEditorModal]] | [[ShredDestructionPolicy]]  

---

## 1. Tool Overview & Quick Navigation

The **DartBucks Generator** is an interactive web tool built into the DART CMS platform. Staff use this tool to print on-the-spot reward bills or generate itemized cash drawers for facility departments.

To access the tool:
1. Log in to DART CMS.
2. Click **Tools** in the top navigation or footer.
3. Select **DartBucks Generator** (`/Tools/dart-bucks-generator`).

---

## 2. Step-by-Step UI Workflows

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DART BUCKS UI DASHBOARD                           │
├───────────────────────────────┬─────────────────────────────────────────────┤
│  LEFT PANEL: CONTROLS & FORM  │       RIGHT PANEL: LIVE VISUAL PREVIEW      │
│  • Mode: [Drawer] / [Single]  │  [ Single Card ] [ A4 Front ] [ A4 Back ]   │
│  • Drawer Presets: [$200]/[$250]│  ┌───────────────────────────────────────┐  │
│  • Weighting: [Balanced/Light]│  │                                       │  │
│  • Denominations: [$1/$5/$10] │  │          LIVE CANVAS PREVIEW          │  │
│  • Duplex Back Checkbox       │  │                                       │  │
│  • Upload & Crop Client Art   │  └───────────────────────────────────────┘  │
└───────────────────────────────┴─────────────────────────────────────────────┘
```

---

### Workflow A: Job Coach On-the-Spot Field Reward ($1, $5, $10 Bills)

**Use Case**: You are at the [[DARTThriftShop]] or on a job site and notice a client proudly wearing their **DART ID Badge** or official **DART Shirt**. You want to reward them on the spot with a DART Buck.

#### Step-by-Step UI Instructions:
1. Open [[DartBucksGenerator]].
2. In the **[[GenerationModeToggle]]** box (top-left), click **Single Denomination Batch**.
3. Under **[[MonopolyDenominationStyles]]**, click the desired bill value:
   - Click **$1** (Pastel Yellow/Pink style)
   - Click **$5** (Rose Pink style)
   - Click **$10** (Amber Yellow style)
4. Check the **[[LiveCardPreview]]** on the right side of your screen to confirm the bill graphics and serial number format (`COACH-XXXXXX-0001-XX`).
5. Click **[[ExportPDFButton]]** in the top-right banner.
6. Print the generated 2×7 sheet, cut the bills, and hand them to the client!

---

### Workflow B: Manager Darlene Departmental Cash Drawer ($100, $200, $250 Allotment)

**Use Case**: Department Manager [[ManagerDarlene]] asks: *"Hey, this department needs $100 in DartBucks, can you get that for them?"*

#### Step-by-Step UI Instructions:
1. Open [[DartBucksGenerator]].
2. Under **[[GenerationModeToggle]]**, select **Cash Drawer Mode ($200/$250)**.
3. Type `$100` (or click `$200` / `$250` presets) into the **Target Cash Amount** box.
4. Select your **[[BillWeightingPreference]]**:
   - **Balanced**: Standard mix ($20s, $10s, $5s, $1s).
   - **Heavy ($20s)**: Higher denomination bills.
   - **Light ($1s)**: Extra $1s and $5s for high-volume change drawers.
   - **Custom**: Type exact bill quantities into the denomination input boxes.
5. Click **[[ExportPrepressPDFButton]]**. The **[[PrintAuthModal]]** appears:
   - Enter Issuer Name (*Manager Darlene* or *Job Coach*)
   - Select Department (*Commercial Services*, *Thrift Shop*, *Janitorial*, etc.)
   - Enter Authorization PIN
6. **Print & Sign**:
   - Page 1 prints as the formal **[[CashDrawerAuditSlip]]** listing the batch hash, date, issuer, and bill counts.
   - Manager [[ManagerDarlene]] and the department recipient sign Page 1, attach it to the cash drawer, and issue the batch!

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

## 3. Quick Reference UI Control Summary

| UI Element | Location | Function |
| :--- | :--- | :--- |
| **[[GenerationModeToggle]]** | Top Left | Switch between single denomination batches and cash drawer allotments. |
| **[[DrawerAmountPresets]]** | Left Column | Type any target drawer amount ($100, $200, $250) or click presets. |
| **[[PrintAuthModal]]** | Pop-up Modal | Enforces manager authorization PIN, issuer name, and department tracking. |
| **[[TurnedInButton]]** | Audit Table | 1-click marks batch as collected at the store register. |
| **[[ShredUnusedButton]]** | Audit Table | Marks unallocated bills as handed over to the DART Shredding Department. |
| **[[ExportPDFButton]]** | Header Banner | Generates 300DPI prepress PDF containing Audit Slip & bill sheets. |

---

## 4. Related WikiLinks & Tools

- [[DartBucksGenerator]] - Main App Route (`/Tools/dart-bucks-generator`)
- [[ManagerDarleneWorkflow]] - Departmental Allotment Standard Operating Procedure
- [[DARTThriftShop]] - Community Retail & Register Turn-In Site
- [[DARTShreddingDepartment]] - Secure Currency Shredding & Destruction Protocol
- [[CashDrawerAuditSlip]] - Page 1 Printable PDF Receipt & Signature Form
