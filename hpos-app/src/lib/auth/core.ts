import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import * as argon2 from "argon2";
import crypto from "crypto";

const SESSION_COOKIE_NAME = "hpos_session";
const SESSION_EXPIRY_HOURS = 8;

export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password);
}

export async function verifyPassword(hash: string, password: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, password);
  } catch (error) {
    return false;
  }
}

export async function createSession(userId: string, userAgent?: string, ip?: string) {
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  
  const expiresAt = new Date(Date.now() + SESSION_EXPIRY_HOURS * 60 * 60 * 1000);
  
  await prisma.session.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
      userAgent,
      ip
    }
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/"
  });

  return token;
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  
  if (!token) return null;

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const session = await prisma.session.findUnique({
    where: { tokenHash },
    include: {
      user: {
        include: {
          roles: {
            include: {
              role: {
                include: {
                  permissions: {
                    include: {
                      permission: true
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  });

  if (!session || session.expiresAt < new Date()) {
    return null;
  }

  // Sliding renewal
  const timeRemaining = session.expiresAt.getTime() - Date.now();
  if (timeRemaining < (SESSION_EXPIRY_HOURS / 2) * 60 * 60 * 1000) {
    const newExpiresAt = new Date(Date.now() + SESSION_EXPIRY_HOURS * 60 * 60 * 1000);
    await prisma.session.update({
      where: { id: session.id },
      data: { expiresAt: newExpiresAt }
    });
    
    try {
      cookieStore.set(SESSION_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        expires: newExpiresAt,
        path: "/"
      });
    } catch (e) {
      // Ignored: cannot set cookies inside Server Components
    }
  }

  return session;
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  
  if (token) {
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    await prisma.session.deleteMany({
      where: { tokenHash }
    });
  }
  
  try {
    cookieStore.delete(SESSION_COOKIE_NAME);
  } catch (e) {
    // Ignored
  }
}

export async function handleFailedLogin(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return;

  const newAttempts = user.failedAttempts + 1;
  const updateData: any = { failedAttempts: newAttempts };
  
  if (newAttempts >= 5) {
    updateData.lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
  }
  
  await prisma.user.update({
    where: { id: userId },
    data: updateData
  });
}

export async function resetFailedLogin(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      failedAttempts: 0,
      lockedUntil: null,
      lastLoginAt: new Date()
    }
  });
}

export async function logAudit(userId: string | null, event: string, ip?: string, metadata?: any) {
  await prisma.auditLog.create({
    data: {
      userId,
      event,
      ip,
      metadata: metadata || {}
    }
  });
}
