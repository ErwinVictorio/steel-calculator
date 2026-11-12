# Excel calculator implementation report

Completed locally: 2026-11-12.
Formula version: `excel-2026-11-v1`.

## Approved decisions

The user explicitly selected Excel as the source of truth after reviewing the conflicts. Checkered Plate now uses the plate formula with no +5 kg. Wide Flange uses the kg/m or lb/ft workbook expression; the old 20/40 divided by 2.2 shortcut has been removed. Flat Bar uses mm/inches/meters and the exact `0.00786 * 25.4` factor.

## Delivered

- 19 calculation choices across Plates, Bars & sections, Pipes & tubes and Known weight.
- MS/other plate grades, Checkered, Base Plate (mm or inch dimensions), Triangle Plate and Round Plate.
- Flat Bar, both Wide Flange rating bases, Channel Bar, Angle Bar, Roll Form and Sheet Pile.
- Pipe and rectangular/square Tubular, with wall-thickness geometry validation.
- Reviewed catalogue, known kg/piece, known kg/m and tagged batch total modes. A tagged batch total is never multiplied by quantity; per-piece value is clearly an average.
- Fixed labels and manual conversion, 6/12 m presets with custom decimal lengths, automatic full-precision results, reset, item names and Copy with manual-copy fallback.
- Formula definitions include version, fixed fields, unit suffixes and workbook source cells. Calculation functions are ordinary JavaScript, with no execution of workbook formulas at runtime.
- The source workbook, extraction and inventory data are not imported into the production bundle.

## Catalogue review

Two exact records were checked and enabled: deformed round bar USN 1M1620029 (25 mm x 7.5 m, 28.9 kg/piece across ten matching formula rows), and channel USN 1F1010002 (75 x 40 mm x 6 m, stored 6.92 kg/m).

CR Shafting USN 1L1610013 remains disabled. LP!G20 stores 378 kg for 10 pieces (37.8 kg/piece), while LP!G137 and subsequent formulas use 6.21 kg/m x 6 = 37.26 kg/piece. Other LP coefficients are not generalized; known-weight modes allow explicit supplier values.

## Verification completed

- `npm test`: 24 tests passed, including reconciliation of 817 nonzero cached weight results across the nine core workbook material sheets against the actual new calculation engine.
- Additional shape cases cover LP!G6, G198, G407 and G1099, including quantities greater than one.
- `npm run lint`: passed.
- `npm run build`: passed. Frontend JS is approximately 279 KB before gzip; audit files are not bundled.
- `npm run test:browser`: 23 tests passed in installed Microsoft Edge. All 19 choices exercised, including resets, invalid inputs, geometry boundaries, length presets/cuts, item names, clipboard success/failure handling and 360/768/1440 px layouts.
- Mobile and desktop screenshots visually inspected.
- Original workbook SHA-256 remains `661468d1856d9ef42c1e77c233c6447b8a29a58dffe5630bfe1b90decdb15f3c`.

## Result changes to expect

| Case | Final result |
| --- | --- |
| MS Plate 5.5 mm x 4 ft x 12 ft, one piece | 192.54 kg, unchanged |
| Checkered Plate 2 mm x 4 ft x 8 ft, one piece | 46.68 kg; no 5 kg allowance |
| Flat Bar 8 mm x 3.34 inches x 6 meters, one piece | 32.01 kg; Item Name ends with 6M |
| Wide Flange 16 lb/ft x 6 meters, one piece | 142.83 kg using 3.28 / 2.20462 |
| Tagged total 100 kg for four pieces | Total 100 kg; average 25 kg/piece |

## Limits

Reconciliation uses saved workbook values, not a new full-workbook Excel recalculation. Existing broken inventory references remain untouched. Clipboard browser tests mock success/denial; real clipboard permissions depend on browser context and the UI supports manual copy. Production-system item data and its questionable width label were not modified. Catalogue coverage is limited to the two reviewed specifications; the full extracted formula inventory remains in docs for subsequent catalogue review.

## Purlins - DONE (2026-11-12)

Added Purlins under Bars & sections with C/Z type, thickness, height, flange width, length in meters and quantity. RF rows 304-305 verify developed width 375 mm for Z 1.9 x 200 x 75 mm. Calculation is thickness x developed width x length x 0.00786; 7.2 m gives 40.3218 kg per piece (40.32 displayed). Other profiles require a confirmed manual developed width. Profile edits clear manual width; length and quantity edits retain it. Auto width is read-only. Item names use section dimensions, not developed width. No USN lookup is introduced. Purlins are entered through the material form; the existing paste parser's supported materials are unchanged.

Validation: added engine and browser coverage for auto width, manual fallback, profile changes, quantities, names and reset. Existing 817 workbook regression samples remain covered.
