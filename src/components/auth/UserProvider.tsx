"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Permission = { resource: string; action: string };
type Role = { name: string; permissions: { permission: Permission }[] };
type User = {
  id: string;
  email: string;
  name: string;
  isActive: boolean;
  dob?: string | null;
  phone?: string | null;
  bio?: string | null;
  roles: { role: Role }[];
};

type UserContextType = {
  user: User | null;
  loading: boolean;
  can: (resource: string, action: string) => boolean;
  logout: () => Promise<void>;
};

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  can: () => false,
  logout: async () => {},
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (e) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const can = (resource: string, action: string) => {
    if (!user || !user.isActive) return false;
    for (const ur of user.roles) {
      for (const rp of ur.role.permissions) {
        const p = rp.permission;
        if (
          (p.resource === "*" || p.resource === resource) &&
          (p.action === "*" || p.action === action)
        ) {
          return true;
        }
      }
    }
    return false;
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <UserContext.Provider value={{ user, loading, can, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
