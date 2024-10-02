// Relative Path: /src/app/(chat)/layout.tsx

import { Navbar } from "@components/navbar";
import { Sidebar } from "@components/sidebar";
import { VerticalCompanionMenu } from "@components/vertical-companion-menu"; // 🧑‍💼 Imported Vertical Companion Menu
import { checkSubscription } from "@lib/subscription";
import { headers } from "next/headers";
import { NextRequest } from "next/server";
import { Companion } from "@prisma/client";

interface ChatLayoutProps {
    children: React.ReactNode;
}

const ChatLayout = async ({ children }: ChatLayoutProps) => {
    // Create a NextRequest object from the current headers
    const reqHeaders = headers();
    const host = reqHeaders.get("host") || "";
    const protocol = reqHeaders.get("x-forwarded-proto") || "http";
    const req = new NextRequest(`${protocol}://${host}`);

    const isPro = await checkSubscription(req);

    // Fetch companions data (replace with your actual data fetching logic)
    const companions: (Companion & {
        _count: {
            messages: number;
        }
    })[] = []; // Replace this with your data fetching logic

    return (
        <div className="h-full flex">
            {/* Navbar */}
            <Navbar isPro={isPro} />

            {/* Sidebar for larger screens */}
            <div className="hidden md:flex w-20 flex-col fixed inset-y-0">
                <Sidebar isPro={isPro} />
            </div>

            {/* Vertical Companion Menu for larger screens */}
            <div className="hidden md:flex w-48 fixed inset-y-0 left-20">
                <VerticalCompanionMenu data={companions} />
            </div>

            {/* Main content area */}
            <main className="flex-1 pt-16 pl-[17rem] h-full"> {/* pl-[17rem] accounts for Sidebar (5rem) + VerticalCompanionMenu (12rem) */}
                <div className="h-full w-full">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default ChatLayout;
