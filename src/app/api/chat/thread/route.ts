// Relative Path: /src/app/api/threads/route.ts

import { NextResponse, NextRequest } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import prisma from "@/lib/prismadb";

export async function GET(req: Request) {
  try {
    // Convert the incoming request to a NextRequest instance
    const nextRequest = new NextRequest(req);

    // 🔍 Fetch user ID from Clerk for authentication
    const { userId } = getAuth(nextRequest);
    if (!userId) {
      console.error("❌ User not authenticated");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("🔍 Fetching companions for user:", userId);
    
    // Fetch companions and their latest messages
    const companions = await prisma.companion.findMany({
      where: {
        userId, // Only fetch companions related to the authenticated user
      },
      include: {
        _count: {
          select: {
            messages: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1, // Fetch the latest message only
        },
      },
    });

    // Map companions to thread structure
    const threads = companions.map((companion) => ({
      id: companion.id,
      companion: {
        name: companion.name,
        src: companion.src,
        userName: companion.userName,
      },
      lastMessageAt: companion.messages[0]?.createdAt.toISOString() || "No messages yet",
      lastMessage: companion.messages[0]?.content || "No messages yet",
      _count: {
        messages: companion._count.messages,
      },
    }));

    console.log("📦 Successfully fetched threads:", threads);

    return NextResponse.json(threads);
  } catch (error) {
    console.error("❌ Error fetching threads:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
