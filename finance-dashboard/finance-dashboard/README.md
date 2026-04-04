# Finance Dashboard — Backend API

A production-structured REST API for a role-based finance dashboard, built with the MERN stack (MongoDB, Express.js, Node.js). Supports full financial record management, aggregated dashboard analytics, JWT authentication, and role-based access control.

---

## Tech Stack

| Layer        | Technology                        |
|--------------|-----------------------------------|
| Runtime      | Node.js                           |
| Framework    | Express.js                        |
| Database     | MongoDB + Mongoose ODM             |
| Auth         | JSON Web Tokens (JWT)             |
| Validation   | express-validator                 |
| Rate Limiting| express-rate-limit                |
| Logging      | morgan                            |

---

## Project Structure

```
backend/
├── config/
│   ├── db.js              # MongoDB connection
│   └── seed.js            # Database seeder with test data
├── controllers/
│   ├── authController.js
│   ├── dashboardController.js
│   ├── recordController.js
│   └── userController.js
├── middleware/
│   ├── auth.js            # JWT verification + role guard
│   ├── errorHandler.js    # Global error handler
│   └── validate.js        # express-validator result checker
├── models/
│   ├── FinancialRecord.js
│   └── User.js
├── routes/
│   ├── authRoutes.js
│   ├── dashboardRoutes.js
│   ├── recordRoutes.js
│   └── userRoutes.js
├── services/
│   ├── authService.js     # Business logic for auth
│   ├── dashboardService.js# MongoDB aggregation pipelines
│   ├── recordService.js   # Financial record operations
│   └── userService.js     # User management operations
├── .env.example
├── package.json
└── server.js
```

---

## Setup & Installation

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)

### Steps

```bash
# 1. Clone and navigate
cd backend

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# 4. (Optional) Seed the database with test data
npm run seed

# 5. Start the server
npm run dev       # development (nodemon)
npm start         # production
```

### Environment Variables

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/finance_dashboard
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=7d
NODE_ENV=development
```

---

## Roles & Permissions

The system uses a **hierarchical role model** with three levels:

| Permission                    | Viewer | Analyst | Admin |
|-------------------------------|:------:|:-------:|:-----:|
| View financial records        | ✅     | ✅      | ✅    |
| View dashboard & analytics    | ✅     | ✅      | ✅    |
| Create financial records      | ❌     | ✅      | ✅    |
| Update financial records      | ❌     | ✅      | ✅    |
| Delete financial records      | ❌     | ❌      | ✅    |
| Manage users (CRUD)           | ❌     | ❌      | ✅    |

Role enforcement is implemented in `middleware/auth.js` using a `requireRole()` guard that checks a numeric role level hierarchy (`viewer=1, analyst=2, admin=3`).

---

## API Reference

All protected routes require the `Authorization: Bearer <token>` header.

### Auth — `/api/auth`

| Method | Endpoint         | Auth | Description              |
|--------|------------------|------|--------------------------|
| POST   | `/register`      | No   | Register a new user      |
| POST   | `/login`         | No   | Login, get JWT token     |
| GET    | `/me`            | Yes  | Get logged-in user info  |

**Register body:**
```json
{
  "name": "Alice Admin",
  "email": "alice@example.com",
  "password": "password123",
  "role": "admin"
}
```

**Login body:**
```json
{
  "email": "alice@example.com",
  "password": "password123"
}
```

**Login response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "data": { "_id": "...", "name": "Alice Admin", "role": "admin" }
}
```

---

### Users — `/api/users` *(Admin only)*

| Method | Endpoint   | Description                       |
|--------|------------|-----------------------------------|
| GET    | `/`        | List all users (paginated)        |
| GET    | `/:id`     | Get user by ID                    |
| PUT    | `/:id`     | Update user (role, status, name)  |
| DELETE | `/:id`     | Delete user                       |

**Query params for GET /:**
- `page` (default: 1), `limit` (default: 10)
- `role` — filter by role (`viewer`, `analyst`, `admin`)
- `isActive` — filter by status (`true` / `false`)

---

### Financial Records — `/api/records`

| Method | Endpoint | Auth Role        | Description               |
|--------|----------|------------------|---------------------------|
| GET    | `/`      | viewer+          | List records (paginated)  |
| GET    | `/:id`   | viewer+          | Get single record         |
| POST   | `/`      | analyst+         | Create a record           |
| PUT    | `/:id`   | analyst+         | Update a record           |
| DELETE | `/:id`   | admin            | Soft-delete a record      |

**Query params for GET /:**
- `page`, `limit` — pagination
- `type` — `income` or `expense`
- `category` — e.g. `salary`, `rent`, `food`
- `startDate`, `endDate` — ISO8601 date filter
- `search` — text search in description
- `sortBy` — field to sort by (default: `date`)
- `order` — `asc` or `desc`

**Record body:**
```json
{
  "amount": 3500.00,
  "type": "income",
  "category": "salary",
  "date": "2024-01-15",
  "description": "January salary"
}
```

**Valid categories:** `salary`, `freelance`, `investment`, `rent`, `food`, `utilities`, `healthcare`, `entertainment`, `travel`, `education`, `shopping`, `taxes`, `other`

---

### Dashboard — `/api/dashboard` *(viewer+)*

| Method | Endpoint           | Description                          |
|--------|--------------------|--------------------------------------|
| GET    | `/summary`         | Total income, expenses, net balance  |
| GET    | `/categories`      | Totals broken down by category       |
| GET    | `/trends/monthly`  | Monthly income vs expense for a year |
| GET    | `/trends/weekly`   | Daily totals for the past 7 days     |
| GET    | `/recent`          | Most recent transactions             |

**Query params:**
- `/summary` — `startDate`, `endDate`
- `/categories` — `startDate`, `endDate`, `type`
- `/trends/monthly` — `year` (default: current year)
- `/recent` — `limit` (default: 5)

**Sample summary response:**
```json
{
  "success": true,
  "data": {
    "totalIncome": 15200.00,
    "totalExpenses": 8450.50,
    "netBalance": 6749.50,
    "incomeCount": 12,
    "expenseCount": 28
  }
}
```

---

## Error Handling

All errors return a consistent shape:

```json
{
  "success": false,
  "message": "Descriptive error message here"
}
```

| Status | Meaning                         |
|--------|---------------------------------|
| 400    | Bad request / invalid input     |
| 401    | Unauthenticated                 |
| 403    | Forbidden (insufficient role)   |
| 404    | Resource not found              |
| 409    | Conflict (e.g. duplicate email) |
| 422    | Validation error                |
| 429    | Rate limit exceeded             |
| 500    | Internal server error           |

Validation errors include per-field details:
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Valid email is required" },
    { "field": "amount", "message": "Amount must be a positive number" }
  ]
}
```

---

## Design Decisions & Tradeoffs

### Soft Delete
Financial records use soft delete (`isDeleted: true`) rather than hard delete. This preserves audit history and allows potential recovery. The Mongoose pre-query hook transparently filters deleted records from all queries, so no controller code needs to be changed.

### Role Hierarchy (Numeric Levels)
Roles are mapped to numeric levels (`viewer=1, analyst=2, admin=3`). The `requireRole()` middleware accepts one or more minimum roles and computes the minimum required level. This means adding a new role in the future only requires updating the level map — no route changes needed.

### Services Layer
Business logic is separated into a services layer, keeping controllers thin (only parse request / send response). This makes logic reusable and independently testable.

### MongoDB Aggregation for Dashboard
Dashboard endpoints use MongoDB's aggregation pipeline (`$group`, `$match`, `$project`) rather than fetching all records and computing in JavaScript. This keeps computation close to the data and scales well.

### Rate Limiting
100 requests per 15-minute window per IP on all `/api` routes. This protects against brute-force attacks without impacting normal usage.

---

## Test Credentials (after seeding)

| Role    | Email                    | Password     |
|---------|--------------------------|--------------|
| Admin   | admin@finance.com        | password123  |
| Analyst | analyst@finance.com      | password123  |
| Viewer  | viewer@finance.com       | password123  |

---

## Optional Enhancements Implemented

- ✅ JWT Authentication
- ✅ Pagination on all list endpoints
- ✅ Search support on records
- ✅ Soft delete for financial records
- ✅ Rate limiting (express-rate-limit)
- ✅ Seed script with realistic test data
