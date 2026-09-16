# U DEVS Showroom Management System — Backend

Node.js + Express + Sequelize + PostgreSQL + JWT backend for the U DEVS
(SMC-PRIVATE) LIMITED Showroom Management System intern assignment.

It implements the full role hierarchy and workflow from the assignment guide —
**Super Admin → Admin → Manager → Customer** — and serves the existing React
frontend without any frontend changes: every route, field name and response
shape matches what `src/services/*Api.js` already calls.

---

## 1. Requirements

- Node.js 18+
- PostgreSQL 13+

## 2. Setup

```bash
cd backend
npm install
cp .env.example .env     # then edit DB_PASSWORD and JWT_SECRET
```

Create the database once:

```bash
createdb showroom_db
# or:  psql -U postgres -c "CREATE DATABASE showroom_db;"
```

Then sync the schema and load demo data:

```bash
npm run db:migrate   # creates/updates all tables from the Sequelize models
npm run db:seed      # demo users, suppliers, vehicles, settings
npm run dev          # http://localhost:5000
```

`npm start` runs it without nodemon. Health check: `GET /health`.

## 3. Environment variables

| Variable | Purpose |
|---|---|
| `PORT` | API port (default 5000) |
| `NODE_ENV` | `development` / `production` |
| `DB_HOST` `DB_PORT` `DB_NAME` `DB_USER` `DB_PASSWORD` | PostgreSQL connection |
| `DATABASE_URL` | Optional single-URL alternative (hosted Postgres) |
| `DB_SSL` | `true` to enable SSL (needed by most hosted Postgres) |
| `JWT_SECRET` | **Change this.** Signing secret for JWTs |
| `JWT_EXPIRES_IN` | Token lifetime (default `1d`) |
| `CLIENT_URL` | Allowed CORS origin — must match the Vite dev URL |
| `UPLOAD_DIR` | Upload folder (default `uploads`) |

Only `.env.example` is committed; `.env` is gitignored.

## 4. Demo credentials

Created by `npm run db:seed`, matching `DEMO_LOGIN_HINTS` in the frontend:

| Role | Email | Password |
|---|---|---|
| Super Admin | superadmin@udevs.com | SuperAdmin@123 |
| Admin | admin@udevs.com | Admin@123 |
| Manager | manager@udevs.com | Manager@123 |
| Customer | customer@udevs.com | Customer@123 |

The seed is idempotent — re-running it won't duplicate accounts.

## 5. Connecting the frontend

The frontend's `.env` already points at this server:

```
VITE_API_URL=http://localhost:5000/api
```

Start the backend first, then `npm run dev` in the frontend. Keep `CLIENT_URL`
in the backend `.env` equal to the frontend's origin (`http://localhost:5173`)
or CORS will block the browser.

## 6. Response envelope

Every response uses one shape, which the frontend's `unwrap()` helper
(`src/services/api.js`) already understands:

```json
{ "success": true, "message": "Applications fetched.", "data": [ ... ], "errors": null }
```

Errors return the same shape with `success: false` and an HTTP status of
400/401/403/404/409/500. Expired or invalid tokens return **401**, which the
frontend's Axios interceptor turns into an automatic logout.

## 7. API reference

All routes are prefixed with `/api`. Everything except `POST /auth/login`
requires an `Authorization: Bearer <token>` header.

### Auth
| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/auth/login` | Public | Login, returns `{ token, user }` |
| GET | `/auth/me` | Authenticated | Current user (session restore) |

### Users
| Method | Endpoint | Access |
|---|---|---|
| GET | `/users` | Authenticated (sanitized — never returns password hashes) |
| GET | `/users/:id` | Authenticated |
| POST | `/users` | **Super Admin** — JSON or multipart (`cnicFront`, `cnicBack`) |
| PUT | `/users/:id` | **Super Admin** |
| DELETE | `/users/:id` | **Super Admin** |
| GET | `/users/:id/cnic-front` | Super Admin / Admin / the user themselves |
| GET | `/users/:id/cnic-back` | Super Admin / Admin / the user themselves |

If no `password` is supplied when registering, a temporary one is generated and
returned once as `tempPassword`.

### Vehicles (`cars`)
| Method | Endpoint | Access |
|---|---|---|
| GET | `/cars`, `/cars/:id` | Authenticated |
| POST | `/cars` | Super Admin / Admin |
| PUT | `/cars/:id` | Super Admin / Admin |
| DELETE | `/cars/:id` | **Super Admin** |
| POST | `/cars/upload-images` | Super Admin / Admin (multipart `images`) |

### Suppliers / Customers
| Method | Endpoint | Access |
|---|---|---|
| GET | `/suppliers`, `/suppliers/:id` | Authenticated |
| POST/PUT | `/suppliers`, `/suppliers/:id` | Super Admin / Admin |
| DELETE | `/suppliers/:id` | **Super Admin** |
| GET | `/customers`, `/customers/:id` | Super Admin / Admin / Manager |
| POST/PUT | `/customers`, `/customers/:id` | Super Admin / Admin |
| DELETE | `/customers/:id` | **Super Admin** |

### Applications
| Method | Endpoint | Access |
|---|---|---|
| GET | `/applications` | Role-scoped (see §8) |
| GET | `/applications/user/:userId` | Self, or Super Admin / Admin |
| GET | `/applications/:id` | Owner / assigned Manager / Super Admin / Admin |
| POST | `/applications` | Customer (own) or Super Admin |
| PATCH | `/applications/:id/status` | Super Admin, or assigned Manager (workflow states only) |
| PATCH | `/applications/:id/assign-manager` | **Super Admin only** |
| PATCH | `/applications/:id/select-vehicle` | Assigned Manager or Super Admin |

### Finance / Installments / Payments
| Method | Endpoint | Access |
|---|---|---|
| POST | `/applications/:id/finance` | Assigned Manager or Super Admin |
| GET | `/applications/:id/finance` | Owner / assigned Manager / Super Admin / Admin |
| GET | `/applications/:id/installments` | Same as above |
| GET | `/payments?applicationId=...` | Same as above |
| POST | `/payments` | Assigned Manager, Admin, or Super Admin |

### Misc
| Method | Endpoint | Access |
|---|---|---|
| GET | `/notifications/user/:userId` | Self only |
| PATCH | `/notifications/:id/read` | Owner |
| GET | `/activity?limit=100` | Super Admin / Admin |
| GET | `/settings` | Authenticated |
| PUT | `/settings` | Super Admin / Admin |
| GET | `/dashboard` | Role-scoped metrics |

## 8. Authorization model

The critical rule from section 10 of the guide — *"Manager queries must be
filtered server-side by `managerId = req.user.id`. Customer queries must be
restricted to `customerId = req.user.id`. Never depend on React to protect
data."* — is enforced in `applicationController.scopeForUser()` and
`canAccessApplication()`, which every application, finance, installment and
payment read passes through.

| Role | Sees |
|---|---|
| Super Admin | Everything; sole authority for approvals, Manager assignment, user registration and deletions |
| Admin | Operational read/write (vehicles, suppliers, customers); **cannot** register users, approve applications or assign Managers |
| Manager | Only applications where `managerId` equals their own id |
| Customer | Only applications where `userId` equals their own id |

Role checks live in `middleware/roleMiddleware.js`; ownership checks live in the
controllers, because they depend on the specific record being touched.

## 9. Workflow & status rules

The status machine from sections 8 and 20 is enforced server-side in
`models/Application.js` (`STATUS_NEXT`). A transition that isn't listed for the
current status is rejected with 400, no matter who requests it:

```
PENDING → APPROVED → ASSIGNED → IN_PROCESS → VEHICLE_SELECTED
  → FINANCE_SETUP → PAYMENT_IN_PROGRESS → READY_FOR_DELIVERY → COMPLETED
```

Additional guards:

- `ASSIGNED` is refused unless a Manager has actually been assigned.
- Managers can only set `IN_PROCESS`, `VEHICLE_SELECTED`, `FINANCE_SETUP`,
  `PAYMENT_IN_PROGRESS`, `READY_FOR_DELIVERY`, `OVERDUE` — approvals,
  rejections and `COMPLETED` stay with the Super Admin.
- `READY_FOR_DELIVERY` is refused while any installment is still outstanding.

## 10. Finance calculations

Per section 18 and the Golden Rules, money is never trusted from the client.
`POST /applications/:id/finance` accepts only `downPayment`, `duration` and
`frequency`; the price is read from the `Vehicle` record, and:

```
financedAmount    = vehiclePrice - downPayment
installmentAmount = financedAmount / duration
```

The schedule is generated in `services/financeService.js`, with the final
installment absorbing any rounding remainder so the rows sum to exactly
`financedAmount`. Payments are applied FIFO against the oldest unpaid
installments and can spill across several at once; each installment's
`paidAmount`/`status` is the authoritative ledger.

## 11. Security

- bcrypt password hashing (cost 10); hashes are stripped from every response.
- JWT verification in `authMiddleware`, role enforcement in `roleMiddleware`.
- Helmet, configurable CORS origin, and rate limiting on `/auth/login`.
- Deactivated accounts (`status: 'Inactive'`) are rejected at login and on
  every subsequent request.
- **CNIC documents are not publicly served.** Only `/uploads/cars` is a static
  mount; CNIC files sit outside it and are reachable solely through the
  authenticated `/users/:id/cnic-front|back` routes, which check the caller's
  role and identity first.
- Foreign keys and unique constraints (notably `users.email`) are enforced in
  PostgreSQL, not just in application code.

## 12. Project structure

```
backend/
├── src/
│   ├── config/         db.js, env.js
│   ├── controllers/    auth, user, car, supplier, customer, application,
│   │                   finance, installment, payment, notification,
│   │                   activity, setting, dashboard
│   ├── middleware/     authMiddleware, roleMiddleware, errorMiddleware,
│   │                   uploadMiddleware
│   ├── models/         User, Vehicle, Supplier, Customer, Application,
│   │                   FinancePlan, Installment, Payment, AuditLog,
│   │                   Notification, Setting, index.js (associations)
│   ├── routes/         one file per resource
│   ├── services/       financeService, activityService, notificationService
│   ├── scripts/        syncDb.js, seed.js
│   ├── utils/          apiResponse, AppError, asyncHandler, idGenerator
│   ├── app.js
│   └── server.js
├── uploads/            cars/ (public) · cnic/ (protected)
├── .env.example
└── package.json
```

## 13. Local test walkthrough

With the server running and the database seeded:

```bash
# 1. Log in as the customer
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"customer@udevs.com","password":"Customer@123"}' \
  | python3 -c 'import sys,json;print(json.load(sys.stdin)["data"]["token"])')

# 2. Browse the catalog
curl -s http://localhost:5000/api/cars -H "Authorization: Bearer $TOKEN"

# 3. Submit an application (starts at PENDING)
curl -s -X POST http://localhost:5000/api/applications \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"fullName":"Demo Customer","email":"customer@udevs.com",
       "cnic":"35202-1234567-1","phone":"03001234567","city":"Lahore",
       "carId":"<CAR_ID_FROM_STEP_2>","color":"White"}'
```

Then log in as the Super Admin to approve it and assign the Manager, and as the
Manager to verify → select vehicle → create the finance plan → record payments.

Checks worth running to confirm the authorization rules hold:

- Call any endpoint with no token → **401**
- Admin calling `PATCH /applications/:id/status` with `APPROVED` → **403**
- A second customer requesting another customer's application → **403**
- `PATCH /applications/:id/status` with `COMPLETED` straight from `PENDING` → **400**
- `GET /uploads/cnic/<filename>` directly in a browser → **404**

## 14. Notes

- `sequelize.sync()` runs on boot for development convenience. For production,
  use `npm run db:migrate` explicitly (or add real migrations) rather than
  syncing on every start.
- The guide's **Vehicle** entity is exposed as `cars` throughout, matching the
  existing frontend's naming and routes.
- `Application.userId` holds the customer's `User.id` (the guide calls it
  `customerId`); the name follows the payload the frontend already sends.
