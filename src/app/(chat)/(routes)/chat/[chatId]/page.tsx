// /src/app/(chat)/(routes)/chat/[chatId]/page.tsx

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prismadb from "@/lib/prismadb";
import { ChatClient } from "./components/client";
import { Message } from "@prisma/client";

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

  const initialMessages = companion.messages.map((message: Message) => ({
    role: message.role as "user" | "system",
    content: message.content,
  }));

  return (
    <ChatClient 
      companion={{
        ...companion,
        characterDescription,
      }}
      initialMessages={initialMessages}
    />
  );
};

export default ChatIdPage;