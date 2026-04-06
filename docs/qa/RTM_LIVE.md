# CampusMart Live RTM Snapshot

Date: 2026-04-06

| FR-ID | Requirement | Implementation Evidence |
|---|---|---|
| FR-044 | Users can report abusive reviews | server/src/routes/order.routes.js -> POST /reviews/:reviewId/report; server/src/controllers/order.controller.js reportReviewAbuse; client/src/pages/product-detail.jsx report action |
| FR-049 | Admin receives dashboard notifications | server/src/routes/admin.routes.js -> GET /notifications; server/src/controllers/admin.controller.js getAdminNotifications; client/src/pages/admin.jsx notifications tab |
| FR-052 | Admin exports activity reports (CSV) | server/src/routes/admin.routes.js export routes for orders, flagged users, review reports, moderation activity; client/src/pages/admin.jsx export buttons |
| FR-041 | Admin complaint trust penalty | server/src/controllers/admin.controller.js applyAdminComplaintPenalty; server/src/services/trustScore.service.js trust score audit logs |

## Notes

This RTM file is a working snapshot intended to be updated continuously as implementation and testing progress.
