//C:\AI_src\Companion_UI\SaaS-AI-Companion\src\app\(root)\layout.tsx

"use client";

import { Navbar } from "@components/navbar";
import { Sidebar } from "@components/sidebar";
import { checkSubscription } from "@lib/subscription";
import { headers } from "next/headers";
import { NextRequest } from "next/server";

const RootLayout = async ({ children }: { children: React.ReactNode }) => {
  // Create a NextRequest object from the current headers
  const reqHeaders = headers();
  const host = reqHeaders.get("host");
  const protocol = reqHeaders.get("x-forwarded-proto") || "http";
  const req = new NextRequest(`${protocol}://${host}`);

  const isPro = await checkSubscription(req);

  return (
    <div className="flex flex-col h-screen"> {/* 🔄 Flex container with column direction and full viewport height */}
      <Navbar isPro={isPro} />
      <div className="hidden md:flex mt-16 w-20 flex-col fixed inset-y-0"> {/* Sidebar remains fixed */}
        <Sidebar isPro={isPro} />
      </div>
      <main className="md:pl-20 pt-16 flex-1 overflow-hidden"> {/* 🔄 Main content occupies remaining space */}
        {children}
      </main>
    </div>
  );
};

export default RootLayout;
