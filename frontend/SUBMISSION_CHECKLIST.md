# Frontend submission checklist — U DEVS Showroom Management System

Matches the PDF assignment ("Definition of Done", section 24).

## Auth & roles
- [x] JWT login (`POST /api/auth/login`) — no LocalStorage password auth.
- [x] Four roles routed and guarded: Super Admin, Admin, Manager, Customer.
- [x] Each role lands on and is confined to its own portal/navigation.
- [ ] Verify unauthorized API calls return 401/403 once the backend RBAC
      middleware is in place (frontend already handles 401 via auto-logout).

## Super Admin
- [x] Register users with First/Last Name, Email, Phone, CNIC, CNIC
      Front/Back upload, Role, Status (`UserForm.jsx`).
- [x] Review applications: Pending / Approved / Rejected.
- [x] Assign a Manager to an approved application.
- [x] Full vehicle, supplier, customer CRUD.
- [x] Audit Log page (reads backend ActivityLog).
- [x] Reports + CSV export.

## Manager
- [x] Sees only applications where `managerId` matches them (client-side
      filter as a safety net — backend must enforce this for real).
- [x] Verify customer → select vehicle → create finance plan → record
      payments → mark ready for delivery, one step unlocked at a time.
- [x] Cannot see other Managers' customers (route + filter in place).

## Customer
- [x] Browse showroom, apply for a vehicle, track application status.
- [x] Sees only their own applications (`userId` filter).
- [x] Read-only finance plan, installment schedule and payment history
      once a Manager sets it up.
- [x] Cannot edit official financial totals (all finance screens are
      read-only for this role).

## Finance / installments / payments
- [x] Down payment, duration, frequency captured client-side; the
      backend is expected to return the authoritative `financedAmount`
      and `installmentAmount` — never recalculated in React.
- [x] Installment schedule and payment history rendered from backend data.

## Still needed to fully run end-to-end
- [ ] Backend: JWT auth routes + bcrypt, `roleMiddleware`.
- [ ] Backend: `Manager` role, `managerId`/`carId` on `Application`.
- [ ] Backend: `FinancePlan`, `Installment`, `Payment` models + routes.
- [ ] Backend: 11-status `Application` workflow (see `constants.js`
      `APP_STATUS`) replacing the current 5-status enum.
- [ ] Re-point `VITE_API_URL` at the updated backend and re-test each role.
