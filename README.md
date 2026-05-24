# Allo Inventory Reservation System

A full-stack inventory reservation system built with Next.js, Prisma, Neon PostgreSQL, and TailwindCSS.

This project simulates a real-world multi-warehouse inventory reservation flow where stock is temporarily reserved during checkout to prevent overselling while avoiding premature stock depletion from abandoned carts.

---

# Live Demo

Add deployed Vercel URL here:

```bash
https://your-vercel-url.vercel.app
```

---

# GitHub Repository

Add your GitHub repository link here:

```bash
https://github.com/your-username/allo-inventory
```

---

# Tech Stack

## Frontend
- Next.js App Router
- React
- TypeScript
- TailwindCSS

## Backend
- Next.js API Routes
- Prisma ORM
- PostgreSQL (Neon)

## Database
- Neon Hosted PostgreSQL

---

# Features

## Inventory & Reservation System
- Multi-warehouse inventory support
- Product stock tracking per warehouse
- Reservation lifecycle management
- Reservation expiry handling
- Concurrency-safe reservation logic
- Automatic inventory updates

## Frontend
- Product listing page
- Available stock per warehouse
- Reserve button
- Reservation checkout page
- Live countdown timer
- Confirm purchase flow
- Cancel reservation flow
- Automatic UI refresh after actions
- Error handling for:
  - 409 insufficient stock
  - 410 expired reservation

## Backend
- REST API endpoints
- Prisma ORM integration
- Hosted PostgreSQL database
- Transaction-based reservation handling
- Row-level locking for concurrency safety
- Lazy cleanup for expired reservations
- Idempotency support for reservation creation

---

# API Endpoints

## Products

### GET `/api/products`

Returns all products with stock availability per warehouse.

---

## Warehouses

### GET `/api/warehouses`

Returns all warehouses.

---

## Reservations

### POST `/api/reservations`

Creates a temporary reservation.

Returns:
- `200` on success
- `409` if insufficient stock

---

### GET `/api/reservations/:id`

Returns reservation details.

---

### POST `/api/reservations/:id/confirm`

Confirms reservation and permanently decrements stock.

Returns:
- `200` on success
- `410` if reservation expired

---

### POST `/api/reservations/:id/release`

Cancels/releases reservation and restores stock.

---

# Database Schema

## Product
Represents a sellable SKU.

## Warehouse
Represents physical warehouse locations.

## Inventory
Tracks stock per product per warehouse.

Fields:
- totalUnits
- reservedUnits

Available stock is calculated as:

```txt
availableUnits = totalUnits - reservedUnits
```

## Reservation
Tracks temporary inventory holds.

Statuses:
- PENDING
- CONFIRMED
- RELEASED

Includes:
- expiry timestamp
- reserved quantity

---

# Concurrency Handling

The reservation endpoint is implemented using PostgreSQL row-level locking with:

```sql
SELECT ... FOR UPDATE
```

inside a database transaction.

This guarantees that when multiple requests attempt to reserve the final unit simultaneously:
- exactly one request succeeds
- remaining requests receive `409 Conflict`

This prevents overselling and ensures inventory consistency under concurrency.

---

# Reservation Expiry Strategy

Expired reservations are automatically released using a lazy cleanup strategy.

Before:
- inventory reads
- reservation creation

the system checks for expired pending reservations.

If expired:
- reserved stock is released
- reservation status is updated to `RELEASED`

This approach avoids requiring additional infrastructure like cron jobs or background workers while still ensuring inventory consistency.

---

# Idempotency Support

The reservation endpoint supports idempotency using the `Idempotency-Key` header.

If a client retries the same request with the same key:
- the original response is returned
- duplicate reservations are not created

This prevents accidental duplicate side effects caused by:
- retries
- double clicks
- network failures

Example:

```http
POST /api/reservations
Idempotency-Key: abc123
```

---

# Local Development Setup

## 1. Clone Repository

```bash
git clone https://github.com/your-username/allo-inventory.git
```

---

## 2. Navigate Into Project

```bash
cd allo-inventory
```

---

## 3. Install Dependencies

```bash
npm install
```

---

## 4. Configure Environment Variables

Create a `.env` file in project root.

Example:

```env
DATABASE_URL="your_neon_database_url"
```

---

## 5. Push Prisma Schema

```bash
npx prisma db push
```

---

## 6. Generate Prisma Client

```bash
npx prisma generate
```

---

## 7. Seed Database

```bash
npx prisma db seed
```

---

## 8. Run Development Server

```bash
npm run dev
```

---

# Seed Data

The seed script creates:
- sample products
- warehouses
- inventory records

This allows the application to be demoed immediately after setup.

---

# Frontend Flow

1. User views products and warehouse stock.
2. User clicks Reserve.
3. Reservation is created.
4. User is redirected to checkout page.
5. Reservation countdown starts.
6. User can:
   - confirm purchase
   - cancel reservation
7. Inventory updates automatically.

---

# Error Handling

## 409 Conflict
Returned when insufficient stock is available.

## 410 Gone
Returned when reservation expires before confirmation.

Both errors are displayed clearly in the frontend UI.

---

# Deployment

## Frontend Hosting
- Vercel

## Database Hosting
- Neon PostgreSQL

---

# Trade-offs & Improvements

## Current Trade-offs
- Lazy cleanup strategy instead of background workers
- Polling-based inventory refresh instead of WebSockets
- Idempotency implemented only for reservation creation endpoint

## Improvements With More Time
- Redis-based distributed locking
- WebSocket realtime inventory updates
- Background worker for reservation cleanup
- Reservation quantity selection UI
- Authentication and user accounts
- Admin dashboard
- Inventory analytics
- React Query or SWR for frontend caching
- Optimistic UI updates

---

# Testing

## Reservation Lifecycle
Tested:
- reservation creation
- reservation confirmation
- reservation cancellation
- reservation expiry
- insufficient stock handling

## Concurrency Testing
Concurrent requests against low-stock inventory correctly result in:
- one successful reservation
- remaining requests receiving `409 Conflict`

---

# Author

Kola Samhith