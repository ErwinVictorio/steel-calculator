# Price List Integration Plan

Status: PROPOSED — implementation has not started.

## Goal

Add an optional price estimate to the steel weight calculator. Reuse the entered material, dimensions and quantity to find a confirmed pricing rule, then show the rate, price per piece and total amount.

Keep the interface simple. No USN entry or inventory lookup is required. Existing Excel weight formulas and constants remain unchanged.

## Source and confirmation

The source is the price-list photo supplied in this conversation. The photo is a draft reference, not a verified current price database. Its effective date and several handwritten/printed abbreviations need confirmation.

Before activating rates, confirm:

- Effective date, currency (proposed: PHP) and whether prices include VAT.
- Whether delivery or other charges are included. Do not calculate unconfirmed charges.
- Meaning of `/KL` and `/ko` (apparently per kg) and prices without a stated unit.
- Which prices are per piece and which stock length each covers.
- Retail, wholesale, truckload and payment-term eligibility.
- Exact size/thickness boundaries, gaps and overlapping rules.
- Whether theoretical calculator weight or another supplied weight is the billing basis.
- How special-cut and other adjustments combine, and the required rounding policy.

Do not guess unreadable values or activate incomplete rules. Preserve the original wording with each draft rule for review.

## Proposed user flow

1. Choose material and enter measurements as usual.
2. Enable **Show price estimate** below the weight result.
3. Show only the extra choices required by that material: for example BI/GI, payment terms, origin, sales category or special-cut status.
4. Match the dimensions and selections against the active price list.
5. Display the price basis, rate, price per piece, quantity and total amount.
6. Include the price-list effective date and any applied adjustments.
7. Allow copying a short weight-and-price summary or adding a priced item to the existing computation list.

Suggested result:

```text
Price estimate
Rate                      PHP 45.00 / kg
Calculated weight         100.00 kg / piece
Price per piece           PHP 4,500.00
Quantity                  3 pcs
Total estimate            PHP 13,500.00
Price list                [effective date]
```

This example is illustrative, not a current quotation.

If a required choice is missing, prompt for that choice. If there is no matching rule, show **No confirmed price for this specification** and offer a manual rate. If multiple rules match, show the relevant choices; never silently choose the cheapest or the first rule.

Manual entry must require a basis (**per kg** or **per piece**) and a positive rate. Label the result **Manual rate**. Changing the material or pricing specification clears the override so it cannot carry over accidentally.

## Calculation rules

Let `W` be the existing calculated weight per piece and `Q` the quantity.

| Basis | Calculation |
| --- | --- |
| Per kg | Price per piece = billable kg per piece × rate; total = price per piece × Q |
| Per piece | Price per piece = listed piece price; total = listed piece price × Q |

Do not multiply a per-piece price by weight. Do not apply quantity more than once.

Use decimal-safe monetary calculations. Retain full weight precision until the confirmed billing-rounding step. Display PHP amounts to two decimal places; document whether the business rounds the per-piece price before multiplication or rounds only the final total.

### Adjustments requiring confirmation

- **Checkered Plate:** the photo states “add 5 kg/pc.” If confirmed as a pricing rule, billable weight is `W + 5` per piece. Display both calculated and billable weights. Do not change the Excel weight result or apply the extra 5 kg twice.
- **Purlins:** the photo states “+10% if special cut.” Confirm eligible profiles, standard lengths and the amount to which the surcharge applies. Use an explicit special-cut choice until those conditions are confirmed.
- **Sheet surcharges:** confirm the unit and scope of “sheets +0.50.”
- **Pipe adjustments:** confirm the scope of the BI special-size surcharge and GI addition to the BI rate.
- **Flat Bar:** “plus base price” and the 16% note require the referenced base price and exact eligibility before implementation.

Keep all unconfirmed adjustments inactive.

## Material-specific matching

| Material | Candidate matching details from photo | Review needed |
| --- | --- | --- |
| Wide Flange / Beams | Standard, dimensions or section designation, weight rating | General rate versus listed beam exceptions |
| Sheet Pile | Type and COD / 30 / 60 days | Payment-term applicability |
| Channel Bar | Size, rating and stock length | Per-kg rules versus exact per-piece entries |
| Angle Bar | Equal/unequal, grade, thickness, both legs and length | Basis of unlabelled piece prices |
| Purlins | BI/GI, thickness, sales category, special cut | Surcharge and truckload conditions |
| CR / GI Sheet | Thickness, retail/wholesale, coil/sheet | Surcharges, boundary values and W/R meaning |
| Pipe | BI/GI, seamless classification, nominal size and schedule | OD is not nominal size; do not infer schedule from OD alone |
| MS Plate | Thickness, stock size, origin and cut/special length | Overlaps between size-specific and general rules |
| Checkered Plate | Thickness and stock size | Additional billable weight |
| Flat Bar | Size and referenced base rate | Incomplete pricing instructions |
| Tubular | Exact specification and stock length | Ready-stock offer availability and scope |
| ABS / A572 Plate | Grade and applicable size limits | Confirm quoted rate applicability |

Normalize compatible dimension units before matching. Do not equate approximate dimensions or nominal and actual sizes without a confirmed mapping. Do not infer supplier origin, sales terms or finish from dimensions.

## Data design

Use a versioned price list separate from `src/data/formulas.js`.

Suggested files:

- `src/data/price-lists.js`: reviewed default lists and rule metadata.
- `src/lib/pricing.js`: pure matching, validation and monetary calculations.
- `src/components/calculators/PriceEstimate.jsx`: optional pricing controls and result.
- `src/components/pricing/PriceListEditor.jsx`: simple editable list with draft/active states.
- `tests/pricing.test.js`: matching and arithmetic tests.

Price-list metadata:

- ID, version, title, currency, effective date, optional expiry date.
- Source description, confirmation status and last-updated timestamp.
- Tax/delivery treatment and rounding policy.

Rule data:

- Stable rule ID and user-readable label.
- Material and required qualifiers.
- Exact dimensions or explicit inclusive/exclusive ranges with units.
- Stock length and size conditions where applicable.
- Basis (`perKg` or `perPiece`) and rate stored as a decimal string.
- Confirmed adjustments and their application order.
- Draft/confirmed status and source wording.

Pricing results should include the matched rule/version, supplied qualifiers, weight basis, rate, adjustments, per-piece price and total. This lets the UI explain the estimate and saves a reproducible snapshot with each computation-list item.

## Editing and persistence

For the initial browser-only version:

- Ship only reviewed default rates; keep uncertain entries as inactive drafts.
- Provide a separate **Manage price list** view to avoid cluttering the calculator.
- Validate edits before activation: required fields, positive rates, valid ranges, dates and overlapping rules.
- Save user edits locally with a schema version and handle unavailable/corrupt browser storage gracefully.
- Support JSON export/import for backup and sharing; validate imports before replacing active data.
- Explain that local edits stay in that browser. They are not automatically synchronized across users or devices.
- Keep existing computation snapshots unchanged when rates are updated. Offer an explicit **Reprice** action.

A shared centrally managed list, authentication and edit permissions are a later phase if multiple users need synchronized rates. They are not required for the first version.

## Integration with existing features

- Weight-only calculation continues to work without pricing enabled.
- Paste measurement fills dimensions as today; ask for missing pricing qualifiers after Apply.
- Never treat the weight at the end of a pasted message as a price.
- Known-weight modes can accept a manual pricing basis; do not infer a material rule from free-text descriptions.
- Tagged batch weight needs separate explicit batch-pricing handling. Keep automatic pricing disabled there in the initial version to avoid multiplying the batch weight by quantity again.
- Extend Copy computation, the computation list, CSV and print output with optional pricing fields.
- For mixed priced/unpriced lists, label the sum **Priced items subtotal** and show the number of unpriced items. Do not represent missing prices as zero.
- Validate calculations and prevent stale prices after dimensions, type, grade, quantity or applicable qualifiers change.

## Implementation phases

### Phase 1 — Review price data

Status: TODO

Transcribe the photo into a review table with source wording, basis, conditions, rates and unresolved questions. Confirm the current list and activate only complete rules.

Done when: every active rule has a confirmed basis, scope, rate and effective date.

### Phase 2 — Pricing engine

Status: TODO

Implement unit-normalized matching, missing-choice handling, overlap detection, per-kg/per-piece arithmetic, confirmed adjustments and manual overrides.

Done when: arithmetic and matching tests pass, including boundaries and ambiguous matches.

### Phase 3 — Simple pricing UI

Status: TODO

Add the optional estimate panel with relevant qualifiers, clear price basis, source date, adjustments and manual-rate entry. Support mobile layouts and keyboard navigation.

Done when: users can produce and understand an estimate without entering a USN or seeing irrelevant fields.

### Phase 4 — List management and output

Status: TODO

Add the price-list editor, validated local persistence and import/export. Extend existing computation snapshots, copy, CSV and print; handle mixed priced/unpriced items and explicit repricing.

Done when: changing the active list does not silently change saved estimates and backups can be restored safely.

### Phase 5 — Verification and documentation

Status: TODO

Run existing workbook regressions, targeted pricing tests, lint, build and browser checks. Document confirmed rules, limitations, effective dates and rounding behavior.

Done when: weight results remain unchanged and pricing examples match reviewed manual computations.

## Acceptance checks

- 100 kg/piece × PHP 45/kg × 3 pieces = PHP 13,500.
- PHP 500/piece × 3 pieces = PHP 1,500 regardless of theoretical weight.
- A confirmed +5 kg/piece billing adjustment is applied once per piece and displayed separately.
- A confirmed percentage adjustment is applied once to the specified pricing base.
- Exact stock-size and length restrictions do not match unrelated sizes.
- Missing qualifiers, inactive rules, invalid rates and multiple matches cannot produce an apparently confirmed price.
- Thickness boundaries, unit conversion, manual overrides and quantity changes behave correctly.
- Copy/list/export output retains the rate basis, version and adjustment details.
- Existing Excel weight calculations and their regression fixtures continue to pass.

## Next step

Review and transcribe the supplied photo, then confirm the unresolved pricing terms before activating any rates. This document is a plan only; it does not add prices or change calculator behavior.
