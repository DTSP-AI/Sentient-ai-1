//src\app\(chat)\(routes)\chat\[chatId]\page.tsx

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
  const { userId } = auth();

  if (!userId) {
    return redirect("/sign-in");
  }

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
    return redirect("/");
  }

  const characterDescription = companion.characterDescription as {
    physicalAppearance: string;
    identity: string;
    interactionStyle: string;
  };

  const initialMessages: ChatMessageProps[] = companion.messages.map((message: Message) => ({
    id: message.id,
    role: message.role as "user" | "system",
    content: message.content,
    src: companion.src,
  }));

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

  return (
    <ChatClient 
      companion={companionWithCharacterDescription}
      initialMessages={initialMessages}
    />
  );
};

export default ChatIdPage;