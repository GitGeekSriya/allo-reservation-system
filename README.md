# Inventory Reservation System

A full-stack inventory reservation system built using Next.js, Prisma, Supabase PostgreSQL, and Tailwind CSS.

The application allows users to:
- View warehouse inventory
- Reserve stock temporarily
- Confirm reservations
- Release/cancel reservations
- Automatically expire inactive reservations
- Track low stock availability

---

# Live Demo

Vercel Deployment:
https://allo-reservation-system-beta.vercel.app/

GitHub Repository:
https://github.com/GitGeekSriya/allo-reservation-system

---

# Tech Stack

- Next.js 15
- TypeScript
- Prisma ORM
- Supabase PostgreSQL
- Tailwind CSS
- Vercel

---

# Features

## Inventory Dashboard
- View products across warehouses
- Available stock calculation
- Low-stock alerts
- Out-of-stock handling
- Cancel reservations directly from dashboard
- Product-linked reservation tracking

## Reservation System
- Reserve inventory temporarily
- Prevent overselling
- Atomic stock reservation using Prisma transactions

## Reservation Checkout
- Countdown timer
- Confirm reservation
- Cancel reservation
- Reservation status tracking

## Expiry Handling
- Reservations expire automatically after 15 minutes
- Expired reservations release reserved stock back into inventory

## Reservation Management
- Active reservations dashboard
- Cancel pending reservations directly from dashboard
- View all reservations with product information
- Track reservation status

## Business Rules
- Only `PENDING` reservations can be released/cancelled
- `CONFIRMED` reservations cannot be released (API returns `400`)

---

# API Endpoints

## Products
```http
GET /api/products
```

Fetch all products with warehouse inventory.

---
## Warehouses
```http
GET /api/warehouses
---

## Create Reservation
```http
POST /api/reserve
```

Request Body:
```json
{
  "productId": "PRODUCT_ID",
  "warehouseId": "WAREHOUSE_ID",
  "quantity": 1
}
```

---

## Confirm Reservation
```http
POST /api/reserve/[reservationId]/confirm
```

Confirms a pending reservation.

---

## Release Reservation
```http
POST /api/reserve/[reservationId]/release
```

Cancels/releases reservation and restores stock.

---

## Get Reservation
```http
GET /api/reserve/[reservationId]
```

Fetch reservation details.

---

## Get All Reservations
```http
GET /api/reservations
```

Fetch all reservations.

---

# Database Schema

The application uses the following models:

- Product
- Warehouse
- Inventory
- Reservation

Reservation statuses:
- PENDING
- CONFIRMED
- RELEASED

---

# Running Locally

## 1. Clone Repository

```bash
git clone https://github.com/your-github-username/your-repo-name.git
```

```bash
cd your-repo-name
```

---

## 2. Install Dependencies

```bash
npm install
```

---

## 3. Configure Environment Variables

Create a `.env` file in the root directory.

Example:

```env
DATABASE_URL=your_supabase_database_url
```

---

## 4. Generate Prisma Client

```bash
npx prisma generate
```

---

## 5. Push Database Schema

```bash
npx prisma db push
```

---

## 6. Seed Database

```bash
npx prisma db seed
```

---

## 7. Run Development Server

```bash
npm run dev
```

Application will run at:

```txt
http://localhost:3000
```

---

# Expiry Mechanism

Reservations are created with a 15-minute expiry window.

When a reservation is created:
- `reservedStock` is incremented
- Reservation status is set to `PENDING`
- `expiresAt` timestamp is generated

If the reservation is:
- confirmed → status becomes `CONFIRMED`
- cancelled/released → reserved stock is restored
- expired → reserved stock is automatically released

The frontend also displays a live countdown timer for active reservations.

---

# Error Handling

The application properly exposes backend errors to users.

Implemented errors include:

## 409 Conflict
Returned when:
- requested quantity exceeds available stock

Example:
```txt
Not enough stock available
```

---

## 410 Gone
Returned when:
- a user attempts to confirm an expired reservation

Example:
```txt
Reservation expired
```

Errors are displayed directly to the user through frontend alerts.

---

# Trade-offs & Future Improvements

## Trade-offs Made
- Used polling/fetch-based updates instead of WebSockets for simplicity
- Expiry cleanup is request-driven instead of using a background worker/cron job
- Used alert popups for user-visible errors instead of toast notifications
- Prioritized functionality and correctness over advanced UI polish

---

## Improvements With More Time
- Implement idempotency keys for reservation APIs
- Add Redis for distributed locking
- Add background cron jobs for expiry cleanup
- Add analytics dashboards/charts
- Add authentication and role-based access
- Add WebSocket live inventory updates
- Add automated testing
## Bonus
Idempotency keys were not implemented in this version, but the API structure was designed to support future extension for retry-safe reservation flows.

---

# Deployment

The application is deployed on Vercel.

Production stack:
- Frontend: Vercel
- Database: Supabase PostgreSQL

---


# Author

Sriya Chilukuri
