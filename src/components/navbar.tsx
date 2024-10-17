// Relative Path: /src/components/navbar.tsx

"use client";

import { cn } from "@lib/utils";
import { UserButton } from "@clerk/nextjs";
import { Sparkles } from "lucide-react";
import { Poppins } from "next/font/google";
import Link from "next/link";
import { Button } from "./ui/button";
import { ModeToggle } from "./mode-toggle";
import { MobileSidebar } from "./mobile-sidebar"; // 📱 MobileSidebar component
import { useProModal } from "@hooks/use-pro-modal";
import { ThreadMenu } from "./ui/thread-menu"; // 📜 Adjusted import path for ThreadMenu
import { Thread } from "./ui/thread-menu"; // 📜 Adjusted import path for Thread interface

const font = Poppins({
    weight: "600",
    subsets: ["latin"],
});

interface NavbarProps {
    isPro: boolean; // 💼 Indicates if the user has a pro account
    threads: Thread[]; // 📜 Array of threads to be passed to MobileSidebar and ThreadMenu
}

export const Navbar = ({ isPro, threads }: NavbarProps) => {
    const proModal = useProModal(); // 🛠️ Corrected variable name

    console.log("📝 Rendering Navbar with isPro status:", isPro);
    console.log("📦 Passing threads to MobileSidebar and ThreadMenu:", threads);

    return (
        <div className="fixed w-full z-50 flex justify-between items-center py-2 px-4 border-b border-primary/10 bg-gray-900 h-16"> {/* Changed bg-secondary to bg-gray-900 for consistency */}
            <div className="flex items-center">
                {/* 📱 Mobile Sidebar with threads passed */}
                <MobileSidebar isPro={isPro} threads={threads} />
                <Link href="/">
                    <h1 className={cn("hidden md:block text-xl md:text-3xl font-bold text-primary", font.className)}>
                        Sentient.ai
                    </h1>
                </Link>
            </div>
            <div className="flex items-center gap-x-3">
                {/* 📝 ThreadMenu Component */}
                <div className="hidden md:block"> {/* Hidden on mobile, visible on larger screens */}
                    <ThreadMenu isPro={isPro} /> {/* Correctly rendering ThreadMenu component */}
                </div>

                {/* ✨ Display upgrade button for non-pro users */}
                {!isPro && (
                    <Button onClick={proModal.onOpen} variant="premium" size="sm">
                        Upgrade
                        <Sparkles className="h-4 w-4 fill-white text-white ml-2" />
                    </Button>
                )}
                <ModeToggle /> {/* 🌓 Mode toggle */}
                <UserButton /> {/* 👤 User button */}
            </div>
        </div>
    );
};
