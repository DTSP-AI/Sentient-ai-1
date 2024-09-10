// C:\AI_src\Companion_UI\SaaS-AI-Companion\src\components\chat-header.tsx

"use client";

import { BotAvatar } from "@/components/bot-avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { useUser } from "@clerk/nextjs";
import { Companion, Message } from "@prisma/client";
import axios from "axios";
import {
  ChevronLeft,
  Edit,
  History,
  MessageSquare,
  MoreVertical,
  Trash,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface ChatHeaderProps {
  companion: Companion & {
    messages: Message[];
  };
}

export const ChatHeader = ({ companion }: ChatHeaderProps) => {
  const router = useRouter();
  const { user } = useUser();
  const { toast } = useToast();

  const onDelete = async () => {
    try {
      console.log(`Attempting to delete companion with id: ${companion.id}`);
      const response = await axios.delete(`/api/companion/${companion.id}`);
      console.log("Delete response:", response);
  
      if (response.status === 200) {
        toast({ description: "Companion deleted successfully." });
        console.log("Companion deleted successfully");
        router.refresh();
        router.push("/");
      } else {
        throw new Error(`Unexpected response status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error deleting companion:", error);
      toast({
        description: "Failed to delete companion. Please try again.",
        variant: "destructive",
      });
    }
  };

  const onClearMessageHistory = async () => {
    try {
      console.log(`Clearing message history for companion with id: ${companion.id}`);
      await axios.delete(`/api/companion/${companion.id}/history`);

      toast({ description: "Message history cleared." });
      console.log("Message history cleared successfully");

      router.refresh();
    } catch (error) {
      console.error("Error clearing message history:", error);
      toast({
        description: "Something went wrong.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex w-full items-center justify-between border-b border-primary/10 pb-4">
      <div className="flex items-center gap-x-2">
        <Button
          size="icon"
          variant="ghost"
          onClick={() => {
            console.log("Navigating back");
            router.back();
          }}
        >
          <ChevronLeft className="h-8 w-8" />
        </Button>
        <BotAvatar src={companion.src} />
        <div className="flex flex-col gap-y-1">
          <div className="flex items-center gap-x-2">
            <p className="font-bold">{companion.name}</p>
            <div className="flex items-center text-xs text-muted-foreground">
              <MessageSquare className="mr-1 h-3 w-3" />
              {companion.messages.length}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Created by {companion.userName}
          </p>
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger className="p-4 outline-none">
          <MoreVertical />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => {
              console.log("Clear Message History button clicked");
              onClearMessageHistory();
            }}
          >
            <History className="mr-2 h-4 w-4" />
            Clear Message History
          </DropdownMenuItem>
          {user?.id === companion.userId && (
            <>
              <DropdownMenuItem
                onClick={() => {
                  console.log("Edit button clicked, navigating to edit companion");
                  router.push(`/companion/${companion.id}`);
                }}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => {
                  console.log("Delete button clicked");
                  onDelete();
                }}
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
