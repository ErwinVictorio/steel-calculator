# Steel Weight Calculator

Frontend-only React/Vite calculator using Tailwind CSS v4, shadcn/ui and Lucide. No database or backend.

## Run and verify

- npm install
- npm run dev
- npm test
- npm run lint
- npm run build
- npm run test:browser (uses installed Microsoft Edge; launches a temporary Vite server)

Build output: dist/. Source workbook and audit files in docs/ are never imported into the frontend.

## Formula contract

Version: excel-2026-11-v1. The November 2026 workbook is the source of truth, as confirmed by the user. Fixed unit labels and manual conversion remain. Keep full calculation precision; display two decimals. Total = per-piece weight ? quantity, except tagged batch weight which is already a total.

Changes from v1: Checkered Plate no longer adds 5 kg; Flat Bar uses meters and 0.00786 ? 25.4; Wide Flange replaces the Beam 20/40 ? 2.2 shortcut with exact workbook rating formulas and arbitrary meter lengths.

| Material / mode | Fixed inputs | Formula | Workbook source |
| --- | --- | --- | --- |
| MS Plate | Thickness (mm), Width (feet), Length (feet) | T × W × L × 0.7293 | PL!N8 |
| Checkered Plate | Thickness (mm), Width (feet), Length (feet) | T × W × L × 0.7293 | PL!N645:N663 |
| Base Plate | Thickness (mm), Width (mm), Length (mm) | T × (W ÷ 25.4 ÷ 12) × (L ÷ 25.4 ÷ 12) × 0.7293 | LP!G6 |
| Base Plate (inches) | Thickness (mm), Width (inches), Length (inches) | T × (W ÷ 12) × (L ÷ 12) × 0.7293 | LP!G198 |
| Triangle Plate | Thickness (mm), Width (mm), Length (mm) | (T × (W ÷ 25.4 ÷ 12) × (L ÷ 25.4 ÷ 12) × 0.7293) ÷ 2 | LP!G1099 |
| Round Plate | Thickness (mm), Diameter (mm) | 3.141516 × (D ÷ 2 × D ÷ 2) × T × 7.85 ÷ 1000000 | LP!G407:G412 |
| Flat Bar | Thickness (mm), Width (inches), Length (meters) | T × W × L × 0.00786 × 25.4 | FB!M10 |
| Wide Flange (lb/ft) | Weight rating (lb/ft), Length (meters) | R × (L × 3.28) ÷ 2.20462 | WF!AA11 |
| Wide Flange (kg/m) | Weight rating (kg/m), Length (meters) | R × L | WF!AA9 |
| Channel Bar | Weight rating (kg/m), Length (meters) | R × L | CB!Q8 |
| Angle Bar | Thickness (mm), Outside width / leg 1 (mm), Outside height / leg 2 (mm), Length (meters) | ((W1 × W2) − (W1 − T) × (W2 − T)) × L × 7.85 ÷ 1000 | AB!O20 |
| Roll Form | Thickness (mm), Developed strip width (mm), Length (meters) | T × W × L × 0.00786 | RF!N8 |
| Sheet Pile | Weight rating (kg/m), Length (meters) | R × L | SP!Q8 |
| Pipe | Outside diameter (mm), Thickness (mm), Length (meters) | 3.1416 × T × (OD − T) × L × 0.00786 | PP!Q11 |
| Tubular | Thickness (mm), Outside width / leg 1 (mm), Outside height / leg 2 (mm), Length (meters) | 2 × T × (W1 + W2 − 2 × T) × L × 0.00786 | TB!O9 |
| Catalogue Item |  | Catalogue kg per piece × quantity | Reviewed LP / CB records |
| Known kg per piece | Weight per piece (kg/pc) | Known kg per piece × quantity | User-supplied per-piece weight |
| Known kg per meter | Weight rating (kg/m), Length (meters) | R × L | User-supplied linear rating |
| Tagged batch weight | Tagged total weight (kg) | Total = tagged kg; average per piece = total ÷ quantity | User-supplied total; CL / TJCOIL store net weights |

## Simple calculator tools

No USN, item-code lookup or catalogue records are included in the calculator. The 18 calculation modes use manually entered measurements or known weights.

- Expand the unit converter, choose the destination field and source unit, enter a value and select Apply. The calculator keeps its fixed units and uses the full converted value.
- Copy computation includes item name, quantity, per-piece/average weight and total.
- Add to list saves a snapshot. Later input changes do not change saved rows; use Edit and Update item. Remove deletes a row from the current list.
- Grand total sums full-precision weights. Tagged batch totals are not multiplied again.
- Print generates a clean list sheet. Export CSV opens in Excel and retains numeric precision; it is CSV, not an XLSX workbook. Item names are quoted and spreadsheet formula prefixes escaped.
- The list is session-only and clears on reload. Copy or export it before leaving.

## Architecture

- src/data/formulas.js: versioned field contracts, units, exact expressions and provenance.
- src/lib/calculations.js: pure calculation and shared/geometry validation.
- src/lib/item-name.js: family-specific names derived from valid inputs.
- src/components/calculators/: grouped material selection, fields, result, copyable name.

## Evidence and limits

23 unit tests include 817 nonzero source rows from nine core sheets, plus additional shapes, known weights, edge cases and naming. The fixtures are tests only. 23 browser tests cover all modes, clipboard handling, reset, geometry errors, converter Apply, list edit/remove/snapshots, CSV download, print CSS and three viewport sizes. Clipboard test branches use a mocked browser clipboard API; deployment permissions remain browser-dependent, with manual-copy fallback.

Reconciliation is against saved workbook results, not a fresh full Excel recalculation. The workbook contains broken inventory references and lookup errors. Historical workbook audit files remain in docs, but no catalogue data is used by the application. The production-system width label discussed in the screenshot has not been changed.

See docs/EXCEL_CALCULATOR_UPDATE_PLAN.md and docs/IMPLEMENTATION_REPORT.md.
