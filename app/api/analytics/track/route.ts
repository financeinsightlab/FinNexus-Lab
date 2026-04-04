import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { path, sessionId, durationMs, referrer } = body;

    if (!path || !sessionId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const session = await auth();
    const userId = session?.user?.id ?? null;

    const userAgent = req.headers.get("user-agent") ?? undefined;

    // Upsert: update duration if same session+path, else create
    const existing = await (prisma as any).pageView.findFirst({
      where: { sessionId, path },
    });

    if (existing) {
      await (prisma as any).pageView.update({
        where: { id: existing.id },
        data: { durationMs: Math.max(existing.durationMs, durationMs ?? 0), updatedAt: new Date() },
      });
    } else {
      await (prisma as any).pageView.create({
        data: {
          path,
          sessionId,
          userId,
          durationMs: durationMs ?? 0,
          referrer: referrer ?? null,
          userAgent: userAgent ?? null,
        },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Analytics track error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
