# Workbook formula findings and calculator update plan

Source: `NOV 2026 DAILY DELIVERY REPORT.xlsx` (reviewed 2026-11-12).
Status: implemented on 2026-11-12. After the audit, the user explicitly selected the Excel formulas as the source of truth. This supersedes the earlier recommendations to retain Checkered +5 and the old Beam shortcut. See IMPLEMENTATION_REPORT.md for final behavior and validation. The original workbook remains unchanged.

## 1. Extraction coverage and verification

- 22 worksheets inspected, including sheets without formulas.
- 279,093 formula cells extracted. Independent raw worksheet XML count is also 279,093.
- 123,264 shared-formula follower cells expanded using their master formula and relative/absolute references. No unresolved shared formulas.
- 3,961 arithmetic weight cells independently evaluated using saved numeric input values: all match cached workbook results within relative tolerance `1e-8 * max(1, abs(expected))`. This covers the beginning-weight column in all nine core material sheets and arithmetic weight formulas in LP; it is not a full Excel recalculation.
- Formula-cell cached errors: 13,387 `#REF!`, 1,904 `#N/A`, and 2 `#VALUE!`. Some other error cells are literals rather than formula nodes. Errors frequently belong to missing inventory references or blank lookup rows. They must not be copied into a calculator engine.
- Source SHA-256: `661468d1856d9ef42c1e77c233c6447b8a29a58dffe5630bfe1b90decdb15f3c`.
- Cell references below are workbook evidence, not web citations. Saved cached values are not evidence that the separate production system runs the same code.

### Files produced

| File | Purpose |
| --- | --- |
| `workbook-formulas.csv` | Every formula cell: sheet, address, full resolved formula, cached value, shared-master reference, formula type. About 25 MB. |
| `workbook-formula-patterns.md` | All formula patterns grouped by row-generalized references, with exact example formulas and occurrence counts. |
| `workbook-local-purchase-rules.md` | Every distinct LP weight rule with material description and example row. Includes catalogue-weight constants and exceptions. |
| `workbook-material-rows.json` | Core material row inputs and beginning-weight formulas for review and fixtures. |
| `workbook-audit-summary.json` | Counts, errors, defined names and source hash. |
| `workbook-numeric-verification.json` | Arithmetic verification and nonzero examples. |
| `workbook-extraction.json` | Full extracted cells and formulas; about 78 MB. Audit-only, never bundle in the app. |
| `extract-workbook.ps1`, `analyze-workbook.mjs`, `verify-workbook.mjs` | Repeatable local extraction, shared-formula expansion, and numeric verification. |

The CSV deliberately retains Excel formula text with `=`. View/import its formula column as text to inspect expressions; use the Markdown inventory for straightforward reading.

## 2. Formula inventory for the core steel families

All formulas below produce kg per piece unless quantity `Q` is explicitly included. Total weight is per-piece weight multiplied by positive whole-number quantity. Keep constants and calculation precision exactly as written; round only displayed results.

| Sheet / family | Inputs and fixed units from workbook headers | Per-piece formula | Evidence |
| --- | --- | --- | --- |
| PP / Pipe | Outside diameter OD mm; thickness T mm; length L meters | `3.1416 * T * (OD - T) * L * 0.00786` | PP!F5:I5, Q8, Q11 |
| CB / Channel Bar | Weight rating R kg/m; length L meters | `R * L` | CB!G5:H6, Q8 |
| AB / Angle Bar | Thickness T mm; legs W1 and W2 mm; length L meters | `((W1 * W2) - (W1 - T) * (W2 - T)) * L * 7.85 / 1000` | AB!D5:G6, O8, O20 |
| WF / Wide Flange, metric rating | Weight rating R kg/m; length L meters | `R * L` | WF!G5:I5, AA9 |
| WF / Wide Flange, imperial rating | Weight rating R lb/ft (`#/ft` in Excel); length L meters | `R * (L * 3.28) / 2.20462` | WF!AA11, AA18 and I11:I18 |
| RF / Roll Form | Thickness T mm; developed strip width W mm; length L meters | `T * W * L * 0.00786` | RF!D6:F6, N8 |
| PL / Plate | Thickness T mm; width W feet; length L feet | `T * W * L * 0.7293` | PL!D6:F6, N8 |
| SP / Sheet Pile | Weight rating R kg/m; length L meters | `R * L` | SP!H5:I5, Q8 |
| FB / Flat Bar | Thickness T mm; width W inches; length L meters | `T * W * L * 0.00786 * 25.4` | FB!C6:E6, M8, M10 |
| TB / Tubular | Thickness T mm; outside W1 and W2 mm; length L meters | `2 * T * (W1 + W2 - 2 * T) * L * 0.00786` | TB!D6:G6, O8, O9 |

### Important interpretation details

- **Pipe:** Excel's G5 says `ID (in)`, but that column is not used by its weight formula. Do not replace actual OD with a nominal pipe size. Type, schedule, class and nominal size can be catalogue/name metadata; lookup actual OD and thickness before calculating.
- **Channel Bar:** H is a stored kg/m rating, not a computed geometry result. I contains lb/ft values, but no H/I formulas were found. B1 says `LBS/FT=KG/M/1.488`; some stored row values do not obey that note. Use the verified H rating as the workbook basis, not an inferred conversion from I.
- **Wide Flange:** supports actual meter lengths beyond 6 and 12, including 2.3, 3, 9, 5.5 and other cut lengths. Formula branches are written into rows rather than a universal IF statement. Choose the branch from the explicit rating basis. Several old count columns have broken references; WF!K437 is one example. Beginning-weight formulas remain usable for the verified fixtures.
- **Roll Form:** W is the strip/developed width used in the workbook, not necessarily the visible face width of a C-purlin. Require developed width or a reviewed profile catalogue. Do not invent a profile-to-strip conversion.
- **Sheet Pile:** size, thickness, origin and mill are metadata; dimensions alone do not supply its kg/m rating. Require a catalogue rating or explicit kg/m input.
- **Tubular:** the formula is for rectangular/square hollow sections. Do not apply it to a circular tube. Workbook classifications include SQUARE, RCTNGLR, GI and SS variants; these use the same workbook rule, not a separately verified material-density model.
- **Plate:** workbook types include MSP, MSP (SC), MSP A572, ABS, BLASTED ABS, CHCKRD, CR, GI, SS 304 and GA. The sheet applies the same 0.7293 rule to these rows. This is workbook behavior, not a claim that all alloys/coatings have identical physical density.

## 3. The Flat Bar discrepancy is now explained numerically

Workbook headers explicitly say **T mm / W inches / L meters**.

For the numbers from the production screenshot:

```text
8 * 3.34 * 6 * 0.00786 * 25.4 = 32.00692608 kg
Displayed: 32.01 kg
```

This reproduces the displayed production number. It does not prove the production application's internal code or correct the production width label: that screenshot said `3.34 MM`, whereas this workbook formula treats 3.34 as inches. If the physical width truly is 3.34 mm, the corresponding width input is `3.34 / 25.4` inches and the result is 1.2601152 kg. Confirm the item specification separately before changing an actual item's units.

Current calculator uses `T(mm) * W(inches) * L(feet) * 0.0608`. The workbook coefficient expressed with feet would be `0.00786 * 25.4 * 0.3048 = 0.0608514912`, so converting length alone still leaves a small coefficient difference. Proposed Excel-aligned mode must use the exact workbook expression and meter input, rather than tweaking 0.0608 until examples match.

## 4. Conflicts with previously approved rules

### Checkered Plate

- There are 19 CHCKRD rows in PL.
- PL!N645 is `=$D645*$E645*$F645*0.7293*M645`; it has no extra 5 kg.
- Row 645: T=2 mm, W=4 ft, L=8 ft, Q=1,033; cached total=48,215.4816 kg, per-piece=46.6752 kg.
- Existing user-confirmed rule adds **5 kg per piece**. That would yield 53,380.4816 kg for the same quantity.
- Final decision: the user explicitly chose Excel formulas. The application now uses the workbook base-only Checkered formula; the +5 rule is retired.

### Beams / Wide Flange

- Existing rule: `R * 20 / 2.2` for 6 m, `R * 40 / 2.2` for 12 m.
- Workbook imperial rule: `R * L(m) * 3.28 / 2.20462`.
- Final decision: replacement was approved by the instruction to follow Excel. Both Wide Flange rating branches are implemented and the 20/40 shortcut is retired. Regression expectations have been updated.

### Flat Bar

- Existing rule and feet label were user-confirmed before the workbook was supplied.
- Proposed update replaces this with the workbook's mm/inches/meters expression only when the update plan is accepted. Update formula display, labels, tests and Item Name suffix together.

## 5. Additional shapes and catalogue rules in LP

LP is a mixed local-purchase ledger, not a clean universal material formula table. The complete distinct expressions are in `workbook-local-purchase-rules.md`.

| Shape / rule | Per-piece formula or behavior | Evidence / limitations |
| --- | --- | --- |
| Rectangular Base Plate, all mm | `T * (W / 25.4 / 12) * (L / 25.4 / 12) * 0.7293` | LP!G6, inputs C6:E6; F6 is quantity |
| Base Plate, inches for width/length | `T * (W / 12) * (L / 12) * 0.7293` | LP!G198; workbook expression omits quantity; row quantity is 1. Treat this as a per-piece expression and multiply by Q in the app. |
| Triangle Base Plate, all mm | Rectangular base plate result `/ 2` | LP!G1099; its Excel expression includes quantity F1099 |
| Round Plate, all mm | `3.141516 * (D / 2 * D / 2) * T * 7.85 / 1000000` | LP!G407:G412; preserve 3.141516 for Excel parity, not Math.PI or pipe constant 3.1416 |
| Catalogue per-piece weight | `catalogueKgPerPiece * Q` | Many row-specific constants, e.g. LP!G175 `28.9*F175` for a deformed round bar specification |
| Catalogue linear rating | `catalogueKgPerMeter * lengthMeters * Q` | Example LP!G137 `6.21*6*F137` for CR shafting; six is hardcoded in this row, not valid for all item lengths |
| Manual/item-specific weight | Stored values or bespoke formulas | LP!G7 contains 19, not a formula; LP!G413 is `F413*E413`, with E=3 and F=218, contrary to the generic quantity header expectation |

Other LP descriptions include pipes, anchor bolts, plain/deformed round bars, shafting, stainless items, fasteners and accessories. Their presence does not establish a universal geometric formula. Extract a reviewed catalogue keyed by USN + exact specification + length + weight basis. Do not generalize one row's coefficient to every item in its material family.

### Coils and operational sheets

- CL and TJCOIL store net weights (CL column H; TJCOIL column G) and compute inventory counts/balances. No general coil geometry weight formula was found. Offer a clearly identified known/tagged-weight mode only if required.
- INVENTORY and DR SUMMARY summarize stock and daily movement.
- IMP, RR, RS, JOIN and JOOUT use VLOOKUP to USN descriptions and SUM/SUMIF-style quantity aggregation.
- DR and USN contain no formula cells. USN is a reference list, not a geometry formula catalogue.
- WFJO has only total-quantity and weight/1000 summary formulas.
- These sheets remain in the complete formula export, but their inventory logic is outside the weight calculator update.

## 6. Proposed UI and behavior

1. Keep the current light, solid-color interface, automatic results, reset, quantity, per-piece/total split, and Copy Item Name.
2. Group material choices into Plates, Bars/Sections, Pipes/Tubes and Known Weight. Avoid a single row of 15 small tabs on mobile.
3. Keep **fixed unit labels and manual conversion**, as requested. Do not reintroduce per-field unit dropdowns. Add field-specific helper text and an explicit units sentence beside each formula.
4. Flat Bar workbook input labels: T mm / W inches / L meters. Item Name example: `FLAT BAR 8MM X 3.34IN X 6M`.
5. Separate Wide Flange kg/m and lb/ft calculation choices or explicit rating-mode tabs. These choose distinct formula contracts, not arbitrary input-unit conversion. Request kg/m for Channel Bar and Sheet Pile.
6. Allow positive decimal lengths for workbook WF, Pipe, Angle, Roll Form, Flat Bar, Tubular and Sheet Pile. Keep optional 6 m / 12 m presets, with free length entry for cuts.
7. Required name-only metadata must not silently affect weight. For Pipe/WF/Channel/Sheet Pile, show a generic name if profile details are absent; do not fabricate dimensions from a weight rating. Quantity stays out of the item name.
8. Invalid/blank dimensions clear the result; copy is unavailable until a valid name can be generated. Keep successful copy feedback and manual-copy fallback.
9. Result explanation shows the selected formula, fixed units, per-piece value, quantity and full total. Display two decimals while retaining full internal precision.
10. Catalogue/known-weight results must be labelled as such, distinct from calculated geometry estimates.

## 7. Implementation phases and file changes

### Phase A: freeze formula contracts and resolve conflicts

Deliver a versioned formula catalogue with `id`, source sheet/cells, required inputs, fixed units, constants, formula explanation, naming fields and validation rules. Agree on Checkered +5 versus workbook base-only and old Beam shortcut versus WF workbook formula. Keep existing behavior until the choice is explicit. Accept Flat Bar's new meter-based contract as part of approving this plan. Preserve a baseline of current examples for comparison.

### Phase B: calculation engine

- Refactor `src/data/formulas.js` into declarative definitions for existing and new families.
- Refactor `src/lib/calculations.js` into a common validation/quantity layer and named pure calculation functions; remove hardcoded assumptions that all non-beam items use the same three fields.
- Implement Pipe, Channel, Angle, Wide Flange (two rating bases), Roll Form, Sheet Pile and Tubular from the audited rules.
- Add Base Plate rectangle, triangle and round formulas as separate shape definitions.
- Preserve exact constants including 0.00786 versus 7.85/1000 and 3.141516 versus 3.1416. Do not globally normalize them into a single density/pi constant.
- No runtime execution of Excel formulas. Compile reviewed rules into ordinary JavaScript functions; workbook text remains audit evidence.

### Phase C: inputs, layout and item names

- Split `src/App.jsx` into reusable MaterialSelector, DimensionFields, WeightResult and ItemName components.
- Render required fields from each formula definition and keep per-material unit labels aligned with the Item Name formatter.
- Extend `src/lib/item-name.js` with family-specific templates. Include MM/IN/FT/M and rating units as applicable.
- Update `src/App.css` for more families, longer names, rating inputs, mobile wrapping and accessible labels.
- Clear stale values and copy status on material changes; reset restores the selected family's initial values.

### Phase D: optional reviewed catalogue and known weights

- Build a small reviewed catalogue from useful USN/material records, not the entire workbook.
- Model `kgPerPiece`, `kgPerMeter` and `taggedTotalKg` as distinct data types. A tagged total is not automatically a per-piece weight.
- Include description, specification, unit basis, source row and review state.
- Block missing/conflicting catalogue records. Never infer a rating from dimensions when the workbook itself uses a stored rating.
- Do not bundle the source workbook, inventory transactions, 78 MB extraction, or 25 MB CSV into the frontend.

### Phase E: reconciliation and acceptance

- Add fixtures derived from workbook formulas and nonzero cached values. Test every family, both WF rating branches, Q=1 and Q>1, cut lengths and applicable geometry boundaries.
- Keep screenshot regression case: Flat Bar 8 / 3.34 / 6 -> 32.00692608 -> 32.01 kg under the workbook contract.
- Checkered tests follow the approved rule and explicitly document the difference from PL!N645 if +5 is retained.
- Pipe: require `OD > 2*T`; tubular: `W1 > 2*T` and `W2 > 2*T`; angle: `T < min(W1,W2)`; all required numbers finite and positive; quantity a safe positive integer; reject overflow/nonfinite results.
- For RF, require developed width; catalogue lookup must not silently substitute face width. For rate-driven families, require a positive rate.
- Browser checks: all material switches, unit labels, presets/custom lengths, reset, invalid input, name generation, copy success/failure, keyboard access and mobile/tablet/desktop fit.
- Run unit tests, lint, production build and browser tests. Reconcile representative results against a recalculated Excel copy where broken references permit; never overwrite the supplied original.
- Update README with exact formulas and known differences. Provide before/after examples for changed calculators.

## 8. Numeric acceptance examples

| Family | Inputs | Expected kg per piece / total |
| --- | --- | --- |
| MS Plate | 5.5 mm, 4 ft, 12 ft, Q=1 | 192.5352 / 192.54 displayed |
| Flat Bar (workbook) | 8 mm, 3.34 in, 6 m, Q=1 | 32.00692608 / 32.01 displayed |
| Flat Bar (workbook cached row) | 1.9 mm, 2 in, 6 m, Q=1 | 4.5518832, FB!M10 |
| Pipe | OD 33.4 mm, T 3.38 mm, L 6 m, Q=13 | Total 195.43188690305283, PP!Q11 |
| Channel | R 6.92 kg/m, L 6 m, Q=1257 | Total 52190.64, CB!Q8 |
| Angle | T 6 mm, W1=50 mm, W2=50 mm, L 6 m, Q=7 | Total 185.9508, AB!O20 |
| Roll Form | T 1.1 mm, W 202 mm, L 6 m, Q=16 | Total 167.663232, RF!N8 |
| Sheet Pile | R 48 kg/m, L 12 m, Q=1410 | Total 812160, SP!Q8 |
| Tubular | T 1.5 mm, W1=W2=25 mm, L 6 m, Q=1 | 6.64956, TB!O9 |
| Base Plate | T 12 mm, W=L=300 mm, Q=2 | Total 16.956258912517825, LP!G6 |
| Round Plate | T 3 mm, diameter 150 mm, Q=10 | Total 4.16152697625, LP!G407 |
| Triangle Plate | T 10 mm, W 150 mm, L 200 mm, Q=36 | Total 42.390647281294562, LP!G1099 |

## 9. Definition of completion

- Every implemented formula has a source reference, fixed input contract and regression fixture.
- Checkered and Beam rules follow the user-approved Excel behavior; differences from v1 are documented.
- Flat Bar formula, meter label, displayed explanation and Item Name agree.
- Main workbook families and supported additional shapes calculate correctly; catalogue-only materials are identified honestly.
- Complete workbook formulas remain available in the audit files, including operational formulas excluded from the calculator.
- App remains frontend-only; no database, authentication, publishing or production-system edits are required.
- No inventory/history/Excel export feature is implicitly added by this plan.
