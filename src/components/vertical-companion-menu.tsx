// Relative Path: /src/components/vertical-companion-menu.tsx

import { Companion } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { MessagesSquare } from "lucide-react";

interface VerticalCompanionMenuProps {
    data: (Companion & {
        _count: {
            messages: number;
        }
    })[];
}

export const VerticalCompanionMenu = ({ data }: VerticalCompanionMenuProps) => {
    if (data.length === 0) {
        return (
            <div className="pt-10 flex flex-col items-center justify-center space-y-3">
                <div className="relative w-24 h-24">
                    <Image 
                        fill
                        className="grayscale"
                        alt="Empty"
                        src="/images/Empty.png"
                    />
                </div>
                <p className="text-sm text-muted-foreground">
                    No companions found.
                </p>
            </div>
        );
    }

    return (
        <div className="w-48 h-full overflow-y-auto border-r border-primary/10 p-2"> {/* Sidebar styling */}
            {data.map((item) => (
                <Link 
                    href={`/chat/${item.id}`} // 📝 Corrected string interpolation for href
                    key={item.id} 
                    className="flex items-center gap-2 p-2 hover:bg-primary/10 rounded transition"
                >
                    <div className="relative w-12 h-12">
                        <Image 
                            src={item.src ?? "/images/default-avatar.png"} 
                            fill
                            className="rounded-full object-cover" 
                            alt={item.name} 
                        />
                    </div>
                    <div className="flex flex-col">
                        <p className="font-bold">{item.name}</p>
                        <p className="text-xs text-muted-foreground">@{item.userName}</p>
                    </div>
                    <div className="ml-auto flex items-center text-xs text-muted-foreground">
                        <MessagesSquare className="w-3 h-3 mr-1" />
                        {item._count.messages}
                    </div>
                </Link>
            ))}
        </div>
    );
};
