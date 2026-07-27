# DART BUCKS: USER INTERFACE GUIDE & INCENTIVE OPERATIONAL WORKFLOW

> **Document Version**: 3.0.0  
> **Target Audience**: Job Coaches, Employment Specialists, Department Managers (Manager Darlene), & Cashiers  
> **Tool Location**: `https://schedual-five.vercel.app/Tools/dart-bucks-generator`  
> **UI Components**: [[GenerationModeToggle]] | [[DrawerAmountPresets]] | [[BillWeightingTiles]] | [[A4PreviewTabs]] | [[CropEditorModal]]  

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

### Workflow B: Manager Darlene Departmental Cash Drawer ($200 or $250 Allotment)

**Use Case**: Department Manager [[ManagerDarlene]] requests a $200 or $250 cash drawer of DART Bucks for an upcoming department incentive program or store register.

#### Step-by-Step UI Instructions:
1. Open [[DartBucksGenerator]].
2. Under **[[GenerationModeToggle]]**, select **Cash Drawer Mode ($200/$250)**.
3. Click the **[ $200 Preset ]** or **[ $250 Preset ]** button under **[[DrawerAmountPresets]]**.
4. Select your **[[BillWeightingPreference]]**:
   - **Balanced**: Standard mix ($20s, $10s, $5s, $1s).
   - **Heavy ($20s)**: Higher denomination bills.
   - **Light ($1s)**: Extra $1s and $5s for high-volume change drawers.
   - **Custom**: Type exact bill quantities into the denomination input boxes.
5. Under **[[DuplexPrintingSettings]]**, ensure **Include Double-Sided Back Pages (Mirrored Duplex Grid)** is checked.
6. **Verify Paper Layout**:
   - Click **[[A4FrontGridTab]]** on top of the preview window to see how the bill fronts look on the paper sheet.
   - Click **[[A4BackMirroredTab]]** to inspect the double-sided back side with the DART emblem and mirrored column alignment.
7. Click **[[ExportAllotmentPDFButton]]**.
8. **Print & Sign**:
   - Load paper into printer and select **Print Double-Sided** (Flip on Long Edge).
   - Page 1 prints as the formal **[[CashDrawerAuditSlip]]**.
   - Manager [[ManagerDarlene]] signs Page 1, attaches it to the cash drawer, and issues the batch!

---

### Workflow C: Uploading & Cropping Client Contest Artwork

**Use Case**: A client submits a custom drawing for the monthly DART Buck contest. You want to upload it and fit it onto the official bill template.

#### Step-by-Step UI Instructions:
1. Scroll down the left panel to **[[UploadClientDrawingBox]]**.
2. Enter the **Artwork Title** (e.g., *"Sarah's Winning Sunset"*) and **Client Artist Name** (e.g., *"Sarah M."*).
3. Click **[[SelectUploadArtFileButton]]** and choose the image file from your computer.
4. The **[[CropEditorModal]]** opens automatically:
   - **Fit Mode Buttons**: Click `Cover` (smart aspect crop), `Fit` (contain full drawing), or `Stretch` (forced fill).
   - **Zoom Slider**: Drag left/right to scale between 0.5× and 3.0×.
   - **Horizontal Offset Slider**: Pan drawing left or right.
5. Review the 1200×469 px live frame in the modal.
6. Click **[[CropSavePermanentlyButton]]**.
7. The cropped artwork immediately applies to all active bills and saves to the [[ClientBucksGallery]].

---

## 3. Quick Reference UI Control Summary

| UI Element | Location | Function |
| :--- | :--- | :--- |
| **[[GenerationModeToggle]]** | Top Left | Switch between single denomination batches and $200/$250 cash drawer allotments. |
| **[[DrawerAmountPresets]]** | Left Column | 1-click sets target drawer to `$200` or `$250`. |
| **[[BillWeightingTiles]]** | Left Column | Auto-calculates bill mix (`Balanced`, `Heavy`, `Light`, `Custom`). |
| **[[A4PreviewTabs]]** | Top Right | Switch live view between `Single Card`, `A4 Front Grid`, and `A4 Back (Mirrored)`. |
| **[[CropEditorModal]]** | Pop-up Modal | Interactively crop, zoom, and stretch client artwork to 1200×469 px. |
| **[[DuplexCheckbox]]** | Left Column | Enables mirrored back-page PDF generation for double-sided printers. |
| **[[ExportPDFButton]]** | Top Right Header | Generates 300DPI print-ready PDF containing Audit Slip & bill sheets. |

---

## 4. Related WikiLinks & Tools

- [[DartBucksGenerator]] - Main App Route (`/Tools/dart-bucks-generator`)
- [[ManagerDarleneWorkflow]] - Departmental Allotment Standard Operating Procedure
- [[DARTThriftShop]] - Community Retail & Field Reward Site
- [[CashDrawerAuditSlip]] - Page 1 Printable PDF Receipt & Signature Form
