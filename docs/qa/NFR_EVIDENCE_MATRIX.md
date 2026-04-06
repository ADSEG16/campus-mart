# CampusMart NFR Evidence Matrix

Date: 2026-04-06
Owner: Advanced S.E Group 16

## NFR-014 Accessibility (WCAG 2.1 AA)

Evidence artifacts:
- Manual keyboard-only navigation checklist across login, dashboard, product detail, admin, settings.
- Color contrast checks for primary text/background pairs using browser DevTools.
- Form labels and error messaging checks on auth, listing, and settings forms.

Verification checklist:
- [ ] All interactive controls reachable with Tab/Shift+Tab.
- [ ] Visible focus indicators on links, inputs, and buttons.
- [ ] Images have meaningful alt text where applicable.
- [ ] Form controls have associated labels.
- [ ] Error messages are readable and actionable.

Current status: In progress.

## NFR-001/NFR-004 Performance and Concurrent Load

Tooling:
- k6 script in ../../server/scripts/k6-orders-load.js.

Execution steps:
1. Start backend in a staging-like environment.
2. Run: k6 run server/scripts/k6-orders-load.js
3. Capture p95 latency and error rate.

Acceptance targets:
- API p95 <= 500ms for core endpoints.
- Error rate < 1% under configured test profile.

Current status: Script added; baseline run pending.

## NFR-021 API Documentation Completeness

Evidence artifacts:
- OpenAPI JSON endpoint: /api/docs.
- Added docs for FR-044 abusive review reporting and expanded FR-052 CSV export endpoints.

Verification checklist:
- [ ] All active endpoints appear in OpenAPI paths.
- [ ] Auth requirements documented for protected routes.
- [ ] Request and response bodies documented.

Current status: Improved and in review.

## NFR-020 Coverage

Evidence artifacts:
- Jest test suite passing with order/reporting coverage.
- Added automated test for review abuse reporting endpoint.

Current status: Active; keep target >= 75%.
