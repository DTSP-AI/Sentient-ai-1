// Relative Path: /src/components/chat-header.tsx

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
  onMessagesCleared: () => void;
}

export const ChatHeader = ({ companion, onMessagesCleared }: ChatHeaderProps) => {
  const router = useRouter();
  const { user } = useUser();
  const { toast } = useToast();

  // Function to handle deleting a companion
  const onDelete = async () => {
    try {
      console.log(`Attempting to delete companion with id: ${companion.id}`);
      await axios.delete(`/api/companion/${companion.id}`);
      toast({ description: "Companion deleted successfully." });
      console.log("Companion deleted successfully");
      router.refresh(); // Refresh the page
      router.push("/"); // Navigate back to the home page
    } catch (error) {
      console.error("Error deleting companion:", error);
      toast({
        description: "Failed to delete companion. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Function to handle clearing message history
  const onClearMessageHistory = async () => {
    try {
      console.log(`Clearing message history for companion with id: ${companion.id}`);
      await axios.delete(`/api/companion/${companion.id}/history`);
      toast({ description: "Message history cleared successfully." });
      console.log("Message history cleared successfully");
      onMessagesCleared(); // Call the function to clear messages on the client side
      router.refresh(); // Optionally refresh to reflect changes in UI
    } catch (error) {
      console.error("Error clearing message history:", error);
      toast({
        description: "Failed to clear message history. Please try again.",
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
            router.back(); // Navigate to the previous page
          }}
        >
          <ChevronLeft className="h-8 w-8" />
        </Button>
        <BotAvatar src={companion.src} />
        <div className="flex flex-col gap-y-1">
          <div className="flex items-center gap-x-2">
            <p className="text-xl font-bold">{companion.name}</p> {/* Increased font size */}
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
              onClearMessageHistory(); // Trigger clearing of message history
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
                  router.push(`/companion/${companion.id}`); // Navigate to companion edit page
                }}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  console.log("Delete button clicked");
                  onDelete(); // Trigger deletion of the companion
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
