# Prompt 04 — Manufacturing Module

## Before You Start
- Read `PROGRESS.md`. Confirm Prompts 00–03 are `done`. Note the Item Group / Warehouse / batch naming decisions logged in Prompt 03's entry — use them consistently here.
- Reference docs: `05_DATA_MODEL.md` §4 & §6 (Manufacturing rows), `06_USER_STORIES.md` Epic 3, `02_TRD.md` module table (Manufacturing row).

## Context
Configure BOM → Production Plan → Work Order → Job Card → Stock Entry (Manufacture). No custom DocTypes are needed here — Job Card natively carries Workstation (machine) and Employee (operator), which is the exact fit the pitch deck identified. This prompt is configuration + one test BOM to prove the chain, not real production data entry.

## Objective
Configure Workstations (machines), Operations, and confirm the full BOM→Work Order→Job Card→Stock Entry chain works, including scrap/process loss recording.

## Instructions
1. Create a small set of `TEST-` prefixed Workstations representing plausible machine types for uPVC/TPE extrusion (e.g., `TEST-Extruder-1`, `TEST-Extruder-2`) — flag that the real machine list/count needs client confirmation (per PRD open items).
2. Create at least one Operation (e.g., "Extrusion") linked to a Workstation.
3. Create one `TEST-` BOM using the test Finished Good and Raw Material items from Prompts 01–03, including a scrap item/percentage so scrap recording can be tested.
4. Walk the full chain: Production Plan (from a test Sales Order if one exists from Prompt 01, or standalone) → Work Order → Job Card (assign the test Workstation + a test Employee record — create one if none exists) → Stock Entry (Manufacture).
5. Confirm scrap quantity recorded on the Job Card correctly ties to the BOM's scrap item and shows up in the resulting Stock Entry, per `05_DATA_MODEL.md` §4.
6. Confirm the FG Batch created at Stock Entry (Manufacture) is correctly linked as a **child batch** of the consumed raw material batch — this is the second link in the batch genealogy chain from `05_DATA_MODEL.md` §5, and it's the single most important piece of native functionality in the whole system (the traceability argument). Do not proceed until this link is verified working.

## Verification (do not mark this prompt done until these pass)
- [ ] Production Plan correctly calculates raw material requirement from the test BOM (per MFG-01).
- [ ] Job Card cannot be started without Workstation + Employee assigned (per MFG-02).
- [ ] Scrap quantity recorded on Job Card reflects correctly in the Stock Entry and ties to the BOM scrap item (per MFG-03).
- [ ] Stock Entry (Manufacture) creates an FG Batch (per MFG-04).
- [ ] **Critical:** Query the FG Batch's genealogy backward and confirm it correctly resolves to the raw material batch(es) consumed, per INV-01 in `08_TEST_PLAN.md`. This is the traceability chain the entire pitch is built on — do not mark this prompt done if this doesn't work.

## Update PROGRESS.md
Append to "04 — Manufacturing": status, Workstations/Operations created, confirmation that batch genealogy resolves correctly (explicitly state pass/fail — this is the highest-stakes verification in the whole build), and flag real machine list/count as blocked on client input.
