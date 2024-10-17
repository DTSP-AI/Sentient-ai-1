//src\components\mobile-sidebar.tsx

"use client";

import { Menu } from "lucide-react"; // 📦 Icon for menu toggle
import { Sheet, SheetContent, SheetTrigger } from "@components/ui/sheet"; // 📄 UI components for sidebar
import { Sidebar } from "./sidebar"; // 🖥️ Sidebar component
import { useState } from "react"; // 🔄 React hook for state management
import { cn } from "@/lib/utils"; // 🧩 Utility for conditional classNames

interface MobileSidebarProps {
  isPro: boolean; // 💼 Flag indicating if the user has a pro account
  threads: Thread[]; // 📜 Array of threads with companion info
}

interface Thread {
  id: string;
  companion: {
    name: string;
    src: string;
    userName: string;
  };
  lastMessageAt: string; // 🕒 ISO date string
  _count: {
    messages: number;
  };
}

export const MobileSidebar = ({ isPro, threads }: MobileSidebarProps) => {
  const [isOpen, setIsOpen] = useState(false); // 🔓 State to control sidebar visibility

  // 📝 Toggle sidebar visibility
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
    console.log(`🔄 Sidebar toggled. Now open: ${!isOpen}`);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      {/* 🟢 Trigger Button for Mobile Sidebar */}
      <SheetTrigger asChild>
        <button
          onClick={toggleSidebar}
          aria-label="Open Conversations Sidebar"
          className="md:hidden pr-4 flex items-center justify-center p-2 rounded-md hover:bg-primary/10 transition"
        >
          <Menu className="w-6 h-6 text-primary" />
          <span className="sr-only">Open Conversations Sidebar</span>
        </button>
      </SheetTrigger>

      {/* 🖥️ Sidebar Content */}
      <SheetContent
        side="left"
        className={cn(
          "p-0 bg-secondary pt-10 w-full max-w-xs overflow-y-auto scrollbar-hide hover:scrollbar-thumb-primary", // 💡 Adjusted for touch scrolling and hover-based scrollbar
          "md:hidden" // Hidden on desktop
        )}
        style={{ zIndex: 50 }} // 🧩 Ensure the sidebar is on top of other elements
      >
        <Sidebar isPro={isPro} threads={threads} /> {/* 🖥️ Integrated Sidebar component */}
        <div className="p-4">
          <p className="text-sm text-muted-foreground">© 2024 Your Company</p>
        </div>
      </SheetContent>
    </Sheet>
  );
};
