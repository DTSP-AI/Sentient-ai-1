// Relative Path: /src/app/(chat)/layout.tsx

import { Navbar } from "@components/navbar"; // 🧭 Navbar component
import { Sidebar } from "@components/sidebar"; // 🖥️ Sidebar component for desktop
import { MobileSidebar } from "@components/mobile-sidebar"; // 📱 MobileSidebar component for mobile
import { checkSubscription } from "@lib/subscription"; // 🛠️ Function to check user subscription status
import { headers } from "next/headers"; // 📑 Next.js utility to access request headers
import { NextRequest } from "next/server"; // 📡 Next.js server-side request object
import prisma from "@lib/prismadb"; // 🗃️ Prisma client for database interactions
import type { Companion } from "@prisma/client"; // 🗃️ Prisma model type

interface ChatLayoutProps {
  children: React.ReactNode;
}

type CompanionWithMessages = Companion & {
  _count: {
    messages: number;
  };
  messages: {
    createdAt: Date;
  }[];
};

interface Thread {
  id: string;
  companion: CompanionWithMessages;
  lastMessageAt: string;
  _count: {
    messages: number;
  };
}

const ChatLayout = async ({ children }: ChatLayoutProps) => {
  try {
    const reqHeaders = headers();
    const host = reqHeaders.get("host") || "";
    const protocol = reqHeaders.get("x-forwarded-proto") || "http";
    const req = new NextRequest(`${protocol}://${host}`);
    console.log("📝 Created NextRequest object from headers:", req.url);

    console.log("🚀 Checking subscription status...");
    const isPro = await checkSubscription(req);
    console.log(`📜 Subscription status: ${isPro ? "Pro" : "Basic"}`);

    console.log("🔍 Fetching companions from database...");
    const companions: CompanionWithMessages[] = await prisma.companion.findMany({
      include: {
        _count: {
          select: {
            messages: true,
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });
    console.log("📦 Fetched companions data:", companions);

    const threads: Thread[] = companions.map((companion) => ({
      id: companion.id,
      companion: companion,
      lastMessageAt: companion.messages[0]?.createdAt.toISOString() || "No messages yet",
      _count: {
        messages: companion._count.messages,
      },
    }));
    console.log("🧩 Mapped companions to threads:", threads);

    threads.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
    console.log("📈 Sorted threads by lastMessageAt descending:", threads);

    return (
      <div className="h-screen flex overflow-hidden">
        {/* 🧭 Navbar */}
        <Navbar isPro={isPro} threads={threads} />

        {/* 🗂 Sidebar for larger screens */}
        <div className="hidden md:flex mt-16 w-72 flex-col fixed inset-y-0">
          <Sidebar isPro={isPro} threads={threads} />
        </div>

        {/* 📱 Mobile Sidebar for smaller screens */}
        <div className="md:hidden fixed inset-y-0 left-0 z-40">
          <MobileSidebar isPro={isPro} threads={threads} />
        </div>

        {/* 🖥️ Main content area */}
        <main className="flex-1 pt-16 md:pl-72 overflow-y-auto">
          <div className="w-full h-full">
            {children}
          </div>
        </main>
      </div>
    );
  } catch (error) {
    console.error("❌ Error in ChatLayout:", error);
    return (
      <div className="flex items-center justify-center h-full">
        An error occurred while loading the page.
      </div>
    );
  }
};

export default ChatLayout;
