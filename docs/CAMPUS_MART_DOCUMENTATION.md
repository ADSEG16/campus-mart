# CampusMart Documentation

This document explains how to run the system, the trust score behavior, admin moderation, and COD meetup flow from the current repository state.

---

## 1. How to Run the System

### 1.1 Prerequisites
- Node.js v18+ and npm
- MongoDB instance (local or cloud)
- Cloudinary account & credentials for image uploads
- Git checkout of repository in `c:\Users\Mikaela-Jessie\campus-mart`

### 1.2 Server Setup
1. Navigate to server folder:
   - `cd c:\Users\Mikaela-Jessie\campus-mart\server`
2. Install dependencies:
   - `npm install`
3. Create `.env` from `.env.example` and set:
   - `MONGODB_URI` (e.g., `mongodb://localhost:27017/campusmart`)
   - `JWT_SECRET`
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
   - optional: `CANCELLATION_FLAG_THRESHOLD` (default 3)
4. Run API 
   - `npm run dev` to start with `nodemon` (or `npm start` for production)b
5. API base path: `http://localhost:8000` (default in `server/src/server.js`)

### 1.3 Client Setup
1. Navigate to client folder:
   - `cd c:\Users\Mikaela-Jessie\campus-mart\client`
2. Install dependencies:
   - `npm install`
3. Start frontend:
   - `npm run dev`
4. Open `http://localhost:5173` in browser (Vite default). 

### 1.4 Basic API / Routes Summary
#### Authentication (server/src/routes/auth.routes.js)
- `POST /api/auth/signup`  -> sign up, includes student email validation (`@st.ug.edu.gh`)
- `POST /api/auth/login` -> login
- `GET /api/auth/me` -> user profile
- `POST /api/auth/upload-student-id` -> upload ID, sets `verificationStatus = pending`
- `POST /api/auth/upload-profile` -> profile image upload

#### Products (server/src/routes/product.routes.js)
- `GET /api/products` -> list products
- `POST /api/products` -> create product (auth)
- `GET /api/products/:productId` -> get product
- `PATCH /api/products/:productId` -> update product (seller or admin)
- `DELETE /api/products/:productId` -> delete product (seller or admin)

#### Orders (server/src/routes/order.routes.js)
- `PATCH /api/orders/:orderId/status` -> update statel
- `PATCH /api/orders/:orderId/cancel` -> cancel order

#### Admin (server/src/routes/admin.routes.js)
- `GET /api/admin/flagged-users` -> list flagged users (admin only)

---

## 2. How Trust Score Works (Current Implementation)

### 2.1 Current Mechanism
There is no explicit `trustScore` numeric field in the DB, but reliability is tracked via:
- `User.flagged` boolean
- `Order.status` and cancellation behavior

A user is evaluated by the cancellation monitor in `server/src/services/cancellationMonitor.service.js`.

### 2.2 Cancellation Monitoring
1. Triggered when an order moves to `Cancelled` (via `/api/orders/:orderId/status` or `/cancel`).
2. Count of canceled orders in a rolling window of `WINDOW_HOURS = 24` hours is computed.
3. `CANCELLATION_FLAG_THRESHOLD` (env; default 3) is the threshold.
4. If `cancellationCount > threshold`, user is flagged:
   - `User.flagged = true`

### 2.3 Trust Score Interpretation
- `flagged: false` = good standing.
- `flagged: true` = repeat cancellation / low reliability.
- Admin uses flagged list to escalate checks, block transactions, or manually review.

> Future addition: add numeric `trustScore`, e.g. 100 - (cancellations * 10) and store in DB.

---

## 3. How Admin Moderation Works

### 3.1 Admin Role and Guards
- `role` in `User` schema is either `user` or `admin`
- `requireAdmin` middleware in `server/src/middleware/auth.middleware.js` ensures admin-only endpoint access.
- Endpoints requiring admin:
  - `GET /api/admin/flagged-users`

### 3.2 Flagged and Verification States
User document fields:
- `flagged` (bool)
- `verificationStatus` ('pending' | 'verified' | 'rejected')
- `isVerified` (boolean)

When cancellations exceed threshold, `flagged` toggles true by `monitorUserCancellationBehavior()`.

### 3.3 Admin Workflow
1. Admin fetches flagged list: `GET /api/admin/flagged-users`.
2. Inspect user and order history, especially cancellations.
3. Optionally run manual actions in UI (not implemented), or use DB updates:
   - `User.flagged = false` (after review)
   - `User.verificationStatus = 'verified'` / `'rejected'` depending on student ID approval.

### 3.4 Extending Moderation
Recommended new endpoints:
- `PATCH /api/admin/users/:userId/flag` (set true/false)
- `PATCH /api/admin/users/:userId/verificationStatus`
- `GET /api/admin/users/:userId/orders`

---

## 4. How COD Meetup Works

### 4.1 Order Status Workflow
Order model (server/src/models/order.model.js) has `status` enum:
- `Pending`
- `Meetup Scheduled`
- `Delivered`
- `Cancelled`

Allowed transitions (server/src/constants/orderStatus.js):
- `Pending` -> `Meetup Scheduled` or `Cancelled`
- `Meetup Scheduled` -> `Delivered` or `Cancelled`
- `Delivered` and `Cancelled` are terminal

Legacy mapping in controller accepts short values:
- `pending`
- `accepted` -> `Meetup Scheduled`
- `completed` -> `Delivered`
- `cancelled` or `rejected` -> `Cancelled`

### 4.2 API Update Flow
Endpoint: `PATCH /api/orders/:orderId/status`
- Body: `{ nextStatus: '<status>' [, cancellationReason: '...'] }`
- Enforced by `canTransition` in `server/src/controllers/order.controller.js`
- `buyer`, `seller`, or `admin` may call

### 4.3 COD Stage Meaning
- `Pending`: order placed; seller sees request.
- `Meetup Scheduled`: buyer and seller coordinate an on-campus pickup point (`meetingSpot`), ready for handshake.
- `Delivered`: meetup completed, payment exchanged, transaction final.
- `Cancelled`: order aborted; cancellation reason logged, and monitor run.

### 4.4 Buyer/Seller Confirmation Fields
`Order` has:
- `buyerConfirmed` (bool)
- `sellerConfirmed` (bool)

These are available now in schema but the standard status transitions are primary.

---

## 5. Notes for Developers

- Authentication uses JWT and `server/src/middleware/auth.middleware.js`.
- `server/src/config/cloudinary.js` and `server/src/config/multer.js` manage uploads.
- Product listing includes `meetingSpot` for COD meetup location.
- UI under `client/src` has pages for dashboard, listing, transactions and watchlist.

## 6. Where to Put Next Docs
- Add more docs to `docs/` for "deployment" and "release checklist".
- Keep this file as central architecture + workflow reference.
