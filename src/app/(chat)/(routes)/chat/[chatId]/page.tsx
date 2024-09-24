// src\app\(chat)\(routes)\chat\[chatId]\page.tsx

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prismadb from "@/lib/prismadb";
import { ChatClient } from "./components/client";
import { Message, Companion } from "@prisma/client";
import { ChatMessageProps } from "@/components/chat-message";

interface ChatIdPageProps {
  params: {
    chatId: string;
  };
}

const ChatIdPage = async ({ params }: ChatIdPageProps) => {
  console.log("🚀 ChatIdPage: Starting to process for chatId:", params.chatId);

  const { userId } = auth();
  console.log("👤 ChatIdPage: User authentication status:", userId ? "Authenticated" : "Not authenticated");

  if (!userId) {
    console.log("🚫 ChatIdPage: No userId, redirecting to sign-in");
    return redirect("/sign-in");
  }

  console.log("🔍 ChatIdPage: Fetching companion data from database");
  const companion = await prismadb.companion.findUnique({
    where: {
      id: params.chatId,
    },
    include: {
      messages: {
        orderBy: {
          createdAt: "asc",
        },
        where: {
          userId,
        },
      },
      _count: {
        select: {
          messages: true,
        },
      },
    },
  });

  if (!companion) {
    console.log("❌ ChatIdPage: Companion not found, redirecting to home");
    return redirect("/");
  }

  console.log("✅ ChatIdPage: Companion found:", companion.name);

  const characterDescription = companion.characterDescription as {
    physicalAppearance: string;
    identity: string;
    interactionStyle: string;
  };
  console.log("📝 ChatIdPage: Character description processed");

  const initialMessages: ChatMessageProps[] = companion.messages.map((message: Message) => ({
    id: message.id,
    role: message.role as "user" | "system",
    content: message.content,
    src: companion.src,
  }));
  console.log(`📨 ChatIdPage: Processed ${initialMessages.length} initial messages`);

  const companionWithCharacterDescription: Companion & {
    messages: Message[];
    _count: { messages: number };
    characterDescription: {
      physicalAppearance: string;
      identity: string;
      interactionStyle: string;
    };
  } = {
    ...companion,
    characterDescription,
  };
  console.log("🧩 ChatIdPage: Companion data prepared for ChatClient");

  console.log("🎭 ChatIdPage: Rendering ChatClient component");
  return (
    <ChatClient 
      companion={companionWithCharacterDescription}
      initialMessages={initialMessages}
    />
  );
};

export default ChatIdPage;