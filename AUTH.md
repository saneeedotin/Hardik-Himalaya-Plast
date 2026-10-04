# HPOS Authentication & Authorization (RBAC)

This document explains how the Auth system works for the Himalaya Plast ERP web app.

## Schema Overview

The database uses PostgreSQL via Prisma. Key models include:

- **User**: Represents a human (or service) account. Contains hashed password, lockout fields (`failedAttempts`, `lockedUntil`), and `isActive` toggle.
- **Role**: Groups of permissions (e.g., `Founder`, `Sales`, `Production`, `Dispatch`).
- **Permission**: Granular actions on resources (e.g., `{ resource: 'users', action: 'create' }`).
- **UserRole** & **RolePermission**: Join tables for many-to-many relationships.
- **Session**: Securely stores the active session tokens (SHA-256 hashed).
- **AuditLog**: Immutable record of authentication events (e.g., logins, failures, password changes).

## Permission Matrix

By default, the seed script sets up the following:

- **Founder**: Has `*` (all actions) on `*` (all resources).
- **Sales**: Access to orders, quotations, and customers.
- **Production**: Access to work orders, job cards, and shop floor screens.
- **QC**: Access to quality inspection screens.
- **Dispatch**: Access to the QR scanner and delivery notes.
- **Accounts**: Access to Tally Sync and invoices.

*Note: Roles and permissions are fully dynamic and can be added via the database.*

## Endpoints

### 1. `POST /api/auth/login`
- **Body**: `{ email, password }`
- **Returns**: `{ success: true, redirect: "/" }` or error.
- **Features**: Rate limiting (5 attempts = 15 min lockout), sets `hpos_session` cookie.

### 2. `POST /api/auth/logout`
- **Returns**: `{ success: true }`
- **Features**: Destroys session in DB and deletes cookie.

### 3. `GET /api/auth/me`
- **Returns**: `{ user: { id, email, name, ... } }`
- **Features**: Returns current active session user without password hashes.

### 4. `POST /api/auth/change-password`
- **Body**: `{ currentPassword, newPassword }`
- **Returns**: `{ success: true }`
- **Features**: Requires active session.

### 5. `GET /api/users` & `POST /api/users`
- **Features**: Requires `users:read` and `users:create` permissions respectively.

### 6. `PATCH /api/users/[id]`
- **Features**: Requires `users:update` permission. Allows updating roles and active status.

## How to Protect Routes

### UI Components (Client-Side)

Use the `useUser()` hook provided by `UserProvider`.

```tsx
"use client"
import { useUser } from "@/hooks/useUser";

export default function MyComponent() {
  const { user, can } = useUser();
  
  if (!can("orders", "delete")) {
    return <div>Access Denied</div>;
  }
  
  return <button>Delete Order</button>;
}
```

### Route Handlers & Server Actions (Server-Side)

Use the `requirePermission` helper from `src/lib/auth/rbac`.

```ts
import { requirePermission } from "@/lib/auth/rbac";

export async function POST(request: Request) {
  // Throws Error if unauthorized/forbidden
  const user = await requirePermission("orders", "create");
  
  // Proceed with safe action
}
```

## Adding a New Role

1. Add the role to the database via Prisma or SQL.
2. Link it to specific permissions via `RolePermission`.
3. Assign the role to a user via `UserRole`.
4. The system will automatically compute the allowed actions during `getSession()`.
