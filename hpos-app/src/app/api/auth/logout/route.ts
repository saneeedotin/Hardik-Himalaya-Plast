import { NextResponse } from "next/server";
import { destroySession, getSession, logAudit } from "@/lib/auth/core";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    const ip = request.headers.get("x-forwarded-for") || "unknown";

    if (session) {
      await logAudit(session.user.id, "LOGOUT_SUCCESS", ip);
    }
    
    await destroySession();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
