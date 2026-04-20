# CampusMart Documentation

## 1. System Overview

CampusMart is a student marketplace platform with:

1. Verified user onboarding and role-based access (`user`, `admin`)
2. Product listings and image uploads
3. Buyer-seller messaging via product-based conversations
4. COD order workflow with trust and moderation controls
5. Admin analytics, review reporting, and moderation tools

Primary folders:

1. `client/` - React + Vite frontend
2. `server/` - Express + MongoDB backend
3. `docs/` - project documentation

---

## 2. Running the System

### 2.1 Prerequisites

1. Node.js 18+
2. npm 9+
3. MongoDB (Atlas or local)
4. Cloudinary account

### 2.2 Server Setup

```bash
cd server
npm install
```

Create `server/.env` with at least:

```dotenv
PORT=5000
MONGO_URI=<mongo_connection_string>
JWT_SECRET=<jwt_secret>
CLOUDINARY_NAME=<cloudinary_name>
CLOUDINARY_API_KEY=<cloudinary_api_key>
CLOUDINARY_SECRET=<cloudinary_secret>
APP_BASE_URL=http://localhost:5000
CLIENT_BASE_URL=http://localhost:5173
MESSAGE_ENCRYPTION_KEY=<base64_encryption_key>
```

Optional trust and moderation tuning:

```dotenv
LOW_TRUST_FLAG_THRESHOLD=20
CANCELLATION_FLAG_THRESHOLD=3
```

Email delivery options:

1. Brevo API mode (recommended for production)

```dotenv
EMAIL_DELIVERY_PROVIDER=brevo
BREVO_API_KEY=<brevo_api_key>
BREVO_SENDER_EMAIL=<verified_sender_email>
BREVO_SENDER_NAME=CampusMart
```

2. SMTP mode (fallback / local testing)

```dotenv
EMAIL_DELIVERY_PROVIDER=smtp
SMTP_HOST=<smtp_host>
SMTP_PORT=587
SMTP_USER=<smtp_user>
SMTP_PASS=<smtp_pass>
SMTP_FROM=CampusMart <no-reply@example.com>
SMTP_SECURE=false
SMTP_REQUIRE_TLS=true
SMTP_VERIFY_CONNECTION=false
SMTP_IP_FAMILY=4
SMTP_CONNECTION_TIMEOUT_MS=15000
SMTP_GREETING_TIMEOUT_MS=10000
SMTP_SOCKET_TIMEOUT_MS=20000
```

Run server:

```bash
npm run dev
```

### 2.3 Client Setup

```bash
cd client
npm install
```

Create `client/.env`:

```dotenv
VITE_API_BASE_URL=http://localhost:5000/api
```

Run client:

```bash
npm run dev
```

### 2.4 Health Check

`GET /api/health`

---

## 3. API and Module Summary

### 3.1 Auth Routes (`/api/auth`)

1. `POST /signup`
2. `POST /login`
3. `POST /verify-email` (authenticated)
4. `POST /forgot-password`
5. `POST /reset-password`
6. `GET /me` (authenticated)
7. `POST /upload-student-id` (authenticated)
8. `POST /upload-profile-image` (authenticated)
9. `PATCH /complete-profile` (authenticated)

### 3.2 Product Routes (`/api/products`)

1. `GET /`
2. `GET /seller/:sellerId`
3. `GET /:productId`
4. `POST /` (authenticated)
5. `PATCH /:productId` (authenticated + ownership check)
6. `DELETE /:productId` (authenticated + ownership check)

### 3.3 Order Routes (`/api/orders`)

1. `POST /` (create order)
2. `GET /` (list user orders)
3. `GET /:orderId`
4. `PATCH /:orderId/confirm-delivery`
5. `PATCH /:orderId/status`
6. `PATCH /:orderId/cancel`
7. `POST /:orderId/reviews`
8. `GET /seller/:sellerId/reviews`
9. `POST /reviews/:reviewId/report`

### 3.4 Conversation Routes (`/api/conversations`)

1. `GET /` (list current user conversations)
2. `POST /start` (create or reuse product-based conversation)
3. `GET /:conversationId/messages`

### 3.5 Admin Routes (`/api/admin`)

All require authenticated admin user:

1. Verification queue and actions
2. Flagged users and suspension tools
3. Listing moderation
4. Reported review moderation
5. Notifications and activity feed
6. Analytics and CSV exports
7. All users summary

---

## 4. Trust Score and Safety Logic

### 4.1 Current Trust Score Model

`User.trustScore` is a numeric field (`0` to `100`, default `50`).

Current trust adjustment rules:

1. Successful delivery: `+5`
2. Order cancellation penalty: `-5`
3. Admin complaint penalty: `-10`
4. Positive review (`>= 4`): `+1`
5. Negative review (`<= 2`): `-1`

When trust score drops below threshold (`LOW_TRUST_FLAG_THRESHOLD`, default `20`), user is flagged.

### 4.2 Cancellation Monitoring

A separate cancellation monitor checks user cancellations in a rolling 7-day window.

1. Threshold env key: `CANCELLATION_FLAG_THRESHOLD` (default `3`)
2. If cancellations reach threshold, user is flagged

---

## 5. COD Order Workflow

### 5.1 Canonical Order Status Values

1. `pending`
2. `meetup_scheduled`
3. `delivered`
4. `cancelled`

### 5.2 Allowed Transitions

1. `pending -> meetup_scheduled | cancelled`
2. `meetup_scheduled -> delivered | cancelled`
3. `delivered` terminal
4. `cancelled` terminal

### 5.3 Delivery Confirmation

`confirm-delivery` tracks buyer/seller confirmation flags. Transition to `delivered` requires both confirmations.

On delivery:

1. Trust score rewards are applied
2. Order conversation and messages get an `expiresAt` timestamp for cleanup
3. Delivery email notifications are attempted

---

## 6. Messaging and Conversation Model

Conversations are product-scoped and participant-scoped.

1. One room per buyer-seller-product combination
2. If an order is later attached, the same room can be linked to that order
3. Messages are stored encrypted-at-rest and decrypted for authorized participants
4. Conversation/message records can expire after delivered orders

---

## 7. Email Delivery Behavior

### 7.1 Auth Emails

Verification and password reset use provider selection:

1. Brevo API (HTTPS) when `EMAIL_DELIVERY_PROVIDER=brevo`
2. SMTP transport when `EMAIL_DELIVERY_PROVIDER=smtp`

Signup is resilient: account creation can succeed even if verification email delivery fails.

### 7.2 Order Delivery Emails

Order-delivered notification emails currently use SMTP transport configuration in `order.controller.js`.

---

## 8. Admin Moderation Scope

Admin pages and APIs support:

1. Verification review (`pending`, `verified`, `rejected`)
2. Flagged user review and suspension actions
3. Complaint penalty actions
4. Listing removals with audit trail
5. Review abuse report resolution
6. Analytics and exportable reports

---

## 9. Testing and Quality Checks

Backend tests:

```bash
cd server
npm test
```

Frontend lint:

```bash
cd client
npm run lint
```

---

## 10. Notes for Contributors

1. Keep route docs aligned with files under `server/src/routes/`
2. Keep status enums aligned with `server/src/constants/order.status.js`
3. Keep trust logic docs aligned with `server/src/services/trustScore.service.js`
4. Update this file whenever auth, moderation, conversation, or email flows change
