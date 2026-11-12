# Calculator-only UI update

Completed: 2026-11-12. This supersedes the catalogue scope in the original implementation report.

- Removed Catalogue Item, catalogue source data, USN lookup and catalogue validation from the application. Historical workbook audit documents are retained.
- Retained 18 manual calculation modes and all Excel formulas.
- Compact grouped material buttons; formula details are collapsed by default. Source cell references are no longer displayed in the user flow.
- Added optional mm/inches/feet/meters converter with explicit Apply to a selected dimension field. The destination unit remains fixed by the formula; full converted precision is applied.
- Added Copy computation, saved computation rows, Edit/Update/Cancel, Remove and full-precision grand total.
- Added Copy list, print-only computation sheet and Excel-compatible CSV export. CSV is not XLSX; exported numeric values retain full precision and item names are escaped.
- Tagged batch weights remain totals; the per-piece column identifies averages.
- List is held in the current page only and clears on reload. The UI states this explicitly.

Verification: 23 unit tests passed, including 817 workbook regression fixtures, conversion precision and CSV escaping. 23 Edge browser tests passed, including converter Apply, row snapshots, editing/removal, current/list copy, CSV content/download, print request/CSS, and 360/768/1440 px layouts. Browser clipboard and print-dialog invocation are mocked; print CSS and downloaded CSV are checked directly. Lint and production build passed. Original workbook and formulas were not changed.
