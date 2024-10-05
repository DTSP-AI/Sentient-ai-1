// Relative Path: /src/components/ui/thread-menu.tsx

"use client";

import { useRouter, usePathname } from "next/navigation"; // 🚀 Next.js hooks for navigation
import Image from "next/image"; // 📸 Next.js optimized image component
import { useEffect, useState } from "react"; // 🌀 React hooks for side effects and state management
import { cn } from "@/lib/utils"; // 🧩 Utility for conditional classNames

export interface Thread {
  id: string; // 🆔 This is actually the companion's ID
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

interface ThreadMenuProps {
  isPro: boolean; // 💼 Flag indicating if the user has a pro account
}

export const ThreadMenu = ({ isPro }: ThreadMenuProps) => {
  const router = useRouter(); // 🌐 Router instance for navigation
  const pathname = usePathname(); // 📍 Current path for active link highlighting
  const [threads, setThreads] = useState<Thread[]>([]); // 🌀 State to hold thread data

  // 🌀 Fetch thread data on component mount
  useEffect(() => {
    const fetchThreads = async () => {
      try {
        console.log("🌐 Fetching threads from API...");
        const response = await fetch("/api/threads");

        if (!response.ok) {
          throw new Error(`Failed to fetch threads: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log("📥 Threads fetched successfully:", data);
        setThreads(data);
      } catch (error) {
        console.error("❌ Error fetching threads:", error);
      }
    };

    fetchThreads();
  }, []);

  // 🌀 Sort threads by most recent first
  const sortedThreads = [...threads].sort(
    (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
  );
  console.log("📊 Sorted threads by most recent:", sortedThreads);

  // 🎯 Handle companion navigation
  const handleCompanionClick = (companionId: string) => {
    console.log(`📁 Navigating to chat with companion ID: ${companionId}`);
    router.push(`/chat/${companionId}`);
  };

  return (
    <div>
      {sortedThreads.length === 0 ? null : (
        sortedThreads.map((thread) => (
          <div
            key={thread.id}
            onClick={() => handleCompanionClick(thread.id)}
            className={cn(
              "flex items-center gap-2 p-2 hover:bg-primary/10 rounded transition mb-2 cursor-pointer",
              pathname === `/chat/${thread.id}` && "bg-primary/10 text-primary"
            )}
          >
            {/* Bot Avatar */}
            <div className="relative w-8 h-8">
              <Image
                src={thread.companion.src ?? "/images/default-avatar.png"} // 📸 Bot avatar
                fill
                className="rounded-full object-cover"
                alt={thread.companion.name}
              />
            </div>
            <div className="flex flex-col">
              <p className="font-bold">{thread.companion.name}</p> {/* 📝 Companion Name */}
              <p className="text-xs text-muted-foreground">@{thread.companion.userName}</p> {/* 📝 Companion Username */}
            </div>
          </div>
        ))
      )}
    </div>
  );
};
