# API Specification
## Himalaya Plast Operating System (HPOS)

With the pivot to Next.js, data fetching and mutations are handled via **Next.js Server Actions** and **React Server Components (RSC)**. Traditional REST API routes (`src/app/api/...`) are used only for external integrations (e.g., Tally sync, Webhooks) or specific client-side needs where actions aren't optimal.

---

## 1. Data Fetching (React Server Components)

Most list views and detail views in the Desk layout fetch data directly in the server component using Prisma.

```typescript
// Example: src/app/(desk)/sales-orders/page.tsx
export default async function SalesOrdersPage() {
  const orders = await prisma.salesOrder.findMany({
    include: { customer: true },
    orderBy: { createdAt: 'desc' }
  });
  return <SalesOrderList data={orders} />;
}
```

## 2. Server Actions (Mutations)

Mutations are placed in `src/app/actions/` and heavily utilize `zod` for validation. Every action must verify session authorization and RBAC permissions.

### Example: `createSalesOrder`
```typescript
'use server'
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { checkPermission } from '@/lib/rbac';

const SalesOrderSchema = z.object({
  customerId: z.string(),
  deliveryDate: z.date(),
  items: z.array(z.object({
    itemId: z.string(),
    qty: z.number().positive(),
  }))
});

export async function createSalesOrder(data: z.infer<typeof SalesOrderSchema>) {
  await checkPermission('SalesOrder', 'create');
  // ... Prisma transaction to create order and items
}
```

## 3. Specialized Application Endpoints

### QR Dispatch Scan (Client-side API call)
Because the QR scanner runs heavily on the client, it interacts with standard Next.js API routes or Server Actions returning JSON.

- `verifyCartonScan(deliveryNoteId, cartonCode)`: Returns match/mismatch status.
- `confirmDispatch(deliveryNoteId, overrideData)`: Marks the DN as dispatched.

### Founder Dashboard
- `getBusinessHealth()`: Server action that aggregates at-risk orders, overdue payments, and production status.

## 4. Error Handling
Server actions return a standardized union type or throw standard errors that are caught by `error.tsx` boundaries.
```typescript
type ActionResponse<T> = { success: true; data: T } | { success: false; error: string };
```
