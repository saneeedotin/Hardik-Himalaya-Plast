import { describe, it, expect, vi, beforeEach } from "vitest";
import { hashPassword, verifyPassword, handleFailedLogin } from "../../src/lib/auth/core";
import { can } from "../../src/lib/auth/rbac";

describe("Auth Core", () => {
  it("should hash and verify passwords correctly", async () => {
    const password = "mysecretpassword123";
    const hash = await hashPassword(password);
    
    expect(hash).not.toEqual(password);
    
    const isValid = await verifyPassword(hash, password);
    expect(isValid).toBe(true);
    
    const isInvalid = await verifyPassword(hash, "wrongpassword");
    expect(isInvalid).toBe(false);
  });
});

describe("RBAC System", () => {
  const adminUser: any = {
    isActive: true,
    roles: [
      {
        role: {
          permissions: [
            { permission: { resource: "*", action: "*" } }
          ]
        }
      }
    ]
  };

  const restrictedUser: any = {
    isActive: true,
    roles: [
      {
        role: {
          permissions: [
            { permission: { resource: "orders", action: "read" } }
          ]
        }
      }
    ]
  };

  const inactiveUser: any = {
    isActive: false,
    roles: adminUser.roles
  };

  it("should allow admin access to everything", () => {
    expect(can(adminUser, "users", "create")).toBe(true);
    expect(can(adminUser, "dispatch", "scan")).toBe(true);
  });

  it("should restrict user based on permissions", () => {
    expect(can(restrictedUser, "orders", "read")).toBe(true);
    expect(can(restrictedUser, "orders", "create")).toBe(false);
    expect(can(restrictedUser, "users", "read")).toBe(false);
  });

  it("should deny all access to inactive users", () => {
    expect(can(inactiveUser, "orders", "read")).toBe(false);
  });
});
