//C:\AI_src\Companion_UI\SaaS-AI-Companion\src\components\user-avatar.tsx

"use client";

import { useUser } from "@clerk/nextjs";
import { Avatar, AvatarImage } from "./ui/avatar";


export const UserAvatar = () => {
    const {user} = useUser();

    return (
        <Avatar className="h-12 w-12">
            <AvatarImage src={user?.imageUrl} />
        </Avatar>
    )
}