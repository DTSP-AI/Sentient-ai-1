// Relative Path: /src/components/bot-avatar.tsx

import { Avatar, AvatarImage } from "./ui/avatar";

interface BotAvatarProps {
    src: string;
}

export const BotAvatar = ({
    src
}: BotAvatarProps) => {
    return (
        <Avatar className="h-8 w-8 md:h-10 md:w-10"> {/* Tiny on mobile, larger on desktop */}
            <AvatarImage src={src} />
        </Avatar>
    );
};
