// Relative Path: /src/app/(chat)/layout.tsx

import { Navbar } from "@components/navbar";
import { Sidebar } from "@components/sidebar";
import { MobileSidebar } from "@components/mobile-sidebar";
import { VerticalCompanionMenu } from "@components/vertical-companion-menu";
import { checkSubscription } from "@lib/subscription";
import { headers } from "next/headers";
import { NextRequest } from "next/server";
import { Companion } from "@prisma/client";

interface ChatLayoutProps {
    children: React.ReactNode;
}

const ChatLayout = async ({ children }: ChatLayoutProps) => {
    const reqHeaders = headers();
    const host = reqHeaders.get("host") || "";
    const protocol = reqHeaders.get("x-forwarded-proto") || "http";
    const req = new NextRequest(`${protocol}://${host}`);

    console.log("🚀 Checking subscription status...");
    const isPro = await checkSubscription(req);
    console.log(`📜 Subscription status: ${isPro ? "Pro" : "Basic"}`);

    const companions: (Companion & {
        _count: {
            messages: number;
        };
    })[] = [];
    console.log("📦 Fetched companions data:", companions);

    return (
        <div className="h-full flex">
            {/* 🧭 Navbar */}
            <Navbar isPro={isPro} />

            {/* 🗂 Sidebar for larger screens */}
            <div className="hidden md:flex w-20 flex-col fixed inset-y-0">
                <Sidebar isPro={isPro} />
            </div>

            {/* 📱 Mobile Sidebar for smaller screens */}
            <div className="md:hidden fixed inset-y-0 left-0 z-40"> {/* Fixed positioning to avoid layout push */}
                <MobileSidebar isPro={isPro} />
            </div>

            {/* 🧑‍💼 Vertical Companion Menu for larger screens */}
            <div className="hidden md:flex w-48 fixed inset-y-0 left-20">
                <VerticalCompanionMenu data={companions} />
            </div>

            {/* 🖥️ Main content area */}
            <main className="flex-1 pt-16 md:pl-[17rem] h-full"> {/* Removed padding for small screens */}
                <div className="h-full w-full">
                    {children} {/* 🔥 Render children components */}
                </div>
            </main>
        </div>
    );
};

export default ChatLayout;
