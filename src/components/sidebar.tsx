//src\components\sidebar.tsx

"use client";

import { useProModal } from "@hooks/use-pro-modal"; // 🛠️ Hook to handle pro modal
import Image from "next/image"; // 📸 Next.js optimized image component
import Link from "next/link"; // 🔗 Next.js link component
import { MessagesSquare, Home, Plus, Settings } from "lucide-react"; // 📦 Icons for messages and navigation
import { cn } from "@/lib/utils"; // 🧩 Utility for conditional classNames
import { usePathname, useRouter } from "next/navigation"; // 🚀 Next.js hooks for navigation

interface SidebarProps {
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

interface Route {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  href: string;
  label: string;
  pro: boolean;
}

export const Sidebar = ({ isPro, threads }: SidebarProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const proModal = useProModal();

  // 🌀 Sort threads by most recent first
  const sortedThreads = [...threads].sort(
    (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
  );
  console.log("📊 Sorted threads by most recent:", sortedThreads);

  const routes: Route[] = [
    {
      icon: Home,
      href: "/",
      label: "Home",
      pro: false,
    },
    {
      icon: Plus,
      href: "/companion/new",
      label: "Create",
      pro: true,
    },
    {
      icon: Settings,
      href: "/settings",
      label: "Settings",
      pro: false,
    },
  ];

  // 📝 Handle navigation with pro feature check
  const onNavigate = (url: string, pro: boolean) => {
    if (pro && !isPro) {
      console.log("🚫 Pro feature accessed without subscription.");
      proModal.onOpen();
      return;
    }
    console.log(`🔄 Navigating to URL: ${url}`);
    router.push(url);
  };

  return (
    <div className="flex flex-col h-full w-full text-primary bg-gray-900 overflow-hidden"> {/* Uniform dark gray background */}
      {/* 👤 User Profile Section */}
      <div className="flex items-center p-4 bg-gray-900"> {/* Uniform dark gray background */}
        <div className="relative w-12 h-12">
          <Image
            src="/images/default-avatar.png"
            fill
            className="rounded-full object-cover"
            alt="User Avatar"
          />
        </div>
        <div className="ml-4">
          <p className="font-bold">John Doe</p>
          <p className="text-xs text-muted-foreground">@johndoe</p>
        </div>
      </div>

      {/* 🔗 Main Navigation Links */}
      <nav className="flex-1 overflow-y-auto p-4 scrollbar-hide"> {/* Hidden scrollbar */}
        <h2 className="text-sm font-semibold mb-2">Main</h2>
        {routes.map((route) => (
          <div
            key={route.href}
            onClick={() => onNavigate(route.href, route.pro)}
            className={cn(
              "flex items-center gap-2 p-2 hover:bg-gray-700 rounded transition mb-2 cursor-pointer",
              pathname === route.href && "bg-gray-700 text-primary"
            )}
          >
            <route.icon className="w-5 h-5" />
            <span>{route.label}</span>
          </div>
        ))}

        {/* 📝 Conversations Section */}
        <h2 className="text-sm font-semibold mt-4 mb-2">Conversations</h2>
        {sortedThreads.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center">No conversations available.</p>
        ) : (
          sortedThreads.map((thread) => (
            <Link
              href={`/chat/${thread.id}`}
              key={thread.id}
              className={cn(
                "flex items-center gap-2 p-2 hover:bg-gray-700 rounded transition mb-2 cursor-pointer",
                pathname === `/chat/${thread.id}` && "bg-gray-700 text-primary"
              )}
              onClick={(e) => {
                e.preventDefault();
                onNavigate(`/chat/${thread.id}`, false);
              }}
            >
              <div className="relative w-8 h-8">
                <Image
                  src={thread.companion.src ?? "/images/default-avatar.png"}
                  fill
                  className="rounded-full object-cover"
                  alt={thread.companion.name}
                />
              </div>
              <div className="flex flex-col">
                <p className="font-bold">{thread.companion.name}</p>
                <p className="text-xs text-muted-foreground">@{thread.companion.userName}</p>
              </div>
              <div className="ml-auto flex items-center text-xs text-muted-foreground">
                <MessagesSquare className="w-3 h-3 mr-1" />
                {thread._count.messages}
              </div>
            </Link>
          ))
        )}
      </nav>
    </div>
  );
};
