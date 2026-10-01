# Prompt 12 — Fixtures Export + Deploy Prep

## Before You Start
- Read `PROGRESS.md`. Confirm Prompts 00–11 are all `done`. This is the final prompt in the series — it doesn't add new features, it makes everything built so far reproducible and stage/production-deployable.
- Reference docs: `09_DEPLOYMENT.md` (full document), `02_TRD.md` §3 & §7, `08_TEST_PLAN.md` (full regression pass).

## Context
Every prompt so far has built directly against a local dev site. This prompt ensures all of that configuration (custom fields, workflows, roles, print formats, the new DocTypes) is captured as **fixtures** so it can be reproduced identically on staging and production — per `09_DEPLOYMENT.md` §3, no environment should ever be manually reconfigured by hand.

## Objective
1. Audit and complete the `fixtures` list in `hpos_extensions/hooks.py`.
2. Run the full regression test pass from `08_TEST_PLAN.md`.
3. Confirm the app is ready for the Frappe Cloud deploy flow described in `09_DEPLOYMENT.md`.

## Instructions
1. Review every prompt's `PROGRESS.md` entries and compile a complete list of everything that needs to be a fixture: custom fields (`approval_method`, Transporter/Vehicle/LR if added, any others), the Quality Inspection Workflow, all custom Roles, the permission matrix (Role Permission Manager entries — export as fixtures too, not left as manual UI configuration), print formats, and the two new DocTypes (`HPOS Settings`, `HPOS Carton Label`).
2. Add/verify all of these in `hpos_extensions/hooks.py`'s `fixtures = [...]` list, using appropriate filters (e.g., filtering Custom Field fixtures to only `hpos_extensions`-relevant ones, not every custom field on the site) so the fixture export stays scoped to this app's changes.
3. Test reproducibility: on a fresh scratch site, install `erpnext` + `india_compliance` + `hpos_extensions`, then run `bench --site <scratch-site> migrate` and confirm all fixtures apply cleanly, producing an equivalent configuration to the dev site — this is the actual test of whether Prompt 00–11's work is deployable, not just "works on my machine."
4. Run through the full test matrix in `08_TEST_PLAN.md` §2 (all module scenarios) and §3 (RBAC pass) end-to-end once more against the reproduced scratch site, not just the original dev site, to confirm nothing was lost in the fixture export.
5. Prepare the Git repository for the Frappe Cloud deploy flow per `09_DEPLOYMENT.md` §3: confirm `hpos_extensions` is committed to a private Git repo on the branch Frappe Cloud will track, with no secrets/credentials committed (check specifically for the sandbox GSTIN/India Compliance test credentials from Prompt 07 — these must not be committed as hardcoded values).
6. Compile a final summary in `PROGRESS.md`: a consolidated list of every remaining open item across all 13 prompts (client data, GSTIN/compliance details, domain name, go-live timeline, etc.) so nothing gets lost between "dev build complete" and "production go-live."

## Verification (do not mark this prompt done until these pass)
- [ ] Fresh scratch site + fixture migration reproduces the full configuration without manual steps.
- [ ] Full `08_TEST_PLAN.md` test matrix passes against the reproduced scratch site.
- [ ] No secrets/credentials are committed to the `hpos_extensions` Git repo (manually grep for anything resembling API keys, passwords, or GSTINs in the diff).
- [ ] `PROGRESS.md`'s consolidated open-items list is complete and matches (or explicitly reconciles differences with) the "Known Open Items Carried Forward" section already in the template.

## Update PROGRESS.md
Append to "12 — Fixtures Export + Deploy Prep": status, confirm scratch-site reproduction test passed, confirm no secrets committed, and finalize the consolidated open-items list. Mark the overall build "Phase 0-1 + Phase 2 subset complete, pending client data and production deploy" once this prompt is done.
