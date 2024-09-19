// src\components\chat-message.tsx

"use client";

import { BotAvatar } from "@/components/bot-avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { UserAvatar } from "@/components/user-avatar";
import { cn } from "@/lib/utils";
import { Copy } from "lucide-react";
import { useTheme } from "next-themes";
import { BeatLoader } from "react-spinners";

export interface ChatMessageProps {
  id?: string;
  role: "system" | "user";
  content?: string;
  isLoading?: boolean;
  src?: string; // Make src optional as in the old repo
}

export const ChatMessage = ({
  role,
  content = "", // Provide a default empty string
  isLoading,
  src,
}: ChatMessageProps) => {
  const { toast } = useToast();
  const { theme } = useTheme();

  const onCopy = () => {
    if (!content) {
      return;
    }

    navigator.clipboard.writeText(content);
    toast({
      description: "Message copied to clipboard.",
      duration: 3000,
    });
  };

  // Convert newlines to paragraphs for display
  const formattedContent = content.split("\n").map((line, index) => (
    <p key={index} className="mb-2">
      {line}
    </p>
  ));

  return (
    <div className={cn(
      "group flex items-start gap-x-3 py-4 w-full",
      role === "user" && "justify-end"
    )}>
      {role !== "user" && src && <BotAvatar src={src} />}
      <div className="rounded-md bg-primary/10 px-4 py-2 max-w-sm text-sm">
        {isLoading ? (
          <BeatLoader size={5} color={theme === "light" ? "black" : "white"} />
        ) : (
          <div>{formattedContent}</div> // Render formatted content as paragraphs
        )}
      </div>
      {role === "user" && <UserAvatar />}
      {role !== "user" && !isLoading && (
        <Button
          onClick={onCopy}
          className="opacity-0 group-hover:opacity-100 transition"
          size="icon"
          variant="ghost"
        >
          <Copy className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
};
