# Roles & Permissions (RBAC)
## Himalaya Plast Operating System (HPOS)

With the pivot to Next.js, we have implemented a custom Role-Based Access Control (RBAC) system in the Prisma database, heavily inspired by standard ERP security models.

## 1. Prisma RBAC Data Model

The schema defines four core models for authorization:
- `Role`: (e.g., "Admin", "Sales User", "Operator")
- `Permission`: A combination of `resource` (e.g., "SalesOrder") and `action` (e.g., "create", "read", "update", "delete").
- `RolePermission`: Maps Permissions to Roles.
- `UserRole`: Maps Users to Roles.

## 2. Roles (mapped to personas)

| Role | Persona | Notes |
|---|---|---|
| `System Manager` | Admin/IT (Param) | Full access across all resources. |
| `HPOS Founder` | Founder/Owner | Read access across all modules + exclusive access to Founder Dashboard. |
| `Sales User` | Sales Executive | Create/edit Sales Order, Customer; read-only on Stock. |
| `Production Planner` | Factory Manager | Create/edit Work Order, Job Card; read on BOM, Stock. |
| `HPOS Operator` | Machine Operator | Create/edit Job Cards (scoped to their assigned machine); no access to Sales/Accounts. |
| `Quality Inspector` | QC Staff | Create/edit Quality Inspection; read on Manufacturing. |
| `Warehouse Staff` | Store/Warehouse | Create/edit Delivery Note, Stock Entry; access to QR Dispatch Scan. |
| `Accounts User` | Accounts Executive | Create/edit Invoices, Payments. |

## 3. Enforcement Strategy

**Server-Side Verification (Mandatory):**
Every Server Action and API route must verify permissions using a utility function before executing any logic:

```typescript
import { requirePermission } from '@/lib/auth/rbac';

export async function updateSalesOrder(id: string, data: any) {
  await requirePermission('SalesOrder', 'update');
  // proceed...
}
```

**Client-Side UI Hiding (UX Only):**
The UI should hide buttons and sidebar links if the user lacks the permission, providing a cleaner experience.

```tsx
import { HasPermission } from '@/components/auth/HasPermission';

<HasPermission resource="SalesOrder" action="create">
  <Button>New Order</Button>
</HasPermission>
```

## 4. Row-Level Restrictions (Future Implementation)
Currently, RBAC is at the model/table level. For row-level restrictions (e.g., an Operator can only see Job Cards assigned to their specific workstation), the data fetching logic must explicitly filter queries based on the logged-in user's attributes (e.g., `where: { workstationId: user.assignedMachineId }`).
