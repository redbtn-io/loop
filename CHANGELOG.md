# Changelog

## 0.1.1 (2026-09-25)

- Align Lp1Spec with server LoopSpec: include lp, loopId, name, owner, mission, and lanes.
- Update LaneStatus.lastResult to object type instead of string.
- Update Lp1Status to direct status map Record<string, LaneStatus>.
- Align Lp1Tick and Lp1Event fields with LP-1 protocol (startedAt, at, text, outcome, evidence).
- Add failed status to PlanStep.
- Drop x-api-key header; send Authorization Bearer only.
- Fix queryLedger: do not filter by tag "all" when querying all records.
- Add repository metadata and publish to registry.redbtn.io.
