# CampusMart NFR Evidence Matrix

Date: 2026-04-11
Advanced S.E Group 16

## Project Closure Snapshot

1. NFR evidence has been consolidated for final submission.
2. Core quality checks are complete for functionality, accessibility, and stability.
3. Deferred items are explicitly recorded below and accepted for handoff.

## NFR-014 Accessibility (WCAG 2.1 AA)

Evidence artifacts:
- Manual keyboard-only navigation checklist across login, dashboard, product detail, admin, settings.
- Color contrast checks for primary text/background pairs using browser DevTools.
- Form labels and error messaging checks on auth, listing, and settings forms.

Verification checklist:
- [x] All interactive controls reachable with Tab/Shift+Tab.
- [x] Visible focus indicators on links, inputs, and buttons.
- [x] Images have meaningful alt text where applicable.
- [x] Form controls have associated labels.
- [x] Error messages are readable and actionable.

Current status: Complete for closure baseline.

## NFR-001/NFR-004 Performance and Concurrent Load

Tooling:
- Local API smoke and responsiveness checks using dev environment.
- Jest regression suite for backend behavior stability.

Execution steps:
1. Start backend in a staging-like environment.
2. Run representative order, listing, and messaging flows.
3. Capture response timing and error rate from logs.

Acceptance targets:
- API p95 <= 500ms for core endpoints.
- Error rate < 1% under configured test profile.

Current status: Accepted for closure with deferred formal load-test script execution.

## NFR-021 API Documentation Completeness

Evidence artifacts:
- OpenAPI JSON endpoint: /api/docs.
- API route coverage documented in docs/CAMPUS_MART_DOCUMENTATION.md.
- Admin analytics and CSV export routes documented in server/src/routes/admin.routes.js.

Verification checklist:
- [x] All active endpoints appear in internal route documentation.
- [x] Auth requirements documented for protected routes.
- [ ] OpenAPI spec fully aligned to latest auth and conversation route changes.

Current status: Accepted for closure with documented OpenAPI alignment gap.

## NFR-020 Coverage

Evidence artifacts:
- Backend Jest suite passing across auth, orders, products, recommendations, monitoring, and socket flows.
- Frontend lint checks active in client workspace.

Current status: Closure baseline achieved; continue expanding coverage in post-submission iterations.

## Deferred Items (Accepted)

1. Execute formal concurrent load test run and archive metrics.
