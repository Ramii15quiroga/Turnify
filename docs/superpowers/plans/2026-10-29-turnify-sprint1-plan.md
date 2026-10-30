# Turnify Sprint 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the complete Turnify SW Sprint 1 system (13 Jira tasks, 24 subtasks, 58 story points) including SQLite/Prisma database in 3NF, Express TypeScript REST backend with authentication, service management, schedule configuration, concurrency-safe appointments, and responsive Vite React frontend for clients and administrators.

**Architecture:** Monorepo with `backend/` and `frontend/` packages and root orchestration scripts. The backend uses layered architecture (routes, controllers, services, middlewares) with Prisma ORM on SQLite and transactional duplicate-booking prevention. The frontend uses React 18, TypeScript, Tailwind CSS, Lucide icons, React Router DOM with role-based route guards (`ProtectedRoute`, `AdminRoute`), and centralized authentication state.

**Tech Stack:** Node.js, Express, TypeScript, Prisma ORM, SQLite, bcryptjs, jsonwebtoken, Zod, React, Vite, Tailwind CSS, React Router, Lucide React, Jest, Supertest.

**Spec:** `docs/superpowers/specs/2026-10-29-turnify-sprint1-design.md`

## Global Constraints

- Database model must remain strictly in 3rd Normal Form (3NF).
- Concurrency and duplicate reservation prevention must be enforced at the database and server level (409 Conflict).
- Passwords must be hashed with bcrypt (min 6 characters).
- Authentication must use JWT tokens and enforce role-based access control (`CLIENT` vs `ADMIN`).
- Cancelled appointments must liberate their time slots immediately in availability calculations.
- Deactivating a service (`isActive: false`) hides it from clients while preserving existing appointments.
- Past dates and past times must never be offered or accepted as available appointment slots.

## Review Focus

1. Concurrent booking collision: Two clients requesting the same `(serviceId, date, time)` simultaneously — exactly one succeeds (201), the other receives 409 Conflict with clear explanation.
2. Slot liberation upon cancellation: When a confirmed appointment is cancelled, the corresponding time slot immediately reappears in `GET /api/availability`.
3. Client isolation: A client calling `GET /api/appointments/my` or attempting to cancel an appointment can only view or cancel their own bookings.
4. Role escalation prevention: Client accounts attempting to call admin endpoints (`/api/admin/*`) receive 403 Forbidden.
5. Service deactivation integrity: Deactivating a service prevents new bookings but retains existing appointments in history and in the admin dashboard.

---

### Task 1: Scaffolding Monorepo, Database Schema & Project Base (SCRUM-9)

**Files:**
- Create: `package.json`
- Create: `backend/package.json`
- Create: `backend/tsconfig.json`
- Create: `backend/prisma/schema.prisma`
- Create: `backend/src/config/prisma.ts`
- Create: `backend/prisma/seed.ts`
- Create: `frontend/package.json`
- Create: `frontend/tsconfig.json`
- Create: `frontend/vite.config.ts`
- Create: `frontend/tailwind.config.js`
- Create: `frontend/postcss.config.js`
- Create: `frontend/index.html`
- Create: `frontend/src/index.css`
- Test: `backend/tests/setup.test.ts`

**Interfaces:**
- Consumes: Spec data model in 3NF (`User`, `Service`, `BusinessSchedule`, `Appointment`).
- Produces: Prisma Client instance `prisma`, initial seed runner, working local development scripts.

- [ ] **Step 1: Create root `package.json` with npm workspaces and scripts**
- [ ] **Step 2: Initialize `backend` with TypeScript, Prisma, Express, and test dependencies**
- [ ] **Step 3: Define 3NF Prisma schema in `backend/prisma/schema.prisma`**
- [ ] **Step 4: Create Prisma client singleton in `backend/src/config/prisma.ts`**
- [ ] **Step 5: Create database seed script in `backend/prisma/seed.ts` with admin user, client user, sample services, and weekly schedule**
- [ ] **Step 6: Initialize `frontend` with Vite, React, TypeScript, and Tailwind CSS**
- [ ] **Step 7: Run `npx prisma db push` and `npx ts-node prisma/seed.ts` to verify database creation**
- [ ] **Step 8: Write verification test in `backend/tests/setup.test.ts` to assert database tables and seed records exist**
- [ ] **Step 9: Run test to verify it passes**
- [ ] **Step 10: Commit task deliverable**

---

### Task 2: Backend Authentication Module (SCRUM-5, SCRUM-6 / SCRUM-40, SCRUM-42)

**Files:**
- Create: `backend/src/utils/jwt.ts`
- Create: `backend/src/middlewares/auth.ts`
- Create: `backend/src/middlewares/validation.ts`
- Create: `backend/src/schemas/auth.schema.ts`
- Create: `backend/src/services/auth.service.ts`
- Create: `backend/src/controllers/auth.controller.ts`
- Create: `backend/src/routes/auth.routes.ts`
- Modify: `backend/src/app.ts`
- Test: `backend/tests/auth.test.ts`

**Interfaces:**
- Consumes: `prisma.user`
- Produces:
  - `POST /api/auth/register` -> `{ message: string, user: { id, name, email, role } }`
  - `POST /api/auth/login` -> `{ token: string, user: { id, name, email, role } }`
  - `GET /api/auth/me` -> `{ user: { id, name, email, role } }`
  - `authenticate`: Express middleware verifying JWT and attaching `req.user`
  - `authorizeRole(['ADMIN'])`: Express middleware enforcing role

- [ ] **Step 1: Write failing tests in `backend/tests/auth.test.ts` (registration, unique email error, password hashing, login success, invalid credentials neutral error, protected `/me` endpoint)**
- [ ] **Step 2: Run tests to verify failure**
- [ ] **Step 3: Implement JWT token generator/verifier in `backend/src/utils/jwt.ts`**
- [ ] **Step 4: Implement Zod auth schemas in `backend/src/schemas/auth.schema.ts`**
- [ ] **Step 5: Implement `AuthService` in `backend/src/services/auth.service.ts` (bcrypt hashing, user creation, credential validation)**
- [ ] **Step 6: Implement `authMiddleware` and `roleMiddleware` in `backend/src/middlewares/auth.ts`**
- [ ] **Step 7: Implement `AuthController` and mount `/api/auth` routes in `backend/src/app.ts`**
- [ ] **Step 8: Run tests to verify all auth tests pass**
- [ ] **Step 9: Commit task deliverable**

---

### Task 3: Backend Services Module (SCRUM-8, SCRUM-10 / SCRUM-44, SCRUM-46)

**Files:**
- Create: `backend/src/schemas/service.schema.ts`
- Create: `backend/src/services/service.service.ts`
- Create: `backend/src/controllers/service.controller.ts`
- Create: `backend/src/routes/service.routes.ts`
- Modify: `backend/src/app.ts`
- Test: `backend/tests/service.test.ts`

**Interfaces:**
- Consumes: `prisma.service`, `authenticate`, `authorizeRole`
- Produces:
  - `GET /api/services`: returns active services only
  - `GET /api/admin/services`: returns all services (admin only)
  - `POST /api/admin/services`: creates service with unique name and duration (admin only)
  - `PUT /api/admin/services/:id`: updates service (admin only)
  - `PATCH /api/admin/services/:id/deactivate`: sets `isActive = false` (admin only)

- [ ] **Step 1: Write failing tests in `backend/tests/service.test.ts` (public list filters inactive, admin CRUD, duplicate name rejection, deactivation preserves relations)**
- [ ] **Step 2: Run tests to verify failure**
- [ ] **Step 3: Implement Zod service validation schema in `backend/src/schemas/service.schema.ts`**
- [ ] **Step 4: Implement `ServiceService` in `backend/src/services/service.service.ts`**
- [ ] **Step 5: Implement `ServiceController` and routes in `backend/src/routes/service.routes.ts`**
- [ ] **Step 6: Mount service routes in `backend/src/app.ts`**
- [ ] **Step 7: Run tests to verify all service tests pass**
- [ ] **Step 8: Commit task deliverable**

---

### Task 4: Backend Schedules & Availability Module (SCRUM-24, SCRUM-11 / SCRUM-60, SCRUM-48)

**Files:**
- Create: `backend/src/schemas/schedule.schema.ts`
- Create: `backend/src/services/schedule.service.ts`
- Create: `backend/src/controllers/schedule.controller.ts`
- Create: `backend/src/routes/schedule.routes.ts`
- Modify: `backend/src/app.ts`
- Test: `backend/tests/availability.test.ts`

**Interfaces:**
- Consumes: `prisma.businessSchedule`, `prisma.appointment`, `prisma.service`
- Produces:
  - `GET /api/admin/schedules`: returns weekly schedule list
  - `PUT /api/admin/schedules`: sets/updates days, startTime, endTime, slotDuration (admin only)
  - `GET /api/availability?serviceId=:id&date=YYYY-MM-DD`: returns `{ date, serviceId, availableSlots: string[] }`

- [ ] **Step 1: Write failing tests in `backend/tests/availability.test.ts` (schedule range validation `endTime > startTime`, slot generation for a date, exclusion of booked slots, exclusion of past dates/times)**
- [ ] **Step 2: Run tests to verify failure**
- [ ] **Step 3: Implement Zod schedule schema in `backend/src/schemas/schedule.schema.ts`**
- [ ] **Step 4: Implement `ScheduleService` in `backend/src/services/schedule.service.ts` (computes slot intervals, queries non-cancelled appointments, filters past moments)**
- [ ] **Step 5: Implement `ScheduleController` and mount routes in `backend/src/app.ts`**
- [ ] **Step 6: Run tests to verify all schedule & availability tests pass**
- [ ] **Step 7: Commit task deliverable**

---

### Task 5: Backend Appointments Module & Concurrency (SCRUM-13, SCRUM-14, SCRUM-19, SCRUM-20, SCRUM-21, SCRUM-26 / SCRUM-50, SCRUM-52, SCRUM-54, SCRUM-56, SCRUM-58, SCRUM-62)

**Files:**
- Create: `backend/src/schemas/appointment.schema.ts`
- Create: `backend/src/services/appointment.service.ts`
- Create: `backend/src/controllers/appointment.controller.ts`
- Create: `backend/src/routes/appointment.routes.ts`
- Modify: `backend/src/app.ts`
- Test: `backend/tests/appointment.test.ts`

**Interfaces:**
- Consumes: `prisma.appointment`, `prisma.$transaction`, `authenticate`, `authorizeRole`
- Produces:
  - `POST /api/appointments`: atomic booking creation with duplicate prevention (returns 201 or 409)
  - `GET /api/appointments/my`: client's appointments grouped/ordered
  - `PATCH /api/appointments/:id/cancel`: client cancellation with slot liberation
  - `GET /api/admin/appointments`: admin list with filters (`date`, `serviceId`, `status`)
  - `GET /api/admin/appointments/:id`: admin single appointment detail

- [ ] **Step 1: Write failing tests in `backend/tests/appointment.test.ts` (successful booking, concurrent duplicate collision 409, slot liberated after cancel, client can only see/cancel own appointment, admin can list and filter all appointments)**
- [ ] **Step 2: Run tests to verify failure**
- [ ] **Step 3: Implement `AppointmentService` with transactional safety in `backend/src/services/appointment.service.ts`**
- [ ] **Step 4: Implement `AppointmentController` with error mapping in `backend/src/controllers/appointment.controller.ts`**
- [ ] **Step 5: Mount appointment routes in `backend/src/app.ts`**
- [ ] **Step 6: Run tests to verify all appointment tests pass**
- [ ] **Step 7: Commit task deliverable**

---

### Task 6: Frontend Auth & Core Navigation (SCRUM-41, SCRUM-43)

**Files:**
- Create: `frontend/src/types/auth.ts`
- Create: `frontend/src/services/api.ts`
- Create: `frontend/src/context/AuthContext.tsx`
- Create: `frontend/src/components/Navbar.tsx`
- Create: `frontend/src/components/ProtectedRoute.tsx`
- Create: `frontend/src/components/AdminRoute.tsx`
- Create: `frontend/src/pages/Home.tsx`
- Create: `frontend/src/pages/Login.tsx`
- Create: `frontend/src/pages/Register.tsx`
- Modify: `frontend/src/App.tsx`
- Test: `frontend/src/tests/auth.test.tsx`

**Interfaces:**
- Consumes: Backend `/api/auth/*`
- Produces: `AuthProvider`, `useAuth`, responsive `Navbar`, protected route guards, Login & Register views.

- [ ] **Step 1: Write tests for `AuthContext`, `Login` form validation and `ProtectedRoute` redirection**
- [ ] **Step 2: Create centralized API client in `frontend/src/services/api.ts` with token interceptor**
- [ ] **Step 3: Create `AuthContext` with `login`, `register`, `logout` and role inspection**
- [ ] **Step 4: Build modern responsive `Navbar` with navigation links, user greeting, and logout action**
- [ ] **Step 5: Build `ProtectedRoute` and `AdminRoute` guards**
- [ ] **Step 6: Build `Login` page with generic error message and redirect to intended destination**
- [ ] **Step 7: Build `Register` page with form field validations (name, email, password min 6) and confirmation message**
- [ ] **Step 8: Configure routes in `frontend/src/App.tsx`**
- [ ] **Step 9: Run tests and verify auth components pass**
- [ ] **Step 10: Commit task deliverable**

---

### Task 7: Frontend Services Catalog & Booking Wizard (SCRUM-47, SCRUM-49, SCRUM-51, SCRUM-53, SCRUM-55)

**Files:**
- Create: `frontend/src/types/service.ts`
- Create: `frontend/src/types/appointment.ts`
- Create: `frontend/src/services/serviceApi.ts`
- Create: `frontend/src/services/appointmentApi.ts`
- Create: `frontend/src/pages/ServicesCatalog.tsx`
- Create: `frontend/src/pages/BookingWizard.tsx`
- Create: `frontend/src/pages/BookingConfirmation.tsx`
- Modify: `frontend/src/App.tsx`
- Test: `frontend/src/tests/booking.test.tsx`

**Interfaces:**
- Consumes: Backend `/api/services`, `/api/availability`, `/api/appointments`
- Produces: Catalog view, Step-by-step Booking Wizard, Confirmation view with voucher details.

- [ ] **Step 1: Write tests for `ServicesCatalog` empty state & service list, and `BookingWizard` date/slot selection**
- [ ] **Step 2: Implement `serviceApi.ts` and `appointmentApi.ts`**
- [ ] **Step 3: Build `ServicesCatalog` page listing active services with duration, description, and "Reservar Turno" CTA**
- [ ] **Step 4: Build `BookingWizard` page with date selector, slot chips, collision warning message (409) with slot reload, and confirmation CTA**
- [ ] **Step 5: Build `BookingConfirmation` page displaying reservation code, service name, date, time, status, and email voucher notification**
- [ ] **Step 6: Register routes in `App.tsx` (`/services`, `/book`, `/appointments/confirmation/:id`)**
- [ ] **Step 7: Run tests to verify booking flows pass**
- [ ] **Step 8: Commit task deliverable**

---

### Task 8: Frontend Client "Mis Turnos" & Cancellation (SCRUM-57, SCRUM-59)

**Files:**
- Create: `frontend/src/pages/MyAppointments.tsx`
- Create: `frontend/src/components/CancelModal.tsx`
- Modify: `frontend/src/App.tsx`
- Test: `frontend/src/tests/myAppointments.test.tsx`

**Interfaces:**
- Consumes: Backend `GET /api/appointments/my`, `PATCH /api/appointments/:id/cancel`
- Produces: "Mis Turnos" view with upcoming/history tabs, cancellation modal, and instant status updates.

- [ ] **Step 1: Write tests for `MyAppointments` rendering upcoming vs cancelled/past appointments, and cancellation confirmation modal**
- [ ] **Step 2: Build `CancelModal` component with clear warning and confirmation button**
- [ ] **Step 3: Build `MyAppointments` page with tabs for "Próximos Turnos" and "Historial", badges for states, and cancellation action**
- [ ] **Step 4: Register route in `App.tsx` (`/my-appointments`) guarded by `ProtectedRoute`**
- [ ] **Step 5: Run tests to verify cancellation and list views pass**
- [ ] **Step 6: Commit task deliverable**

---

### Task 9: Frontend Admin Portal (SCRUM-45, SCRUM-61, SCRUM-63)

**Files:**
- Create: `frontend/src/pages/admin/AdminDashboard.tsx`
- Create: `frontend/src/pages/admin/AdminServices.tsx`
- Create: `frontend/src/pages/admin/AdminSchedules.tsx`
- Create: `frontend/src/components/admin/AppointmentDetailModal.tsx`
- Create: `frontend/src/components/admin/ServiceModal.tsx`
- Modify: `frontend/src/App.tsx`
- Test: `frontend/src/tests/adminDashboard.test.tsx`

**Interfaces:**
- Consumes: Backend `/api/admin/*`
- Produces: Admin Dashboard with filters, Services CRUD & Deactivation, Weekly Schedule Configuration.

- [ ] **Step 1: Write tests for Admin Dashboard filtering by date, service and status**
- [ ] **Step 2: Build `AdminDashboard` page with metric cards, reactive filter controls, appointments data table, and `AppointmentDetailModal`**
- [ ] **Step 3: Build `AdminServices` page with service table, `ServiceModal` for create/edit, and deactivate toggle with confirmation**
- [ ] **Step 4: Build `AdminSchedules` page for configuring business days, start/end times and slot durations with range validation**
- [ ] **Step 5: Register admin routes in `App.tsx` (`/admin/dashboard`, `/admin/services`, `/admin/schedules`) guarded by `AdminRoute`**
- [ ] **Step 6: Run tests to verify admin pages pass**
- [ ] **Step 7: Commit task deliverable**

---

### Task 10: Full Integration, Seed Verification, Local Run & Final Push (SCRUM-9, SCRUM-30)

**Files:**
- Modify: `package.json`
- Create: `backend/src/server.ts`
- Test: Full test suites (Backend Jest + Frontend Vitest)

**Interfaces:**
- Consumes: All modules from Tasks 1-9
- Produces: One-command local execution (`npm run setup`, `npm run dev`, `npm test`), passing all acceptance criteria.

- [ ] **Step 1: Configure root scripts in `package.json` to concurrently run backend on :4000 and frontend on :5173 with API proxying**
- [ ] **Step 2: Run complete backend test suite and verify 100% green**
- [ ] **Step 3: Run complete frontend test suite and verify 100% green**
- [ ] **Step 4: Execute database seed and verify login with `admin@turnify.com` and `cliente@turnify.com`**
- [ ] **Step 5: Verify all 13 Jira acceptance criteria end-to-end**
- [ ] **Step 6: Commit and push complete Sprint 1 to remote repository `https://github.com/Ramii15quiroga/Turnify.git`**

