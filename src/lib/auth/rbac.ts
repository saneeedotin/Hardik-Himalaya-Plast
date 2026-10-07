import { User, Role, Permission } from "@prisma/client";
import { getSession } from "./core";

export type SessionUser = User & {
  roles: {
    role: Role & {
      permissions: {
        permission: Permission
      }[]
    }
  }[]
};

export function can(user: SessionUser | null, resource: string, action: string): boolean {
  if (!user || !user.isActive) return false;

  for (const userRole of user.roles) {
    for (const rolePerm of userRole.role.permissions) {
      const p = rolePerm.permission;
      if (
        (p.resource === "*" || p.resource === resource) &&
        (p.action === "*" || p.action === action)
      ) {
        return true;
      }
    }
  }
  return false;
}

import { redirect } from "next/navigation";

export async function requirePermission(resource: string, action: string) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  if (!can(session.user as unknown as SessionUser, resource, action)) {
    throw new Error("Forbidden");
  }

  return session.user as unknown as SessionUser;
}
