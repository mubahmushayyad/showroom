# U DEVS Showroom Management System — Frontend

React.js frontend for the U DEVS (SMC-PRIVATE) LIMITED Showroom Management
System intern assignment (PERN stack). Built with React 18, Material UI,
Redux Toolkit, React Router and Axios, talking to the Express + Sequelize +
PostgreSQL backend in `/backend`.

Implements the full role hierarchy and workflow from the assignment guide:
**Super Admin → Admin → Manager → Customer**.

## Run

```bash
npm install
npm run dev
```

The app expects the backend at the URL in `.env` (`VITE_API_URL`, default
`http://localhost:5000/api`). Start the backend first (see `/backend/README.md`),
then run `npm run db:seed` there to create demo accounts for every role.

## Demo Credentials

Seeded by `npm run db:seed` in `/backend`:

| Role | Email | Password |
|---|---|---|
| Super Admin | superadmin@udevs.com | SuperAdmin@123 |
| Admin | admin@udevs.com | Admin@123 |
| Manager | manager@udevs.com | Manager@123 |
| Customer | customer@udevs.com | Customer@123 |

## Role Summary (section 2 of the assignment guide)

| Role | Access | Can do |
|---|---|---|
| **Super Admin** | Full | Register users, approve/reject applications, assign Managers, manage the vehicle catalog, suppliers, finance rules, and view the full Audit Log. |
| **Admin** | Limited | Operational visibility into vehicles, suppliers, customers and applications — no user registration, approvals, or Manager assignment. |
| **Manager** | Assigned only | Sees only applications assigned to them; verifies the customer, selects the vehicle, sets up the finance plan, and records payments. |
| **Customer** | Own data only | Browses the showroom, applies for a vehicle, and tracks their own application, assigned Manager, finance plan and payment history. |

## Application-to-Delivery Workflow (section 8)

```
PENDING → APPROVED → ASSIGNED → IN_PROCESS → VEHICLE_SELECTED
  → FINANCE_SETUP → PAYMENT_IN_PROGRESS → READY_FOR_DELIVERY → COMPLETED
```

(`REJECTED` and `OVERDUE` are also reachable — see `STATUS_NEXT` in
`src/utils/constants.js` for the full transition table.)

## Project Structure

```
src/
├── api / services/       Axios instance (JWT interceptor) + one file per resource
├── app/store.js          Redux Toolkit store (Users module)
├── redux/users/          userSlice / userActions / userSelectors
├── context/              AuthContext (JWT session) + AppContext (shared data)
├── components/           common/, finance/, users/, cars/, layout/, dashboard/
├── pages/
│   ├── auth/             Login
│   ├── super-admin/      Dashboard, Vehicles, Suppliers, Customers,
│   │                     Applications, Users, Reports, AuditLog, Settings
│   ├── admin/            Limited-access equivalents
│   ├── manager/          Dashboard, AssignedCustomers, ApplicationWorkflow
│   └── customer/         Showroom, ApplyForCar, MyApplications,
│                         ApplicationDetail, Profile, Wishlist, Compare…
├── routes/AppRoutes.jsx  Role-guarded routing
└── utils/constants.js    Roles, status flow, status-transition rules
```

## Features

- JWT authentication against `POST /api/auth/login`, auto-attached to every
  request and auto-logout on 401 (`src/services/api.js`)
- Role-based routing and navigation for all four roles
- Super Admin: register users (with phone/CNIC/CNIC front-back upload),
  review & approve/reject applications, assign a Manager, full vehicle/
  supplier/customer CRUD, system-wide Audit Log
- Manager: assigned-customers-only view; step-by-step workflow
  (verify → select vehicle → finance plan → payments → ready for delivery)
- Customer: showroom browsing, application submission, wishlist/compare,
  and a read-only finance/installment/payment-history view per application
- Finance module: down payment, duration & frequency captured on the client,
  but `financedAmount`/`installmentAmount` and all totals are always
  authoritative from the backend (never recalculated in React)
- CSV report export, dashboards, responsive sidebar/mobile drawer, dark mode

## Notes

- Vehicle CRUD uses the existing `cars` naming/endpoints from this project
  (the assignment guide's "Vehicle" entity — same thing).
- The backend in `/backend` needs matching updates (Manager role, JWT auth
  routes, FinancePlan/Installment/Payment models, `managerId`/`carId` on
  Application, and the 11-status workflow) to serve this frontend end to
  end — see the accompanying backend delivery.
