# Prompt 05 — Quality Management Module

## Before You Start
- Read `PROGRESS.md`. Confirm Prompts 00–04 are `done`. Note the QC-gating dependency flagged in Prompt 02's entry.
- Reference docs: `05_DATA_MODEL.md` §6 (Quality Inspection row), `06_USER_STORIES.md` Epic 4, `02_TRD.md` module table (Quality Management row — this is the module needing the most customization in Phase 1).

## Context
This is the one Phase 1 module needing real customization beyond configuration: ERPNext's native Quality Inspection is binary (Accepted/Rejected), but Himalaya Plast needs a 4-state outcome (Pass / Reject / Scrap / Rework), with Reject/Scrap routing to a Rework Stock Entry. This requires a **Frappe Workflow** on top of the native DocType.

## Objective
1. Configure a Quality Inspection Template with the required Reading parameters.
2. Build the 4-state Frappe Workflow on Quality Inspection.
3. Wire Reject/Scrap outcomes to auto-suggest/create a Rework Stock Entry.
4. Close the loop on Prompt 02's flagged dependency: incoming stock should not be consumable in a Work Order until its linked Quality Inspection resolves to Pass.

## Instructions
1. Create a `TEST-` Quality Inspection Template for the test Item, with Reading parameters: Pin Size, Width, Leg, Weight, Profile Fit Test (per the pitch deck's actual QC parameters — use these exact names since they're stated requirements, not placeholders).
2. Build a **Frappe Workflow** on the Quality Inspection DocType with states: `Draft → Pass | Reject | Scrap`, plus a `Rework` state reachable from Reject/Scrap. Define the workflow transitions and which Roles can perform each transition (Quality Manager role, per `07_RBAC.md`).
3. On transition to Reject or Scrap, trigger creation of a Rework Stock Entry (via a Server Script or hook in `hpos_extensions`) — per `02_TRD.md`, "Reject/Scrap routing to a Rework Stock Entry triggered on Reject/Scrap outcome." Auto-suggesting a pre-filled draft Stock Entry (rather than fully silent auto-submission) is the safer default — confirm this matches intent, don't silently auto-submit stock movements without a human check.
4. Implement the incoming-QC gate flagged in Prompt 02: an Item flagged `Quality Inspection Required` should block Stock Entry consumption in a Work Order until its Purchase Receipt's Quality Inspection resolves to Pass. Implement as a validation hook, not a UI-only restriction (server-side, per `02_TRD.md` §7).
5. Confirm QC history is queryable across all inspections (a simple report/list filter suffices — this underpins the "digital QC history, no paper" success metric from the PRD, which is an adoption/rollout metric, not something to force in code beyond making the data queryable).

## Verification (do not mark this prompt done until these pass)
- [ ] Creating a Quality Inspection for the test product pre-loads the correct Reading parameters from the template (per QC-01).
- [ ] Marking an inspection Reject or Scrap correctly triggers/suggests a Rework Stock Entry (per QC-02, QC-03) — confirm neither outcome is silently treated as "Accepted" anywhere downstream.
- [ ] Attempting to consume a QC-required raw material batch in a Work Order before its Quality Inspection is Pass is blocked, both via UI and direct API call.
- [ ] A basic QC history query/report returns inspection records filterable by product and date range (per QC-04).

## Update PROGRESS.md
Append to "05 — Quality Management": status, workflow states/transitions built, confirmation the incoming-QC gate from Prompt 02 is now closed, verification result.
