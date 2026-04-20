# CampusMart Live RTM Snapshot

Date: 2026-04-11

Status: Final submission snapshot (closure baseline)

| FR-ID | Requirement | Implementation Evidence |
|---|---|---|
| FR-044 | Users can report abusive reviews | server/src/routes/order.routes.js -> POST /reviews/:reviewId/report; server/src/controllers/order.controller.js -> reportReviewAbuse; client/src/pages/product-detail.jsx report action |
| FR-049 | Admin receives dashboard notifications | server/src/routes/admin.routes.js -> GET /notifications; server/src/controllers/admin.controller.js -> getAdminNotifications; client/src/pages/admin.jsx notifications tab |
| FR-052 | Admin exports activity reports (CSV) | server/src/routes/admin.routes.js -> analytics export CSV endpoints; client/src/pages/admin.jsx export controls |
| FR-041 | Admin complaint trust penalty | server/src/controllers/admin.controller.js -> applyAdminComplaintPenalty; server/src/services/trustScore.service.js trust score adjustments + audit events |
| FR-060 | Product-scoped buyer-seller conversations | server/src/routes/conversation.routes.js; server/src/services/conversation.service.js one-room-per-buyer-seller-product rule; client/src/pages/messages.jsx conversation navigation |
| FR-061 | Verification email resend from login flow | server/src/controllers/auth.controller.js resilient email delivery + resend behavior; client/src/components/login/form.jsx resend verification action |
| FR-062 | Admin user count card excludes admin role from total users metric | server/src/controllers/admin.controller.js role-aware counts; client/src/pages/admin.jsx role=user filtering for totals/list |

## Notes

1. This RTM reflects implemented and verified features included in the closure baseline.
2. Update this file only when new functional requirements are added after submission.

