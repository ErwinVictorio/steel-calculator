# Steel Weight Calculator

Frontend-only React / Vite application using Tailwind CSS v4, shadcn/ui and Lucide icons. No backend, account, or database required.

## Run

Use `npm install`, then `npm run dev`. Production build: `npm run build` (output: dist).

## Verification

- `npm test`: formula, validation, precision, and overflow checks.
- `npm run lint`: ESLint.
- `npm run test:browser`: interaction and responsive checks using installed Microsoft Edge via Playwright; starts its own temporary Vite server.

## Features

Four material calculators; 6/12 meter beams; quantity; automatic per-piece and total weights; reset; inline validation; responsive light interface. Calculations keep full precision and display two decimal places. Checkered Plate adds 5 kg per piece before multiplying by quantity.

## Direct formulas

Inputs are used directly without unit selectors or conversion.

- MS Plate: thickness x width x length x 0.7293.
- Checkered Plate: (thickness x width x length x 0.7293) + 5 kg per piece.
- Beams: LBS x 20 / 2.2 for 6 meters; LBS x 40 / 2.2 for 12 meters.
- Flat Bar: thickness x width x length x 0.0608.

Total weight = complete per-piece weight x quantity. Example: MS Plate 5.5 x 4 x 12 x 0.7293 = 192.54 kg displayed.

Definitions: src/data/formulas.js. Calculation and validation: src/lib/calculations.js.

Summary rows, printing, Excel export, and history remain future features outside this MVP.
