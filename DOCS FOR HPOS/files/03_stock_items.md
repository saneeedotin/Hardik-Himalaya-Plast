# Prompt 03 — Stock & Item Setup

## Before You Start
- Read `PROGRESS.md`. Confirm Prompt 02 is `done`.
- Reference docs: `01_PRD.md` §4.2 point 3 (Stock module), `05_DATA_MODEL.md` §6 (Stock rows).

## Context
This prompt configures the structural backbone the rest of the system depends on: Item Groups, UOMs, Warehouses, and batch-tracking rules. This is largely structural/taxonomy work, not transactional testing (Prompts 01–02 already exercised the transactional flow with test records).

## Objective
Set up Item Group hierarchy, UOM list, and Warehouse structure that the rest of the modules (Manufacturing, Quality, Dispatch) will reference. Since real item/BOM data isn't available yet, build the **structure** (groups, not the full item list) and flag actual item-master population as blocked on real data.

## Instructions
1. Create a sensible Item Group hierarchy anticipating a uPVC Gasket / TPE Extrusion Profile manufacturer's needs, e.g.:
   - Raw Materials (uPVC Compound, TPE Compound, Additives/Colorants)
   - Finished Goods (Gaskets, Extrusion Profiles — with sub-groups per product line if it helps organize later)
   - Consumables / Packaging (cartons, labels)
   - Do NOT treat this as final — note in `PROGRESS.md` that this hierarchy is a reasonable placeholder pending the client's actual item master.
2. Confirm/add standard UOMs needed: kg, meter, piece, roll, carton — add any manufacturing-specific UOM conversions once real BOM data exists (flag as open item, don't guess conversion factors).
3. Set up Warehouse structure: at minimum, Raw Material Store, Work-in-Progress, Finished Goods Store, per plant/location if multiple plants are confirmed later (currently unconfirmed — see PRD open items — so build for a single-plant structure now, structured so adding a plant dimension later doesn't require a rebuild, e.g. using Warehouse's native Company/parent-warehouse tree rather than hardcoding assumptions elsewhere).
4. On the test Item from Prompts 01–02, confirm `has_batch_no` behavior is correct and decide/document the batch naming series convention (e.g., auto-incrementing per item, or item-code + date based) — this affects how batch codes look on printed documents and QR-scanned cartons later (Prompt 11).

## Verification (do not mark this prompt done until these pass)
- [ ] Item Group tree is created and browsable in the Desk.
- [ ] UOM list covers the units above; a UOM conversion test (e.g., kg ↔ a manufacturing unit) works if any conversion was configured.
- [ ] Warehouse tree reflects Raw Material / WIP / Finished Goods at minimum.
- [ ] Batch naming series is documented in `PROGRESS.md` (exact series pattern used) so it's consistent when Prompt 11 (QR Dispatch Scan) needs to print/scan batch-derived carton codes.

## Update PROGRESS.md
Append to "03 — Stock & Items": status, the Item Group hierarchy and Warehouse structure chosen (list them explicitly so later prompts/humans don't have to re-derive them), batch naming series decision, and flag "item master population" and "UOM conversion factors" as blocked on real client data.
