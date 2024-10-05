// Relative Path: /src/components/user-avatar.tsx

"use client";

import { useUser } from "@clerk/nextjs";
import { Avatar, AvatarImage } from "./ui/avatar";

export const UserAvatar = () => {
    const { user } = useUser();

    return (
        <Avatar className="h-8 w-8 md:h-10 md:w-10"> {/* Tiny on mobile, larger on desktop */}
            <AvatarImage src={user?.imageUrl} />
        </Avatar>
    );
};
