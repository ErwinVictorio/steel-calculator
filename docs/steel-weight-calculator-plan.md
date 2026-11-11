# Steel Weight Calculator

## React + shadcn/ui Project Brief

## 1. Project Overview

Build a lightweight, frontend-only **Steel Weight Calculator** for
calculating the estimated weight of common steel materials.

The application will use React and shadcn/ui. It does not require
Laravel, a database, authentication, or a backend for the initial
version.

## 2. Technology Stack

-   React JS (JavaScript / JSX only; no TypeScript)
-   Vite
-   Tailwind CSS v4
-   shadcn/ui
-   lucide-react
-   React Hooks (`useState`, `useMemo`)
-   Browser-based calculation logic

## 3. Material Calculators

The application must provide four material calculators:

1.  MS Plate
2.  Checkered Plate
3.  Beams
4.  Flat Bar

### 3.1 MS Plate

**Formula supplied:**

``` text
Thickness × Width × Length × 0.7293 = Weight (KG)
```

Inputs: - Thickness - Width - Length - Quantity (PCS)

### 3.2 Checkered Plate

**Formula supplied:**

``` text
Thickness × Width × Length × 0.7293 = Base Weight (KG)
Base Weight + 5 = Weight (KG)
```

Inputs: - Thickness - Width - Length - Quantity (PCS)

**Confirmation required:** Confirm whether the additional `5` is applied
per piece or once to the entire calculation.

### 3.3 Beams

Provide two length options.

**For 6 meters:**

``` text
LBS × 20 ÷ 2.2 = Weight (KG)
```

**For 12 meters:**

``` text
LBS × 40 ÷ 2.2 = Weight (KG)
```

Inputs: - LBS - Beam length: 6 meters or 12 meters - Quantity (PCS)

### 3.4 Flat Bar

**Formula supplied:**

``` text
Thickness × Width × Length × 0.0608 = Weight (KG)
```

Inputs: - Thickness - Width - Length - Quantity (PCS)

## 4. Important Formula and Unit Validation

Do not silently change the supplied formulas.

Before using the calculator for actual purchasing, inventory, or
quotation work, confirm the measurement units expected by the formulas:

-   Thickness: mm or inches?
-   Width: mm or inches?
-   Length: mm, meters, or another unit?
-   Beam LBS: Is this the weight rating/value per the user's existing
    computation method?

Also confirm: - Is the Checkered Plate additional 5 kg applied per
piece? - Should the displayed result show two decimal places? - Should
quantity multiply the complete per-piece result?

Keep the formulas in one central file (for example,
`src/data/formulas.js` or `src/lib/calculations.js`) so they can be
reviewed and updated easily.

## 5. Recommended UI / UX

Create a clean, professional, industrial-style interface.

### Main layout

-   Page title: **Steel Weight Calculator**
-   Short subtitle: **Material Weight Computation**
-   Four material selection cards or tabs:
    -   MS Plate
    -   Checkered Plate
    -   Beams
    -   Flat Bar
-   Show only the inputs relevant to the selected material.
-   Display the computed weight clearly in a prominent result area.
-   Include a quantity input for all material types.
-   Recalculate automatically when a valid input changes.

### Design direction

-   Light theme; avoid a dark interface.
-   White or light-gray page background.
-   Navy/blue accents.
-   Clear labels and visible measurement units.
-   Large, easy-to-read KG result.
-   Consistent spacing and simple card layouts.
-   Use shadcn/ui components and lucide-react icons where appropriate.
-   Make the layout responsive for desktop, tablet, and mobile.

## 6. Suggested Features

### Initial version (MVP)

-   [ ] Select a material type.
-   [ ] Enter the required dimensions or LBS.
-   [ ] Select beam length (6M or 12M).
-   [ ] Enter quantity.
-   [ ] Calculate automatically.
-   [ ] Display per-piece weight.
-   [ ] Display total weight.
-   [ ] Validate empty, zero, negative, and invalid inputs.
-   [ ] Provide a clear/reset action.

### Optional future improvements

-   [ ] Add multiple material rows to one computation.
-   [ ] Show a computation summary table.
-   [ ] Remove or edit rows in the summary.
-   [ ] Display grand total weight.
-   [ ] Print a computation sheet.
-   [ ] Export the summary to Excel.
-   [ ] Add a calculation history feature using browser storage, if
    needed.

## 7. Calculation Behavior

For plate and flat bar materials:

``` text
Per-piece weight = Formula result for one piece
Total weight = Per-piece weight × Quantity
```

For beams:

``` text
Per-piece weight = LBS × Length Factor ÷ 2.2
Total weight = Per-piece weight × Quantity
```

Where the length factor is: - 20 for 6-meter beams - 40 for 12-meter
beams

For Checkered Plate, the implementation must follow the confirmed
interpretation of the additional 5 kg.

Keep full precision during calculations. Round only the displayed result
to the chosen number of decimal places.

## 8. Suggested Folder Structure

``` text
steel-weight-calculator/
├── public/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   ├── calculators/
│   │   └── ui/
│   ├── data/
│   │   └── formulas.js
│   ├── hooks/
│   ├── lib/
│   │   └── calculations.js
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── package.json
└── vite.config.js
```

Use the shadcn/ui CLI to add the components required by the project.
Keep calculation logic separate from presentation components.

## 9. Acceptance Checklist

-   [ ] All four material calculators are available.
-   [ ] Each calculator uses the supplied formula.
-   [ ] Beam length selection correctly switches between factors 20 and
    40.
-   [ ] Quantity is included in total weight.
-   [ ] Per-piece and total weights are clearly distinguished.
-   [ ] Invalid inputs do not produce misleading results.
-   [ ] Formula units and Checkered Plate's additional 5 kg behavior are
    confirmed.
-   [ ] The application works without a backend.
-   [ ] The interface is responsive and usable.

------------------------------------------------------------------------

**Project status:** Planning / specification

**Important:** The formulas in this document are transcribed from the
user's supplied instructions. Measurement units and the Checkered Plate
additional 5 kg rule still need confirmation before the calculator is
treated as production-ready.
